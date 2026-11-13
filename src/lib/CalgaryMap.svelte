<script lang="ts">
	import { onMount } from 'svelte';
	import type { Map as LeafletMap, LatLngTuple } from 'leaflet';
	import type { MapInfo } from './server/data';

	interface Props {
		title: string;
		items: MapInfo[];
		showStarted?: boolean;
	}

	let { title, items, showStarted = false }: Props = $props();
	let mapElement: HTMLElement;
	let map: LeafletMap | undefined;

	onMount(() => {
		void createMap();

		return () => map?.remove();
	});

	async function createMap(): Promise<void> {
		// Leaflet requires the browser DOM, so load it only after the component mounts.
		const L = await import('leaflet');
		map = L.map(mapElement, { scrollWheelZoom: false }).setView([51.0447, -114.0719], 10);

		L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
			attribution: '&copy; OpenStreetMap contributors'
		}).addTo(map);

		const bounds: LatLngTuple[] = [];
		for (const item of items) {
			const point: LatLngTuple = [item.latitude, item.longitude];
			bounds.push(point);

			L.marker(point).addTo(map).bindPopup(buildPopup(item));
		}

		if (bounds.length > 0) {
			map.fitBounds(bounds, { padding: [30, 30], maxZoom: 13 });
		}
	}

	function buildPopup(item: MapInfo): string {
		const started = showStarted ? `<br>Started: ${new Date(item.created).toLocaleString()}` : '';

		return `<strong>${item.location}</strong><br>${item.description}${started}`;
	}
</script>

<div>
	<h3 class="text-center">{title}</h3>
	<div class="map-shell">
		<div
			bind:this={mapElement}
			class="leaflet-map"
			data-testid="leaflet-map"
			aria-label={title}
		></div>
		{#if items.length === 0}
			<p class="map-message">No current items reported.</p>
		{/if}
	</div>
</div>
