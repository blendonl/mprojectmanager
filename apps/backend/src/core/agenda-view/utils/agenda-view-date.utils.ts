const DATE_KEY_REGEX = /^\d{4}-\d{2}-\d{2}$/;
const WEEKDAY_ORDER = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

export const isValidDateKey = (dateKey: string): boolean => DATE_KEY_REGEX.test(dateKey);

export const parseDateKey = (dateKey: string): { year: number; month: number; day: number } => {
  if (!isValidDateKey(dateKey)) {
    throw new Error(`Invalid date key: ${dateKey}`);
  }

  const [year, month, day] = dateKey.split('-').map(Number);
  return { year, month, day };
};

const getTimeZoneParts = (
  date: Date,
  timeZone: string,
  options: Intl.DateTimeFormatOptions
): Record<string, string> => {
  const formatter = new Intl.DateTimeFormat('en-US', {
    timeZone,
    ...options,
  });
  const parts = formatter.formatToParts(date);
  return parts.reduce<Record<string, string>>((acc, part) => {
    acc[part.type] = part.value;
    return acc;
  }, {});
};

export const formatDateKeyInTimeZone = (date: Date, timeZone: string): string => {
  const parts = getTimeZoneParts(date, timeZone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  });
  return `${parts.year}-${parts.month}-${parts.day}`;
};

export const formatDateKeyUtc = (date: Date): string => date.toISOString().split('T')[0];

export const getUtcStartOfDay = (dateKey: string): Date =>
  new Date(`${dateKey}T00:00:00.000Z`);

export const getUtcEndOfDay = (dateKey: string): Date =>
  new Date(`${dateKey}T23:59:59.999Z`);

const getTimeZoneOffset = (date: Date, timeZone: string): number => {
  const parts = getTimeZoneParts(date, timeZone, {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
    hour12: false,
  });
  const utcTimestamp = Date.UTC(
    Number(parts.year),
    Number(parts.month) - 1,
    Number(parts.day),
    Number(parts.hour),
    Number(parts.minute),
    Number(parts.second),
  );
  return utcTimestamp - date.getTime();
};

export const getZonedStartOfDay = (dateKey: string, timeZone: string): Date => {
  const { year, month, day } = parseDateKey(dateKey);
  const utcDate = new Date(Date.UTC(year, month - 1, day, 0, 0, 0));
  const offset = getTimeZoneOffset(utcDate, timeZone);
  return new Date(utcDate.getTime() - offset);
};

export const getZonedEndOfDay = (dateKey: string, timeZone: string): Date => {
  const nextDateKey = addDaysToDateKey(dateKey, 1);
  const nextStart = getZonedStartOfDay(nextDateKey, timeZone);
  return new Date(nextStart.getTime() - 1);
};

export const getTodayDateKey = (timeZone: string): string =>
  formatDateKeyInTimeZone(new Date(), timeZone);

export const addDaysToDateKey = (dateKey: string, days: number): string => {
  const { year, month, day } = parseDateKey(dateKey);
  const date = new Date(Date.UTC(year, month - 1, day));
  date.setUTCDate(date.getUTCDate() + days);
  return formatDateKeyUtc(date);
};

const getDaysInMonth = (year: number, month: number): number => {
  return new Date(Date.UTC(year, month, 0)).getUTCDate();
};

export const addMonthsToDateKey = (dateKey: string, months: number): string => {
  const { year, month, day } = parseDateKey(dateKey);
  const targetMonthIndex = month - 1 + months;
  const targetYear = year + Math.floor(targetMonthIndex / 12);
  const normalizedMonthIndex = ((targetMonthIndex % 12) + 12) % 12;
  const maxDay = getDaysInMonth(targetYear, normalizedMonthIndex + 1);
  const clampedDay = Math.min(day, maxDay);
  const date = new Date(Date.UTC(targetYear, normalizedMonthIndex, clampedDay));
  return formatDateKeyUtc(date);
};

