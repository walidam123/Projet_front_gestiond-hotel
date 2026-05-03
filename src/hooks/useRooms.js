import { useState, useEffect } from 'react';
import * as roomsAPI from '../api/roomsAPI';
import { toast } from 'react-hot-toast';

export function useRooms() {
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchRooms = async () => {
    try {
      setLoading(true);
      const response = await roomsAPI.getAllRooms();
      setRooms(response.data);
    } catch (error) {
      toast.error('Erreur lors du chargement des chambres.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchRooms();
  }, []);

  const updateRoomStatus = async (id, newStatus) => {
    const roomToUpdate = rooms.find(r => r.id === id);
    if (!roomToUpdate) return;
    try {
      await roomsAPI.updateRoom(id, { ...roomToUpdate, status: newStatus });
      toast.success('Statut mis à jour avec succès.');
      fetchRooms(); // Refresh the list
    } catch (error) {
      toast.error('Erreur lors de la mise à jour du statut.');
    }
  };

  return { rooms, loading, updateRoomStatus, refreshRooms: fetchRooms };
}
