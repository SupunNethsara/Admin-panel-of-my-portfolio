import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import { FiMenu, FiX, FiBell } from "react-icons/fi";
import AdminSidebar from "./AdminSidebar";

const pageTitles = {
  '/dashboard/certificates': 'Certificates',
  '/dashboard/licenseCertificate': 'License Certificates',
  '/dashboard/Projects': 'Projects',
};

const Dashboard = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();

  const pageTitle = pageTitles[location.pathname] || 'Dashboard';

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/60 z-20 lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      <AdminSidebar
        isOpen={sidebarOpen}
        toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
        currentPath={location.pathname}
      />

      <div className="flex-1 lg:ml-64 flex flex-col min-h-screen">
        {/* Top header */}
        <header className="sticky top-0 z-10 bg-white border-b border-slate-100 px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <button
              className="lg:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <FiX className="h-5 w-5" /> : <FiMenu className="h-5 w-5" />}
            </button>
            <h1 className="text-base font-semibold text-slate-800">{pageTitle}</h1>
          </div>
          <div className="flex items-center gap-3">
            <button className="p-2 rounded-xl text-slate-500 hover:bg-slate-100 transition-colors">
              <FiBell className="h-5 w-5" />
            </button>
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-md shadow-indigo-500/20">
              A
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6 max-w-5xl w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default Dashboard;