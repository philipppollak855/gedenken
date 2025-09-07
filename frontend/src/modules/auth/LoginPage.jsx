// frontend/src/modules/auth/LoginPage.jsx
// AKTUALISIERT: Link "Passwort vergessen" hinzugefügt und CSS-Import auf die geteilte Datei geändert.

import React, { useContext, useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './AuthPage.css'; // NEUER, GEMEINSAMER CSS-IMPORT

const LoginPage = () => {
    const { loginUser } = useContext(AuthContext);
    const [settings, setSettings] = useState({});
    const navigate = useNavigate();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`);
                if (response.ok) {
                    setSettings(await response.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Design-Einstellungen:", error);
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

    const pageStyle = {
        backgroundColor: settings.login_background_color || '#f4f1ee',
        backgroundImage: settings.login_background_image ? `url(${settings.login_background_image.url})` : 'none',
    };
    const cardStyle = {
        backgroundColor: settings.login_card_background_color || '#ffffff',
        color: settings.login_text_color || '#3a3a3a',
    };
    const buttonStyle = {
        backgroundColor: settings.login_button_color || '#8c8073',
        color: settings.login_button_text_color || '#ffffff',
    };

    return (
        <div className="auth-page-container single-panel" style={pageStyle}>
            <div className="auth-card">
                <div className="auth-form-panel" style={cardStyle}>
                    <h2>{settings.login_title || 'Willkommen zurück'}</h2>
                    <p>{settings.login_subtitle || 'Melden Sie sich an, um auf Ihr persönliches Vorsorge-Dashboard zuzugreifen und Gedenkseiten zu verwalten.'}</p>
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <input type="email" name="email" placeholder="E-Mail-Adresse" required />
                        <input type="password" name="password" placeholder="Passwort" required />
                        <div className="forgot-password-link">
                            <Link to="/password-reset" style={{color: buttonStyle.backgroundColor}}>Passwort vergessen?</Link>
                        </div>
                        <button type="submit" style={buttonStyle}>Anmelden</button>
                    </form>
                    
                    <p className="auth-switch-link">
                        Noch kein Konto? <Link to="/register" style={{color: buttonStyle.backgroundColor}}>Hier registrieren</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default LoginPage;

