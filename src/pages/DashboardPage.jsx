import { useState, useEffect } from 'react';
import { BedDouble, Calendar, CheckSquare, TrendingUp } from 'lucide-react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const statusColors = {
  CONFIRMEE: 'bg-green-100 text-green-800',
  EN_ATTENTE: 'bg-yellow-100 text-yellow-800',
  EN_COURS: 'bg-blue-100 text-blue-800',
  TERMINEE: 'bg-gray-100 text-gray-800',
  ANNULEE: 'bg-red-100 text-red-800',
};

export default function DashboardPage() {
  const [rooms, setRooms] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [roomsRes, resRes] = await Promise.all([
          api.get('/rooms'),
          api.get('/reservations'),
        ]);
        setRooms(roomsRes.data);
        setReservations(resRes.data);
      } catch {
        toast.error('Erreur lors du chargement du dashboard');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  // KPIs calculés depuis les vraies données
  const chambresLibres = rooms.filter(r => r.status === 'LIBRE').length;
  const today = new Date().toISOString().split('T')[0];
  const reservationsAujourdhui = reservations.filter(r => r.checkIn === today).length;
  const checkInsAujourdhui = reservations.filter(r => r.checkIn === today && r.status === 'CONFIRMEE').length;
  const revenusJour = reservations
    .filter(r => r.checkIn === today)
    .reduce((sum, r) => {
      if (!r.checkIn || !r.checkOut || !r.room) return sum;
      const nights = Math.round(
        (new Date(r.checkOut) - new Date(r.checkIn)) / (1000 * 60 * 60 * 24)
      );
      return sum + (nights * (r.room?.pricePerNight || 0));
    }, 0);

  const recentReservations = [...reservations]
    .sort((a, b) => b.id - a.id)
    .slice(0, 5);

  if (loading) return (
    <div className="flex items-center justify-center h-64 text-gray-400">
      Chargement du tableau de bord...
    </div>
  );

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tableau de bord</h1>
        <p className="text-gray-500">Bienvenue sur votre espace de gestion hôtelière.</p>
      </div>

      {/* KPIs réels */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-green-100 rounded-lg">
              <BedDouble className="w-5 h-5 text-green-600" />
            </div>
            <span className="text-sm text-gray-500">Chambres disponibles</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{chambresLibres}</p>
          <p className="text-xs text-gray-400 mt-1">sur {rooms.length} chambres total</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-blue-100 rounded-lg">
              <Calendar className="w-5 h-5 text-blue-600" />
            </div>
            <span className="text-sm text-gray-500">Réservations aujourd'hui</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{reservationsAujourdhui}</p>
          <p className="text-xs text-gray-400 mt-1">check-in le {today}</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-purple-100 rounded-lg">
              <CheckSquare className="w-5 h-5 text-purple-600" />
            </div>
            <span className="text-sm text-gray-500">Check-ins du jour</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{checkInsAujourdhui}</p>
          <p className="text-xs text-gray-400 mt-1">confirmés aujourd'hui</p>
        </div>

        <div className="bg-white rounded-xl border shadow-sm p-5">
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingUp className="w-5 h-5 text-yellow-600" />
            </div>
            <span className="text-sm text-gray-500">Revenus du jour</span>
          </div>
          <p className="text-3xl font-bold text-gray-800">{revenusJour} MAD</p>
          <p className="text-xs text-gray-400 mt-1">basé sur les réservations</p>
        </div>
      </div>

      {/* Dernières réservations réelles */}
      <div className="bg-white rounded-xl border shadow-sm">
        <div className="px-6 py-4 border-b">
          <h2 className="text-xl font-bold text-gray-800">Dernières réservations</h2>
        </div>
        {recentReservations.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Aucune réservation trouvée
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Client</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Chambre</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Check-in</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {recentReservations.map(r => (
                <tr key={r.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{r.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {r.client
                      ? `${r.client.firstName} ${r.client.lastName}`
                      : 'Client inconnu'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">
                    {r.room ? `Chambre ${r.room.roomNumber}` : 'N/A'}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{r.checkIn}</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusColors[r.status] || 'bg-gray-100'}`}>
                      {r.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}