import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiAward, FiExternalLink } from 'react-icons/fi';

function CertificatesList() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchCerts(); }, []);

  const fetchCerts = async () => {
    try {
      const q = query(collection(db, 'certificates'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setCerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      try {
        const snapshot = await getDocs(collection(db, 'certificates'));
        setCerts(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching certificates:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, title) => {
    if (!window.confirm(`Delete "${title}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'certificates', id));
      setCerts(prev => prev.filter(c => c.id !== id));
    } catch (err) {
      console.error('Error deleting certificate:', err);
    } finally {
      setDeletingId(null);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-5xl">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <FiAward className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Certificates</h1>
            <p className="text-sm text-slate-500">{certs.length} certificate{certs.length !== 1 ? 's' : ''}</p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/certificates/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all"
        >
          <FiPlus className="h-4 w-4" />
          Add Certificate
        </button>
      </div>

      {certs.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FiAward className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No certificates yet</p>
          <p className="text-slate-400 text-sm mb-5">Add your first certificate to showcase your skills</p>
          <button
            onClick={() => navigate('/dashboard/certificates/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-indigo-500/25 hover:from-indigo-600 hover:to-violet-700 transition-all"
          >
            <FiPlus className="h-4 w-4" />
            Add First Certificate
          </button>
        </div>
      ) : (
        <div className="grid gap-3">
          {certs.map(cert => (
            <div key={cert.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-4 flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl border border-slate-100 bg-white shadow-sm flex items-center justify-center flex-shrink-0 overflow-hidden">
                {cert.icon ? (
                  <img src={cert.icon} alt={cert.title} className="w-full h-full object-contain p-1" />
                ) : (
                  <FiAward className="h-5 w-5 text-slate-300" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold text-slate-800 truncate">{cert.title}</h3>
                  {cert.link && cert.link !== '#' && (
                    <a href={cert.link} target="_blank" rel="noopener noreferrer"
                      className="text-slate-400 hover:text-indigo-600 transition-colors flex-shrink-0"
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
                  onClick={() => navigate(`/dashboard/certificates/edit/${cert.id}`)}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-xl transition-all border border-indigo-100"
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

export default CertificatesList;