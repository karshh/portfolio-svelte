const PERMANENT_ALBERTA_TIME_START = Date.parse('2026-11-01T08:00:00Z');
export function formatCalgaryTime(date: Date): string {
	return new Intl.DateTimeFormat('en-CA', {
		timeZone: date.valueOf() >= PERMANENT_ALBERTA_TIME_START ? 'Etc/GMT+6' : 'America/Edmonton',
		hour: 'numeric',
		minute: '2-digit',
		second: '2-digit',
		hour12: true
	}).format(date);
}
