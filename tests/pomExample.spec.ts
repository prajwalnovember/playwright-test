import { test, expect } from '../fixtures/pageFixtures';

/**
 * Example tests using Page Object Model with Fixtures
 * Tests are clean and readable - all page interactions are abstracted
 * Page objects are automatically injected via custom fixtures
 * Credentials come from playwright.config.ts use context
 */

test.describe.skip('Login Tests with POM', () => {
    test.beforeEach(async ({ loginPage }) => {
        await loginPage.goto();
    });

    test('should login successfully with valid credentials', async ({ loginPage, dashboardPage }) => {
        const username = process.env.TEST_USERNAME || '';
        const password = process.env.TEST_PASSWORD || '';
        await loginPage.login(username, password);

        // After login, verify dashboard is loaded
        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should show error message with invalid credentials', async ({ loginPage }) => {
        await loginPage.login('invalid@example.com', 'wrongpassword');

        const errorDisplayed = await loginPage.isErrorMessageDisplayed();
        expect(errorDisplayed).toBeTruthy();

        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toContain('Invalid credentials');
    });

    test('should login with remember me option', async ({ loginPage, dashboardPage }) => {
        const username = process.env.TEST_USERNAME || '';
        const password = process.env.TEST_PASSWORD || '';
        await loginPage.loginWithRememberMe(username, password);

        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should navigate to forgot password', async ({ loginPage, page }) => {
        await loginPage.clickForgotPassword();

        // Verify URL changed (or another element appeared)
        await page.waitForURL(/forgot-password/);
        const url = page.url();
        expect(url).toContain('forgot-password');
    });

    test('should verify login page is displayed', async ({ loginPage }) => {
        const isPageLoaded = await loginPage.verifyLoginPageIsLoaded();
        expect(isPageLoaded).toBeTruthy();
    });
});

test.describe.skip('Dashboard Tests with POM', () => {
    test.beforeEach(async ({ loginPage, page }) => {
        // Login first
        const username = process.env.TEST_USERNAME || '';
        const password = process.env.TEST_PASSWORD || '';
        await loginPage.goto();
        await loginPage.login(username, password);
    });

    test('should verify dashboard is loaded', async ({ dashboardPage }) => {
        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should navigate to menu option', async ({ dashboardPage, page }) => {
        await dashboardPage.navigateToMenuOption('Reports');
        await page.waitForURL(/reports/);
        const url = page.url();
        expect(url).toContain('reports');
    });

    test('should search for item', async ({ dashboardPage, page }) => {
        await dashboardPage.search('test item');
        // Verify search results are displayed
        await page.waitForSelector('[data-testid="search-results"]');
    });

    test('should get dashboard card count', async ({ dashboardPage }) => {
        const cardCount = await dashboardPage.getDashboardCardCount();
        expect(cardCount).toBeGreaterThan(0);
    });

    test('should click dashboard card and verify navigation', async ({ dashboardPage }) => {
        await dashboardPage.clickDashboardCard(0);
        // Add assertion based on expected navigation
    });

    test('should logout successfully', async ({ dashboardPage, page }) => {
        await dashboardPage.logout();
        await page.waitForURL(/login|auth/);
        const url = page.url();
        expect(url).toContain('login');
    });

    test('should check if user is logged in', async ({ dashboardPage }) => {
        const isLoggedIn = await dashboardPage.isUserLoggedIn();
        expect(isLoggedIn).toBeTruthy();
    });

    test('should open notifications', async ({ dashboardPage, page }) => {
        await dashboardPage.openNotifications();
        await page.waitForSelector('[data-testid="notifications-panel"]');
    });
});
