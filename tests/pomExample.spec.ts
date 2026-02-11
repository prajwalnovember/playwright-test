import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/LoginPage';
import { DashboardPage } from '../pages/DashboardPage';

/**
 * Example tests using Page Object Model
 * Tests are clean and readable - all page interactions are abstracted
 */

test.describe('Login Tests with POM', () => {
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        await loginPage.goto();
    });

    test('should login successfully with valid credentials', async ({ page }) => {
        await loginPage.login('user@example.com', 'password123');

        // After login, verify dashboard is loaded
        const dashboardPage = new DashboardPage(page);
        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should show error message with invalid credentials', async () => {
        await loginPage.login('invalid@example.com', 'wrongpassword');

        const errorDisplayed = await loginPage.isErrorMessageDisplayed();
        expect(errorDisplayed).toBeTruthy();

        const errorText = await loginPage.getErrorMessage();
        expect(errorText).toContain('Invalid credentials');
    });

    test('should login with remember me option', async ({ page }) => {
        await loginPage.loginWithRememberMe('user@example.com', 'password123');

        const dashboardPage = new DashboardPage(page);
        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should navigate to forgot password', async ({ page }) => {
        await loginPage.clickForgotPassword();

        // Verify URL changed (or another element appeared)
        await page.waitForURL(/forgot-password/);
        const url = page.url();
        expect(url).toContain('forgot-password');
    });

    test('should verify login page is displayed', async () => {
        const isPageLoaded = await loginPage.verifyLoginPageIsLoaded();
        expect(isPageLoaded).toBeTruthy();
    });
});

test.describe('Dashboard Tests with POM', () => {
    let dashboardPage: DashboardPage;
    let loginPage: LoginPage;

    test.beforeEach(async ({ page }) => {
        loginPage = new LoginPage(page);
        dashboardPage = new DashboardPage(page);

        // Login first
        await loginPage.goto();
        await loginPage.login('user@example.com', 'password123');
    });

    test('should verify dashboard is loaded', async () => {
        const isLoaded = await dashboardPage.verifyDashboardLoaded();
        expect(isLoaded).toBeTruthy();
    });

    test('should navigate to menu option', async ({ page }) => {
        await dashboardPage.navigateToMenuOption('Reports');
        await page.waitForURL(/reports/);
        const url = page.url();
        expect(url).toContain('reports');
    });

    test('should search for item', async ({ page }) => {
        await dashboardPage.search('test item');
        // Verify search results are displayed
        await page.waitForSelector('[data-testid="search-results"]');
    });

    test('should get dashboard card count', async () => {
        const cardCount = await dashboardPage.getDashboardCardCount();
        expect(cardCount).toBeGreaterThan(0);
    });

    test('should click dashboard card and verify navigation', async () => {
        await dashboardPage.clickDashboardCard(0);
        // Add assertion based on expected navigation
    });

    test('should logout successfully', async ({ page }) => {
        await dashboardPage.logout();
        await page.waitForURL(/login|auth/);
        const url = page.url();
        expect(url).toContain('login');
    });

    test('should check if user is logged in', async () => {
        const isLoggedIn = await dashboardPage.isUserLoggedIn();
        expect(isLoggedIn).toBeTruthy();
    });

    test('should open notifications', async ({ page }) => {
        await dashboardPage.openNotifications();
        await page.waitForSelector('[data-testid="notifications-panel"]');
    });
});
