import {
  FiHome,
  FiUsers,
  FiSettings,
  FiPieChart,
  FiShoppingBag,
  FiFileText,
  FiLogOut,
  FiX
} from "react-icons/fi";
import { Link } from 'react-router-dom';
import { auth } from "../../firebaseConfig";
import { signOut } from "firebase/auth";

const AdminSidebar = ({ isOpen, toggleSidebar, currentPath }) => {
  const menuItems = [
    
      { path: "/dashboard/certificates", icon: <FiFileText />, label: "Certificates" },
      {path:"licenseCertificate" , icon:<FiPieChart/>  , label:"License Ceritificate"} ,
      {path: "Projects", icon: <FiUsers />, label: "projects"},
  ];
const handleLogout = async () => {
  try {
    await signOut(auth);
 window.location.href = "/login";
  } catch (error) {
    console.error("Logout failed", error);
  }
};
  return (
    <div className={`fixed inset-y-0 left-0 transform ${isOpen ? 'translate-x-0' : '-translate-x-full'} lg:translate-x-0 z-30 transition-transform duration-300 ease-in-out bg-white shadow-lg w-64`}>
 <div className="flex items-center justify-between p-4 border-b border-gray-300">
        <div className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center text-white font-bold">
            A
          </div>
          <span className="text-lg font-semibold">Admin Panel</span>
        </div>
        <button 
          onClick={toggleSidebar}
          className="lg:hidden p-1 rounded-md hover:bg-gray-100"
        >
          <FiX className="h-5 w-5" />
        </button>
      </div>

      <div className="p-4 overflow-y-auto h-[calc(100vh-8rem)]">
        <nav className="space-y-1">
          {menuItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={`flex items-center px-4 py-3 rounded-lg transition-colors ${
                currentPath === item.path
                  ? 'bg-blue-50 text-blue-600'
                  : 'hover:bg-gray-100 text-gray-700'
              }`}
            >
              <span className="mr-3">{item.icon}</span>
              <span>{item.label}</span>
            </Link>
          ))}
        </nav>
      </div>

      <div className="absolute bottom-0 left-0 right-0 p-4 border-t">
        <button onClick={handleLogout} className="flex items-center w-full px-4 py-3 rounded-lg text-gray-700 hover:bg-gray-100">
          <FiLogOut className="mr-3" />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
};

export default AdminSidebar;