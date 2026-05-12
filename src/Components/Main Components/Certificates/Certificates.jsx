import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { FiAward, FiUpload, FiCheck, FiAlertCircle } from 'react-icons/fi';
import { db } from '../../../firebaseConfig';
import { uploadImage } from '../Cloudinaryapi';

const Certificates = () => {
  const [formData, setFormData] = useState({
    title: '', issuer: '', date: '', icon: null, link: '', credentialsId: '', iconPreview: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (!file.type.match('image.*')) {
        setErrorMessage('Please select an image file (JPEG, PNG, SVG)');
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage('File size should be less than 2MB');
        return;
      }
      setFormData(prev => ({ ...prev, icon: file, iconPreview: URL.createObjectURL(file) }));
      setErrorMessage('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.title || !formData.issuer || !formData.icon) {
      setErrorMessage('Title, issuer, and icon are required');
      return;
    }
    setIsUploading(true);
    setErrorMessage('');
    setSuccessMessage('');
    setUploadProgress(0);
    try {
      const response = await uploadImage(formData.icon, 'portfolio_certs', (p) => setUploadProgress(p));
      await addDoc(collection(db, 'certificates'), {
        title: formData.title,
        issuer: formData.issuer,
        date: formData.date || null,
        icon: response.data.secure_url,
        link: formData.link || '#',
        credentialsId: formData.credentialsId || null,
        createdAt: serverTimestamp(),
      });
      setSuccessMessage('Certificate added successfully!');
      setFormData({ title: '', issuer: '', date: '', icon: null, link: '', credentialsId: '', iconPreview: '' });
    } catch (error) {
      setErrorMessage(error.response?.data?.error?.message || 'Failed to add certificate. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all';

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
          <FiAward className="text-white h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Add Certificate</h1>
          <p className="text-sm text-slate-500">Upload a new skill certificate to your portfolio</p>
        </div>
      </div>

      {successMessage && (
        <div className="mb-5 flex items-center gap-2 p-4 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-700 text-sm">
          <FiCheck className="h-4 w-4 shrink-0" />
          {successMessage}
        </div>
      )}
      {errorMessage && (
        <div className="mb-5 flex items-center gap-2 p-4 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm">
          <FiAlertCircle className="h-4 w-4 shrink-0" />
          {errorMessage}
        </div>
      )}

      <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Certificate Title <span className="text-red-400">*</span>
              </label>
              <input
                type="text" name="title" value={formData.title} onChange={handleChange}
                required placeholder="React (Basic)" className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Issuer <span className="text-red-400">*</span>
              </label>
              <input
                type="text" name="issuer" value={formData.issuer} onChange={handleChange}
                required placeholder="HackerRank" className={inputClass}
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Issue Date</label>
              <input
                type="text" name="date" value={formData.date} onChange={handleChange}
                placeholder="Issued Jun 2025" className={inputClass}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Certificate Link</label>
              <input
                type="url" name="link" value={formData.link} onChange={handleChange}
                placeholder="https://example.com/certificate" className={inputClass}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Credentials ID</label>
            <input
              type="text" name="credentialsId" value={formData.credentialsId} onChange={handleChange}
              placeholder="Enter certificate ID or verification code" className={inputClass}
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Issuer Icon <span className="text-red-400">*</span>
            </label>
            <div className="flex items-center gap-4">
              <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
                <FiUpload className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 group-hover:text-indigo-600 truncate">
                    {formData.icon ? formData.icon.name : 'Click to upload icon'}
                  </p>
                  <p className="text-xs text-slate-400">PNG, JPG, or SVG (Max 2MB)</p>
                </div>
                <input type="file" accept="image/*" onChange={handleFileChange} required className="hidden" />
              </label>
              {formData.iconPreview && (
                <div className="w-14 h-14 border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                  <img src={formData.iconPreview} alt="Preview" className="w-full h-full object-contain p-1" />
                </div>
              )}
            </div>
          </div>

          {isUploading && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Uploading...</span>
                <span>{uploadProgress}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-violet-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-indigo-500 to-violet-600 hover:from-indigo-600 hover:to-violet-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <FiAward className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Add Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default Certificates;