export interface ValidationResult {
  isValid: boolean;
  error?: string;
  sanitized?: any;
}

export const validateHourValue = (hour: number): ValidationResult => {
  if (typeof hour !== 'number' || isNaN(hour)) {
    return { isValid: false, error: 'Hour must be a number' };
  }

  if (hour < 0 || hour > 23) {
    return {
      isValid: false,
      error: `Hour must be between 0-23, got ${hour}`,
    };
  }

  return { isValid: true, sanitized: hour };
};

export const validateTimeString = (timeStr: string): ValidationResult => {
  if (!timeStr || typeof timeStr !== 'string') {
    return { isValid: false, error: 'Time must be a string' };
  }

  // Match HH:MM format
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):([0-5][0-9])$/;
  const match = timeStr.match(timeRegex);

  if (!match) {
    return {
      isValid: false,
      error: `Invalid time format: ${timeStr}. Expected HH:MM`,
    };
  }

  const [_, hours, minutes] = match;
  const hour = parseInt(hours, 10);
  const minute = parseInt(minutes, 10);

  return {
    isValid: true,
    sanitized: { hour, minute, formatted: timeStr },
  };
};

export const validateWakeSleepRange = (
  wake: string,
  sleep: string
): ValidationResult => {
  const wakeValidation = validateTimeString(wake);
  if (!wakeValidation.isValid) {
    return { isValid: false, error: `Invalid wake time: ${wakeValidation.error}` };
  }

  const sleepValidation = validateTimeString(sleep);
  if (!sleepValidation.isValid) {
    return { isValid: false, error: `Invalid sleep time: ${sleepValidation.error}` };
  }

  // Additional business logic: wake and sleep should be different
  if (wake === sleep) {
    return {
      isValid: false,
      error: 'Wake and sleep times cannot be identical',
    };
  }

  return { isValid: true };
};

export const safeParseHour = (timeStr: string | null): number | null => {
  if (!timeStr) return null;

  const validation = validateTimeString(timeStr);
  if (!validation.isValid) {
    console.warn(`Invalid time string: ${timeStr}`, validation.error);
    return null;
  }

  return validation.sanitized.hour;
};
