export interface WeatherObservation { temperatureC: number; observedAt: string; station: string }
export interface NewsItem { title: string; pubdate: string; href: string }
export interface MapInfo { location: string; description: string; latitude: number; longitude: number; created: string }

const STATION_ID = "3031094";
const WEATHER_AGE = 3 * 60 * 60 * 1000;

async function getJson<T>(url: URL): Promise<T> {
  const response = await fetch(url, { signal: AbortSignal.timeout(15_000), headers: { Accept: "application/json" } });
  if (!response.ok) throw new Error(`Upstream returned ${response.status}`);
  return response.json() as Promise<T>;
}

export async function getWeather(now = new Date()): Promise<WeatherObservation> {
  const url = new URL("https://api.weather.gc.ca/collections/swob-realtime/items");
  url.search = new URLSearchParams({ f: "json", "msc_id-value": STATION_ID, datetime: `${new Date(now.getTime() - WEATHER_AGE).toISOString()}/..`, sortby: "-date_tm-value", limit: "10", properties: "air_temp,air_temp-uom,date_tm-value,stn_nam-value,msc_id-value" }).toString();
  const data = await getJson<{ features?: Array<{ properties?: Record<string, unknown> }> }>(url);
  const observations = (data.features ?? []).flatMap(({ properties: p }) => {
    const temperature = p?.air_temp;
    const observedAt = p?.["date_tm-value"];
    const timestamp = typeof observedAt === "string" ? Date.parse(observedAt) : NaN;
    if (p?.["msc_id-value"] !== STATION_ID || p?.["air_temp-uom"] !== "°C" || typeof temperature !== "number" || !Number.isFinite(timestamp) || timestamp < now.getTime() - WEATHER_AGE) return [];
    return [{ temperatureC: temperature, observedAt: new Date(timestamp).toISOString(), station: typeof p?.["stn_nam-value"] === "string" ? p["stn_nam-value"] : "Calgary International CS" }];
  }).sort((a, b) => Date.parse(b.observedAt) - Date.parse(a.observedAt));
  if (!observations[0]) throw new Error("No recent Calgary observation");
  return observations[0];
}

export async function getNews(): Promise<NewsItem[]> {
  const url = new URL("https://data.calgary.ca/resource/3x6m-4vs7.json");
  url.search = new URLSearchParams({ "$select": "title,pubdate,link", "$where": "pubdate is not null", "$order": "pubdate DESC", "$limit": "25" }).toString();
  const data = await getJson<Array<{ title?: string; pubdate?: string; link?: string }>>(url);
  return data.flatMap((item) => {
    if (!item.title?.trim() || !item.pubdate || !item.link) return [];
    try {
      const link = new URL(item.link);
      const date = new Date(item.pubdate);
      if (link.protocol !== "https:" || Number.isNaN(date.valueOf()) || (link.hostname === "newsroom.calgary.ca" && link.pathname === "/")) return [];
      return [{ title: item.title.trim(), pubdate: item.pubdate, href: link.href }];
    } catch { return []; }
  }).sort((a, b) => Date.parse(b.pubdate) - Date.parse(a.pubdate)).slice(0, 11);
}

function floatingCalgaryTimestamp(instant: Date): string {
  const permanentAlbertaTime = Date.parse("2026-11-01T08:00:00Z");
  const parts = new Intl.DateTimeFormat("en-CA", { timeZone: instant.valueOf() >= permanentAlbertaTime ? "Etc/GMT+6" : "America/Edmonton", year: "numeric", month: "2-digit", day: "2-digit", hour: "2-digit", minute: "2-digit", second: "2-digit", hourCycle: "h23" }).formatToParts(instant);
  const value = (type: Intl.DateTimeFormatPartTypes) => parts.find((part) => part.type === type)?.value;
  return `${value("year")}-${value("month")}-${value("day")}T${value("hour")}:${value("minute")}:${value("second")}`;
}

export async function getTraffic(now = new Date()): Promise<MapInfo[]> {
  const cutoff = new Date(now.getTime() - 6 * 60 * 60 * 1000).toISOString().replace(/Z$/, "");
  const url = new URL("https://data.calgary.ca/resource/35ra-9556.json");
  url.search = new URLSearchParams({ "$select": "incident_info,description,start_dt_utc,modified_dt_utc,longitude,latitude", "$where": `modified_dt_utc >= '${cutoff}'`, "$order": "modified_dt_utc DESC", "$limit": "200" }).toString();
  const data = await getJson<Array<Record<string, string>>>(url);
  return data.flatMap((item) => toMapInfo(item.description, item.incident_info, item.latitude, item.longitude, item.start_dt_utc ? `${item.start_dt_utc}Z` : undefined));
}

export async function getDetours(now = new Date()): Promise<MapInfo[]> {
  const timestamp = floatingCalgaryTimestamp(now);
  const url = new URL("https://data.calgary.ca/resource/w8zq-79bq.json");
  url.search = new URLSearchParams({ "$select": "construction_info,description,start_dt,end_dt,longitude,latitude", "$where": `start_dt <= '${timestamp}' AND end_dt >= '${timestamp}'`, "$order": "start_dt DESC", "$limit": "500" }).toString();
  const data = await getJson<Array<Record<string, string>>>(url);
  return data.flatMap((item) => toMapInfo(item.description, item.construction_info, item.latitude, item.longitude, item.start_dt));
}

function toMapInfo(location?: string, description?: string, latitudeValue?: string, longitudeValue?: string, createdValue?: string): MapInfo[] {
  const latitude = Number(latitudeValue), longitude = Number(longitudeValue), created = createdValue ? new Date(createdValue) : null;
  if (!location?.trim() || !description?.trim() || !Number.isFinite(latitude) || !Number.isFinite(longitude) || !created || Number.isNaN(created.valueOf())) return [];
  return [{ location: location.trim(), description: description.trim(), latitude, longitude, created: created.toISOString() }];
}
