import { test, expect, Page, Locator, TestInfo } from '@playwright/test';
import * as fs from 'fs'; // not used
import * as path from 'path'; //not used

/**
 * Please note that all classes are in single file since it was asked so. But in real scenarios/production, Base page, Utils and CareersPage
 * and tests into separate files.
 * 
 **/

/**
 * BasePage. 
 */
class BasePage {
    protected page: Page;
    protected baseUrl = 'https://careers.osapiens.com/'; // better to use environment variables for baseUrl for flexible configuration.
    //protected reportsDir = path.resolve('./reports');

    constructor(page: Page) {
        this.page = page;
        // fs.mkdirSync(this.reportsDir, { recursive: true }); // Ensure reports folder exists - but consider this moving into reporting utility and not here.
    }

    /**
     * Navigate to the given url. Default base url in our case.
     * @param endpoint 
     */
    async navigate(endpoint = ''): Promise<void> {
        const fullUrl = this.baseUrl + endpoint;
        console.log(`Navigating to ${fullUrl}`);
        //await this.page.setViewportSize({ width: 1920, height: 1080 });
        await this.page.goto(fullUrl, { waitUntil: 'domcontentloaded' , timeout: 10_000});
        
    }
}

/**
 * Utility class to handle cookies, retry mechanisms etc
 */
class Utils {
    /**
     * Handle cookies to accept or deny. Could be handled separately. could also use test.step here
     */
    static async handleCookies(page: Page): Promise<void> {
        const acceptButton = page.getByRole('button' , {name: 'Accept all' });
        const denyButton = page.getByRole('button' , {name: 'Reject all' });

        try {
            const acceptVisible = await acceptButton.isVisible().catch(() => false);
            const denyVisible = await denyButton.isVisible().catch(() => false);

            if (acceptVisible) {
                //await acceptButton.focus();
                await acceptButton.click();
                console.log('Cookies accepted.');
            } else if (denyVisible) {
                //await denyButton.click();
                await denyButton.click();
                console.log('Cookies denied.');
            } else {
                console.log('No cookies are detected in the page.');
            }
        } catch (error) {
            console.log('Error while handling cookies:', (error as Error).message);
        }
    }

    /**
     * Retry mechanism for flaky tests - Full stack trace could be logged for better debugging.
     */
    static async runWithRetry(fn: () => Promise<void>, maxRetries = 2): Promise<void> {
        for (let attempt = 1; attempt <= maxRetries; attempt++) {
            try {
                console.log(`Attempt ${attempt} of ${maxRetries}.`);
                await fn();
                console.log('Test passed');
                return;
            } catch (error) {
                console.error(`Attempt failed. ${attempt} failed: ${(error as Error).message}`);
                if (attempt === maxRetries) throw new Error(`Test failed after ${maxRetries} attempts.`);
            }
        }
    }
}

/**
 * Osapiens Careers Page that extends base page
 */
class CareersPage extends BasePage {
    readonly isCareersPageTitleVisible: Locator;
    readonly viewJobsButton: Locator;
    readonly allOpenJobPositionsLink: Locator;
   

    constructor(page: Page) {
        super(page);
        //this.isCareersPageTitleVisible = page.getByRole('button', { name:'View Jobs'});
        this.isCareersPageTitleVisible = page.locator('a.careers-navigation-block__menu-item', { hasText: 'View Jobs' });
        this.viewJobsButton = page.locator('a.external-button[href="#js-careers-jobs-block"]');// can use getByRole ('button', { hasText: 'Learn more' });
        //this.viewJobsButton = page.getByRole('button', { name:'View Jobs'});      
        this.allOpenJobPositionsLink = page.locator('//a[starts-with(@href, "/en/postings/") and text()]');
        //this.allOpenJobPositionsLink = page.getByRole('rowgroup')
        
    }
    /**
       * Opens the careers page and validates it's loaded
       */
    async openCareersPage(): Promise<void> {
        await test.step('Open Careers Page', async () => {
            await super.navigate();            
            await expect(this.isCareersPageTitleVisible).toBeVisible();
            console.log('Osapiens careers page is loaded.');
        });
    }