export const getWeekdayIndex = (dateKey: string, timeZone: string): number => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  const parts = getTimeZoneParts(date, timeZone, { weekday: 'short' });
  const weekday = parts.weekday;
  const index = WEEKDAY_ORDER.indexOf(weekday);
  if (index === -1) {
    throw new Error(`Unsupported weekday: ${weekday}`);
  }
  return index;
};

export const getWeekRange = (dateKey: string, timeZone: string): { start: string; end: string } => {
  const weekdayIndex = getWeekdayIndex(dateKey, timeZone);
  const start = addDaysToDateKey(dateKey, -weekdayIndex);
  const end = addDaysToDateKey(start, 6);
  return { start, end };
};

export const getWeekDays = (dateKey: string, timeZone: string): string[] => {
  const { start } = getWeekRange(dateKey, timeZone);
  return Array.from({ length: 7 }, (_, index) => addDaysToDateKey(start, index));
};

export const getMonthRange = (dateKey: string): { start: string; end: string } => {
  const { year, month } = parseDateKey(dateKey);
  const start = `${year}-${String(month).padStart(2, '0')}-01`;
  const endDate = new Date(Date.UTC(year, month, 0));
  return { start, end: formatDateKeyUtc(endDate) };
};

export const getMonthGridDays = (dateKey: string, timeZone: string): string[] => {
  const { start } = getMonthRange(dateKey);
  const weekdayIndex = getWeekdayIndex(start, timeZone);
  const gridStart = addDaysToDateKey(start, -weekdayIndex);
  return Array.from({ length: 42 }, (_, index) => addDaysToDateKey(gridStart, index));
};

export const formatDayLabel = (dateKey: string, timeZone: string): string => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'long',
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  }).format(date);
};

export const formatMonthLabel = (dateKey: string, timeZone: string): string => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    month: 'long',
    year: 'numeric',
  }).format(date);
};

export const formatWeekLabel = (startDateKey: string, endDateKey: string, timeZone: string): string => {
  const startDate = getZonedStartOfDay(startDateKey, timeZone);
  const endDate = getZonedStartOfDay(endDateKey, timeZone);
  const startParts = getTimeZoneParts(startDate, timeZone, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
  const endParts = getTimeZoneParts(endDate, timeZone, {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });

  if (startParts.year === endParts.year) {
    if (startParts.month === endParts.month) {
      return `${startParts.month} ${startParts.day} - ${endParts.day}, ${endParts.year}`;
    }
    return `${startParts.month} ${startParts.day} - ${endParts.month} ${endParts.day}, ${endParts.year}`;
  }

  return `${startParts.month} ${startParts.day}, ${startParts.year} - ${endParts.month} ${endParts.day}, ${endParts.year}`;
};

export const formatWeekDayLabel = (dateKey: string, timeZone: string): string => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
    day: 'numeric',
  }).format(date);
};

export const formatWeekDayShortLabel = (dateKey: string, timeZone: string): string => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    weekday: 'short',
  }).format(date);
};

export const formatDayNumberLabel = (dateKey: string, timeZone: string): string => {
  const date = getZonedStartOfDay(dateKey, timeZone);
  return new Intl.DateTimeFormat('en-US', {
    timeZone,
    day: 'numeric',
  }).format(date);
};

export const getWeekdayLabels = (timeZone: string): string[] => {
  const monday = '2021-01-04';
  return getWeekDays(monday, timeZone).map((dateKey) =>
    new Intl.DateTimeFormat('en-US', { timeZone, weekday: 'short' }).format(
      getZonedStartOfDay(dateKey, timeZone)
    )
  );
};

export const formatHourLabel = (hour: number): string => {
  if (hour === 0) return '12 AM';
  if (hour === 12) return '12 PM';
  if (hour < 12) return `${hour} AM`;
  return `${hour - 12} PM`;
};

export const getTimePartsInTimeZone = (
  date: Date,
  timeZone: string
): { hour: number; minute: number } => {
  const parts = getTimeZoneParts(date, timeZone, {
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  });
  return {
    hour: Number(parts.hour),
    minute: Number(parts.minute),
  };
};
