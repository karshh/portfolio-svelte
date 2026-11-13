<script lang="ts">
	import CalgaryMap from '../../lib/CalgaryMap.svelte';
	import NewsPanel from '../../lib/NewsPanel.svelte';
	import type { PageProps } from './$types';

	let { data }: PageProps = $props();
</script>

<section class="container page-content">
	<div class="text-center">
		<h3>Recent Local News</h3>
		<p>Powered by: <a href="https://newsroom.calgary.ca/">The Calgary Newsroom</a></p>
	</div>
	<hr />

	{#if data.newsError}
		<div class="text-center error" role="alert">Local news is temporarily unavailable.</div>
	{:else}
		<div data-testid="news-list">
			<div class="row">
				<div class="col-6">
					{#each data.news.slice(0, 1) as item (item.href)}
						<NewsPanel {item} featured />
					{/each}
				</div>
				<div class="col-6">
					{#each data.news.slice(1, 4) as item (item.href)}
						<NewsPanel {item} />
					{/each}
				</div>
			</div>

			<div class="row">
				{#each data.news.slice(4, 7) as item (item.href)}
					<div class="col-4"><NewsPanel {item} /></div>
				{/each}
			</div>

			<div class="row justify-center">
				{#each data.news.slice(7, 11) as item (item.href)}
					<div class="col-3"><NewsPanel {item} /></div>
				{/each}
			</div>
		</div>
	{/if}
	<br /><br />
</section>

<section class="traffic">
	<div class="container">
		<div class="row justify-around">
			<div class="col-6">
				<CalgaryMap title="Traffic Incidents" items={data.traffic} showStarted />
			</div>
			<div class="col-6">
				<CalgaryMap title="Current Detours" items={data.detours} />
			</div>
		</div>
	</div>
</section>
