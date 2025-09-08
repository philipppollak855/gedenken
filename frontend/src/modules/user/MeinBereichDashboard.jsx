// frontend/src/modules/user/MeinBereichDashboard.jsx
// NEUE DATEI: Eine Willkommens- und Übersichtsseite für "Mein Bereich".

import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './MeinBereich.css'; // Nutzt das gleiche Stylesheet

const MeinBereichDashboard = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="dashboard-willkommen">
            <h1>Willkommen, {user?.first_name || 'im Vorsorgeportal'}!</h1>
            <p className="willkommen-untertitel">
                Dies ist Ihr persönlicher Bereich. Hier können Sie alle Aspekte Ihrer digitalen Vorsorge und Ihrer Gedenkseiten einfach und sicher verwalten.
            </p>

            <div className="dashboard-karten-container">
                <Link to="/mein-bereich/vorsorge" className="dashboard-karte">
                    <h3>Meine Vorsorge</h3>
                    <p>Hinterlegen Sie hier wichtige Dokumente, Verträge, digitale Konten und Ihre letzten Wünsche sicher und zentral.</p>
                </Link>
                <Link to="/mein-bereich/gedenkseite" className="dashboard-karte">
                    <h3>Meine Gedenkseite</h3>
                    <p>Gestalten Sie Ihre eigene Gedenkseite im Voraus oder verwalten Sie die Seite eines Angehörigen.</p>
                </Link>
                 <Link to="/mein-bereich/beitraege" className="dashboard-karte">
                    <h3>Meine Beiträge</h3>
                    <p>Sehen und bearbeiten Sie alle Kondolenzen und Gedenkkerzen, die Sie auf anderen Seiten hinterlassen haben.</p>
                </Link>
                <Link to="/mein-bereich/konto" className="dashboard-karte">
                    <h3>Konto verwalten</h3>
                    <p>Ändern Sie hier Ihre persönlichen Daten, Ihre E-Mail-Adresse oder Ihr Passwort.</p>
                </Link>
            </div>
        </div>
    );
};

export default MeinBereichDashboard;
