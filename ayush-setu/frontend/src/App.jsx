import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ToastProvider } from './context/ToastContext';
import ProtectedRoute from './components/ProtectedRoute';
import Login from './pages/Login';
import Register from './pages/Register';
import StudentDashboard from './pages/StudentDashboard';
import Opportunities from './pages/Opportunities';
import IndustryDashboard from './pages/IndustryDashboard';
import InstitutionDashboard from './pages/InstitutionDashboard';

export default function App() {
  return (
    <ToastProvider>
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/" element={
            <ProtectedRoute allowedRoles={['student']}><StudentDashboard /></ProtectedRoute>
          } />
          <Route path="/opportunities" element={
            <ProtectedRoute allowedRoles={['student']}><Opportunities /></ProtectedRoute>
          } />
          <Route path="/industry" element={
            <ProtectedRoute allowedRoles={['industry']}><IndustryDashboard /></ProtectedRoute>
          } />
          <Route path="/institution" element={
            <ProtectedRoute allowedRoles={['institution']}><InstitutionDashboard /></ProtectedRoute>
          } />
        </Routes>
      </BrowserRouter>
    </AuthProvider>
    </ToastProvider>
  );
}