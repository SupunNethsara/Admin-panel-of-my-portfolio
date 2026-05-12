import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import Login from './Components/Main Components/Login';
import Dashboard from './Components/Main Components/Dashboard';
import { auth } from './firebaseConfig';
import Certificates from './Components/Main Components/Certificates/Certificates';
import LicenseCerificate from './Components/Main Components/Certificates/LicenseCerificate';
import ProjectUploadForm from './Components/Main Components/Projects/projectUploadForm';
import ProjectsList from './Components/Main Components/Projects/ProjectsList';
import ProjectEditForm from './Components/Main Components/Projects/ProjectEditForm';
import CertificatesList from './Components/Main Components/Certificates/CertificatesList';
import CertificateEditForm from './Components/Main Components/Certificates/CertificateEditForm';
import LicenseCertificatesList from './Components/Main Components/Certificates/LicenseCertificatesList';
import LicenseCertificateEditForm from './Components/Main Components/Certificates/LicenseCertificateEditForm';
import DashboardHome from './Components/Main Components/DashboardHome';

export default function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });
    return unsubscribe;
  }, []);

  if (loading) return <div>Loading...</div>;

  return (
    // In App.js
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/dashboard" element={user ? <Dashboard /> : <Navigate to="/login" />}>
        <Route index element={<DashboardHome />} />
        <Route path="certificates" element={<CertificatesList />} />
        <Route path="certificates/add" element={<Certificates />} />
        <Route path="certificates/edit/:id" element={<CertificateEditForm />} />
        <Route path="licenseCertificate" element={<LicenseCertificatesList />} />
        <Route path="licenseCertificate/add" element={<LicenseCerificate />} />
        <Route path="licenseCertificate/edit/:id" element={<LicenseCertificateEditForm />} />
        <Route path="Projects" element={<ProjectsList />} />
        <Route path="Projects/add" element={<ProjectUploadForm />} />
        <Route path="Projects/edit/:id" element={<ProjectEditForm />} />
      </Route>
      <Route path="/*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}