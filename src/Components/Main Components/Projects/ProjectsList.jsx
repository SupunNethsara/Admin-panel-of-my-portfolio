import { useState, useEffect } from 'react';
import { collection, getDocs, deleteDoc, doc, query, orderBy } from 'firebase/firestore';
import { db } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
import { FiPlus, FiEdit2, FiTrash2, FiCode, FiExternalLink, FiGithub, FiEye, FiEyeOff } from 'react-icons/fi';

function ProjectsList() {
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const navigate = useNavigate();

  useEffect(() => { fetchProjects(); }, []);

  const fetchProjects = async () => {
    try {
      const q = query(collection(db, 'projects'), orderBy('createdAt', 'desc'));
      const snapshot = await getDocs(q);
      setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
    } catch {
      try {
        const snapshot = await getDocs(collection(db, 'projects'));
        setProjects(snapshot.docs.map(d => ({ id: d.id, ...d.data() })));
      } catch (err) {
        console.error('Error fetching projects:', err);
      }
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await deleteDoc(doc(db, 'projects', id));
      setProjects(prev => prev.filter(p => p.id !== id));
    } catch (err) {
      console.error('Error deleting project:', err);
    } finally {
      setDeletingId(null);
    }
  };

  const typeColors = {
    'full-stack': 'bg-violet-50 text-violet-700 border-violet-200',
    frontend: 'bg-blue-50 text-blue-700 border-blue-200',
    backend: 'bg-green-50 text-green-700 border-green-200',
    mobile: 'bg-orange-50 text-orange-700 border-orange-200',
    other: 'bg-slate-50 text-slate-600 border-slate-200',
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-violet-500/30">
            <FiCode className="text-white h-5 w-5" />
          </div>
          <div>
            <h1 className="text-xl font-bold text-slate-800">Projects</h1>
            <p className="text-sm text-slate-500">
              {projects.length} project{projects.length !== 1 ? 's' : ''} in your portfolio
            </p>
          </div>
        </div>
        <button
          onClick={() => navigate('/dashboard/Projects/add')}
          className="flex items-center gap-2 px-4 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 hover:from-violet-600 hover:to-purple-700 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/25 transition-all"
        >
          <FiPlus className="h-4 w-4" />
          Add Project
        </button>
      </div>

      {projects.length === 0 ? (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-16 text-center">
          <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center mx-auto mb-4">
            <FiCode className="h-7 w-7 text-slate-300" />
          </div>
          <p className="text-slate-500 font-medium mb-1">No projects yet</p>
          <p className="text-slate-400 text-sm mb-5">Add your first project to showcase it in your portfolio</p>
          <button
            onClick={() => navigate('/dashboard/Projects/add')}
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-violet-500 to-purple-600 text-white text-sm font-semibold rounded-xl shadow-lg shadow-violet-500/25 hover:from-violet-600 hover:to-purple-700 transition-all"
          >
            <FiPlus className="h-4 w-4" />
            Add First Project
          </button>
        </div>
      ) : (
        <div className="grid gap-4">
          {projects.map(project => (
            <div key={project.id} className="bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex gap-4">
              <div className="w-28 h-20 rounded-xl overflow-hidden bg-slate-100 flex-shrink-0">
                {project.images?.[0] ? (
                  <img src={project.images[0]} alt={project.projectName} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <FiCode className="h-6 w-6 text-slate-300" />
                  </div>
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <h3 className="font-semibold text-slate-800 truncate">{project.projectName}</h3>
                      <span className={`px-2 py-0.5 text-xs font-medium rounded-lg border ${typeColors[project.projectType] || typeColors.other}`}>
                        {project.projectType}
                      </span>
                      <span className={`flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-lg border ${
                        project.visibility === 'public'
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-50 text-slate-600 border-slate-200'
                      }`}>
                        {project.visibility === 'public'
                          ? <FiEye className="h-3 w-3" />
                          : <FiEyeOff className="h-3 w-3" />}
                        {project.visibility}
                      </span>
                    </div>
                    <p className="text-slate-500 text-sm mt-1 line-clamp-2">{project.description}</p>
                  </div>

                  <div className="flex items-center gap-2 flex-shrink-0">
                    {project.githubUrl && (
                      <a
                        href={project.githubUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        <FiGithub className="h-4 w-4" />
                      </a>
                    )}
                    {project.liveUrl && (
                      <a
                        href={project.liveUrl} target="_blank" rel="noopener noreferrer"
                        className="p-2 rounded-xl text-slate-400 hover:text-slate-700 hover:bg-slate-50 transition-all"
                      >
                        <FiExternalLink className="h-4 w-4" />
                      </a>
                    )}
                    <button
                      onClick={() => navigate(`/dashboard/Projects/edit/${project.id}`)}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-medium rounded-xl transition-all border border-indigo-100"
                    >
                      <FiEdit2 className="h-3.5 w-3.5" />
                      Edit
                    </button>
                    <button
                      onClick={() => handleDelete(project.id, project.projectName)}
                      disabled={deletingId === project.id}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-red-600 text-xs font-medium rounded-xl transition-all border border-red-100 disabled:opacity-50"
                    >
                      <FiTrash2 className="h-3.5 w-3.5" />
                      {deletingId === project.id ? 'Deleting...' : 'Delete'}
                    </button>
                  </div>
                </div>

                {project.technologies?.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 mt-2.5">
                    {project.technologies.slice(0, 6).map(tech => (
                      <span key={tech} className="px-2 py-0.5 bg-slate-50 text-slate-600 border border-slate-200 rounded-lg text-xs">
                        {tech}
                      </span>
                    ))}
                    {project.technologies.length > 6 && (
                      <span className="px-2 py-0.5 bg-slate-50 text-slate-400 border border-slate-200 rounded-lg text-xs">
                        +{project.technologies.length - 6} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default ProjectsList;
