import { getWeather } from '../../lib/server/data';
export async function load() {
	try {
		return { weather: await getWeather() };
	} catch {
		return { weather: null };
	}
}
