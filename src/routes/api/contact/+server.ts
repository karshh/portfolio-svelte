import { json } from '@sveltejs/kit';
import type { RequestHandler } from './$types';
import { validateContactMessage } from '../../../lib/server/contact';

const TURNSTILE_VERIFY_URL = 'https://challenges.cloudflare.com/turnstile/v0/siteverify';
const RESEND_EMAIL_URL = 'https://api.resend.com/emails';
const DEVELOPMENT_SECRET_KEY = '1x0000000000000000000000000000000AA';

interface TurnstileResult {
	success?: boolean;
}

export const POST: RequestHandler = async ({ request, fetch }) => {
	const message = validateContactMessage(await request.json());
	if (!message) {
		return json({ error: 'Unable to send this message.' }, { status: 400 });
	}

	const turnstileSecret = getTurnstileSecret();
	if (!turnstileSecret) {
		return json({ error: 'Contact form is unavailable.' }, { status: 503 });
	}

	const turnstileIsValid = await verifyTurnstile(fetch, turnstileSecret, message.turnstileToken);
	if (!turnstileIsValid) {
		return json({ error: 'Please complete the anti-spam check and try again.' }, { status: 400 });
	}

	// Development uses Cloudflare's published test keys and does not send email.
	if (!import.meta.env.DEV) {
		const emailWasSent = await sendContactEmail(fetch, message);
		if (!emailWasSent) {
			return json({ error: 'Unable to send this message right now.' }, { status: 502 });
		}
	}

	return json({ sent: true }, { status: 202 });
};

function getTurnstileSecret(): string {
	return process.env.TURNSTILE_SECRET_KEY || (import.meta.env.DEV ? DEVELOPMENT_SECRET_KEY : '');
}

async function verifyTurnstile(
	fetchRequest: typeof fetch,
	secret: string,
	token: string
): Promise<boolean> {
	const response = await fetchRequest(TURNSTILE_VERIFY_URL, {
		method: 'POST',
		body: new URLSearchParams({ secret, response: token })
	});
	const result = (await response.json()) as TurnstileResult;

	return response.ok && result.success === true;
}

async function sendContactEmail(
	fetchRequest: typeof fetch,
	message: NonNullable<ReturnType<typeof validateContactMessage>>
): Promise<boolean> {
	const { RESEND_API_KEY, CONTACT_TO_EMAIL, CONTACT_FROM_EMAIL } = process.env;
	if (!RESEND_API_KEY || !CONTACT_TO_EMAIL || !CONTACT_FROM_EMAIL) {
		return false;
	}

	const response = await fetchRequest(RESEND_EMAIL_URL, {
		method: 'POST',
		headers: {
			Authorization: `Bearer ${RESEND_API_KEY}`,
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({
			from: CONTACT_FROM_EMAIL,
			to: [CONTACT_TO_EMAIL],
			reply_to: message.email,
			subject: `Portfolio contact: ${message.subject}`,
			text: `From: ${message.name} <${message.email}>\n\n${message.message}`
		})
	});

	return response.ok;
}
