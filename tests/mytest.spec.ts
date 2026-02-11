import { test, expect } from "@playwright/test";




/* test("title",()=> {

//step1
//step2

//step3


}) */

test.skip("verify title", async ({ page }) => {

    await page.goto("http://www.google.com");

    let title: string = await page.title();
    console.log("title: ", title);

    await expect(page).toHaveTitle("Google");

})

test.skip("Verify header", async ({ page }) => {




})