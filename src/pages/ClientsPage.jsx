import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ClientsPage() {
  const [clients, setClients]   = useState([]);
  const [loading, setLoading]   = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [editClient, setEditClient] = useState(null);
  const [search, setSearch]     = useState('');
  const [form, setForm] = useState({
    firstName: '', lastName: '', email: '',
    phone: '', idDocument: '', nationality: ''
  });

  const fetchClients = async () => {
    try {
      const res = await api.get('/clients');
      setClients(res.data);
    } catch {
      toast.error('Erreur lors du chargement des clients');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchClients(); }, []);

  const openAdd = () => {
    setEditClient(null);
    setForm({ firstName: '', lastName: '', email: '',
              phone: '', idDocument: '', nationality: '' });
    setShowForm(true);
  };

  const openEdit = (client) => {
    setEditClient(client);
    setForm({
      firstName:   client.firstName,
      lastName:    client.lastName,
      email:       client.email || '',
      phone:       client.phone || '',
      idDocument:  client.idDocument || '',
      nationality: client.nationality || '',
    });
    setShowForm(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.firstName || !form.lastName) {
      toast.error('Nom et prénom sont obligatoires');
      return;
    }
    try {
      if (editClient) {
        await api.put(`/clients/${editClient.id}`, form);
        toast.success('Client modifié avec succès');
      } else {
        await api.post('/clients', form);
        toast.success(`Client ${form.firstName} ${form.lastName} ajouté !`);
      }
      setShowForm(false);
      fetchClients();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce client ?')) return;
    try {
      await api.delete(`/clients/${id}`);
      toast.success('Client supprimé');
      fetchClients();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  const filtered = clients.filter(c =>
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(search.toLowerCase()) ||
    (c.phone && c.phone.includes(search))
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Clients</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des clients et leurs informations.
          </p>
        </div>
        <button onClick={openAdd}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700">
          + Nouveau client
        </button>
      </div>

      {/* Recherche */}
      <div className="mb-4">
        <input
          type="text"
          placeholder="Rechercher par nom ou téléphone..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="w-full max-w-md border rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
        />
      </div>

      {/* Modal Formulaire */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl w-full max-w-lg p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-5">
              <h2 className="text-xl font-bold text-gray-800">
                {editClient ? 'Modifier le client' : 'Nouveau client'}
              </h2>
              <button onClick={() => setShowForm(false)}
                className="text-gray-400 hover:text-gray-600 text-2xl">×</button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Prénom <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.firstName}
                    onChange={e => setForm({ ...form, firstName: e.target.value })}
                    placeholder="Ahmed"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nom <span className="text-red-500">*</span>
                  </label>
                  <input type="text" value={form.lastName}
                    onChange={e => setForm({ ...form, lastName: e.target.value })}
                    placeholder="Bennani"
                    className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <input type="email" value={form.email}
                  onChange={e => setForm({ ...form, email: e.target.value })}
                  placeholder="ahmed@email.com"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Téléphone</label>
                <input type="text" value={form.phone}
                  onChange={e => setForm({ ...form, phone: e.target.value })}
                  placeholder="0600000000"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  N° Pièce d'identité
                </label>
                <input type="text" value={form.idDocument}
                  onChange={e => setForm({ ...form, idDocument: e.target.value })}
                  placeholder="CIN / Passeport"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nationalité</label>
                <input type="text" value={form.nationality}
                  onChange={e => setForm({ ...form, nationality: e.target.value })}
                  placeholder="Marocaine"
                  className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button type="submit"
                  className="flex-1 bg-yellow-600 text-white py-2 rounded-lg hover:bg-yellow-700 font-medium">
                  {editClient ? 'Modifier' : 'Ajouter le client'}
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

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : filtered.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            {search ? 'Aucun client trouvé' : 'Aucun client enregistré'}
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nom</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Email</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Téléphone</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">CIN/Passeport</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Nationalité</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filtered.map(client => (
                <tr key={client.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">
                    {client.firstName} {client.lastName}
                  </td>
                  <td className="px-6 py-4 text-gray-600">{client.email || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.phone || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.idDocument || '—'}</td>
                  <td className="px-6 py-4 text-gray-600">{client.nationality || '—'}</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => openEdit(client)}
                      className="text-blue-600 hover:underline text-sm">
                      Modifier
                    </button>
                    <button onClick={() => handleDelete(client.id)}
                      className="text-red-500 hover:underline text-sm">
                      Supprimer
                    </button>
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
