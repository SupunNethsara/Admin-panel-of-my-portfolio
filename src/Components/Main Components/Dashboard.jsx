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
                    className="fixed inset-0 bg-black bg-opacity-50 z-10 lg:hidden"
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
                    <header className="bg-white shadow-sm">
                        <div className="max-w-7xl mx-auto px-4 py-4 sm:px-6 lg:px-8 flex justify-between items-center">
                            <h1 className="text-lg font-semibold text-gray-900"></h1>
                            <div className="flex items-center space-x-4">
                                <button className="p-2 rounded-full hover:bg-gray-100">
                                    <FiBell className="h-5 w-5 text-gray-500" />
                                </button>
                                <div className="flex items-center">
                                    <img
                                        className="h-8 w-8 rounded-full"
                                        src="https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&ixid=eyJhcHBfaWQiOjEyMDd9&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80"
                                        alt=""
                                    />
                                    <span className="ml-2 text-sm font-medium text-gray-700">Admin User</span>
                                </div>
                            </div>
                        </div>
                    </header>
                    <main className="max-w-7xl mx-auto px-4 py-6 sm:px-6 lg:px-8">
                        <Outlet />
                    </main>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;