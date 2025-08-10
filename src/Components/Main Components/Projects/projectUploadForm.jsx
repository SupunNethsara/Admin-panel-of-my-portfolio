import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';

import { db } from '../../../firebaseConfig';
import { uploadImage } from '../Cloudinaryapi';

function ProjectUploadForm() {
  const [formData, setFormData] = useState({
    projectName: '',
    visibility: 'public',
    createdDate: '',
    technologies: [],
    newTechnology: '',
    description: '',
    duration: '',
    projectType: 'full-stack',
    companyProject: false,
    images: [],
    githubUrl: '',
    liveUrl: ''
  });

  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const technologyOptions = [
    'React',
    'Node.js',
    'JavaScript',
    'TypeScript',
    'Next.js',
    'Vue.js',
    'Angular',
    'Postman',
    'vite',
    'Bootstrap',
    'MySQL',
    'Python',
    'XD',
    'Figma',
    'Java',
    'Firebase',
    'MongoDB',
    'Express',
    'HTML/CSS',
    'Tailwind CSS',
    'Redux'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleTechnologyChange = (tech) => {
    setFormData(prev => {
      if (prev.technologies.includes(tech)) {
        return {
          ...prev,
          technologies: prev.technologies.filter(t => t !== tech)
        };
      } else {
        return {
          ...prev,
          technologies: [...prev.technologies, tech]
        };
      }
    });
  };

  const addNewTechnology = () => {
    if (formData.newTechnology && !formData.technologies.includes(formData.newTechnology)) {
      setFormData(prev => ({
        ...prev,
        technologies: [...prev.technologies, prev.newTechnology],
        newTechnology: ''
      }));
    }
  };

  const handleImageUpload = async (e) => {
    const files = Array.from(e.target.files);
    if (files.length === 0) return;

    setIsSubmitting(true);
    setUploadProgress(0);

    try {
      const uploadPromises = files.map(file =>
        uploadImage(file, 'portfolio_projects', (progress) => {
          setUploadProgress(prev => (prev + progress) / (files.length + 1));
        })
      );

      const results = await Promise.all(uploadPromises);
      const imageUrls = results.map(res => res.data.secure_url);

      setFormData(prev => ({
        ...prev,
        images: [...prev.images, ...imageUrls]
      }));

      setSubmitMessage('Images uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      setSubmitMessage('Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const removeImage = (index) => {
    setFormData(prev => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      await addDoc(collection(db, 'projects'), {
        ...formData,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      setSubmitMessage('Project uploaded successfully!');
      setFormData({
        projectName: '',
        visibility: 'public',
        createdDate: '',
        technologies: [],
        newTechnology: '',
        description: '',
        duration: '',
        projectType: 'full-stack',
        companyProject: false,
        images: [],
        githubUrl: '',
        liveUrl: ''
      });
    } catch (error) {
      console.error('Error adding project:', error);
      setSubmitMessage('Failed to upload project');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Upload New Project</h2>

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Project Name */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Name *</label>
          <input
            type="text"
            name="projectName"
            value={formData.projectName}
            onChange={handleChange}
            required
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Visibility */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Visibility *</label>
          <select
            name="visibility"
            value={formData.visibility}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="public">Public</option>
            <option value="private">Private</option>
          </select>
        </div>

        {/* Created Date */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Created Date</label>
          <input
            type="date"
            name="createdDate"
            value={formData.createdDate}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Technologies */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Technologies</label>
          <div className="flex flex-wrap gap-2 mb-2">
            {technologyOptions.map(tech => (
              <div key={tech} className="flex items-center">
                <input
                  type="checkbox"
                  id={tech}
                  checked={formData.technologies.includes(tech)}
                  onChange={() => handleTechnologyChange(tech)}
                  className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
                />
                <label htmlFor={tech} className="ml-2 text-sm text-gray-700">
                  {tech}
                </label>
              </div>
            ))}
          </div>

          <div className="flex mt-2">
            <input
              type="text"
              placeholder="Add new technology"
              value={formData.newTechnology}
              onChange={(e) => setFormData({ ...formData, newTechnology: e.target.value })}
              className="flex-1 px-3 py-2 border border-gray-300 rounded-l-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <button
              type="button"
              onClick={addNewTechnology}
              className="px-4 py-2 bg-blue-500 text-white rounded-r-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              Add
            </button>
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Description *</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={4}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Duration */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
          <input
            type="text"
            name="duration"
            value={formData.duration}
            onChange={handleChange}
            placeholder="e.g., 3 months"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Project Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Type</label>
          <select
            name="projectType"
            value={formData.projectType}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="full-stack">Full Stack</option>
            <option value="frontend">Frontend Development</option>
            <option value="backend">Backend Development</option>
            <option value="mobile">Mobile App</option>
            <option value="other">Other</option>
          </select>
        </div>

        {/* Company Project */}
        <div className="flex items-center">
          <input
            type="checkbox"
            id="companyProject"
            name="companyProject"
            checked={formData.companyProject}
            onChange={handleChange}
            className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded"
          />
          <label htmlFor="companyProject" className="ml-2 text-sm text-gray-700">
            Company Project
          </label>
        </div>

        {/* GitHub URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">GitHub URL</label>
          <input
            type="url"
            name="githubUrl"
            value={formData.githubUrl}
            onChange={handleChange}
            placeholder="https://github.com/username/project"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Live URL */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Live URL</label>
          <input
            type="url"
            name="liveUrl"
            value={formData.liveUrl}
            onChange={handleChange}
            placeholder="https://example.com"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Project Images</label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isSubmitting}
          />
          {uploadProgress > 0 && uploadProgress < 100 && (
            <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
              <div
                className="bg-blue-600 h-2.5 rounded-full"
                style={{ width: `${uploadProgress}%` }}
              ></div>
            </div>
          )}
        </div>

        {/* Preview Uploaded Images */}
        {formData.images.length > 0 && (
          <div>
            <h3 className="text-sm font-medium text-gray-700 mb-2">Uploaded Images</h3>
            <div className="grid grid-cols-3 gap-2">
              {formData.images.map((img, index) => (
                <div key={index} className="relative group">
                  <img
                    src={img}
                    alt={`Project preview ${index}`}
                    className="w-full h-24 object-cover rounded"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    ×
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Submit Button */}
        <div>
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSubmitting ? 'Uploading...' : 'Upload Project'}
          </button>
        </div>

        {/* Status Message */}
        {submitMessage && (
          <div className={`p-3 rounded-md ${submitMessage.includes('success') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
            {submitMessage}
          </div>
        )}
      </form>
    </div>
  );
}

export default ProjectUploadForm;