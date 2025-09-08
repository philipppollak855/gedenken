// frontend/src/App.jsx
// KORRIGIERT: Die alte /dashboard-Route wird jetzt korrekt auf die neue Übersichtsseite umgeleitet.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import HomePage from './modules/HomePage';
import LoginPage from './modules/auth/LoginPage';
import RegistrationPage from './modules/auth/RegistrationPage';
import Header from './components/layout/Header';
import PrivateRoute from './utils/PrivateRoute';
import MemorialPage from './modules/gedenken/MemorialPage';
import MemorialPageAdmin from './modules/gedenken/MemorialPageAdmin';
import MemorialListingPage from './modules/gedenken/MemorialListingPage';
import MeinBereich from './modules/user/MeinBereich';
import PasswordResetRequestPage from './modules/auth/PasswordResetRequestPage';
import PasswordResetConfirmPage from './modules/auth/PasswordResetConfirmPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} exact />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/password-reset" element={<PasswordResetRequestPage />} />
            <Route path="/password-reset-confirm/:uid/:token" element={<PasswordResetConfirmPage />} />
            
            {/* Leitet die alte /dashboard URL auf die neue Standard-Ansicht um */}
            <Route path="/dashboard" element={<Navigate to="/mein-bereich/dashboard" replace />} />

            <Route 
              path="/mein-bereich/*"
              element={<PrivateRoute><MeinBereich /></PrivateRoute>} 
            />
            <Route path="/gedenken" element={<MemorialListingPage />} />
            <Route path="/gedenken/:slug" element={<MemorialPage />} />
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

