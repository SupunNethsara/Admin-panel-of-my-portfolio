import { FiAward, FiBookOpen, FiCode, FiLogOut, FiX } from "react-icons/fi";
import { Link } from 'react-router-dom';
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";

const AdminSidebar = ({ isOpen, toggleSidebar, currentPath }) => {
  const menuItems = [
    { path: "/dashboard/certificates", icon: <FiAward />, label: "Certificates" },
    { path: "licenseCertificate", icon: <FiBookOpen />, label: "License Certificate" },
    { path: "Projects", icon: <FiCode />, label: "Projects" },
  ];

  const handleLogout = async () => {
    try {
      await signOut(auth);
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed", error);
    }
  };

  const isActive = (path) =>
    currentPath === path || currentPath.includes(path.replace('/dashboard/', ''));

  return (
    <div
      className={`fixed inset-y-0 left-0 transform ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      } lg:translate-x-0 z-30 transition-transform duration-300 ease-in-out w-64 flex flex-col bg-slate-900 border-r border-slate-800`}
    >
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-5 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 to-violet-600 flex items-center justify-center text-white font-bold text-sm shadow-lg shadow-indigo-500/30">
            A
          </div>
          <div>
            <p className="text-white font-semibold text-sm leading-tight">Admin Panel</p>
            <p className="text-slate-500 text-xs">Portfolio Manager</p>
          </div>
        </div>
        <button
          onClick={toggleSidebar}
          className="lg:hidden p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
        >
          <FiX className="h-4 w-4" />
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-3 py-5 space-y-1 overflow-y-auto">
        <p className="text-xs font-semibold text-slate-600 uppercase tracking-wider px-3 mb-3">
          Content
        </p>
        {menuItems.map((item) => {
          const active = isActive(item.path);
          return (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                active
                  ? 'bg-indigo-600/20 text-indigo-400 border border-indigo-500/25'
                  : 'text-slate-400 hover:text-white hover:bg-slate-800 border border-transparent'
              }`}
            >
              <span className={`text-base ${active ? 'text-indigo-400' : 'text-slate-500'}`}>
                {item.icon}
              </span>
              {item.label}
              {active && (
                <span className="ml-auto w-1.5 h-1.5 rounded-full bg-indigo-400" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-3 py-4 border-t border-slate-800">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 w-full px-3 py-2.5 rounded-xl text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-500/10 transition-all border border-transparent"
        >
          <FiLogOut className="text-base" />
          Sign Out
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;