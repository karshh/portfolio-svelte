import { expect, test } from '@playwright/test';

const routes = [
	{ path: 'home', heading: '{ name = Karsh }' },
	{ path: 'news', heading: 'Recent Local News' },
	{ path: 'sait', heading: 'Technical Summary' },
	{ path: 'contact', heading: 'Contact Form' }
] as const;

test('root redirects to the SSR home page with security headers', async ({ page, request }) => {
	const serverResponse = await request.get('/home');
	const html = await serverResponse.text();

	expect(serverResponse.status()).toBe(200);
	expect(serverResponse.headers()['x-content-type-options']).toBe('nosniff');
	expect(serverResponse.headers()['x-frame-options']).toBe('DENY');
	expect(html).toContain('{ name = Karsh }');
	expect(html).not.toContain('mailto:');

	await page.goto('/');
	await expect(page).toHaveURL(/\/home$/);
	await expect(page).toHaveTitle('Karsh Sharma | Full-stack Developer');
});

for (const route of routes) {
	test(`${route.path} supports direct navigation without browser errors`, async ({ page }) => {
		const browserErrors: string[] = [];
		page.on('pageerror', (error) => browserErrors.push(error.message));

		await page.goto(`/${route.path}`);
		await expect(page.locator('.site-shell')).toHaveAttribute('data-hydrated', 'true');
		await expect(page.getByRole('heading', { name: route.heading, exact: true })).toBeVisible();
		await expect(page.getByRole('navigation').getByRole('link', { name: route.path })).toHaveClass(
			/active/
		);
		await expect(page.locator('footer')).toContainText('Karsh Sharma');
		expect(browserErrors).toEqual([]);
	});
}

test('home renders deterministic Calgary weather, clock, attribution, and profile links', async ({
	page
}) => {
	await page.clock.setFixedTime(new Date('2026-11-11T20:30:05Z'));
	await page.goto('/home');

	await expect(page.getByTestId('temperature')).toHaveText('12.3 °C');
	await expect(page.getByTestId('temperature')).toHaveAttribute(
		'title',
		/Calgary International CS/
	);
	await expect(page.getByRole('timer', { name: 'Calgary time' })).not.toBeEmpty();
	await expect(
		page.getByRole('link', { name: 'Environment and Climate Change Canada' })
	).toHaveAttribute('href', /eccc-msc\.github\.io/);
	await expect(page.getByRole('link', { name: 'linkedin' })).toHaveAttribute(
		'href',
		'https://www.linkedin.com/in/karshsharma'
	);
});

test('news renders normalized stories and both interactive map datasets', async ({ page }) => {
	await page.route('https://*.tile.openstreetmap.org/**', (route) => route.abort());
	await page.goto('/news');

	const stories = page.locator('.news-panel');
	await expect(stories).toHaveCount(11);
	await expect(stories.first()).toContainText('Calgary headline 1');
	await expect(stories.first()).toHaveAttribute('href', 'https://newsroom.calgary.ca/story-1/');
	await expect(stories.first()).toHaveAttribute('rel', 'noopener noreferrer');
	await expect(page.getByText('City of Calgary Newsroom.', { exact: true })).toHaveCount(0);

	await expect(page.getByTestId('leaflet-map')).toHaveCount(2);
	await expect(page.locator('.leaflet-marker-icon')).toHaveCount(4);
	await page.locator('.leaflet-marker-icon').first().click();
	await expect(page.locator('.leaflet-popup-content')).toContainText(
		'Memorial Drive and 5A Street NW'
	);
});

test('SAIT route exposes the complete project history', async ({ page }) => {
	await page.goto('/sait');

	await expect(page.locator('.summary')).toHaveCount(8);
	await expect(page.locator('article.project')).toHaveCount(5);
	await expect(page.getByRole('heading', { name: 'Medium-Fake' })).toBeVisible();
	await expect(page.getByRole('link', { name: 'github.com/karshh/medium-fake' })).toHaveAttribute(
		'href',
		'https://github.com/karshh/medium-fake'
	);
});

for (const width of [390, 768, 1440]) {
	for (const route of routes) {
		test(`${route.path} has no horizontal overflow at ${width}px`, async ({ page }) => {
			await page.setViewportSize({ width, height: 900 });
			await page.goto(`/${route.path}`);
			expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(
				width
			);
		});
	}
}

test('mobile navigation opens, changes route, and closes', async ({ page }) => {
	await page.setViewportSize({ width: 390, height: 844 });
	await page.goto('/home');

	const toggle = page.getByRole('button', { name: 'Toggle navigation' });
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
	await toggle.click();
	await expect(toggle).toHaveAttribute('aria-expanded', 'true');
	await page.getByRole('navigation').getByRole('link', { name: 'news' }).click();
	await expect(page).toHaveURL(/\/news$/);
	await expect(toggle).toHaveAttribute('aria-expanded', 'false');
});

test('server rejects an invalid contact payload before contacting providers', async ({
	request
}) => {
	const response = await request.post('/api/contact', {
		data: { name: '', email: 'not-an-email' }
	});

	expect(response.status()).toBe(400);
	await expect(response.json()).resolves.toEqual({ error: 'Unable to send this message.' });
});

test('unknown routes return a 404 page', async ({ page }) => {
	const response = await page.goto('/not-a-real-page');

	expect(response?.status()).toBe(404);
	await expect(page.locator('body')).toContainText('404');
});
