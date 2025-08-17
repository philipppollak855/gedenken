// frontend/src/context/AuthContext.jsx
// Vollständiger Code mit angepasster API-URL.

import React, { createContext, useState, useCallback } from 'react';
import { jwtDecode } from 'jwt-decode';
import { useNavigate } from 'react-router-dom';

const AuthContext = createContext();

export default AuthContext;

export const AuthProvider = ({ children }) => {
    const [authTokens, setAuthTokens] = useState(() => 
        localStorage.getItem('authTokens') 
        ? JSON.parse(localStorage.getItem('authTokens')) 
        : null
    );
    
    const [user, setUser] = useState(() => 
        localStorage.getItem('authTokens') 
        ? jwtDecode(JSON.parse(localStorage.getItem('authTokens')).access) 
        : null
    );

    const navigate = useNavigate();
    const API_URL = process.env.REACT_APP_API_URL;

    const loginUser = async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/api/token/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await response.json();

            if (response.ok) {
                setAuthTokens(data);
                setUser(jwtDecode(data.access));
                localStorage.setItem('authTokens', JSON.stringify(data));
                navigate('/dashboard');
            } else {
                alert('Login fehlgeschlagen! Überprüfen Sie E-Mail und Passwort.');
            }
        } catch (error) {
            console.error("Login-Fehler:", error);
            alert("Ein Verbindungsfehler ist aufgetreten.");
        }
    };

    const logoutUser = useCallback(() => {
        setAuthTokens(null);
        setUser(null);
        localStorage.removeItem('authTokens');
        navigate('/login');
    }, [navigate]);

    const contextData = {
        user,
        authTokens,
        loginUser,
        logoutUser,
    };

    return (
        <AuthContext.Provider value={contextData}>
            {children}
        </AuthContext.Provider>
    );
};
