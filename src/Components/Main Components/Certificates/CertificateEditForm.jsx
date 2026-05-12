import { useState, useEffect } from 'react';
import { doc, getDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { useParams, useNavigate } from 'react-router-dom';
import { FiAward, FiUpload, FiCheck, FiAlertCircle, FiArrowLeft, FiSave } from 'react-icons/fi';
import { db } from '../../../firebaseConfig';
import { uploadImage } from '../Cloudinaryapi';

function CertificateEditForm() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [formData, setFormData] = useState({
    title: '', issuer: '', date: '', link: '', credentialsId: '',
    icon: '', newIconFile: null, newIconPreview: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [submitMessage, setSubmitMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const fetchCert = async () => {
      try {
        const docSnap = await getDoc(doc(db, 'certificates', id));
        if (!docSnap.exists()) { setNotFound(true); return; }
        const data = docSnap.data();
        setFormData({
          title: data.title || '',
          issuer: data.issuer || '',
          date: data.date || '',
          link: data.link || '',
          credentialsId: data.credentialsId || '',
          icon: data.icon || '',
          newIconFile: null,
          newIconPreview: '',
        });
      } catch (err) {
        console.error('Error fetching certificate:', err);
        setNotFound(true);
      } finally {
        setLoading(false);
      }
    };
    fetchCert();
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match('image.*')) { setErrorMessage('Only image files allowed'); return; }
    if (file.size > 2 * 1024 * 1024) { setErrorMessage('File must be under 2MB'); return; }
    setFormData(prev => ({ ...prev, newIconFile: file, newIconPreview: URL.createObjectURL(file) }));
    setErrorMessage('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage('');
    setSubmitMessage('');
    setUploadProgress(0);
    try {
      let iconUrl = formData.icon;
      if (formData.newIconFile) {
        const res = await uploadImage(formData.newIconFile, 'portfolio_certs', (p) => setUploadProgress(p));
        iconUrl = res.data.secure_url;
      }
      await updateDoc(doc(db, 'certificates', id), {
        title: formData.title,
        issuer: formData.issuer,
        date: formData.date || null,
        icon: iconUrl,
        link: formData.link || '#',
        credentialsId: formData.credentialsId || null,
        updatedAt: serverTimestamp(),
      });
      setSubmitMessage('Certificate updated successfully!');
      setTimeout(() => navigate('/dashboard/certificates'), 1200);
    } catch (err) {
      console.error('Error updating certificate:', err);
      setErrorMessage('Failed to update certificate');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass = 'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all';

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (notFound) {
    return (
      <div className="max-w-3xl">
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <p className="text-slate-500 font-medium mb-4">Certificate not found</p>
          <button onClick={() => navigate('/dashboard/certificates')} className="text-indigo-600 text-sm font-medium hover:underline">
            Back to Certificates
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-3xl">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate('/dashboard/certificates')} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <FiAward className="text-white h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Edit Certificate</h1>
          <p className="text-sm text-slate-500">Update certificate details</p>
        </div>
      </div>

      {submitMessage && (
        <div className="mb-5 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <FiCheck className="h-4 w-4 shrink-0" />{submitMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <FiAlertCircle className="h-4 w-4 shrink-0" />{errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Certificate Title <span className="text-red-400">*</span></label>
              <input type="text" name="title" value={formData.title} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issuer <span className="text-red-400">*</span></label>
              <input type="text" name="issuer" value={formData.issuer} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Date</label>
              <input type="text" name="date" value={formData.date} onChange={handleChange} placeholder="Issued Jun 2025" className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Certificate Link</label>
              <input type="url" name="link" value={formData.link} onChange={handleChange} placeholder="https://example.com/certificate" className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Credentials ID</label>
            <input type="text" name="credentialsId" value={formData.credentialsId} onChange={handleChange} placeholder="Enter certificate ID" className={inputClass} />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">Issuer Icon</label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                <FiUpload className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 group-hover:text-indigo-600 truncate">
                    {formData.newIconFile ? formData.newIconFile.name : 'Replace icon (optional)'}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG, or SVG (Max 2MB)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleIconChange} className="hidden" />
              </label>
              <div className="w-14 h-14 border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm flex items-center justify-center">
                {(formData.newIconPreview || formData.icon) ? (
                  <img src={formData.newIconPreview || formData.icon} alt="Icon preview" className="w-full h-full object-contain p-1" />
                ) : (
                  <FiAward className="h-5 w-5 text-slate-300" />
                )}
              </div>
            </div>
          </div>

          {isSubmitting && uploadProgress > 0 && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Uploading...</span><span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
              </div>
            </div>
          )}

          <div className="pt-1 flex items-center gap-3">
            <button type="submit" disabled={isSubmitting}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <FiSave className="h-4 w-4" />
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </button>
            <button type="button" onClick={() => navigate('/dashboard/certificates')}
              className="px-5 py-2.5 text-slate-600 hover:text-slate-800 hover:bg-slate-100 font-medium rounded-xl transition-all text-sm border border-slate-200"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CertificateEditForm;