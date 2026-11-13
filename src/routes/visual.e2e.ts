import { expect, test, type Page } from '@playwright/test';

const viewports = [
	{ name: 'desktop', width: 1440, height: 1000 },
	{ name: 'mobile', width: 390, height: 844 }
] as const;

const routes = ['home', 'news', 'sait', 'contact'] as const;

async function stabilizeDynamicContent(page: Page, route: (typeof routes)[number]): Promise<void> {
	await page.addStyleTag({
		content: `
			*, *::before, *::after {
				animation: none !important;
				transition: none !important;
			}
			.leaflet-map > * { visibility: hidden !important; }
		`
	});

	if (route === 'home') {
		await page
			.getByTestId('calgary-clock')
			.evaluate((element) => ((element as HTMLElement).style.color = 'transparent'));

		const temperature = page.getByTestId('temperature');
		if (await temperature.count()) {
			await temperature.evaluate((element) => (element.textContent = '12.3 °C'));
		}
	}

	if (route === 'news') {
		await page.locator('.news-panel').evaluateAll((items) => {
			items.forEach((item, index) => {
				const heading = item.querySelector('h6');
				const date = item.querySelector('small');
				if (heading) heading.textContent = `Calgary headline ${index + 1}.`;
				if (date) date.textContent = '11/11/2026 12:00 PM';
			});
		});
	}
}

for (const viewport of viewports) {
	for (const route of routes) {
		test(`${route} ${viewport.name} visual contract`, async ({ page }) => {
			await page.setViewportSize(viewport);

			if (route === 'contact') {
				await page.route('**/api/contact/config', (request) =>
					request.fulfill({ status: 503, json: { error: 'unavailable' } })
				);
			}

			await page.goto(`/${route}`);
			await stabilizeDynamicContent(page, route);

			await expect(page).toHaveScreenshot(`${route}-${viewport.name}.png`, {
				fullPage: true,
				animations: 'disabled',
				maxDiffPixelRatio: 0.005
			});
		});
	}
}
