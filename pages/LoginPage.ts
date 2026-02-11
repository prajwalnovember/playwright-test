import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * LoginPage - Page Object Model for login functionality
 * Encapsulates all locators and actions for the login page
 */
export class LoginPage extends BasePage {
    // Locators - all UI elements are defined here
    readonly emailInput: Locator;
    readonly passwordInput: Locator;
    readonly loginButton: Locator;
    readonly errorMessage: Locator;
    readonly rememberMeCheckbox: Locator;
    readonly forgotPasswordLink: Locator;

    constructor(page: Page) {
        super(page);
        // Initialize locators
        this.emailInput = page.getByPlaceholder('Email address');
        this.passwordInput = page.getByPlaceholder('Password');
        this.loginButton = page.getByRole('button', { name: /sign in|login/i });
        this.errorMessage = page.getByRole('alert');
        this.rememberMeCheckbox = page.getByLabel('Remember me');
        this.forgotPasswordLink = page.getByRole('link', { name: /forgot password/i });
    }

    /**
     * Navigate to login page
     */
    async goto(): Promise<void> {
        await this.navigate('/login');
    }

    /**
     * Perform login with email and password
     */
    async login(email: string, password: string): Promise<void> {
        await this.fillInput(this.emailInput, email);
        await this.fillInput(this.passwordInput, password);
        await this.clickElement(this.loginButton);
        // Wait for navigation to complete
        await this.page.waitForNavigation({ timeout: 10_000 }).catch(() => { });
    }

    /**
     * Perform login with remember me option
     */
    async loginWithRememberMe(email: string, password: string): Promise<void> {
        await this.fillInput(this.emailInput, email);
        await this.fillInput(this.passwordInput, password);
        await this.clickElement(this.rememberMeCheckbox);
        await this.clickElement(this.loginButton);
        await this.page.waitForNavigation({ timeout: 10_000 }).catch(() => { });
    }

    /**
     * Get error message text
     */
    async getErrorMessage(): Promise<string> {
        return await this.getElementText(this.errorMessage);
    }

    /**
     * Check if error message is displayed
     */
    async isErrorMessageDisplayed(): Promise<boolean> {
        return await this.isElementVisible(this.errorMessage);
    }

    /**
     * Click forgot password link
     */
    async clickForgotPassword(): Promise<void> {
        await this.clickElement(this.forgotPasswordLink);
    }

    /**
     * Verify login page is loaded
     */
    async verifyLoginPageIsLoaded(): Promise<boolean> {
        return await this.isElementVisible(this.emailInput);
    }
}
