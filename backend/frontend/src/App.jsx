// frontend/src/App.jsx
// KORRIGIERT: Stellt die korrekte Layout-Struktur für die fixe Navigation sicher.

import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import HomePage from './modules/HomePage';
import LoginPage from './modules/auth/LoginPage';
import RegistrationPage from './modules/auth/RegistrationPage';
import Header from './components/layout/Header';
import VorsorgeDashboard from './modules/vorsorge/VorsorgeDashboard';
import PrivateRoute from './utils/PrivateRoute';
import MemorialPage from './modules/gedenken/MemorialPage';
import MemorialPageAdmin from './modules/gedenken/MemorialPageAdmin';
import MemorialListingPage from './modules/gedenken/MemorialListingPage';
import MyContributions from './modules/user/MyContributions';

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
            <Route 
              path="/dashboard"
              element={<PrivateRoute><main><VorsorgeDashboard /></main></PrivateRoute>} 
            />
            <Route 
              path="/meine-beitraege"
              element={<PrivateRoute><main><MyContributions /></main></PrivateRoute>} 
            />
            <Route path="/gedenken" element={<MemorialListingPage />} />
            <Route path="/gedenken/:slug" element={<MemorialPage />} />
            <Route 
              path="/gedenken/:slug/verwalten"
              element={<PrivateRoute><main><MemorialPageAdmin /></main></PrivateRoute>} 
            />
          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;
