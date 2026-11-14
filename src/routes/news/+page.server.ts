import { getNews, getTraffic, getDetours } from '../../lib/server/data';
import { fixtureDetours, fixtureNews, fixtureTraffic } from '../../lib/server/e2e-fixtures';
export async function load() {
	if (process.env.PORTFOLIO_E2E_FIXTURES === 'true') {
		return {
			news: fixtureNews,
			traffic: fixtureTraffic,
			detours: fixtureDetours,
			newsError: false
		};
	}
	const [news, traffic, detours] = await Promise.allSettled([
		getNews(),
		getTraffic(),
		getDetours()
	]);
	return {
		news: news.status === 'fulfilled' ? news.value : [],
		traffic: traffic.status === 'fulfilled' ? traffic.value : [],
		detours: detours.status === 'fulfilled' ? detours.value : [],
		newsError: news.status === 'rejected'
	};
}
