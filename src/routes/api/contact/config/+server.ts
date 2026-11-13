import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';

const DEVELOPMENT_SITE_KEY = '1x00000000000000000000AA';

export const GET: RequestHandler = () => {
	const siteKey =
		process.env.TURNSTILE_SITE_KEY || (import.meta.env.DEV ? DEVELOPMENT_SITE_KEY : '');

	if (!siteKey) {
		return json({ error: 'Contact form is unavailable.' }, { status: 503 });
	}

	return json({ turnstileSiteKey: siteKey });
};
