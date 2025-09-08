import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

import Header from './components/layout/Header';
import PrivateRoute from './utils/PrivateRoute';

// Auth Modules
import LoginPage from './modules/auth/LoginPage';
import RegistrationPage from './modules/auth/RegistrationPage';
import PasswordResetRequestPage from './modules/auth/PasswordResetRequestPage';
import PasswordResetConfirmPage from './modules/auth/PasswordResetConfirmPage';

// Gedenken Modules
import MemorialListingPage from './modules/gedenken/MemorialListingPage';
import MemorialPage from './modules/gedenken/MemorialPage';

// User Area (Mein Bereich) Modules
import MeinBereich from './modules/user/MeinBereich';
import MeinBereichDashboard from './modules/user/MeinBereichDashboard';
import MeineVorsorge from './modules/user/MeineVorsorge';
import MeineGedenkseite from './modules/user/MeineGedenkseite';
import MeineGedenkseiteErstellen from './modules/user/MeineGedenkseiteErstellen';
import MeineDaten from './modules/user/MeineDaten';
import MeineMedien from './modules/user/MeineMedien';
import VerwalteteSeiten from './modules/user/VerwalteteSeiten';
import MyContributions from './modules/user/MyContributions';
import GespeicherteSeiten from './modules/user/GespeicherteSeiten';
import AngehoerigeVerwalten from './modules/user/AngehoerigeVerwalten';
import KontoVerwalten from './modules/user/KontoVerwalten';

// General Modules
import HomePage from './modules/HomePage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <div className="content-wrapper">
          <Routes>
            <Route path="/" element={<HomePage />} />
            
            {/* Auth Routes */}
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route path="/password-reset" element={<PasswordResetRequestPage />} />
            <Route path="/password-reset-confirm/:uid/:token/" element={<PasswordResetConfirmPage />} />

            {/* Public Gedenken Routes */}
            <Route path="/gedenken" element={<MemorialListingPage />} />
            <Route path="/gedenken/:slug" element={<MemorialPage />} />

            {/* Private User Area Routes */}
            <Route path="/mein-bereich" element={<PrivateRoute><MeinBereich /></PrivateRoute>}>
                <Route index element={<Navigate to="dashboard" replace />} />
                <Route path="dashboard" element={<MeinBereichDashboard />} />
                <Route path="vorsorge" element={<MeineVorsorge />} />
                <Route path="gedenkseite" element={<MeineGedenkseite />} />
                <Route path="gedenkseite-erstellen" element={<MeineGedenkseiteErstellen />} />
                <Route path="daten" element={<MeineDaten />} />
                <Route path="medien" element={<MeineMedien />} />
                <Route path="verwaltete-seiten" element={<VerwalteteSeiten />} />
                <Route path="beitraege" element={<MyContributions />} />
                <Route path="gespeicherte-seiten" element={<GespeicherteSeiten />} />
                <Route path="angehoerige-verwalten" element={<AngehoerigeVerwalten />} />
                <Route path="konto-verwalten" element={<KontoVerwalten />} />
            </Route>

          </Routes>
        </div>
      </AuthProvider>
    </Router>
  );
}

export default App;

