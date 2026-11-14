import type { MapInfo, NewsItem, WeatherObservation } from './data';

export const fixtureWeather: WeatherObservation = {
	temperatureC: 12.3,
	observedAt: '2026-11-11T20:30:05.000Z',
	station: 'Calgary International CS'
};

export const fixtureNews: NewsItem[] = Array.from({ length: 11 }, (_, index) => ({
	title: `Calgary headline ${index + 1}`,
	pubdate: '2026-11-11T12:00:00',
	href: `https://newsroom.calgary.ca/story-${index + 1}/`
}));

export const fixtureTraffic: MapInfo[] = [
	{
		location: 'Memorial Drive and 5A Street NW',
		description: 'Traffic incident.',
		latitude: 51.057,
		longitude: -114.074,
		created: '2026-11-11T19:00:00.000Z'
	},
	{
		location: 'Macleod Trail SE',
		description: 'Traffic incident.',
		latitude: 50.95,
		longitude: -114.071,
		created: '2026-11-11T19:30:00.000Z'
	}
];

export const fixtureDetours: MapInfo[] = [
	{
		location: '5 Street SW',
		description: 'Construction detour.',
		latitude: 51.045,
		longitude: -114.074,
		created: '2026-11-01T08:00:00.000Z'
	},
	{
		location: '17 Avenue SE',
		description: 'Construction detour.',
		latitude: 51.038,
		longitude: -114.011,
		created: '2026-11-02T08:00:00.000Z'
	}
];
