import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiBookOpen, FiExternalLink } from 'react-icons/fi';

function LicenseCertificatesList() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      const q = query(collection(db, 'Licensecertificates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setCerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      try {
        const snapshot = await getDocs(collection(db, 'Licensecertificates'));
        setCerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching license certificates:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'Licensecertificates', id));
      setCerts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting license certificate:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-emerald-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
            <FiBookOpen className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">License Certificates</h1>
            <p className="text-sm text-slate-500">{certs.length} certificate{certs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/licenseCertificate/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all"
        >
          <FiPlus className="h-4 w-4" />
          Add Certificate
        </button>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FiBookOpen className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No license certificates yet</p>
          <p className="text-slate-400 text-sm mb-5">Add your official certifications and credentials</p>
          <button
            onClick={() => navigate('/dashboard/licenseCertificate/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-emerald-500/25 hover:from-emerald-600 hover:to-teal-700 transition-all"
          >
            <FiPlus className="h-4 w-4" />
            Add First Certificate
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {certs.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-16 h-12 rounded-xl border border-slate-100 bg-slate-50 flex-shrink-0 overflow-hidden">
                {cert.icon ? (
                  <img src={cert.icon} alt={cert.title} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiBookOpen className="h-5 w-5 text-slate-300" />
                  </div>
                )}
              </div>

              {cert.issuerIcon && (
                <div className="w-8 h-8 rounded-lg border border-slate-100 bg-white flex items-center justify-center overflow-hidden flex-shrink-0">
                  <img src={cert.issuerIcon} alt="Issuer" className="w-full h-full object-contain p-0.5" />
                </div>
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 truncate">{cert.title}</h3>
                  {cert.link && cert.link !== '#' && (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer"
                      className="text-slate-400 hover:text-emerald-600 transition-colors flex-shrink-0"
                    >
                      <FiExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
                <p className="text-slate-500 text-sm">{cert.issuer}{cert.date ? ` · ${cert.date}` : ''}</p>
                {cert.credentialsId && (
                  <p className="text-slate-400 text-xs mt-0.5">ID: {cert.credentialsId}</p>
                )}
              </div>

              <div className="flex items-center gap-2 flex-shrink-0">
                <button
                  onClick={() => navigate(`/dashboard/licenseCertificate/edit/${cert.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-medium rounded-xl transition-all border border-emerald-100"
                >
                  <FiEdit2 className="h-3.5 w-3.5" />
                  Edit
                </button>
                <button
                  onClick={() => handleDelete(cert.id, cert.title)}
                  disabled={deletingId === cert.id}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-xl transition-all border border-red-100 disabled:opacity-50"
                >
                  <FiTrash2 className="h-3.5 w-3.5" />
                  {deletingId === cert.id ? 'Deleting...' : 'Delete'}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default LicenseCertificatesList;