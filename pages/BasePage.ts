import { Page, Locator } from '@playwright/test';

/**
 * Base Page class that contains common functionality
 * All page objects should extend this class
 */
export class BasePage {
    protected page: Page;
    protected baseUrl: string = process.env.BASE_URL || 'https://example.com';

    constructor(page: Page) {
        this.page = page;
    }

    /**
     * Navigate to a specific URL
     */
    async navigate(path: string = ''): Promise<void> {
        const url = this.baseUrl + path;
        await this.page.goto(url, { waitUntil: 'domcontentloaded' });
    }

    /**
     * Get page title
     */
    async getPageTitle(): Promise<string> {
        return await this.page.title();
    }

    /**
     * Wait for element to be visible
     */
    async waitForElement(locator: Locator): Promise<void> {
        await locator.waitFor({ state: 'visible', timeout: 10_000 });
    }

    /**
     * Fill input field
     */
    async fillInput(locator: Locator, text: string): Promise<void> {
        await locator.fill(text);
    }

    /**
     * Click element
     */
    async clickElement(locator: Locator): Promise<void> {
        await locator.click();
    }

    /**
     * Get text content
     */
    async getElementText(locator: Locator): Promise<string> {
        return await locator.textContent() || '';
    }

    /**
     * Verify element visibility
     */
    async isElementVisible(locator: Locator): Promise<boolean> {
        return await locator.isVisible().catch(() => false);
    }
}
