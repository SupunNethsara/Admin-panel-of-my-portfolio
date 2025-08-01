import React, { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { uploadImage } from '../Cloudinaryapi';


const Certificates = () => {
  const [formData, setFormData] = useState({
    title: '',
    issuer: '',
    date: '',
    icon: null,
    link: '',
    iconPreview: '',
  });
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
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
      
      setFormData(prev => ({
        ...prev,
        icon: file,
        iconPreview: URL.createObjectURL(file)
      }));
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
      const response = await uploadImage(
        formData.icon,
        'portfolio_certs',
        (progress) => setUploadProgress(progress)
      );
      
      const iconUrl = response.data.secure_url;

      const certificateData = {
        title: formData.title,
        issuer: formData.issuer,
        date: formData.date || null,
        icon: iconUrl,
        link: formData.link || '#',
        createdAt: serverTimestamp()
      };

      await addDoc(collection(db, 'certificates'), certificateData);
      
      setSuccessMessage('Certificate added successfully!');
      setFormData({
        title: '',
        issuer: '',
        date: '',
        icon: null,
        link: '',
        iconPreview: '',
      });
    } catch (error) {
      console.error('Error adding certificate:', error);
      setErrorMessage(error.response?.data?.error?.message || 'Failed to add certificate. Please try again.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold text-gray-800 mb-6">Add New Certificate</h1>
      
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
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Title*
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="React (Basic)"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issuer*
            </label>
            <input
              type="text"
              name="issuer"
              value={formData.issuer}
              onChange={handleChange}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              required
              placeholder="HackerRank"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Issue Date
            </label>
            <input
              type="text"
              name="date"
              value={formData.date}
              onChange={handleChange}
              placeholder="Issued Jun 2025"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Certificate Link
            </label>
            <input
              type="url"
              name="link"
              value={formData.link}
              onChange={handleChange}
              placeholder="https://example.com/certificate"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Issuer Icon*
          </label>
          <div className="flex items-center space-x-4">
            <div className="flex-1">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="block w-full text-sm text-gray-500
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
            {formData.iconPreview && (
              <div className="w-16 h-16 border rounded-md overflow-hidden">
                <img 
                  src={formData.iconPreview} 
                  alt="Preview" 
                  className="w-full h-full object-contain"
                />
              </div>
            )}
          </div>
        </div>

        <div className="pt-4">
          <button
            type="submit"
            disabled={isUploading}
            className={`px-4 py-2 rounded-md text-white font-medium ${isUploading ? 'bg-blue-400' : 'bg-blue-600 hover:bg-blue-700'} focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`}
          >
            {isUploading ? 'Uploading...' : 'Add Certificate'}
          </button>
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
              Uploading: {uploadProgress}% complete
            </p>
          </div>
        )}
      </form>
    </div>
  );
};

export default Certificates;





 