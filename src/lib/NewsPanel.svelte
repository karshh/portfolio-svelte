<script lang="ts">
	import type { NewsItem } from './server/data';

	let { item, featured = false }: { item: NewsItem; featured?: boolean } = $props();

	const publishedLabel = $derived.by(() => {
		const published = new Date(item.pubdate);
		return `${published.toLocaleDateString()} ${published.toLocaleTimeString([], {
			hour: 'numeric',
			minute: '2-digit'
		})}`;
	});
</script>

<!-- The URL is validated as HTTPS by the server data adapter before reaching this component. -->
<!-- eslint-disable-next-line svelte/no-navigation-without-resolve -->
<a class="news-panel" class:featured href={item.href} target="_blank" rel="noopener noreferrer">
	<h6>{item.title}.</h6>
	<p><small>{publishedLabel}</small></p>
</a>
