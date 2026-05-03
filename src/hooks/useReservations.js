import { useState, useEffect } from 'react';
import * as reservationsAPI from '../api/reservationsAPI';
import { toast } from 'react-hot-toast';

export function useReservations() {
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchReservations = async () => {
    try {
      setLoading(true);
      const response = await reservationsAPI.getAllReservations();
      // Format dates for the calendar
      const formatted = response.data.map(res => ({
        ...res,
        start: new Date(res.checkIn),
        end: new Date(res.checkOut),
        title: `Réservation #${res.id}`
      }));
      setReservations(formatted);
    } catch (error) {
      toast.error('Erreur lors du chargement des réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReservations();
  }, []);

  return { reservations, loading, refreshReservations: fetchReservations };
}
