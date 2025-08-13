// frontend/src/modules/auth/RegistrationPage.jsx
// Fügt Felder für Vor- und Nachname zum Registrierungsformular hinzu.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegistrationPage = () => {
    const [errors, setErrors] = useState({});
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setErrors({});

        const email = e.target.email.value;
        const firstName = e.target.firstName.value; // Neu
        const lastName = e.target.lastName.value; // Neu
        const password = e.target.password.value;
        const password2 = e.target.password2.value;
        const consent = e.target.consent.checked;

        if (password !== password2) {
            setErrors({ password: "Passwörter stimmen nicht überein." });
            return;
        }

        try {
            const response = await fetch('http://localhost:8000/api/register/', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ 
                    email, 
                    first_name: firstName, // Neu
                    last_name: lastName, // Neu
                    password, 
                    password2, 
                    consent_admin_access: consent 
                })
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

    return (
        <div>
            <h2>Neues Konto erstellen</h2>
            <form onSubmit={handleSubmit}>
                <input type="text" name="firstName" placeholder="Vorname" required />
                <input type="text" name="lastName" placeholder="Nachname" required />
                <input type="email" name="email" placeholder="E-Mail-Adresse" required />
                {errors.email && <p style={{ color: 'red' }}>{errors.email}</p>}
                <input type="password" name="password" placeholder="Passwort" required />
                <input type="password" name="password2" placeholder="Passwort bestätigen" required />
                {errors.password && <p style={{ color: 'red' }}>{errors.password}</p>}
                <div>
                    <input type="checkbox" id="consent" name="consent" required />
                    <label htmlFor="consent">
                        Ich stimme der Datenverarbeitung gemäß der Spezifikation zu.
                    </label>
                    {errors.consent_admin_access && <p style={{ color: 'red' }}>{errors.consent_admin_access}</p>}
                </div>
                <br />
                {errors.general && <p style={{ color: 'red' }}>{errors.general}</p>}
                <button type="submit">Registrieren</button>
            </form>
            <p>
                Bereits ein Konto? <Link to="/login">Hier einloggen</Link>
            </p>
        </div>
    );
};

export default RegistrationPage;
