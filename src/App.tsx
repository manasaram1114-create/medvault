import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './components/AuthProvider';
import Navbar from './components/Navbar';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import PatientDashboard from './pages/PatientDashboard';
import UploadRecord from './pages/UploadRecord';
import Timeline from './pages/Timeline';
import DoctorDashboard from './pages/DoctorDashboard';
import PatientView from './pages/PatientView';
import { Role } from './lib/firebase';

const ProtectedRoute: React.FC<{ children: React.ReactNode, allowedRole?: Role }> = ({ children, allowedRole }) => {
  const { user, profile, loading } = useAuth();

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 text-blue-600 font-bold">
      Loading MedVault...
    </div>
  );

  if (!user) return <Navigate to="/login" />;

  if (!profile) return <Navigate to="/onboarding" />;

  if (allowedRole && profile.role !== allowedRole) {
    return <Navigate to={profile.role === Role.PATIENT ? '/patient/dashboard' : '/doctor/dashboard'} />;
  }

  return <>{children}</>;
};

import HealtHuBot from './components/HealtHuBot';

const AuthenticatedLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  return (
    <>
      {children}
      {user && <HealtHuBot />}
    </>
  );
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 pb-20 md:pb-0 md:pt-16">
          <Navbar />
          <AuthenticatedLayout>
            <Routes>
              <Route path="/login" element={<Login />} />
              <Route path="/onboarding" element={<ProtectedRoute><Onboarding /></ProtectedRoute>} />
              
              {/* Patient Routes */}
              <Route path="/patient/dashboard" element={
                <ProtectedRoute allowedRole={Role.PATIENT}>
                  <PatientDashboard />
                </ProtectedRoute>
              } />
              <Route path="/patient/upload" element={
                <ProtectedRoute allowedRole={Role.PATIENT}>
                  <UploadRecord />
                </ProtectedRoute>
              } />
              <Route path="/patient/timeline" element={
                <ProtectedRoute allowedRole={Role.PATIENT}>
                  <Timeline />
                </ProtectedRoute>
              } />

              {/* Doctor Routes */}
              <Route path="/doctor/dashboard" element={
                <ProtectedRoute allowedRole={Role.DOCTOR}>
                  <DoctorDashboard />
                </ProtectedRoute>
              } />
              <Route path="/doctor/patient/:id" element={
                <ProtectedRoute allowedRole={Role.DOCTOR}>
                  <PatientView />
                </ProtectedRoute>
              } />

              {/* Default Redirection */}
              <Route path="/" element={<Navigate to="/login" />} />
            </Routes>
          </AuthenticatedLayout>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
