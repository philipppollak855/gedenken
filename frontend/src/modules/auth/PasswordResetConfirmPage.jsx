// frontend/src/modules/auth/PasswordResetConfirmPage.jsx
// NEUE KOMPONENTE: Formular, um das neue Passwort nach Klick auf den Link zu setzen.

import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import './AuthPage.css';

const PasswordResetConfirmPage = () => {
    const [password, setPassword] = useState('');
    const [password2, setPassword2] = useState('');
    const [message, setMessage] = useState('');
    const [errors, setErrors] = useState({});
    const [settings, setSettings] = useState({});
    const { uid, token } = useParams();
    const navigate = useNavigate();

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
        setErrors({});

        if (password !== password2) {
            setErrors({ password: 'Die Passwörter stimmen nicht überein.' });
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/password-reset-confirm/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ uid, token, password, password2 })
            });

            if (response.ok) {
                setMessage("Ihr Passwort wurde erfolgreich zurückgesetzt. Sie können sich nun mit Ihrem neuen Passwort anmelden.");
                setTimeout(() => navigate('/login'), 5000);
            } else {
                const data = await response.json();
                setErrors(data.errors ? { password: data.errors.join(' ') } : { general: data.error || 'Ein unbekannter Fehler ist aufgetreten.' });
            }
        } catch (err) {
             setErrors({ general: 'Ein Netzwerkfehler ist aufgetreten.' });
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
                    <h2>{settings.password_reset_confirm_title || 'Neues Passwort festlegen'}</h2>
                    
                    {message ? (
                        <>
                            <p className="success-message">{message}</p>
                            <Link to="/login" className="auth-button" style={buttonStyle}>Zum Login</Link>
                        </>
                    ) : (
                        <>
                            <p>{settings.password_reset_confirm_subtitle || 'Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es.'}</p>
                            <form onSubmit={handleSubmit} className="auth-form">
                                <input
                                    type="password"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    placeholder="Neues Passwort"
                                    required
                                />
                                <input
                                    type="password"
                                    value={password2}
                                    onChange={(e) => setPassword2(e.target.value)}
                                    placeholder="Neues Passwort bestätigen"
                                    required
                                />
                                {errors.password && <p className="error-message">{errors.password}</p>}
                                {errors.general && <p className="error-message">{errors.general}</p>}
                                <button type="submit" style={buttonStyle}>Passwort speichern</button>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default PasswordResetConfirmPage;
