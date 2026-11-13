export interface ContactMessage {
	name: string;
	email: string;
	subject: string;
	message: string;
	website: string;
	turnstileToken: string;
}

const CONTACT_FIELDS = [
	'name',
	'email',
	'subject',
	'message',
	'website',
	'turnstileToken'
] as const;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export function validateContactMessage(value: unknown): ContactMessage | null {
	if (!isRecord(value)) {
		return null;
	}

	if (CONTACT_FIELDS.some((field) => typeof value[field] !== 'string')) {
		return null;
	}

	const contact = Object.fromEntries(
		CONTACT_FIELDS.map((field) => [field, (value[field] as string).trim()])
	) as unknown as ContactMessage;

	return isValidContact(contact) ? contact : null;
}

function isRecord(value: unknown): value is Record<string, unknown> {
	return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function isValidContact(contact: ContactMessage): boolean {
	return (
		contact.name.length >= 1 &&
		contact.name.length <= 100 &&
		contact.email.length <= 254 &&
		EMAIL_PATTERN.test(contact.email) &&
		contact.subject.length >= 1 &&
		contact.subject.length <= 150 &&
		contact.message.length >= 1 &&
		contact.message.length <= 5000 &&
		contact.website.length === 0 &&
		contact.turnstileToken.length >= 1 &&
		contact.turnstileToken.length <= 2048
	);
}
