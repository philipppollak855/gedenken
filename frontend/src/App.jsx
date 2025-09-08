// frontend/src/App.jsx
// KORRIGIERT: Unbenutzter Import von 'VorsorgeDashboard' entfernt, um den Netlify-Build-Fehler zu beheben.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import HomePage from './modules/HomePage';
import LoginPage from './modules/auth/LoginPage';
import RegistrationPage from './modules/auth/RegistrationPage';
import Header from './components/layout/Header';
// HINWEIS: 'VorsorgeDashboard' wurde entfernt, da es jetzt innerhalb von 'MeinBereich' verwendet wird.
import PrivateRoute from './utils/PrivateRoute';
import MemorialPage from './modules/gedenken/MemorialPage';
import MemorialPageAdmin from './modules/gedenken/MemorialPageAdmin';
import MemorialListingPage from './modules/gedenken/MemorialListingPage';
import MyContributions from './modules/user/MyContributions';
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
            
            <Route 
              path="/mein-bereich/*"
              element={<PrivateRoute><MeinBereich /></PrivateRoute>} 
            />
            <Route 
              path="/meine-beitraege"
              element={<PrivateRoute><main className="page-container"><MyContributions /></main></PrivateRoute>} 
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

