// src/App.jsx
import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import axios from 'axios';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import Landing from './pages/Main.jsx';
import API_BASE_URL from './api/api';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = React.useState(true);
  const [authenticated, setAuthenticated] = React.useState(false);

  React.useEffect(() => {
    const token = JSON.parse(localStorage.getItem('user'))?.idToken;
    if (!token) {
      setAuthenticated(false);
      setLoading(false);
    } else {
      axios
        .post(`${API_BASE_URL}/api/auth/check`, {}, { headers: { Authorization: `Bearer ${token}` } })
        .then(() => {
          setAuthenticated(true);
          setLoading(false);
        })
        .catch(() => {
          setAuthenticated(false);
          setLoading(false);
        });
    }
  }, []);

  if (loading) {
    return <div className="text-white bg-dark text-center vh-100">Loading...</div>;
  }
  return authenticated ? children : <Navigate to="/login" />;
}

function App() {
  return (
    <Routes>
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="*" element={<div className="text-white bg-dark text-center vh-100"><h1>404</h1></div>} />
    </Routes>
  );
}

export default App;
