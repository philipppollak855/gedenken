// frontend/src/App.jsx
// KORRIGIERT: Die Route für "/gedenken" wurde in den "page-with-padding"-Container
// verschoben, um das Höhenproblem zu beheben.

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

// User Area (Mein Bereich) Modules - NEU STRUKTURIERT
import MeinBereich from './modules/user/MeinBereich'; // Fungiert jetzt als Haupt-Layout für den User-Bereich
import PortalChoicePage from './modules/user/PortalChoicePage'; // NEUE Auswahlseite
import GedenkenDashboard from './modules/user/GedenkenDashboard'; // NEUES Layout für Gedenken
import VorsorgeDashboard from './modules/user/VorsorgeDashboard'; // NEUES Layout für Vorsorge
import UnterlagenDashboard from './modules/user/UnterlagenDashboard'; // NEUES Layout für Unterlagen
import UnterlagenUebersicht from './modules/user/UnterlagenUebersicht';

// Unterseiten, die jetzt in den Dashboards gerendert werden
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
        <Routes>
          {/* Routen, die das Padding benötigen */}
          <Route path="/" element={<div className="page-with-padding"><HomePage /></div>} />
          <Route path="/gedenken/:slug" element={<div className="page-with-padding"><MemorialPage /></div>} />
          {/* KORRIGIERT: Diese Route benötigt ebenfalls das Padding */}
          <Route path="/gedenken" element={<div className="page-with-padding"><MemorialListingPage /></div>} />
          
          {/* Vollbild-Routen, die KEIN extra Padding benötigen */}
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<RegistrationPage />} />
          <Route path="/password-reset" element={<PasswordResetRequestPage />} />
          <Route path="/password-reset-confirm/:uid/:token/" element={<PasswordResetConfirmPage />} />
          
          {/* "Mein Bereich" ist eine Vollbild-Route */}
          <Route path="/mein-bereich" element={<PrivateRoute><MeinBereich /></PrivateRoute>}>
              <Route index element={<Navigate to="auswahl" replace />} />
              <Route path="auswahl" element={<PortalChoicePage />} />

              {/* Gedenken Portal */}
              <Route path="gedenken" element={<GedenkenDashboard />}>
                  <Route index element={<Navigate to="uebersicht" replace />} />
                  <Route path="uebersicht" element={<VerwalteteSeiten />} /> 
                  <Route path="gespeicherte-seiten" element={<GespeicherteSeiten />} />
                  <Route path="angehoerige-verwalten" element={<AngehoerigeVerwalten />} />
                  <Route path="beitraege" element={<MyContributions />} />
              </Route>

              {/* Vorsorge Portal */}
              <Route path="vorsorge" element={<VorsorgeDashboard />}>
                  <Route index element={<Navigate to="uebersicht" replace />} />
                  <Route path="uebersicht" element={<MeineVorsorge />} />
                  <Route path="meine-gedenkseite" element={<MeineGedenkseite />} />
                  <Route path="meine-gedenkseite-erstellen" element={<MeineGedenkseiteErstellen />} />
                  <Route path="medien" element={<MeineMedien />} />
                  <Route path="konto" element={<KontoVerwalten />} />
                  <Route path="meine-daten" element={<MeineDaten />} />
              </Route>

              {/* Unterlagen Portal */}
              <Route path="unterlagen" element={<UnterlagenDashboard />}>
                  <Route index element={<Navigate to="uebersicht" replace />} />
                  <Route path="uebersicht" element={<UnterlagenUebersicht />} />
              </Route>
          </Route>
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;

