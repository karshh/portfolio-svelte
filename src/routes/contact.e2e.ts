import { expect, test, type Page } from '@playwright/test';

test.beforeEach(async ({ page }) => {
	await page.addInitScript(() => {
		(window as typeof window & { turnstile: Record<string, unknown> }).turnstile = {
			render: (_element: HTMLElement, options: Record<string, unknown>) => {
				(options.callback as (token: string) => void)('XXXX.DUMMY.TOKEN.XXXX');
				return 'test-widget';
			}
		};
	});
	await page.route('**/turnstile/v0/api.js?**', (route) =>
		route.fulfill({ contentType: 'application/javascript', body: '' })
	);
	await page.route('**/api/contact/config', (route) =>
		route.fulfill({ json: { turnstileSiteKey: '1x00000000000000000000AA' } })
	);
});

async function completeForm(page: Page): Promise<void> {
	await page.getByLabel('Name').fill('Playwright Visitor');
	await page.getByLabel('Email').fill('visitor@example.com');
	await page.getByLabel('Subject').fill('E2E contact');
	await page.getByLabel('Message').fill('This verifies the secure contact flow.');
}

test('submits through the same-origin API without exposing a recipient', async ({ page }) => {
	let submitted: Record<string, string> | undefined;
	await page.route('**/api/contact', async (route) => {
		submitted = route.request().postDataJSON();
		await route.fulfill({ status: 202, json: { sent: true } });
	});

	await page.goto('/contact');
	expect(await page.content()).not.toContain('mailto:');
	await completeForm(page);
	await page.getByRole('button', { name: 'Submit' }).click();

	await expect(page.getByText('✓ Sent.')).toBeVisible();
	expect(submitted).toMatchObject({
		name: 'Playwright Visitor',
		email: 'visitor@example.com',
		subject: 'E2E contact',
		message: 'This verifies the secure contact flow.',
		website: '',
		turnstileToken: 'XXXX.DUMMY.TOKEN.XXXX'
	});
});

test('reports delivery failures and preserves entered values', async ({ page }) => {
	await page.route('**/api/contact', (route) =>
		route.fulfill({ status: 502, json: { error: 'Unable to send this message right now.' } })
	);
	await page.goto('/contact');
	await completeForm(page);
	await page.getByRole('button', { name: 'Submit' }).click();

	await expect(page.getByRole('alert')).toHaveText('Unable to send this message right now.');
	await expect(page.getByLabel('Message')).toHaveValue('This verifies the secure contact flow.');
});

test('contact fields are keyboard reachable in label order', async ({ page }) => {
	await page.goto('/contact#contact-form');
	await page.getByLabel('Name').focus();
	await page.keyboard.press('Tab');
	await expect(page.getByLabel('Email')).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByLabel('Subject')).toBeFocused();
	await page.keyboard.press('Tab');
	await expect(page.getByLabel('Message')).toBeFocused();
});
