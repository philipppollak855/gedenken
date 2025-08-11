// frontend/src/utils/PrivateRoute.jsx
// (Erstellen Sie einen neuen Ordner 'utils' in 'src', falls nicht vorhanden)
// Diese Komponente schützt Routen, sodass sie nur für eingeloggte Benutzer zugänglich sind.

import React, { useContext } from 'react';
import { Navigate } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

const PrivateRoute = ({ children }) => {
    const { user } = useContext(AuthContext);
    
    // Wenn kein Benutzer eingeloggt ist, leite zum Login weiter.
    // Ansonsten zeige die geschützte Seite an.
    return user ? children : <Navigate to="/login" />;
};

export default PrivateRoute;
