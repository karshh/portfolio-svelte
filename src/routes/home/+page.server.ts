import { getWeather } from '../../lib/server/data';
import { fixtureWeather } from '../../lib/server/e2e-fixtures';
export async function load() {
	if (process.env.PORTFOLIO_E2E_FIXTURES === 'true') return { weather: fixtureWeather };
	try {
		return { weather: await getWeather() };
	} catch {
		return { weather: null };
	}
}
