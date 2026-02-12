import { test as base, Page } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';
import fs from 'fs';
import path from 'path';

/**
 * Custom fixtures that extend the base test with page objects
 * Provides two convenience fixtures:
 * - `atLoginPage` navigates to the login page before the test runs
 * - `loggedIn` performs a login using `process.env.TEST_USERNAME/PASSWORD`
 */
export const test = base.extend<{
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
    atLoginPage: void;
    loggedIn: void;
}>({
    loginPage: async ({ page }, use) => {
        await use(new LoginPage(page));
    },

    dashboardPage: async ({ page }, use) => {
        await use(new DashboardPage(page));
    },

    // Navigates to the login page before each test that requests this fixture
    atLoginPage: async ({ loginPage }, use) => {
        await loginPage.goto();
        await use();
    },

    // Logs in before each test that requests this fixture.
    // Uses a persisted storageState file if present to speed up authentication.
    loggedIn: async ({ page, loginPage, browser }, use) => {
        const storageDir = path.resolve(process.cwd(), 'playwright', '.auth');
        const storagePath = path.join(storageDir, 'user.json');

        // Helper to save current context state
        const saveState = async () => {
            try {
                if (!fs.existsSync(storageDir)) fs.mkdirSync(storageDir, { recursive: true });
                await page.context().storageState({ path: storagePath });
            } catch (e) {
                // ignore errors saving state
            }
        };

        if (fs.existsSync(storagePath)) {
            // Load stored state and inject into the current context
            try {
                const raw = fs.readFileSync(storagePath, 'utf8');
                const state = JSON.parse(raw);

                if (state.cookies && Array.isArray(state.cookies) && state.cookies.length) {
                    await page.context().addCookies(state.cookies as any);
                }

                if (state.origins && Array.isArray(state.origins)) {
                    for (const origin of state.origins) {
                        if (!origin || !origin.origin) continue;
                        // navigate to origin to set localStorage for that origin
                        try {
                            await page.goto(origin.origin);
                            if (Array.isArray(origin.localStorage)) {
                                for (const item of origin.localStorage) {
                                    await page.evaluate(([k, v]) => {
                                        localStorage.setItem(k, v);
                                    }, [item.name, item.value]);
                                }
                            }
                        } catch (e) {
                            // ignore navigation/localStorage errors for non-critical origins
                        }
                    }
                }

                // reload to apply cookies/localStorage
                await page.reload();
                await use();
                return;
            } catch (e) {
                // If reading/loading fails, fall back to fresh login below
            }
        }

        // No saved state or failed to load — perform fresh login and persist state
        const username = process.env.TEST_USERNAME || '';
        const password = process.env.TEST_PASSWORD || '';
        await loginPage.goto();
        await loginPage.login(username, password);
        await saveState();
        await use();
    },
});

export { expect } from '@playwright/test';
