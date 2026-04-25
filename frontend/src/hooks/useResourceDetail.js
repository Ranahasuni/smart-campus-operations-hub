import { useState, useEffect, useCallback } from 'react';
import api from '../api/axiosConfig';

/**
 * Custom hook to manage resource state and lifecycle.
 */
export const useResourceDetail = (resourceId, selectedDate) => {
  const [resource, setResource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [bookings, setBookings] = useState([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    try {
      const [res, bookingRes] = await Promise.all([
        api.get(`/resources/${resourceId}`),
        api.get(`/bookings/resource/${resourceId}?date=${selectedDate}`).catch(() => ({ data: [] }))
      ]);
      setResource(res.data);
      setBookings(bookingRes.data || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }, [resourceId, selectedDate]);

  useEffect(() => {
    if (resourceId) fetchData();
  }, [fetchData]);

  return { resource, bookings, loading, error, refetch: fetchData };
};
