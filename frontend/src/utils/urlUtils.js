/**
 * Resolves a potentially relative image URL to an absolute backend URL.
 * Handles various formats: absolute URLs, data URLs, paths with/without /api, 
 * and raw filenames from the uploads directory.
 * 
 * @param {string} url - The URL or filename to resolve
 * @param {string} apiBaseUrl - The base URL of the backend (e.g. http://localhost:8082)
 * @returns {string|null} - The resolved absolute URL
 */
export const resolveUrl = (url, apiBaseUrl) => {
  if (!url) return null;
  
  // 1. Return as-is if it's already an absolute URL or a data URL
  if (url.startsWith('http') || url.startsWith('data:')) {
    return url;
  }

  // 2. Standardize API prefix
  const baseUrl = apiBaseUrl || 'http://localhost:8082';
  
  // 3. Handle paths starting with /api/uploads
  if (url.startsWith('/api/uploads')) {
    return `${baseUrl}${url}`;
  }

  // 4. Handle paths starting with /uploads
  if (url.startsWith('/uploads')) {
    return `${baseUrl}/api${url}`;
  }

  // 5. Handle paths starting with uploads/
  if (url.startsWith('uploads/')) {
    return `${baseUrl}/api/${url}`;
  }

  // 6. Handle raw filenames (no slashes) - assume they are in the uploads folder
  if (!url.includes('/')) {
    return `${baseUrl}/api/uploads/${url}`;
  }

  // 7. Fallback for other relative paths
  if (url.startsWith('/')) {
    return `${baseUrl}/api${url}`;
  }

  return `${baseUrl}/api/${url}`;
};
