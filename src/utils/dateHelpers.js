import { format, formatDistanceToNow, isValid, parseISO } from 'date-fns';

/**
 * Safely creates a Date object from various input types
 * @param {string|Date|number} dateInput - The date input to parse
 * @returns {Date|null} Valid Date object or null if invalid
 */
export const safeParseDate = (dateInput) => {
  if (!dateInput) return null;
  
  let date;
  
  if (dateInput instanceof Date) {
    date = dateInput;
  } else if (typeof dateInput === 'string') {
    // Try parsing as ISO string first, then as regular date string
    date = dateInput.includes('T') || dateInput.includes('Z') 
      ? parseISO(dateInput) 
      : new Date(dateInput);
  } else if (typeof dateInput === 'number') {
    date = new Date(dateInput);
  } else {
    return null;
  }
  
  return isValid(date) ? date : null;
};

/**
 * Safely formats a date using date-fns format function
 * @param {string|Date|number} dateInput - The date to format
 * @param {string} formatStr - The format string
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} Formatted date or fallback
 */
export const safeFormat = (dateInput, formatStr = 'MMM d, yyyy', fallback = 'Invalid date') => {
  const date = safeParseDate(dateInput);
  if (!date) return fallback;
  
  try {
    return format(date, formatStr);
  } catch (error) {
    console.warn('Date formatting error:', error);
    return fallback;
  }
};

/**
 * Safely formats distance to now using date-fns
 * @param {string|Date|number} dateInput - The date to format
 * @param {object} options - Options for formatDistanceToNow
 * @param {string} fallback - Fallback text if date is invalid
 * @returns {string} Formatted distance or fallback
 */
export const safeFormatDistanceToNow = (dateInput, options = { addSuffix: true }, fallback = 'Unknown time') => {
  const date = safeParseDate(dateInput);
  if (!date) return fallback;
  
  try {
    return formatDistanceToNow(date, options);
  } catch (error) {
    console.warn('Distance formatting error:', error);
    return fallback;
  }
};

/**
 * Safely checks if a date is after another date
 * @param {string|Date|number} date1 - First date
 * @param {string|Date|number} date2 - Second date
 * @returns {boolean} True if date1 is after date2, false otherwise
 */
export const safeIsAfter = (date1, date2) => {
  const d1 = safeParseDate(date1);
  const d2 = safeParseDate(date2);
  
  if (!d1 || !d2) return false;
  
  try {
    return d1.getTime() > d2.getTime();
  } catch (error) {
    console.warn('Date comparison error:', error);
    return false;
  }
};

/**
 * Validates if a date input is valid
 * @param {string|Date|number} dateInput - The date to validate
 * @returns {boolean} True if valid, false otherwise
 */
export const isValidDate = (dateInput) => {
  const date = safeParseDate(dateInput);
  return date !== null;
};