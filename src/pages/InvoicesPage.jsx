import { useState, useEffect } from 'react';
import api from '../api/axiosInstance';
import toast from 'react-hot-toast';

export default function InvoicesPage() {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchInvoices = async () => {
    try {
      const res = await api.get('/invoices');
      setInvoices(res.data);
    } catch {
      toast.error('Erreur lors du chargement des factures');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchInvoices(); }, []);

  const handleClose = async (id) => {
    try {
      await api.post(`/invoices/${id}/close`);
      toast.success('Facture clôturée avec succès');
      fetchInvoices();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Impossible de clôturer la facture');
    }
  };

  const downloadPdf = async (id) => {
    try {
      const res = await api.get(`/invoices/${id}/pdf`, { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([res.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `facture_${id}.pdf`);
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (err) {
      toast.error('Erreur lors du téléchargement du PDF');
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'CLOTUREE': return 'bg-green-100 text-green-800';
      case 'EN_ATTENTE': return 'bg-yellow-100 text-yellow-800';
      default: return 'bg-gray-100 text-gray-600';
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Facturation</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez et clôturez les factures clients.</p>
      </div>

      <div className="bg-white rounded-lg shadow-sm border overflow-hidden">
        {loading ? (
          <div className="text-center py-10 text-gray-400">Chargement...</div>
        ) : invoices.length === 0 ? (
          <div className="text-center py-10 text-gray-400">
            Aucune facture disponible
          </div>
        ) : (
          <table className="w-full">
            <thead className="bg-gray-50 border-b">
              <tr>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">N° Facture</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Réservation</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Total</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">TVA</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Net à payer</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Statut</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Date</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {invoices.map(invoice => (
                <tr key={invoice.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 font-medium text-gray-800">#{invoice.id}</td>
                  <td className="px-6 py-4 text-gray-600">
                    Rés. #{invoice.reservationId}
                  </td>
                  <td className="px-6 py-4 text-gray-800">{invoice.totalAmount} MAD</td>
                  <td className="px-6 py-4 text-gray-500">{invoice.tvaRate}%</td>
                  <td className="px-6 py-4 font-semibold text-yellow-700">{invoice.netToPay} MAD</td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-semibold ${statusStyle(invoice.status)}`}>
                      {invoice.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-500 text-sm">
                    {new Date(invoice.issuedAt).toLocaleDateString('fr-FR')}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    {invoice.status !== 'CLOTUREE' && (
                      <button
                        onClick={() => handleClose(invoice.id)}
                        className="bg-green-600 text-white text-sm px-3 py-1 rounded hover:bg-green-700"
                      >
                        Clôturer
                      </button>
                    )}

                    <button 
                      onClick={() => downloadPdf(invoice.id)}
                      className="bg-yellow-600 text-white text-sm px-3 py-1 rounded hover:bg-yellow-700"
                    >
                      PDF
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div >
  );
}