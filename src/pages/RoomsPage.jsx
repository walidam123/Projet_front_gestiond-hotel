import { useState } from 'react';
import { useRooms } from '../hooks/useRooms';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function RoomsPage() {
  const { rooms, loading, refreshRooms: refetch } = useRooms();
  const [showForm, setShowForm]     = useState(false);
  const [editRoom, setEditRoom]     = useState(null);
  const [form, setForm] = useState({
    roomNumber: '', category: 'SIMPLE', pricePerNight: '', floor: '', status: 'LIBRE'
  });

  const statusColors = {
    LIBRE:         'bg-green-100 text-green-800',
    OCCUPEE:       'bg-red-100 text-red-800',
    EN_NETTOYAGE:  'bg-yellow-100 text-yellow-800',
    HORS_SERVICE:  'bg-gray-100 text-gray-800',
  };

  const openAdd = () => {
    setEditRoom(null);
    setForm({ roomNumber: '', category: 'SIMPLE', pricePerNight: '', floor: '', status: 'LIBRE' });
    setShowForm(true);
  };

  const openEdit = (room) => {
    setEditRoom(room);
    setForm({
      roomNumber:    room.roomNumber,
      category:      room.category,
      pricePerNight: room.pricePerNight,
      floor:         room.floor || '',
      status:        room.status,
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.roomNumber || !form.pricePerNight) {
      toast.error('Veuillez remplir tous les champs obligatoires');
      return;
    }
    try {
      if (editRoom) {
        await api.put(`/rooms/${editRoom.id}`, form);
        toast.success('Chambre modifiée avec succès');
      } else {
        await api.post('/rooms', form);
        toast.success(`Chambre ${form.roomNumber} ajoutée avec succès`);
      }
      setShowForm(false);
      refetch();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer cette chambre ?')) return;
    try {
      await api.delete(`/rooms/${id}`);
      toast.success('Chambre supprimée');
      refetch();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const handleStatusChange = async (room, newStatus) => {
    try {
      await api.put(`/rooms/${room.id}`, { ...room, status: newStatus });
      toast.success('Statut mis à jour');
      refetch();
    } catch {
      toast.error('Erreur lors de la mise à jour du statut');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Chambres</h1>
          <p className="text-gray-500 text-sm mt-1">Gestion et statut des chambres.</p>
        </div>
        <button
          onClick={openAdd}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          + Ajouter une chambre
        </button>
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editRoom ? 'Modifier la chambre' : 'Nouvelle chambre'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Numéro de chambre <span className="text-red-500">*</span>
                </label>
                <input type="text" value={form.roomNumber}
                  onChange={e => setForm({ ...form, roomNumber: e.target.value })}
                  placeholder="Ex: 401"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Catégorie</label>
                <select value={form.category}
                  onChange={e => setForm({ ...form, category: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="SIMPLE">Simple</option>
                  <option value="DOUBLE">Double</option>
                  <option value="SUITE">Suite</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Prix / nuit (MAD) <span className="text-red-500">*</span>
                </label>
                <input type="number" value={form.pricePerNight}
                  onChange={e => setForm({ ...form, pricePerNight: e.target.value })}
                  placeholder="Ex: 800"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Étage</label>
                <input type="number" value={form.floor}
                  onChange={e => setForm({ ...form, floor: e.target.value })}
                  placeholder="Ex: 2"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Statut</label>
                <select value={form.status}
                  onChange={e => setForm({ ...form, status: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="LIBRE">Libre</option>
                  <option value="OCCUPEE">Occupée</option>
                  <option value="EN_NETTOYAGE">En nettoyage</option>
                  <option value="HORS_SERVICE">Hors service</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 font-medium">
                  {editRoom ? 'Modifier' : 'Ajouter'}
                </button>
                <button type="button" onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300">
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Grille des chambres */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement...</div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {rooms.map(room => (
            <div key={room.id}
              className="bg-white rounded-xl border shadow-sm p-5 hover:shadow-md transition">
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-lg font-bold text-gray-800">Chambre {room.roomNumber}</h3>
                  <p className="text-sm text-gray-500">{room.category} — Étage {room.floor || '?'}</p>
                </div>
                <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[room.status]}`}>
                  {room.status}
                </span>
              </div>
              <p className="text-yellow-700 font-bold text-lg mb-3">
                {room.pricePerNight} MAD<span className="text-sm font-normal text-gray-400">/nuit</span>
              </p>
              {/* Changement rapide de statut */}
              <select
                value={room.status}
                onChange={e => handleStatusChange(room, e.target.value)}
                className="w-full border rounded-lg px-2 py-1 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              >
                <option value="LIBRE">Libre</option>
                <option value="OCCUPEE">Occupée</option>
                <option value="EN_NETTOYAGE">En nettoyage</option>
                <option value="HORS_SERVICE">Hors service</option>
              </select>
              <div className="flex gap-2">
                <button onClick={() => openEdit(room)}
                  className="flex-1 text-blue-600 border border-blue-200 rounded-lg py-1 text-sm hover:bg-blue-50">
                  Modifier
                </button>
                <button onClick={() => handleDelete(room.id)}
                  className="flex-1 text-red-500 border border-red-200 rounded-lg py-1 text-sm hover:bg-red-50">
                  Supprimer
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
