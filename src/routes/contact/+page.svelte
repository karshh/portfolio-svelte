<script lang="ts">
	import { onMount } from 'svelte';

	type SubmissionStatus = 'idle' | 'sending' | 'sent' | 'error';
	type ContactField = 'name' | 'email' | 'subject';

	interface ContactConfig {
		turnstileSiteKey: string;
	}

	interface ContactResponse {
		error?: string;
	}

	interface TurnstileApi {
		render(
			element: HTMLElement,
			options: {
				sitekey: string;
				theme: 'light';
				size: 'flexible';
				callback: (token: string) => void;
			}
		): string;
	}

	const fields: ContactField[] = ['name', 'email', 'subject'];

	let turnstileToken = $state('');
	let status = $state<SubmissionStatus>('idle');
	let errorMessage = $state('');
	let turnstileElement: HTMLElement;

	onMount(() => {
		void initializeTurnstile();
	});

	async function initializeTurnstile(): Promise<void> {
		try {
			const response = await fetch('/api/contact/config');
			if (!response.ok) {
				throw new Error('Contact configuration is unavailable.');
			}

			const config = (await response.json()) as ContactConfig;
			const script = document.createElement('script');
			script.src = 'https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit';
			script.async = true;
			script.defer = true;
			script.onload = () => renderTurnstile(config.turnstileSiteKey);
			document.head.appendChild(script);
		} catch {
			errorMessage = 'The contact form is temporarily unavailable.';
		}
	}

	function renderTurnstile(siteKey: string): void {
		const turnstile = (window as Window & { turnstile?: TurnstileApi }).turnstile;
		turnstile?.render(turnstileElement, {
			sitekey: siteKey,
			theme: 'light',
			size: 'flexible',
			callback: (token) => (turnstileToken = token)
		});
	}

	async function submit(event: SubmitEvent): Promise<void> {
		event.preventDefault();
		status = 'sending';
		errorMessage = '';

		const form = event.currentTarget as HTMLFormElement;
		try {
			const response = await fetch('/api/contact', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({
					...Object.fromEntries(new FormData(form)),
					turnstileToken
				})
			});
			const body = (await response.json()) as ContactResponse;

			if (!response.ok) {
				throw new Error(body.error || 'Unable to send this message.');
			}

			status = 'sent';
			turnstileToken = '';
			form.reset();
		} catch (error) {
			status = 'error';
			errorMessage = error instanceof Error ? error.message : 'Unable to send this message.';
		}
	}

	function fieldLabel(field: ContactField): string {
		return field.charAt(0).toUpperCase() + field.slice(1);
	}
</script>

<section class="jumbotron container">
	<h1>Reach out to me!</h1>
</section>

<section class="contact-links">
	<div class="container text-center">
		<h3>Contact Link</h3>
		<br />
		<div class="row justify-center">
			<div class="col-4">
				<a class="contact-card" href="https://github.com/karshh">
					<img class="brand-img" src="/assets/img/GitHub.png" alt="GitHub" />
				</a>
			</div>
			<div class="col-4">
				<a class="contact-card" href="#contact-form">
					<img class="brand-img" src="/assets/img/Mail.png" alt="Contact form" />
				</a>
			</div>
			<div class="col-4">
				<a class="contact-card" href="https://www.linkedin.com/in/karshsharma/">
					<img class="brand-img" src="/assets/img/LinkedIn.png" alt="LinkedIn" />
				</a>
			</div>
		</div>
	</div>
</section>

<section class="form-section">
	<div class="container">
		<form class="form" onsubmit={submit}>
			<h4 id="contact-form"><strong>Contact Form</strong></h4>
			<br />

			{#each fields as field (field)}
				<div class="form-group">
					<label for={field}>{fieldLabel(field)}</label>
					<input
						id={field}
						class="form-control"
						name={field}
						type={field === 'email' ? 'email' : 'text'}
						required
					/>
				</div>
			{/each}

			<div class="form-group">
				<label for="message">Message</label>
				<textarea
					id="message"
					class="form-control"
					name="message"
					rows="4"
					required
					maxlength="5000"></textarea>
			</div>

			<!-- Hidden bot trap. Real users never interact with this input. -->
			<div class="honeypot" aria-hidden="true">
				<label for="website">Website</label>
				<input id="website" name="website" tabindex="-1" autocomplete="off" />
			</div>

			<div bind:this={turnstileElement} class="turnstile" aria-label="Anti-spam verification"></div>

			{#if errorMessage}
				<p class="error" role="alert">{errorMessage}</p>
			{/if}

			<button class="btn btn-dark" disabled={!turnstileToken || status === 'sending'}>
				{status === 'sending' ? 'Sending…' : 'Submit'}
			</button>

			{#if status === 'sent'}
				<p>✓ Sent.</p>
			{/if}
		</form>
	</div>
</section>
