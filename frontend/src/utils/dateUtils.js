/**
 * Utility functions for date manipulation across the smart campus platform.
 */

/**
 * Formats a date string into a user-friendly long format.
 */
export const formatLongDate = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).toLocaleDateString('en-US', {
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });
};

/**
 * Returns the current date in YYYY-MM-DD format, locale-aware.
 */
export const getLocalDateString = () => {
  const now = new Date();
  const offset = now.getTimezoneOffset() * 60000;
  return new Date(now - offset).toISOString().split('T')[0];
};

/**
 * Calculates the day of the week as a short 3-letter string.
 */
export const getDayShortName = (dateString) => {
  return new Date(dateString + 'T12:00:00')
    .toLocaleDateString('en-US', { weekday: 'short' })
    .toLowerCase()
    .substring(0, 3);
};
/**
 * Determines if a booking slot has already passed based on date and time.
 * date: YYYY-MM-DD
 * endTime: HH:mm or HH:mm:ss
 */
export const isPastBooking = (date, endTime) => {
  if (!date || !endTime) return false;
  
  const today = getLocalDateString();
  if (date < today) return true;
  if (date > today) return false;
  
  // Same day: compare time
  const now = new Date();
  const nowTime = now.getHours() * 60 + now.getMinutes();
  
  try {
    const [endH, endM] = endTime.split(':').map(Number);
    const endMinutes = endH * 60 + endM;
    // Buffer: give 5 minutes grace period before moving to history
    return nowTime > (endMinutes + 5);
  } catch (e) {
    return false;
  }
};
