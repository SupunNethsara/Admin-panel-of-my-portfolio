import React, { useState } from "react";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../../../firebaseConfig";
import { uploadImage } from "../Cloudinaryapi"; 

const CertificateUploadForm = () => {
  const [formData, setFormData] = useState({
    certificateName: "",
    instituteName: "",
    issueDate: "",
    credentialId: "",
    credentialUrl: "",
    file: null,
    issuerIcon: null,
    issuerIconPreview: null,
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

    // Create preview URL
    const previewUrl = URL.createObjectURL(file);
    setFormData({
      ...formData,
      issuerIcon: file,
      issuerIconPreview: previewUrl,
    });
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
      // Upload certificate file
      const certRes = await uploadImage(
        file,
        "portfolio_certs",
        (progress) => setUploadProgress(progress)
      );
      const fileUrl = certRes.data.secure_url;

    
      const iconRes = await uploadImage(
        issuerIcon,
        "portfolio_certs",
        (progress) => setUploadProgress(progress)
      );
      const iconUrl = iconRes.data.secure_url;

      await addDoc(collection(db, "Licensecertificates"), {
        title: certificateName,
        issuer: instituteName,
        date: issueDate,
        icon: fileUrl,
        issuerIcon: iconUrl, 
        link: formData.credentialUrl || "#",
        credentialsId: formData.credentialId || "",
        createdAt: serverTimestamp(),
      });

      setSuccessMessage("Certificate uploaded successfully!");
      setFormData({
        certificateName: "",
        instituteName: "",
        issueDate: "",
        credentialId: "",
        credentialUrl: "",
        file: null,
        issuerIcon: null,
        issuerIconPreview: null,
      });
    } catch (err) {
      console.error(err);
      setErrorMessage("Failed to upload certificate. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4 text-center text-gray-800">
        Upload Certificate
      </h2>

      {successMessage && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          {successMessage}
        </div>
      )}

      {errorMessage && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {errorMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Certificate Name</label>
          <input
            type="text"
            name="certificateName"
            value={formData.certificateName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Institute Name</label>
          <input
            type="text"
            name="instituteName"
            value={formData.instituteName}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Issue Date</label>
          <input
            type="date"
            name="issueDate"
            value={formData.issueDate}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Credential ID</label>
          <input
            type="text"
            name="credentialId"
            value={formData.credentialId}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Credential URL</label>
          <input
            type="url"
            name="credentialUrl"
            value={formData.credentialUrl}
            onChange={handleChange}
            className="mt-1 block w-full px-4 py-2 rounded-md border border-gray-300 bg-white text-gray-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Certificate File (PDF/Image)*
          </label>
          <input
            type="file"
            name="file"
            accept="application/pdf,image/*"
            onChange={handleChange}
            className="mt-1 block w-full text-sm text-gray-800
              file:mr-4 file:py-2 file:px-4
              file:rounded-md file:border-0
              file:text-sm file:font-semibold
              file:bg-blue-50 file:text-blue-700
              hover:file:bg-blue-100"
            required
          />
          <p className="mt-1 text-xs text-gray-500">
            PDF, PNG, or JPG (Max 2MB)
          </p>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issuer Icon*
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                name="issuerIcon"
                accept="image/*"
                onChange={handleIconChange}
                className="block w-full text-sm text-gray-800
                  file:mr-4 file:py-2 file:px-4
                  file:rounded-md file:border-0
                  file:text-sm file:font-semibold
                  file:bg-blue-50 file:text-blue-700
                  hover:file:bg-blue-100"
                required
              />
              <p className="mt-1 text-xs text-gray-500">
                PNG, JPG, or SVG (Max 2MB)
              </p>
            </div>
            {formData.issuerIconPreview && (
              <div className="w-16 h-16 border rounded-md overflow-hidden">
                <img 
                  src={formData.issuerIconPreview} 
                  alt="Issuer icon preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        {isUploading && (
          <div className="pt-2">
            <div className="w-full bg-gray-200 rounded-full h-2.5">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
            <p className="text-xs text-gray-500 mt-1">
              Uploading: {uploadProgress}%
            </p>
          </div>
        )}

        <button
          type="submit"
          className={`w-full py-2 px-4 text-white rounded-lg transition ${isUploading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={isUploading}
        >
          {isUploading ? "Uploading..." : "Submit"}
        </button>
      </form>
    </div>
  );
};

export default CertificateUploadForm;