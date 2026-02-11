import { test as base } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Custom fixtures that extend the base test with page objects
    * This allows us to use loginPage and dashboardPage in our tests without manual initialization
 */
export const test = base.extend<{
    loginPage: LoginPage;
    dashboardPage: DashboardPage;
}>({
    /**
     * Fixture for LoginPage
     * Automatically initialized for each test
     */
    loginPage: async ({ page }, use) => {
        const loginPage = new LoginPage(page);
        await use(loginPage);
    },

    /**
     * Fixture for DashboardPage
     * Automatically initialized for each test
     */
    dashboardPage: async ({ page }, use) => {
        const dashboardPage = new DashboardPage(page);
        await use(dashboardPage);
    },
});

export { expect } from '@playwright/test';
