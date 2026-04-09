/**
 * Formats the duration between two timestamps into a human-readable string.
 * @param {string|Date} start - The starting timestamp
 * @param {string|Date} end - The ending timestamp
 * @returns {string|null} - Formatted duration e.g., "2h 15m" or "45m"
 */
export const formatDuration = (start, end) => {
  if (!start || !end) return null;
  
  const startTime = new Date(start);
  const endTime = new Date(end);
  const diffInMs = endTime - startTime;
  
  // Handle edge cases where resolution time might be reported before creation due to clock sync
  if (diffInMs < 0) return "Just now";
  
  const diffInMins = Math.floor(diffInMs / (1000 * 60));
  
  if (diffInMins < 1) return "Less than a minute";
  
  const hours = Math.floor(diffInMins / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  const mins = diffInMins % 60;
  
  if (days > 0) {
    return `${days}d ${remainingHours}h`;
  }
  
  if (hours > 0) {
    return `${hours}h ${mins}m`;
  }
  
  return `${mins} mins`;
};
