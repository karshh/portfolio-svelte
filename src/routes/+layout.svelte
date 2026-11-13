<script lang="ts">
	import '../app.css';
	import { resolve } from '$app/paths';
	import { page } from '$app/state';
	import type { LayoutProps } from './$types';

	const navigationItems = ['home', 'news', 'sait', 'contact'] as const;

	let { children }: LayoutProps = $props();
	let menuOpen = $state(false);

	function closeMenu(): void {
		menuOpen = false;
	}
</script>

<svelte:head>
	<title>Karsh Sharma | Full-stack Developer</title>
	<meta name="description" content="Karsh Sharma's full-stack development portfolio." />
	<link rel="icon" href="/favicon.png" />
</svelte:head>

<div class="site-shell" data-hydrated="true">
	<nav class="navbar">
		<div class="container nav-inner">
			<a class="brand" href={resolve('/home')}>usharma</a>
			<button
				class="nav-toggle"
				type="button"
				aria-expanded={menuOpen}
				aria-controls="primary-navigation"
				aria-label="Toggle navigation"
				onclick={() => (menuOpen = !menuOpen)}
			>
				<span></span>
			</button>

			<div
				id="primary-navigation"
				class="nav-links"
				class:open={menuOpen}
				aria-label="Primary navigation"
			>
				{#each navigationItems as item (item)}
					<a
						class="nav-link"
						class:active={page.url.pathname === `/${item}`}
						href={resolve(`/${item}`)}
						onclick={closeMenu}
					>
						{item}
					</a>
				{/each}
			</div>
		</div>
	</nav>

	<main>{@render children()}</main>

	<footer class="footer">
		<div class="container">Copyright © Karsh Sharma {new Date().getFullYear()}</div>
	</footer>
</div>
