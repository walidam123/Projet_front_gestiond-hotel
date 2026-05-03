import { useState, useEffect } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

export function ReservationsPage() {
  const [reservations, setReservations] = useState([]);
  const [rooms, setRooms]               = useState([]);
  const [clients, setClients]           = useState([]);
  const [services, setServices]         = useState([]);
  const [loading, setLoading]           = useState(true);
  const [showForm, setShowForm]         = useState(false);
  const [selectedReservation, setSelectedReservation] = useState(null);
  const [form, setForm] = useState({
    clientId: '', roomId: '', checkIn: '', checkOut: '',
    status: 'CONFIRMEE', deposit: 0, serviceIds: []
  });

  const fetchAll = async () => {
    try {
      const [resRes, roomRes, clientRes, serviceRes] = await Promise.all([
        api.get('/reservations'),
        api.get('/rooms'),
        api.get('/clients'),
        api.get('/services'),
      ]);
      setReservations(resRes.data);
      setRooms(roomRes.data);
      setClients(clientRes.data);
      setServices(serviceRes.data);
    } catch {
      toast.error('Erreur lors du chargement des réservations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchAll(); }, []);

  // Convertir les réservations en événements pour le calendrier
  const events = reservations.map(r => ({
    id: r.id,
    title: `Réservation #${r.id}`,
    start: new Date(r.checkIn),
    end:   new Date(r.checkOut),
  }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.clientId || !form.roomId || !form.checkIn || !form.checkOut) {
      toast.error('Veuillez remplir tous les champs obligatoires.');
      return;
    }
    if (form.checkIn >= form.checkOut) {
      toast.error('La date de départ doit être après la date d\'arrivée.');
      return;
    }
    try {
      await api.post('/reservations', {
        clientId: parseInt(form.clientId),
        roomId:   parseInt(form.roomId),
        checkIn:  form.checkIn,
        checkOut: form.checkOut,
        status:   form.status,
        deposit:  form.deposit,
      });
      toast.success('Réservation enregistrée avec succès !');
      setShowForm(false);
      setForm({ clientId: '', roomId: '', checkIn: '', checkOut: '',
                status: 'CONFIRMEE', deposit: 0, serviceIds: [] });
      fetchAll();
    } catch {
      toast.error('Erreur lors de l\'enregistrement de la réservation.');
    }
  };

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round(
        (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const selectedRoom = rooms.find(r => r.id === parseInt(form.roomId));
  const montant = selectedRoom ? nights * selectedRoom.pricePerNight : 0;

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Réservations</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gérez le planning et créez de nouvelles réservations.
          </p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          + Nouvelle réservation
        </button>
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">Nouvelle réservation</h2>
              <button onClick={() => setShowForm(false)} className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Client */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Client <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.clientId}
                  onChange={e => setForm({ ...form, clientId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Sélectionnez un client</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>
                      {c.firstName} {c.lastName}
                    </option>
                  ))}
                </select>
              </div>

              {/* Chambre */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Chambre <span className="text-red-500">*</span>
                </label>
                <select
                  value={form.roomId}
                  onChange={e => setForm({ ...form, roomId: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                >
                  <option value="">Sélectionnez une chambre</option>
                  {rooms.filter(r => r.status === 'LIBRE').map(r => (
                    <option key={r.id} value={r.id}>
                      Chambre {r.roomNumber} — {r.category} — {r.pricePerNight} MAD/nuit
                    </option>
                  ))}
                </select>
              </div>

              {/* Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-in <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.checkIn}
                    onChange={e => setForm({ ...form, checkIn: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Check-out <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    value={form.checkOut}
                    onChange={e => setForm({ ...form, checkOut: e.target.value })}
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>

              {/* Acompte */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Acompte (MAD)</label>
                <input
                  type="number"
                  value={form.deposit}
                  onChange={e => setForm({ ...form, deposit: e.target.value })}
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>

              {/* Calcul automatique */}
              {nights > 0 && selectedRoom && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{nights} nuit(s)</span> × {selectedRoom.pricePerNight} MAD
                  </p>
                  <p className="text-lg font-bold text-yellow-700 mt-1">
                    Total estimé : {montant} MAD
                  </p>
                </div>
              )}

              {/* Boutons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 font-medium"
                >
                  Valider la réservation
                </button>
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="flex-1 bg-gray-200 text-gray-700 py-2 rounded-lg hover:bg-gray-300"
                >
                  Annuler
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Détail réservation cliquée */}
      {selectedReservation && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Réservation #{selectedReservation.id}
              </h2>
              <button onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Check-in :</span> {selectedReservation.checkIn}</p>
              <p><span className="font-semibold">Check-out :</span> {selectedReservation.checkOut}</p>
              <p><span className="font-semibold">Statut :</span> {selectedReservation.status}</p>
              <p><span className="font-semibold">Acompte :</span> {selectedReservation.deposit} MAD</p>
            </div>
          </div>
        </div>
      )}

      {/* Calendrier */}
      <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6">
        <div style={{ height: '500px' }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            onSelectEvent={event => {
              const res = reservations.find(r => r.id === event.id);
              if (res) setSelectedReservation(res);
            }}
            messages={{
              next: "Suivant",
              previous: "Précédent",
              today: "Aujourd'hui",
              month: "Mois",
              week: "Semaine",
              day: "Jour"
            }}
          />
        </div>
      </div>
    </div>
  );
}
