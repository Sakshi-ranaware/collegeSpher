import { Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import AdminDashboard from './components/AdminDashboard';
import ApplyLeavingCertificate from './components/ApplyLeavingCertificate';
import ApplyAlumni from './components/ApplyAlumni';
import DepartmentApplicationDetails from './components/DepartmentApplicationDetails';
import NoDuesStatus from './components/NoDuesStatus';
import Register from './components/Register';
import HODDashboard from './components/HODDashboard';
import HODApplicationDetails from './components/HODApplicationDetails';
import HODAlumniApplications from './components/HODAlumniApplications';
import HODAlumniDetails from './components/HODAlumniDetails';
import PrincipalDashboard from './components/PrincipalDashboard';
import PrincipalApplicationDetails from './components/PrincipalApplicationDetails';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import ForgotPassword from './components/ForgotPassword';

// API base URL
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Check if user is already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      const verifyToken = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.valid) {
            setUser(response.data.user);
            setIsAuthenticated(true);
          } else {
            localStorage.removeItem('token');
          }
        } catch (error) {
          console.error('Token verification failed:', error);
          localStorage.removeItem('token');
        } finally {
          setLoading(false);
        }
      };
      verifyToken();
    } else {
      setLoading(false);
    }
  }, []);

  const handleLogin = (token, userData) => {
    console.log('handleLogin called with:', userData);
    localStorage.setItem('token', token);
    setUser(userData);
    setIsAuthenticated(true);
  };

  const handleLogout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    setUser(null);
  };

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar user={user} onLogout={handleLogout} />
      <main className="container mx-auto px-4 py-8">
        <Routes>
          <Route 
            path="/login" 
            element={!isAuthenticated ? <Login onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/register" 
            element={!isAuthenticated ? <Register onLogin={handleLogin} /> : <Navigate to="/" />} 
          />
          <Route 
            path="/forgot-password" 
            element={!isAuthenticated ? <ForgotPassword /> : <Navigate to="/" />} 
          />
          <Route 
            path="/dashboard" 
            element={isAuthenticated && user?.role === 'student' ? <Dashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/apply" 
            element={isAuthenticated && user?.role === 'student' ? <ApplyLeavingCertificate userId={user?._id} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/no-dues" 
            element={isAuthenticated && user?.role === 'student' ? <NoDuesStatus user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/alumni" 
            element={isAuthenticated && user?.role === 'student' ? <ApplyAlumni /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/department" 
            element={isAuthenticated && user?.role === 'department' ? <DepartmentDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/department/application/:id" 
            element={isAuthenticated && user?.role === 'department' ? <DepartmentApplicationDetails user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/admin" 
            element={isAuthenticated && user?.role === 'admin' ? <AdminDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/hod" 
            element={isAuthenticated && user?.role === 'hod' ? <HODDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/hod/application/:id" 
            element={isAuthenticated && user?.role === 'hod' ? <HODApplicationDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/hod/alumni-applications" 
            element={isAuthenticated && user?.role === 'hod' ? <HODAlumniApplications /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/hod/alumni/application/:id" 
            element={isAuthenticated && user?.role === 'hod' ? <HODAlumniDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/principal" 
            element={isAuthenticated && user?.role === 'principal' ? <PrincipalDashboard user={user} /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/principal/application/:id" 
            element={isAuthenticated && user?.role === 'principal' ? <PrincipalApplicationDetails /> : <Navigate to="/login" />} 
          />
          <Route 
            path="/" 
            element={
              isAuthenticated ? 
                (user?.role === 'student' ? <Navigate to="/dashboard" /> : 
                 user?.role === 'admin' ? <Navigate to="/admin" /> :
                 user?.role === 'hod' ? <Navigate to="/hod" /> :
                 user?.role === 'principal' ? <Navigate to="/principal" /> :
                 user?.role === 'department' ? <Navigate to="/department" /> :
                 <Navigate to="/login" />) : 
                <Navigate to="/login" />
            } 
          />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </main>
      <Footer />
    </div>
  );
}

export default App;
