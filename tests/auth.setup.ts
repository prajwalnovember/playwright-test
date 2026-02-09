import { test as setup, expect } from '@playwright/test';
import path from 'path';

const authFile = path.join(__dirname, '../playwright/.auth/user.json');

setup('authentication', async({page}) => {


    

await page.context().storageState({ path: authFile });

})