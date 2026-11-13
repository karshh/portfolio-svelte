import { expect, test } from '@playwright/test';

test('all portfolio routes render', async ({ page }) => {
	for (const [route, heading] of [
		['home', '{ name = Karsh }'],
		['news', 'Recent Local News'],
		['sait', 'Technical Summary'],
		['contact', 'Contact Form']
	]) {
		await page.goto('/' + route);
		await expect(page.getByRole('heading', { name: heading })).toBeVisible();
	}
	await page.goto('/news');
	await expect(page.getByTestId('leaflet-map')).toHaveCount(2);
	await expect(page.getByText('City of Calgary Newsroom.', { exact: true })).toHaveCount(0);
});
test('mobile menu works without overflow', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/home');
	const button = page.getByRole('button', { name: 'Toggle navigation' });
	await button.click();
	await page.getByRole('navigation').getByRole('link', { name: 'news' }).click();
	await expect(page).toHaveURL(/\/news$/);
	expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
});
