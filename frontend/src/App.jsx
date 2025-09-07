// frontend/src/App.jsx
// KORRIGIERT: Wendet eine spezifische CSS-Klasse für Standard-Inhaltsseiten an und entfernt die /dashboard-Weiterleitung.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import HomePage from './modules/HomePage';
import LoginPage from './modules/auth/LoginPage';
import RegistrationPage from './modules/auth/RegistrationPage';
import Header from './components/layout/Header';
import PrivateRoute from './utils/PrivateRoute';
import MemorialPage from './modules/gedenken/MemorialPage';
import MemorialPageAdmin from './modules/gedenken/MemorialPageAdmin';
import MemorialListingPage from './modules/gedenken/MemorialListingPage';
import MyContributions from './modules/user/MyContributions';
import PasswordResetRequestPage from './modules/auth/PasswordResetRequestPage';
import PasswordResetConfirmPage from './modules/auth/PasswordResetConfirmPage';
import MeinBereich from './modules/user/MeinBereich';
import VorsorgeDashboard from './modules/vorsorge/VorsorgeDashboard'; // Wird jetzt direkt geroutet

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="content-wrapper">
          <Routes>
            {/* Öffentliche Routen */}
            <Route path="/" element={<HomePage />} exact />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/password-reset" element={<PasswordResetRequestPage />} />
            <Route path="/password-reset-confirm/:uid/:token/" element={<PasswordResetConfirmPage />} />
            <Route path="/gedenken" element={<MemorialListingPage />} />
            <Route path="/gedenken/:slug" element={<MemorialPage />} />

            {/* Geschützte Routen */}
            <Route 
              path="/mein-bereich/*"
              element={<PrivateRoute><MeinBereich /></PrivateRoute>} 
            />
            {/* Die alte /dashboard Route wird jetzt direkt von "Meine Vorsorge" genutzt */}
            <Route 
              path="/dashboard" 
              element={<PrivateRoute><main className="page-container"><VorsorgeDashboard /></main></PrivateRoute>} 
            />
             <Route 
              path="/meine-beitraege"
              element={<PrivateRoute><main className="page-container"><MyContributions /></main></PrivateRoute>} 
            />
            <Route 
              path="/gedenken/:slug/verwalten"
              element={<PrivateRoute><main className="page-container"><MemorialPageAdmin /></main></PrivateRoute>} 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

