// RSW Workout App - Main App Component with Routing
import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import EmailEntry from './pages/EmailEntry';
import Onboarding from './pages/Onboarding';
import Dashboard from './pages/Dashboard';
import AdminLogin from './pages/AdminLogin';
import Admin from './pages/Admin';

const App: React.FC = () => {
  return (
    <BrowserRouter basename="/rootedworkout">
      <Routes>
        <Route path="/" element={<EmailEntry />} />
        <Route path="/onboarding" element={<Onboarding />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route path="/admin" element={<Admin />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
