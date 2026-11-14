import { defineConfig } from '@playwright/test';

export default defineConfig({
	workers: 1,
	reporter: 'list',
	use: {
		baseURL: 'http://127.0.0.1:4205',
		screenshot: 'only-on-failure',
		trace: 'retain-on-failure',
		launchOptions: { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
	},
	webServer: {
		command: 'npm run build && PORTFOLIO_E2E_FIXTURES=true PORT=4205 HOST=127.0.0.1 node build',
		url: 'http://127.0.0.1:4205/home',
		reuseExistingServer: true,
		timeout: 120000
	},
	testMatch: '**/*.e2e.{ts,js}'
});
