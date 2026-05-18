import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import Sidebar from './components/Sidebar';
import LoginPage from './pages/LoginPage';
import Dashboard from './pages/Dashboard';
import EmployeesPage from './pages/EmployeesPage';
import EmployeeDetailPage from './pages/EmployeeDetailPage';
import RankingsPage from './pages/RankingsPage';
import AIAnalysisPage from './pages/AIAnalysisPage';

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  if (loading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <div className="spinner" />
    </div>
  );
  return user ? children : <Navigate to="/login" />;
};

const AppLayout = ({ children }) => {
  const { user } = useAuth();
  if (!user) return children;
  return (
    <div className="app-layout">
      <Sidebar />
      <main className="main-content">{children}</main>
    </div>
  );
};

function AppRoutes() {
  return (
    <AppLayout>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
        <Route path="/employees" element={<PrivateRoute><EmployeesPage /></PrivateRoute>} />
        <Route path="/employees/:id" element={<PrivateRoute><EmployeeDetailPage /></PrivateRoute>} />
        <Route path="/rankings" element={<PrivateRoute><RankingsPage /></PrivateRoute>} />
        <Route path="/ai-analysis" element={<PrivateRoute><AIAnalysisPage /></PrivateRoute>} />
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </AppLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <BrowserRouter>
        <Toaster position="top-right" toastOptions={{
          style: { background: '#1a2235', color: '#f1f5f9', border: '1px solid #1e293b' },
        }} />
        <AppRoutes />
      </BrowserRouter>
    </AuthProvider>
  );
}