    /**
     * Click on 'view jobs' button
     */
    async clickViewJobsButton(): Promise<void> {
        await test.step('Click "View Jobs" button', async () => {
            await this.viewJobsButton.waitFor({ state: 'visible', timeout: 10000 });
            await this.viewJobsButton.click();
            console.log('Click "View jobs" button.');
        });
    }

    /**
     * Fetches all open job titles with index and return as array of objects.
     */
    async getAllJobOpeningsWithTitle(): Promise<{ title: string; }[]> {

        let allOpenJobPositionsWithTitle: { title: string }[] = [];
        //await this.page.waitForSelector('a[href^="/en/postings/"]', { timeout: 15000 });
        await this.allOpenJobPositionsLink.first().waitFor({ state: 'visible', timeout: 15000 });

        // Retrieve all open job positions with titles and index. 
        allOpenJobPositionsWithTitle = (await this.allOpenJobPositionsLink.allInnerTexts()).map((title, index) => {
            const trimmed = title.trim();
            console.log(`   ${index + 1}. ${trimmed}`);
            return { title: trimmed };
        });

        if (allOpenJobPositionsWithTitle.length > 0) {
            console.log(`There are currently ${allOpenJobPositionsWithTitle.length} open positions found.`);
        } else {
            console.log(`There are no open positions found.`);
        }

        //Logs and save them to AllOpenJobTitles.json file. always better to have a separate reporting utlity. Not to mix any file systems inside pages.
        //const allJobTitelesPath = path.join(this.reportsDir, 'AllOpenJobTitles.json');
        //fs.writeFileSync(allJobTitelesPath, JSON.stringify(allOpenJobPositionsWithTitle, null, 2));
        return allOpenJobPositionsWithTitle;
    }

    /**
     * Filter out job objects containing 'Quality' in title.
     *  
    */
    async getJobsWithTitleQuality(allJobsWithTitleQuality: { title: string }[]): Promise<{ title: string }[]> {
        let hasJobTitleQuality: { title: string }[] = [];
        await test.step('Filter jobs containing "Quality"', async () => {
           // hasJobTitleQuality = allJobsWithTitleQuality.filter(job => /\bquality\b/i.test(job.title)); // other approaches could be used here like job.title.toLowerCase().includes('quality')
            hasJobTitleQuality = allJobsWithTitleQuality.filter(job => job.title.toLowerCase().includes('quality'));
            if (hasJobTitleQuality.length > 0) {
                console.log('Job titles containing "Quality":');
                hasJobTitleQuality.forEach((job, index) => console.log(`   ${index + 1}. ${job.title}`));
            } else {
                console.log('No jobs contain "Quality" in the title.');
            }
        });
        return hasJobTitleQuality;
    }
}

/**
 * Main test here - could improve readability by breaking steps into smaller helper methods in test file
 */
test('Verify Osapiens careers page and validate jobs that contain "Quality" in the title.', async ({ page }, testInfo) => {
        await Utils.runWithRetry(async () => {
        const careersPage = new CareersPage(page);

        await careersPage.openCareersPage();
        await Utils.handleCookies(page);
        await careersPage.clickViewJobsButton(); // Click on button “View Jobs”
        const getAllJobsWithTitle = await careersPage.getAllJobOpeningsWithTitle(); //Get all job titles
        const jobsWithTitleQuality = await careersPage.getJobsWithTitleQuality(getAllJobsWithTitle); // get job title with 'Quality' in it.

        // Assertion - Test will fail if none of the jobs contain 'Quality' in the title 
        await test.step('Validate jobs to contain "Quality" in title', async () => {
            expect(jobsWithTitleQuality.length, `There are ${jobsWithTitleQuality.length}  jobs with "Quality" in the title.`)
                .toBeGreaterThanOrEqual(1);
            console.log(`Expect atleast one job with "Quality" in the title, and we have: ${jobsWithTitleQuality.length}`);
        });
    });
});
