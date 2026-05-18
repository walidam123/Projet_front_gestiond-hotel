import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

const localizer = momentLocalizer(moment);

// Toolbar personnalisé — remplace les boutons par défaut
function CustomToolbar({ date, view, onNavigate, onView }) {
  return (
    <div style={{
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: '16px',
      flexWrap: 'wrap',
      gap: '8px'
    }}>
      {/* Navigation */}
      <div style={{ display: 'flex', gap: '8px' }}>
        <button
          type="button"
          onClick={() => onNavigate('TODAY')}
          style={{
            padding: '6px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Aujourd'hui
        </button>
        <button
          type="button"
          onClick={() => onNavigate('PREV')}
          style={{
            padding: '6px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          ← Précédent
        </button>
        <button
          type="button"
          onClick={() => onNavigate('NEXT')}
          style={{
            padding: '6px 14px',
            border: '1px solid #d1d5db',
            borderRadius: '6px',
            background: 'white',
            cursor: 'pointer',
            fontSize: '14px'
          }}
        >
          Suivant →
        </button>
      </div>

      {/* Titre */}
      <span style={{ fontWeight: 'bold', fontSize: '16px', textTransform: 'capitalize' }}>
        {new Date(date).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' })}
      </span>

      {/* Vues */}
      <div style={{ display: 'flex', gap: '8px' }}>
        {['month', 'week', 'day', 'agenda'].map(v => (
          <button
            key={v}
            type="button"
            onClick={() => onView(v)}
            style={{
              padding: '6px 14px',
              border: '1px solid #d1d5db',
              borderRadius: '6px',
              background: view === v ? '#C9A84C' : 'white',
              color: view === v ? 'white' : '#374151',
              cursor: 'pointer',
              fontSize: '14px',
              fontWeight: view === v ? '600' : '400'
            }}
          >
            {v === 'month' ? 'Mois' : v === 'week' ? 'Semaine' : v === 'day' ? 'Jour' : 'Agenda'}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function ReservationsPage() {
  const navigate = useNavigate();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [currentView, setCurrentView] = useState('month');
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

  const checkAvailability = async (roomId, checkIn, checkOut) => {
    if (!roomId || !checkIn || !checkOut) return;
    try {
      const res = await api.get('/reservations/check-availability', {
        params: { roomId, checkIn, checkOut }
      });
      if (!res.data.available) {
        toast.error(res.data.message);
        setForm(prev => ({ ...prev, roomId: '' }));
      }
    } catch {
      toast.error('Erreur lors de la vérification de disponibilité');
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
      // 1. Créer la réservation
      const res = await api.post('/reservations', {
        client:   { id: form.clientId },
        room:     { id: form.roomId },
        checkIn:  form.checkIn,
        checkOut: form.checkOut,
        status:   form.status,
        deposit:  form.deposit,
      });

      // 2. Générer automatiquement la facture
      const reservationId = res.data.id;
      const nights = Math.round(
        (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)
      );
      const selectedRoom = rooms.find(r => r.id === parseInt(form.roomId));
      const totalAmount = selectedRoom ? nights * selectedRoom.pricePerNight : 0;
      const tvaRate = 20;
      const tvaAmount = (totalAmount * tvaRate) / 100;
      const totalAvecTVA = totalAmount + tvaAmount;
      const depositAmount = parseFloat(form.deposit || 0);
      const netToPay = totalAvecTVA - depositAmount; // ✅ acompte déduit

      await api.post('/invoices', {
        reservationId,
        totalAmount: totalAvecTVA,
        tvaRate,
        depositDeducted: depositAmount,
        netToPay: netToPay > 0 ? netToPay : 0,
        status: 'EN_ATTENTE'
      });

      toast.success('Réservation et facture créées avec succès !');
      setShowForm(false);
      setForm({ clientId: '', roomId: '', checkIn: '', checkOut: '',
                status: 'CONFIRMEE', deposit: 0, serviceIds: [] });
      fetchAll();
      navigate('/');
    } catch (err) {
      toast.error('Erreur lors de l\'enregistrement de la réservation.');
      console.error(err);
    }
  };

  const nights = form.checkIn && form.checkOut
    ? Math.max(0, Math.round(
        (new Date(form.checkOut) - new Date(form.checkIn)) / (1000 * 60 * 60 * 24)
      ))
    : 0;

  const selectedRoom = rooms.find(r => r.id === parseInt(form.roomId));
  const servicesTotal = form.serviceIds.reduce((sum, id) => {
    const service = services.find(s => s.id === id);
    return sum + (service?.unitPrice || 0);
  }, 0);

  const montant = selectedRoom
    ? (nights * selectedRoom.pricePerNight) + servicesTotal
    : 0;

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
                  onChange={e => {
                    setForm({ ...form, roomId: e.target.value });
                    if (e.target.value && form.checkIn && form.checkOut) {
                      checkAvailability(e.target.value, form.checkIn, form.checkOut);
                    }
                  }}
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
                    onChange={e => {
                      setForm({ ...form, checkIn: e.target.value });
                      if (form.roomId && e.target.value && form.checkOut) {
                        checkAvailability(form.roomId, e.target.value, form.checkOut);
                      }
                    }}
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
                    onChange={e => {
                      setForm({ ...form, checkOut: e.target.value });
                      if (form.roomId && form.checkIn && e.target.value) {
                        checkAvailability(form.roomId, form.checkIn, e.target.value);
                      }
                    }}
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

              {/* Services */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Services additionnels
                </label>
                <div className="space-y-2 max-h-40 overflow-y-auto border rounded-lg p-3">
                  {services.map(service => (
                    <label key={service.id} className="flex items-center gap-3 cursor-pointer hover:bg-gray-50 p-1 rounded">
                      <input
                        type="checkbox"
                        checked={form.serviceIds.includes(service.id)}
                        onChange={e => {
                          if (e.target.checked) {
                            setForm({ ...form, serviceIds: [...form.serviceIds, service.id] });
                          } else {
                            setForm({ ...form, serviceIds: form.serviceIds.filter(id => id !== service.id) });
                          }
                        }}
                        className="w-4 h-4 accent-yellow-600"
                      />
                      <span className="text-sm text-gray-700">{service.label}</span>
                      <span className="text-sm text-yellow-600 font-semibold ml-auto">
                        {service.unitPrice} MAD
                      </span>
                    </label>
                  ))}
                  {services.length === 0 && (
                    <p className="text-sm text-gray-400 text-center">Aucun service disponible</p>
                  )}
                </div>
              </div>

              {/* Calcul automatique */}
              {nights > 0 && selectedRoom && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{nights} nuit(s)</span> × {selectedRoom.pricePerNight} MAD
                  </p>
                  {servicesTotal > 0 && (
                    <p className="text-sm text-gray-600">
                      Services : <span className="font-semibold">{servicesTotal} MAD</span>
                    </p>
                  )}
                  <p className="text-sm text-gray-600">
                    TVA (20%) : <span className="font-semibold">{Math.round(montant * 0.2)} MAD</span>
                  </p>
                  <p className="text-lg font-bold text-yellow-700 mt-1 border-t pt-2">
                    Total TTC : {Math.round(montant * 1.2)} MAD
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
        <div
          className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center"
          onClick={() => setSelectedReservation(null)}
        >
          <div
            className="bg-white rounded-xl shadow-xl w-full max-w-md p-6"
            onClick={e => e.stopPropagation()}
          >
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-800">
                Réservation #{selectedReservation.id}
              </h2>
              <button
                onClick={() => setSelectedReservation(null)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <div className="space-y-2 text-sm text-gray-700">
              <p><span className="font-semibold">Client :</span> {selectedReservation.client?.firstName} {selectedReservation.client?.lastName}</p>
              <p><span className="font-semibold">Chambre :</span> {selectedReservation.room?.roomNumber}</p>
              <p><span className="font-semibold">Check-in :</span> {selectedReservation.checkIn}</p>
              <p><span className="font-semibold">Check-out :</span> {selectedReservation.checkOut}</p>
              <p><span className="font-semibold">Statut :</span> {selectedReservation.status}</p>
              <p><span className="font-semibold">Acompte :</span> {selectedReservation.deposit} MAD</p>
            </div>
            <button
              onClick={() => setSelectedReservation(null)}
              className="mt-5 w-full bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700">
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* Calendrier */}
      {loading ? (
        <div className="text-center py-20 text-gray-400">Chargement...</div>
      ) : (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mt-6" style={{
          position: 'relative',
          zIndex: 1,
          isolation: 'isolate',
          pointerEvents: 'all'
        }}>
          <Calendar
            localizer={localizer}
            events={events}
            startAccessor="start"
            endAccessor="end"
            date={currentDate}
            view={currentView}
            onNavigate={date => setCurrentDate(date)}
            onView={view => setCurrentView(view)}
            style={{ height: 550, pointerEvents: 'all' }}
            components={{ toolbar: CustomToolbar }}
            onSelectEvent={event => {
              const r = reservations.find(res => res.id === event.id);
              setSelectedReservation(r);
            }}
            messages={{
              noEventsInRange: 'Aucune réservation',
            }}
          />
        </div>
      )}
    </div>
  );
}
