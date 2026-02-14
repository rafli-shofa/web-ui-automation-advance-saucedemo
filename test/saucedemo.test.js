require('chromedriver');

const { Builder, By, until } = require('selenium-webdriver');
const assert = require('assert');
const fs = require('fs');

describe('SauceDemo Automation Test - Advance Part 1', function () {
    let driver;
    this.timeout(60000);

    // =========================
    // BEFORE: setup & login ONCE
    // =========================
    before(async function () {
        driver = await new Builder()
            .forBrowser('chrome')
            .build();

        await driver.get('https://www.saucedemo.com');

        await driver.findElement(By.css('[data-test="username"]'))
            .sendKeys('standard_user');

        await driver.findElement(By.css('[data-test="password"]'))
            .sendKeys('secret_sauce');

        await driver.findElement(By.id('login-button')).click();

        await driver.wait(until.urlContains('inventory'), 15000);
        await driver.wait(
            until.elementLocated(By.className('shopping_cart_link')),
            15000
        );
    });

    // =================================
    // BEFORE EACH: reset halaman inventory
    // =================================
    beforeEach(async function () {
        await driver.get('https://www.saucedemo.com/inventory.html');
    });

    // =========================
    // TEST CASE 1
    // =========================
    it('Sukses Login ke SauceDemo', async function () {
        const title = await driver.getTitle();
        assert.strictEqual(title, 'Swag Labs');

        const cart = await driver.findElement(
            By.className('shopping_cart_link')
        );
        assert.ok(cart);
    });

    // =========================
    // TEST CASE 2
    // =========================
    it('Urutkan Produk dari A ke Z', async function () {
        const dropdown = await driver.findElement(
            By.css('[data-test="product-sort-container"]')
        );

        await dropdown.sendKeys('az');

        const items = await driver.findElements(
            By.className('inventory_item_name')
        );

        const names = [];
        for (let item of items) {
            names.push(await item.getText());
        }

        const sortedNames = [...names].sort();
        assert.deepStrictEqual(names, sortedNames);
    });

    // =================================
    // AFTER EACH: screenshot jika FAIL
    // =================================
    afterEach(async function () {
        if (this.currentTest.state === 'failed') {
            if (!fs.existsSync('screenshots')) {
                fs.mkdirSync('screenshots');
            }

            const image = await driver.takeScreenshot();
            fs.writeFileSync(
                `screenshots/${this.currentTest.title}.png`,
                image,
                'base64'
            );
        }
    });

    // =========================
    // AFTER: close browser
    // =========================
    after(async function () {
        if (driver) {
            await driver.quit();
        }
    });
});
