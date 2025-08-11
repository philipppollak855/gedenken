// frontend/src/App.jsx
// AKTUALISIERT: Route für "Meine Beiträge" hinzugefügt und aktiviert.

import React from 'react';
import { BrowserRouter as Router, Routes, Route, Outlet } from 'react-router-dom';
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

// Layout-Komponente für Seiten mit Standard-Padding und Hintergrund
const MainLayout = () => (
  <main style={{ paddingTop: '100px', backgroundColor: 'transparent', boxShadow: 'none'}}>
    <Outlet />
  </main>
);

function App() {
  return (
    <Router>
      <AuthProvider>
        <Header />
        <Routes>
          <Route element={<MainLayout />}>
            <Route path="/" element={<HomePage />} exact />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegistrationPage />} />
            <Route 
              path="/dashboard"
              element={<PrivateRoute><VorsorgeDashboard /></PrivateRoute>} 
            />
            <Route 
              path="/meine-beitraege"
              element={<PrivateRoute><MyContributions /></PrivateRoute>} 
            />
          </Route>

          <Route path="/gedenken" element={<MemorialListingPage />} />
          <Route path="/gedenken/:slug" element={<MemorialPage />} />
          <Route 
            path="/gedenken/:slug/verwalten"
            element={<PrivateRoute><MemorialPageAdmin /></PrivateRoute>} 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
