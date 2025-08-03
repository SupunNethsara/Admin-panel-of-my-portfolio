import { Routes, Route, Navigate } from 'react-router-dom';
import { onAuthStateChanged } from 'firebase/auth';
import { useState, useEffect } from 'react';
import Login from './Components/Main Components/Login';
import Dashboard from './Components/Main Components/Dashboard';
import { auth } from './firebaseConfig';
import Certificates from './Components/Main Components/Certificates/Certificates';
import LicenseCerificate from './Components/Main Components/Certificates/LicenseCerificate';

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
        <Route path="certificates" element={<Certificates />} />
        <Route path="licenseCertificate" element={<LicenseCerificate />} />
      </Route>
      <Route path="/*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  );
}