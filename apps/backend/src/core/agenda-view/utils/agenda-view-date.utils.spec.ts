import {
  addDaysToDateKey,
  addMonthsToDateKey,
  getMonthGridDays,
  getWeekRange,
  getWeekdayLabels,
} from './agenda-view-date.utils';

describe('agenda-view-date.utils', () => {
  it('uses Monday as start of week', () => {
    const range = getWeekRange('2026-02-05', 'UTC');
    expect(range.start).toBe('2026-02-02');
    expect(range.end).toBe('2026-02-08');
  });

  it('adds days across months', () => {
    expect(addDaysToDateKey('2026-01-31', 1)).toBe('2026-02-01');
  });

  it('clamps day when adding months', () => {
    expect(addMonthsToDateKey('2026-01-31', 1)).toBe('2026-02-28');
  });

  it('builds a 6x7 month grid', () => {
    const grid = getMonthGridDays('2026-02-05', 'UTC');
    expect(grid).toHaveLength(42);
  });

  it('returns weekday labels starting Monday', () => {
    const labels = getWeekdayLabels('UTC');
    expect(labels[0]).toBe('Mon');
    expect(labels).toHaveLength(7);
  });
});
