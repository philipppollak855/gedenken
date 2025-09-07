// frontend/src/modules/user/MeineGedenkseite.jsx
// NEU: Platzhalter-Komponente für die Verwaltung der eigenen Gedenkseite.

import React from 'react';
import { Link } from 'react-router-dom';

const MeineGedenkseite = ({ pageData }) => {
    if (!pageData) {
        return (
            <div>
                <h2>Meine Gedenkseite</h2>
                <p className="placeholder-text">Ihnen ist noch keine Gedenkseite zugewiesen.</p>
            </div>
        );
    }

    return (
        <div>
            <h2>Meine Gedenkseite</h2>
            <p>Verwalten Sie hier die Gedenkseite für <strong>{pageData.first_name} {pageData.last_name}</strong>.</p>
            <Link to={`/gedenken/${pageData.slug}/verwalten`} className="bereich-button">
                Seite bearbeiten
            </Link>
        </div>
    );
};

export default MeineGedenkseite;
