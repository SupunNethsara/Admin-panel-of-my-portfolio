import { useEffect, useState } from 'react';
import { collection, getCountFromServer } from 'firebase/firestore';
import { FiAward, FiBookOpen, FiCode, FiArrowRight, FiTrendingUp } from 'react-icons/fi';
import { Link } from 'react-router-dom';
import { db } from '../../firebaseConfig';

const statCards = [
  {
    label: 'Certificates',
    collection: 'certificates',
    icon: FiAward,
    color: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/20',
    bg: 'bg-indigo-50',
    text: 'text-indigo-600',
    link: '/dashboard/certificates',
  },
  {
    label: 'License Certificates',
    collection: 'Licensecertificates',
    icon: FiBookOpen,
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/20',
    bg: 'bg-emerald-50',
    text: 'text-emerald-600',
    link: '/dashboard/licenseCertificate',
  },
  {
    label: 'Projects',
    collection: 'projects',
    icon: FiCode,
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/20',
    bg: 'bg-violet-50',
    text: 'text-violet-600',
    link: '/dashboard/projects',
  },
];

const quickActions = [
  {
    label: 'Add Certificate',
    description: 'Upload a new skill or course certificate',
    icon: FiAward,
    color: 'from-indigo-500 to-violet-600',
    shadow: 'shadow-indigo-500/25',
    link: '/dashboard/certificates',
  },
  {
    label: 'Add License Certificate',
    description: 'Upload an official license or credential',
    icon: FiBookOpen,
    color: 'from-emerald-500 to-teal-600',
    shadow: 'shadow-emerald-500/25',
    link: '/dashboard/licenseCertificate',
  },
  {
    label: 'Add Project',
    description: 'Showcase a new project in your portfolio',
    icon: FiCode,
    color: 'from-violet-500 to-purple-600',
    shadow: 'shadow-violet-500/25',
    link: '/dashboard/projects',
  },
];

const DashboardHome = () => {
  const [counts, setCounts] = useState({ certificates: null, Licensecertificates: null, projects: null });

  useEffect(() => {
    const fetchCounts = async () => {
      try {
        const [certs, licCerts, projects] = await Promise.all([
          getCountFromServer(collection(db, 'certificates')),
          getCountFromServer(collection(db, 'Licensecertificates')),
          getCountFromServer(collection(db, 'projects')),
        ]);
        setCounts({
          certificates: certs.data().count,
          Licensecertificates: licCerts.data().count,
          projects: projects.data().count,
        });
      } catch (err) {
        console.error('Failed to fetch counts:', err);
      }
    };
    fetchCounts();
  }, []);

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Welcome back</h2>
          <p className="text-slate-500 text-sm mt-1">Here's an overview of your portfolio content.</p>
        </div>
        <div className="hidden sm:flex items-center gap-2 px-4 py-2 bg-white border border-slate-100 rounded-xl shadow-sm text-sm text-slate-500">
          <FiTrendingUp className="h-4 w-4 text-indigo-500" />
          Portfolio Admin
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {statCards.map((card) => {
          const Icon = card.icon;
          const count = counts[card.collection];
          return (
            <Link
              key={card.label}
              to={card.link}
              className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 flex items-center gap-4 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
            >
              <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${card.color} flex items-center justify-center shadow-lg ${card.shadow} shrink-0`}>
                <Icon className="text-white h-5 w-5" />
              </div>
              <div className="min-w-0">
                <p className="text-2xl font-bold text-slate-800">
                  {count === null ? (
                    <span className="inline-block w-8 h-6 bg-slate-100 rounded animate-pulse" />
                  ) : count}
                </p>
                <p className="text-sm text-slate-500 truncate">{card.label}</p>
              </div>
              <FiArrowRight className="ml-auto h-4 w-4 text-slate-300 group-hover:text-slate-500 group-hover:translate-x-0.5 transition-all shrink-0" />
            </Link>
          );
        })}
      </div>

      {/* Quick Actions */}
      <div>
        <h3 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Quick Actions</h3>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.label}
                to={action.link}
                className="group bg-white rounded-2xl border border-slate-100 shadow-sm p-5 hover:shadow-md hover:-translate-y-0.5 transition-all duration-200"
              >
                <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${action.color} flex items-center justify-center shadow-lg ${action.shadow} mb-4`}>
                  <Icon className="text-white h-5 w-5" />
                </div>
                <p className="font-semibold text-slate-800 text-sm">{action.label}</p>
                <p className="text-xs text-slate-500 mt-1 leading-relaxed">{action.description}</p>
                <div className="flex items-center gap-1 mt-4 text-xs font-medium text-indigo-500 group-hover:gap-2 transition-all">
                  Go <FiArrowRight className="h-3.5 w-3.5" />
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default DashboardHome;