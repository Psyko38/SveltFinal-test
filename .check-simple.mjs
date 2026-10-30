import { chromium } from '@playwright/test';

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on('pageerror', (error) => errors.push(error.message));

await page.goto('http://localhost:5181/');
await page.waitForFunction(
	() => document.querySelectorAll('.leaflet-marker-icon').length === 13,
	null,
	{ timeout: 15000 }
);

await page.evaluate(() => {
	window.__noReloadMarker = true;
});

await page.locator('input[name="q"]').fill('Shoreditch, London');
await page.waitForFunction(
	() => document.querySelectorAll('.leaflet-marker-icon').length === 6,
	null,
	{ timeout: 30000 }
);

const addressSearch = await page.evaluate(() => ({
	url: location.href,
	markers: document.querySelectorAll('.leaflet-marker-icon').length,
	sidebarItems: document.querySelectorAll('.main > div > div').length,
	circles: document.querySelectorAll('path.leaflet-interactive').length,
	noReload: window.__noReloadMarker === true,
	activeName: document.activeElement?.getAttribute('name')
}));

await page.screenshot({ path: '/tmp/opencode/simplified-address.png', fullPage: true });

await page.locator('input[name="q"]').fill('Brat');
await page.waitForFunction(
	() =>
		document.querySelectorAll('.leaflet-marker-icon').length === 2 &&
		document.querySelectorAll('path.leaflet-interactive').length === 0,
	null,
	{ timeout: 15000 }
);

const nameSearch = await page.evaluate(() => ({
	url: location.href,
	markers: document.querySelectorAll('.leaflet-marker-icon').length,
	circles: document.querySelectorAll('path.leaflet-interactive').length
}));

console.log(JSON.stringify({ addressSearch, nameSearch, errors }, null, 2));

await browser.close();
