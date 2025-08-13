// frontend/src/modules/HomePage.jsx
// Leitet eingeloggte Benutzer automatisch zum Dashboard weiter.

import React, { useContext, useEffect } from 'react';
import AuthContext from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';

const HomePage = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();

    // Dieser "Effekt" wird ausgeführt, sobald die Komponente geladen wird.
    // Wenn ein Benutzer eingeloggt ist, wird er sofort zum Dashboard navigiert.
    useEffect(() => {
        if (user) {
            navigate('/dashboard');
        }
    }, [user, navigate]);

    return (
        <div>
            <h1>Willkommen auf der Vorsorge- & Gedenkplattform</h1>
            {user ? (
                <div>
                    <p>Sie sind erfolgreich eingeloggt. Sie werden zum Dashboard weitergeleitet...</p>
                    {/* Dieser Link dient als Fallback, falls die Weiterleitung fehlschlägt. */}
                    <Link to="/dashboard">
                        <button>Falls Sie nicht weitergeleitet werden, klicken Sie hier.</button>
                    </Link>
                </div>
            ) : (
                <p>Bitte loggen Sie sich ein oder registrieren Sie ein neues Konto, um alle Funktionen zu nutzen.</p>
            )}
        </div>
    );
};

export default HomePage;
