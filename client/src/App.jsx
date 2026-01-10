import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import axios from 'axios';

// Components
import Login from './components/Login';
import Dashboard from './components/Dashboard';
import DepartmentDashboard from './components/DepartmentDashboard';
import AdminDashboard from './components/AdminDashboard'; // Import new component
import ApplyLeavingCertificate from './components/ApplyLeavingCertificate';
import ApplyAlumni from './components/ApplyAlumni';
import NoDuesStatus from './components/NoDuesStatus';
import Register from './components/Register';
import HODDashboard from './components/HODDashboard';
import PrincipalDashboard from './components/PrincipalDashboard';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
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
      // Verify token with backend
      const verifyToken = async () => {
        try {
          const response = await axios.get(`${API_BASE_URL}/auth/verify`, {
            headers: { Authorization: `Bearer ${token}` }
          });
          if (response.data.valid) {
            setIsAuthenticated(true);
            setUser(response.data.user);
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
    localStorage.setItem('token', token);
    setIsAuthenticated(true);
    setUser(userData);
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
    <Router>
      <div className="min-h-screen bg-gray-50">
        {isAuthenticated && <Navbar user={user} onLogout={handleLogout} />}
        <main className="container mx-auto px-4 py-8">
          <Routes>
            <Route 
              path="/login" 
              element={!isAuthenticated ? 
                <Login onLogin={handleLogin} /> : 
                <Navigate to="/" />} 
            />
            <Route 
              path="/register" 
              element={!isAuthenticated ? 
                <Register onLogin={handleLogin} /> : 
                <Navigate to="/" />} 
            />
            <Route 
              path="/dashboard" 
              element={isAuthenticated && user?.role === 'student' ? 
                <Dashboard user={user} /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/apply" 
              element={isAuthenticated && user?.role === 'student' ? 
                <ApplyLeavingCertificate userId={user.id} /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/no-dues" 
              element={isAuthenticated && user?.role === 'student' ? 
                <NoDuesStatus userId={user.id} /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/alumni" 
              element={isAuthenticated && user?.role === 'student' ? 
                <ApplyAlumni /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/department" 
              element={isAuthenticated && user?.role === 'department' ? 
                <DepartmentDashboard user={user} /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/admin" 
              element={isAuthenticated && user?.role === 'admin' ? 
                <AdminDashboard user={user} /> : 
                <Navigate to="/login" />} 
            />
             <Route 
              path="/hod" 
              element={isAuthenticated && user?.role === 'hod' ? 
                <HODDashboard /> : 
                <Navigate to="/login" />} 
            />
             <Route 
              path="/principal" 
              element={isAuthenticated && user?.role === 'principal' ? 
                <PrincipalDashboard /> : 
                <Navigate to="/login" />} 
            />
            <Route 
              path="/" 
              element={
                isAuthenticated ? 
                  (user.role === 'student' ? <Navigate to="/dashboard" /> : 
                   user.role === 'admin' ? <Navigate to="/admin" /> :
                   user.role === 'hod' ? <Navigate to="/hod" /> :
                   user.role === 'principal' ? <Navigate to="/principal" /> :
                   <Navigate to="/department" />) : 
                  <Navigate to="/login" />
              } 
            />
            <Route path="*" element={<Navigate to="/" />} />
          </Routes>
        </main>
        {isAuthenticated && <Footer />}
      </div>
    </Router>
  );
}

export default App;
