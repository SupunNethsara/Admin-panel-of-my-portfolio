import { useState } from 'react';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { FiCode, FiPlus, FiX, FiUpload, FiCheck, FiAlertCircle, FiGithub, FiExternalLink, FiArrowLeft } from 'react-icons/fi';
import { db } from '../../../firebaseConfig';
import { uploadImage } from '../Cloudinaryapi';

function ProjectUploadForm() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    projectName: '', visibility: 'public', createdDate: '', technologies: [],
    newTechnology: '', description: '', duration: '', projectType: 'full-stack',
    companyProject: false, images: [], mainImage: '', githubUrl: '', liveUrl: ''
  });
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitMessage, setSubmitMessage] = useState('');

  const technologyOptions = [
    'React', 'Node.js', 'JavaScript', 'TypeScript', 'Next.js', 'Vue.js', 'Angular',
    'Postman', 'vite', 'Bootstrap', 'MySQL', 'Python', 'XD', 'Figma', 'Java',
    'Firebase', 'MongoDB', 'Express', 'HTML/CSS', 'Tailwind CSS', 'Redux', 'Laravel'
  ];

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === 'checkbox' ? checked : value }));
  };

  const handleTechnologyChange = (tech) => {
    setFormData(prev => ({
      ...prev,
      technologies: prev.technologies.includes(tech)
        ? prev.technologies.filter(t => t !== tech)
        : [...prev.technologies, tech]
    }));
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
        uploadImage(file, 'portfolio_projects', (p) => {
          setUploadProgress(prev => (prev + p) / (files.length + 1));
        })
      );
      const results = await Promise.all(uploadPromises);
      const uploadedUrls = results.map(r => r.data.secure_url);
      setFormData(prev => {
        const newImages = [...prev.images, ...uploadedUrls];
        return {
          ...prev,
          images: newImages,
          mainImage: prev.mainImage || newImages[0] || ''
        };
      });
      setSubmitMessage('Images uploaded successfully!');
    } catch (error) {
      console.error('Image upload error:', error);
      setSubmitMessage('Failed to upload images');
    } finally {
      setIsSubmitting(false);
    }
  };

  const setAsMainImage = (imgUrl) => {
    setFormData(prev => ({ ...prev, mainImage: imgUrl }));
  };

  const removeImage = (index) => {
    setFormData(prev => {
      const removedUrl = prev.images[index];
      const updatedImages = prev.images.filter((_, i) => i !== index);
      let updatedMain = prev.mainImage;
      if (removedUrl === prev.mainImage) {
        updatedMain = updatedImages[0] || '';
      }
      return { ...prev, images: updatedImages, mainImage: updatedMain };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const finalMainImage = formData.mainImage || (formData.images.length > 0 ? formData.images[0] : '');
      const { newTechnology, ...dataToSave } = formData;
      await addDoc(collection(db, 'projects'), {
        ...dataToSave,
        mainImage: finalMainImage,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });
      setSubmitMessage('Project uploaded successfully!');
      setFormData({
        projectName: '', visibility: 'public', createdDate: '', technologies: [],
        newTechnology: '', description: '', duration: '', projectType: 'full-stack',
        companyProject: false, images: [], mainImage: '', githubUrl: '', liveUrl: ''
      });
      setTimeout(() => navigate('/dashboard/Projects'), 1200);
    } catch (error) {
      console.error('Error adding project:', error);
      setSubmitMessage('Failed to upload project');
    } finally {
      setIsSubmitting(false);
    }
  };

  const inputClass =
    'w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all';

  const isSuccess = submitMessage.includes('success');
  const customTechs = formData.technologies.filter(t => !technologyOptions.includes(t));

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={() => navigate('/dashboard/Projects')}
          className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-all"
        >
          <FiArrowLeft className="h-5 w-5" />
        </button>
        <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
          <FiCode className="text-white h-5 w-5" />
        </div>
        <div>
          <h1 className="text-xl font-bold text-slate-800">Add Project</h1>
          <p className="text-sm text-slate-500">Showcase a new project in your portfolio</p>
        </div>
      </div>

      {submitMessage && (
        <div className={`mb-5 flex items-center gap-2 p-4 rounded-xl border text-sm ${
          isSuccess
            ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
            : 'bg-red-50 border-red-200 text-red-600'
        }`}>
          {isSuccess
            ? <FiCheck className="h-4 w-4 shrink-0" />
            : <FiAlertCircle className="h-4 w-4 shrink-0" />}
          {submitMessage}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Basic Info */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Basic Info</p>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Project Name <span className="text-red-400">*</span>
            </label>
            <input type="text" name="projectName" value={formData.projectName} onChange={handleChange} required className={inputClass} />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Visibility</label>
              <select name="visibility" value={formData.visibility} onChange={handleChange} className={inputClass}>
                <option value="public">Public</option>
                <option value="private">Private</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Project Type</label>
              <select name="projectType" value={formData.projectType} onChange={handleChange} className={inputClass}>
                <option value="full-stack">Full Stack</option>
                <option value="frontend">Frontend</option>
                <option value="backend">Backend</option>
                <option value="mobile">Mobile App</option>
                <option value="other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Created Date</label>
              <input type="date" name="createdDate" value={formData.createdDate} onChange={handleChange} className={inputClass} />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Duration</label>
              <input type="text" name="duration" value={formData.duration} onChange={handleChange} placeholder="e.g., 3 months" className={inputClass} />
            </div>
            <div className="flex items-end pb-1">
              <label className="flex items-center gap-3 cursor-pointer select-none">
                <div
                  onClick={() => setFormData(prev => ({ ...prev, companyProject: !prev.companyProject }))}
                  className={`w-10 h-6 rounded-full transition-all duration-200 relative ${formData.companyProject ? 'bg-indigo-500' : 'bg-slate-200'}`}
                >
                  <div className={`absolute top-1 w-4 h-4 rounded-full bg-white shadow transition-all duration-200 ${formData.companyProject ? 'left-5' : 'left-1'}`} />
                </div>
                <span className="text-sm font-medium text-slate-700">Company Project</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Description <span className="text-red-400">*</span>
            </label>
            <textarea
              name="description" value={formData.description} onChange={handleChange} required rows={4}
              className="w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all resize-none"
            />
          </div>
        </div>

        {/* Technologies */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Technologies</p>

          <div className="flex flex-wrap gap-2">
            {technologyOptions.map(tech => {
              const selected = formData.technologies.includes(tech);
              return (
                <button
                  key={tech} type="button" onClick={() => handleTechnologyChange(tech)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
                    selected
                      ? 'bg-indigo-500 text-white border-indigo-500 shadow-sm'
                      : 'bg-slate-50 text-slate-600 border-slate-200 hover:border-indigo-300 hover:text-indigo-600'
                  }`}
                >
                  {selected && <FiCheck className="inline h-3 w-3 mr-1 -mt-0.5" />}
                  {tech}
                </button>
              );
            })}
          </div>

          {customTechs.length > 0 && (
            <div className="flex flex-wrap gap-2">
              {customTechs.map(tech => (
                <span key={tech} className="flex items-center gap-1 px-3 py-1.5 bg-violet-50 text-violet-700 border border-violet-200 rounded-lg text-xs font-medium">
                  {tech}
                  <button type="button" onClick={() => handleTechnologyChange(tech)} className="ml-0.5 hover:text-red-500 transition-colors">
                    <FiX className="h-3 w-3" />
                  </button>
                </span>
              ))}
            </div>
          )}

          <div className="flex gap-2">
            <input
              type="text" placeholder="Add custom technology..."
              value={formData.newTechnology}
              onChange={(e) => setFormData({ ...formData, newTechnology: e.target.value })}
              onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addNewTechnology())}
              className="flex-1 px-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-slate-800 text-sm placeholder-slate-400 focus:outline-none focus:border-indigo-500 focus:bg-white transition-all"
            />
            <button
              type="button" onClick={addNewTechnology}
              className="flex items-center gap-1.5 px-4 py-2 bg-indigo-500 hover:bg-indigo-600 text-white text-sm font-medium rounded-xl transition-all"
            >
              <FiPlus className="h-4 w-4" /> Add
            </button>
          </div>
        </div>

        {/* Links */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-5">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Links</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <FiGithub className="h-4 w-4" /> GitHub URL
              </label>
              <input type="url" name="githubUrl" value={formData.githubUrl} onChange={handleChange}
                placeholder="https://github.com/username/project" className={inputClass} />
            </div>
            <div>
              <label className="flex items-center gap-1.5 text-sm font-medium text-slate-700 mb-1.5">
                <FiExternalLink className="h-4 w-4" /> Live URL
              </label>
              <input type="url" name="liveUrl" value={formData.liveUrl} onChange={handleChange}
                placeholder="https://example.com" className={inputClass} />
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-4">
          <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Project Images</p>

          <label className="flex flex-col items-center justify-center gap-2 px-4 py-10 bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl cursor-pointer hover:border-indigo-400 hover:bg-indigo-50/30 transition-all group">
            <FiUpload className="h-6 w-6 text-slate-400 group-hover:text-indigo-500 transition-colors" />
            <div className="text-center">
              <p className="text-sm font-medium text-slate-500 group-hover:text-indigo-600">Click to upload images</p>
              <p className="text-xs text-slate-400 mt-0.5">PNG, JPG, or WebP</p>
            </div>
            <input type="file" multiple accept="image/*" onChange={handleImageUpload} className="hidden" disabled={isSubmitting} />
          </label>

          {uploadProgress > 0 && uploadProgress < 100 && (
            <div>
              <div className="flex justify-between text-xs text-slate-500 mb-1.5">
                <span>Uploading images...</span>
                <span>{Math.round(uploadProgress)}%</span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${uploadProgress}%` }}
                />
              </div>
            </div>
          )}

          {formData.images.length > 0 && (
            <div className="space-y-2">
              <p className="text-xs text-slate-500 font-medium">
                Click "★ Set Cover" to choose the main preview image for the portfolio grid.
              </p>
              <div className="grid grid-cols-3 gap-3">
                {formData.images.map((img, index) => {
                  const isMain = formData.mainImage === img || (!formData.mainImage && index === 0);
                  return (
                    <div
                      key={index}
                      className={`relative group aspect-video rounded-xl overflow-hidden border-2 transition-all ${
                        isMain ? "border-amber-400 ring-2 ring-amber-400/30" : "border-transparent"
                      }`}
                    >
                      <img src={img} alt={`Preview ${index}`} className="w-full h-full object-cover" />
                      
                      {/* Delete Button */}
                      <button
                        type="button" onClick={() => removeImage(index)}
                        className="absolute top-1.5 right-1.5 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity shadow-lg z-10"
                      >
                        <FiX className="h-3 w-3" />
                      </button>

                      {/* Cover Badge / Selector Button */}
                      <button
                        type="button"
                        onClick={() => setAsMainImage(img)}
                        className={`absolute bottom-1.5 left-1.5 px-2 py-0.5 rounded-md text-[10px] font-semibold transition-all shadow-md ${
                          isMain
                            ? "bg-amber-400 text-slate-900 opacity-100"
                            : "bg-slate-900/80 text-white opacity-80 group-hover:opacity-100 hover:bg-indigo-600"
                        }`}
                      >
                        {isMain ? "★ Cover Image" : "Set Cover"}
                      </button>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </div>

        {/* Submit */}
        <button
          type="submit" disabled={isSubmitting}
          className="flex items-center gap-2 px-6 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all disabled:opacity-60 disabled:cursor-not-allowed text-sm"
        >
          <FiCode className="h-4 w-4" />
          {isSubmitting ? 'Uploading...' : 'Upload Project'}
        </button>
      </form>
    </div>
  );
}

export default ProjectUploadForm;