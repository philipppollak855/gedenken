// frontend/src/modules/auth/RegistrationPage.jsx
// Komplett überarbeitete Registrierungsseite mit dynamischem Design.

import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './RegistrationPage.css'; // Neues, separates CSS importieren

const RegistrationPage = () => {
    const [errors, setErrors] = useState({});
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

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const formData = {
            email: e.target.email.value,
            first_name: e.target.firstName.value,
            last_name: e.target.lastName.value,
            password: e.target.password.value,
            password2: e.target.password2.value,
            consent_admin_access: e.target.consent.checked,
        };

        if (formData.password !== formData.password2) {
            setErrors({ password: "Passwörter stimmen nicht überein." });
            return;
        }

        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/register/`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData)
            });
            const data = await response.json();
            if (response.status === 201) {
                alert("Registrierung erfolgreich! Sie werden zum Login weitergeleitet.");
                navigate('/login');
            } else {
                setErrors(data);
            }
        } catch (err) {
            setErrors({ general: "Ein Fehler ist aufgetreten. Bitte versuchen Sie es später erneut." });
        }
    };

    const pageStyle = {
        backgroundColor: settings.register_background_color || '#f4f1ee',
        backgroundImage: settings.register_background_image ? `url(${settings.register_background_image.url})` : 'none',
    };

    const cardStyle = {
        backgroundColor: settings.register_card_background_color || '#ffffff',
        color: settings.register_text_color || '#3a3a3a',
    };
    
    const buttonStyle = {
        backgroundColor: settings.register_button_color || '#8c8073',
        color: settings.register_button_text_color || '#ffffff',
    };

    return (
        <div className="auth-page-container" style={pageStyle}>
            <div className="auth-card">
                <div className="auth-info-panel registration-info-panel">
                    {/* Dieser Bereich kann für ein Bild oder zusätzliche Informationen genutzt werden */}
                </div>
                <div className="auth-form-panel" style={cardStyle}>
                    <h2>{settings.register_title || 'Konto erstellen'}</h2>
                    <p>{settings.register_subtitle || 'Erstellen Sie Ihr Konto, um mit der Vorsorge zu beginnen oder einem geliebten Menschen zu gedenken.'}</p>
                    
                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="form-row">
                            <input type="text" name="firstName" placeholder="Vorname" required />
                            <input type="text" name="lastName" placeholder="Nachname" required />
                        </div>
                        {errors.first_name && <p className="error-message">{errors.first_name}</p>}
                        {errors.last_name && <p className="error-message">{errors.last_name}</p>}

                        <input type="email" name="email" placeholder="E-Mail-Adresse" required />
                        {errors.email && <p className="error-message">{errors.email}</p>}

                        <div className="form-row">
                            <input type="password" name="password" placeholder="Passwort" required />
                            <input type="password" name="password2" placeholder="Passwort bestätigen" required />
                        </div>
                        {errors.password && <p className="error-message">{errors.password}</p>}
                        
                        <div className="consent-row">
                            <input type="checkbox" id="consent" name="consent" required />
                            <label htmlFor="consent">
                                Ich stimme der Datenverarbeitung gemäß der Spezifikation zu.
                            </label>
                        </div>
                        {errors.consent_admin_access && <p className="error-message">{errors.consent_admin_access}</p>}

                        {errors.general && <p className="error-message">{errors.general}</p>}
                        
                        <button type="submit" style={buttonStyle}>Jetzt registrieren</button>
                    </form>
                    
                    <p className="auth-switch-link">
                        Bereits ein Konto? <Link to="/login" style={{color: buttonStyle.backgroundColor}}>Hier einloggen</Link>
                    </p>
                </div>
            </div>
        </div>
    );
};

export default RegistrationPage;
