import { describe, expect, it } from 'vitest';
import { formatCalgaryTime } from './time';
describe('Calgary clock', () => {
	it('uses permanent UTC-6 after November 2026', () =>
		expect(formatCalgaryTime(new Date('2026-11-12T18:30:00Z'))).toContain('12:30'));
});
