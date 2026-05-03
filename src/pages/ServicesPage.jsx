import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function ServicesPage() {
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ label: '', unitPrice: '' });
  const [editId, setEditId] = useState(null);

  const fetchServices = async () => {
    try {
      const res = await api.get('/services');
      setServices(res.data);
    } catch {
      toast.error('Erreur lors du chargement des services');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchServices(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!form.label || !form.unitPrice) {
      toast.error('Veuillez remplir tous les champs');
      return;
    }
    try {
      if (editId) {
        await api.put(`/services/${editId}`, form);
        toast.success('Service modifié avec succès');
      } else {
        await api.post('/services', form);
        toast.success(`Le service "${form.label}" a été ajouté avec succès`);
      }
      setForm({ label: '', unitPrice: '' });
      setShowForm(false);
      setEditId(null);
      fetchServices();
    } catch {
      toast.error('Erreur lors de l\'enregistrement');
    }
  };

  const handleEdit = (service) => {
    setForm({ label: service.label, unitPrice: service.unitPrice });
    setEditId(service.id);
    setShowForm(true);
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Supprimer ce service ?')) return;
    try {
      await api.delete(`/services/${id}`);
      toast.success('Service supprimé');
      fetchServices();
    } catch {
      toast.error('Erreur lors de la suppression');
    }
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800">Services</h1>
          <p className="text-gray-500 text-sm mt-1">
            Gestion des services annexes (Spa, Restauration, etc.).
          </p>
        </div>
        <button
          onClick={() => { setShowForm(!showForm); setEditId(null); setForm({ label: '', unitPrice: '' }); }}
          className="bg-yellow-600 text-white px-4 py-2 rounded-lg hover:bg-yellow-700"
        >
          + Ajouter un service
        </button>
      </div>

      {/* Formulaire */}
      {showForm && (
        <div className="bg-white border rounded-lg p-5 mb-6 shadow-sm">
          <h2 className="font-semibold text-gray-700 mb-4">
            {editId ? 'Modifier le service' : 'Nouveau service'}
          </h2>
          <form onSubmit={handleSubmit} className="flex gap-4 items-end">
            <div className="flex-1">
              <label className="block text-sm text-gray-600 mb-1">Libellé du service</label>
              <input
                type="text"
                placeholder="Ex: Petit-déjeuner"
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <div className="w-48">
              <label className="block text-sm text-gray-600 mb-1">Prix unitaire (MAD)</label>
              <input
                type="number"
                placeholder="Ex: 80"
                value={form.unitPrice}
                onChange={e => setForm({ ...form, unitPrice: e.target.value })}
                className="w-full border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-yellow-500"
              />
            </div>
            <button
              type="submit"
              className="bg-yellow-600 text-white px-5 py-2 rounded-lg hover:bg-yellow-700"
            >
              {editId ? 'Modifier' : 'Ajouter'}
            </button>
            <button
              type="button"
              onClick={() => { setShowForm(false); setEditId(null); }}
              className="bg-gray-200 text-gray-700 px-5 py-2 rounded-lg hover:bg-gray-300"
            >
              Annuler
            </button>
          </form>
        </div>
      )}

      {/* Tableau */}
      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : services.length === 0 ? (
          <div className="text-center py-10 text-gray-400">Aucun service trouvé</div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">ID</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Libellé</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Prix unitaire</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {services.map(service => (
                <tr key={service.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-gray-500">#{service.id}</td>
                  <td className="px-6 py-4 font-medium text-gray-800">{service.label}</td>
                  <td className="px-6 py-4 text-yellow-700 font-semibold">{service.unitPrice} MAD</td>
                  <td className="px-6 py-4 flex gap-2">
                    <button
                      onClick={() => handleEdit(service)}
                      className="text-blue-600 hover:underline text-sm"
                    >
                      Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(service.id)}
                      className="text-red-500 hover:underline text-sm"
                    >
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