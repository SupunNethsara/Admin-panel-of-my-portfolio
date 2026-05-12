import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { useNavigate } from "react-router-dom";
import { FiBookOpen, FiUpload, FiCheck, FiAlertCircle, FiArrowLeft } from "react-icons/fi";
import { db } from "../../../firebaseConfig";
import { uploadImage } from "../Cloudinaryapi";

const CertificateUploadForm = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    certificateName: "", instituteName: "", issueDate: "", credentialId: "",
    credentialUrl: "", file: null, issuerIcon: null, issuerIconPreview: null,
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  const handleChange = (e) => {
    const { name, value, files } = e.target;
    if (name === "file") {
      const file = files[0];
      if (!file.type.match("image.*") && !file.type.match("pdf")) {
        setErrorMessage("Only image and PDF files allowed");
        return;
      }
      if (file.size > 2 * 1024 * 1024) {
        setErrorMessage("File must be under 2MB");
        return;
      }
      setFormData({ ...formData, file });
      setErrorMessage("");
    } else {
      setFormData({ ...formData, [name]: value });
    }
  };

  const handleIconChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.type.match("image.*")) {
      setErrorMessage("Only image files allowed for issuer icon");
      return;
    }
    if (file.size > 2 * 1024 * 1024) {
      setErrorMessage("Issuer icon must be under 2MB");
      return;
    }
    setFormData({ ...formData, issuerIcon: file, issuerIconPreview: URL.createObjectURL(file) });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { certificateName, instituteName, issueDate, file, issuerIcon } = formData;
    if (!certificateName || !instituteName || !issueDate || !file || !issuerIcon) {
      setErrorMessage("Please fill all required fields and select files.");
      return;
    }
    setIsUploading(true);
    setSuccessMessage("");
    setErrorMessage("");
    setUploadProgress(0);
    try {
      const certRes = await uploadImage(file, "portfolio_certs", (p) => setUploadProgress(p));
      const iconRes = await uploadImage(issuerIcon, "portfolio_certs", (p) => setUploadProgress(p));
      await addDoc(collection(db, "Licensecertificates"), {
        title: certificateName,
        issuer: instituteName,
        date: issueDate,
        icon: certRes.data.secure_url,
        issuerIcon: iconRes.data.secure_url,
        link: formData.credentialUrl || "#",
        credentialsId: formData.credentialId || "",
        createdAt: serverTimestamp(),
      });
      setSuccessMessage("Certificate uploaded successfully!");
      setFormData({
        certificateName: "", instituteName: "", issueDate: "", credentialId: "",
        credentialUrl: "", file: null, issuerIcon: null, issuerIconPreview: null,
      });
      setTimeout(() => navigate('/dashboard/licenseCertificate'), 1200);
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to upload certificate. Please try again.");
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
        <button onClick={() => navigate('/dashboard/licenseCertificate')} className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all">
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center shadow-lg shadow-emerald-500/30">
          <FiBookOpen className="text-white h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Add License Certificate</h1>
          <p className="text-sm text-slate-500">Upload official license certificates and credentials</p>
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
                Certificate Name <span className="text-red-400">*</span>
              </label>
              <input type="text" name="certificateName" value={formData.certificateName} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Institute Name <span className="text-red-400">*</span>
              </label>
              <input type="text" name="instituteName" value={formData.instituteName} onChange={handleChange} required className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Issue Date <span className="text-red-400">*</span>
              </label>
              <input type="date" name="issueDate" value={formData.issueDate} onChange={handleChange} required className={inputClass} />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Credential ID</label>
              <input type="text" name="credentialId" value={formData.credentialId} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">Credential URL</label>
            <input type="url" name="credentialUrl" value={formData.credentialUrl} onChange={handleChange} className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Certificate File (PDF/Image) <span className="text-red-400">*</span>
              </label>
              <label className="flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group h-[72px]">
                <FiUpload className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                <div className="min-w-0">
                  <p className="text-sm text-slate-500 group-hover:text-indigo-600 truncate">
                    {formData.file ? formData.file.name : 'Upload PDF or Image'}
                  </p>
                  <p className="text-xs text-slate-400">PDF, PNG, or JPG (Max 2MB)</p>
                </div>
                <input type="file" name="file" accept="application/pdf,image/*" onChange={handleChange} required className="hidden" />
              </label>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Issuer Icon <span className="text-red-400">*</span>
              </label>
              <div className="flex items-center gap-3">
                <label className="flex-1 flex items-center gap-3 px-4 py-3 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group h-[72px]">
                  <FiUpload className="h-4 w-4 text-slate-400 group-hover:text-indigo-500 transition-colors shrink-0" />
                  <div className="min-w-0">
                    <p className="text-sm text-slate-500 group-hover:text-indigo-600 truncate">
                      {formData.issuerIcon ? formData.issuerIcon.name : 'Upload icon'}
                    </p>
                    <p className="text-xs text-slate-400">PNG, JPG, SVG (Max 2MB)</p>
                  </div>
                  <input type="file" name="issuerIcon" accept="image/*" onChange={handleIconChange} required className="hidden" />
                </label>
                {formData.issuerIconPreview && (
                  <div className="w-[72px] h-[72px] border border-slate-200 rounded-xl overflow-hidden shrink-0 bg-white shadow-sm">
                    <img src={formData.issuerIconPreview} alt="Icon preview" className="w-full h-full object-contain p-1" />
                  </div>
                )}
              </div>
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
                  className="bg-gradient-to-r from-emerald-500 to-teal-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          <div className="pt-1">
            <button
              type="submit"
              disabled={isUploading}
              className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-white font-semibold rounded-xl shadow-lg shadow-emerald-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
            >
              <FiBookOpen className="h-4 w-4" />
              {isUploading ? 'Uploading...' : 'Submit Certificate'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CertificateUploadForm;