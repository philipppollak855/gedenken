// frontend/src/modules/auth/LoginPage.jsx
// Komplett neu gestaltet für ein modernes, anpassbares Design.

import React, { useContext, useState, useEffect } from 'react';
import AuthContext from '../../context/AuthContext';
import { Link } from 'react-router-dom';
import './LoginPage.css'; // Neues CSS importieren

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    const [settings, setSettings] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`);
                if (response.ok) {
                    const data = await response.json();
                    setSettings(data);
                }
            } catch (error) {
                console.error("Fehler beim Laden der Login-Einstellungen:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = (e) => {
        e.preventDefault();
        const email = e.target.email.value;
        const password = e.target.password.value;
        loginUser(email, password);
    };
    
    // Dynamische Styles basierend auf den Admin-Einstellungen
    const pageStyle = {
        backgroundColor: settings?.login_background_color || '#f4f1ee',
        backgroundImage: settings?.login_background_image ? `url(${settings.login_background_image.url})` : 'none',
    };
    
    const cardStyle = {
        backgroundColor: settings?.login_card_background_color || '#ffffff',
        color: settings?.login_text_color || '#3a3a3a',
    };

    const buttonStyle = {
        backgroundColor: settings?.login_button_color || '#8c8073',
        color: settings?.login_button_text_color || '#ffffff',
    };

    if (isLoading) {
        return <div>Lade...</div>;
    }

    return (
        <div className="login-page-container" style={pageStyle}>
            <div className="login-card">
                <div className="info-panel">
                    <h1 style={{ color: settings?.login_text_color || '#3a3a3a' }}>
                        {settings?.login_title || "Willkommen zurück"}
                    </h1>
                    <p style={{ color: settings?.login_text_color || '#3a3a3a' }}>
                        {settings?.login_subtitle || "Melden Sie sich an, um auf Ihr persönliches Vorsorge-Dashboard zuzugreifen und Gedenkseiten zu verwalten."}
                    </p>
                </div>
                <div className="form-panel" style={cardStyle}>
                    <h2>Anmelden</h2>
                    <form onSubmit={handleSubmit}>
                        <div className="input-group">
                            <label htmlFor="email">E-Mail-Adresse</label>
                            <input type="email" id="email" name="email" required />
                        </div>
                        <div className="input-group">
                            <label htmlFor="password">Passwort</label>
                            <input type="password" id="password" name="password" required />
                        </div>
                        <button type="submit" className="login-button" style={buttonStyle}>
                            Sicher einloggen
                        </button>
                    </form>
                    <div className="form-links">
                        <Link to="/register">Neues Konto erstellen</Link>
                        <Link to="/password-reset">Passwort vergessen?</Link>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;
