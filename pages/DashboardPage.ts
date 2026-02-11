import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * DashboardPage - Page Object Model for dashboard
 * Encapsulates all locators and actions for the dashboard
 */
export class DashboardPage extends BasePage {
    // Locators
    readonly welcomeHeading: Locator;
    readonly userProfileButton: Locator;
    readonly logoutButton: Locator;
    readonly sidebarNavigation: Locator;
    readonly dashboardCards: Locator;
    readonly searchInput: Locator;
    readonly notificationBell: Locator;

    constructor(page: Page) {
        super(page);
        this.welcomeHeading = page.getByRole('heading', { name: /welcome|dashboard/i });
        this.userProfileButton = page.getByRole('button', { name: /profile|user/i });
        this.logoutButton = page.getByRole('button', { name: /logout|sign out/i });
        this.sidebarNavigation = page.locator('nav[aria-label="sidebar"]');
        this.dashboardCards = page.locator('[data-testid="dashboard-card"]');
        this.searchInput = page.getByPlaceholder(/search|find/i);
        this.notificationBell = page.getByRole('button', { name: /notifications|bell/i });
    }

    /**
     * Navigate to dashboard
     */
    async goto(): Promise<void> {
        await this.navigate('/dashboard');
    }

    /**
     * Verify dashboard is loaded
     */
    async verifyDashboardLoaded(): Promise<boolean> {
        return await this.isElementVisible(this.welcomeHeading);
    }

    /**
     * Navigate to a sidebar menu item
     */
    async navigateToMenuOption(menuName: string): Promise<void> {
        const menuItem = this.sidebarNavigation.getByRole('link', { name: menuName });
        await this.clickElement(menuItem);
    }

    /**
     * Logout from dashboard
     */
    async logout(): Promise<void> {
        await this.clickElement(this.userProfileButton);
        await this.clickElement(this.logoutButton);
    }

    /**
     * Search for an item
     */
    async search(searchTerm: string): Promise<void> {
        await this.fillInput(this.searchInput, searchTerm);
        await this.page.keyboard.press('Enter');
    }

    /**
     * Get count of dashboard cards
     */
    async getDashboardCardCount(): Promise<number> {
        return await this.dashboardCards.count();
    }

    /**
     * Click on dashboard card by index
     */
    async clickDashboardCard(index: number): Promise<void> {
        await this.clickElement(this.dashboardCards.nth(index));
    }

    /**
     * Get text from dashboard card
     */
    async getDashboardCardText(index: number): Promise<string> {
        return await this.getElementText(this.dashboardCards.nth(index));
    }

    /**
     * Check if user is logged in (by verifying dashboard is visible)
     */
    async isUserLoggedIn(): Promise<boolean> {
        return await this.verifyDashboardLoaded();
    }

    /**
     * Click notification bell
     */
    async openNotifications(): Promise<void> {
        await this.clickElement(this.notificationBell);
    }
}
