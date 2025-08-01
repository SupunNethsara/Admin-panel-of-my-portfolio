import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { FiBell, FiMenu, FiX } from "react-icons/fi";
import AdminSidebar from "./AdminSidebar";

const Dashboard = () => {
    const [sidebarOpen, setSidebarOpen] = useState(false);
    const location = useLocation();

    return (
        <div className="min-h-screen bg-gray-100">
            <button
                className="lg:hidden fixed bottom-6 right-6 z-20 p-3 rounded-full bg-blue-600 text-white shadow-lg"
                onClick={() => setSidebarOpen(!sidebarOpen)}
            >
                {sidebarOpen ? <FiX className="h-6 w-6" /> : <FiMenu className="h-6 w-6" />}
            </button>

            {sidebarOpen && (
                <div
                    className="fixed inset-0 bg-black/50 z-10 lg:hidden"
                    onClick={() => setSidebarOpen(false)}
                />
            )}

            <div className="flex">
                <AdminSidebar
                    isOpen={sidebarOpen}
                    toggleSidebar={() => setSidebarOpen(!sidebarOpen)}
                    currentPath={location.pathname}
                />
                <div className="flex-1 overflow-x-hidden">
                  
                    <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;