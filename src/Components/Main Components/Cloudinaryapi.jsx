import axios from 'axios';

const cloudinaryApi = axios.create({
  baseURL: 'https://api.cloudinary.com/v1_1/dx7waof09',
  headers: {
    'Content-Type': 'multipart/form-data',
  },
});

export const uploadImage = (file, uploadPreset = 'portfolio_certs', onUploadProgress) => {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('upload_preset', uploadPreset);
  formData.append('cloud_name', 'dx7waof09');
  
  return cloudinaryApi.post('/image/upload', formData, {
    onUploadProgress: (progressEvent) => {
      if (onUploadProgress) {
        const progress = Math.round(
          (progressEvent.loaded * 100) / progressEvent.total
        );
        onUploadProgress(progress);
      }
    },
  });
};

export default cloudinaryApi;