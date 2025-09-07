// frontend/src/modules/auth/PasswordResetRequestPage.jsx
// NEUE KOMPONENTE: Formular, um den Link zum Zurücksetzen des Passworts anzufordern.

import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AuthPage.css';

const PasswordResetRequestPage = () => {
    const [email, setEmail] = useState('');
    const [message, setMessage] = useState('');
    const [error, setError] = useState('');
    const [settings, setSettings] = useState({});

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`);
                if (response.ok) setSettings(await response.json());
            } catch (error) {
                console.error("Fehler beim Laden der Design-Einstellungen:", error);
            }
        };
        fetchSettings();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage('');
        setError('');

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/password-reset/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email })
            });
            
            if (response.ok) {
                setMessage("Wenn ein Konto mit dieser E-Mail-Adresse existiert, wurde ein Link zum Zurücksetzen des Passworts gesendet. Bitte überprüfen Sie Ihr Postfach.");
            } else {
                setError("Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut.");
            }
        } catch (err) {
            setError("Ein Netzwerkfehler ist aufgetreten.");
        }
    };

    const pageStyle = {
        backgroundColor: settings.password_reset_background_color || '#f4f1ee',
        backgroundImage: settings.password_reset_background_image ? `url(${settings.password_reset_background_image.url})` : 'none',
    };
    const cardStyle = {
        backgroundColor: settings.password_reset_card_background_color || '#ffffff',
        color: settings.password_reset_text_color || '#3a3a3a',
    };
    const buttonStyle = {
        backgroundColor: settings.password_reset_button_color || '#8c8073',
        color: settings.password_reset_button_text_color || '#ffffff',
    };

    return (
        <div className="auth-page-container single-panel" style={pageStyle}>
            <div className="auth-card">
                <div className="auth-form-panel" style={cardStyle}>
                    <h2>{settings.password_reset_title || 'Passwort vergessen?'}</h2>
                    <p>{settings.password_reset_subtitle || 'Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, um Ihr Passwort zurückzusetzen.'}</p>
                    
                    {message && <p className="success-message">{message}</p>}
                    {error && <p className="error-message">{error}</p>}
                    
                    {!message && (
                        <form onSubmit={handleSubmit} className="auth-form">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Ihre E-Mail-Adresse"
                                required
                            />
                            <button type="submit" style={buttonStyle}>Link anfordern</button>
                        </form>
                    )}

                    <p className="auth-switch-link">
                        Zurück zum <Link to="/login" style={{color: buttonStyle.backgroundColor}}>Login</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default PasswordResetRequestPage;
