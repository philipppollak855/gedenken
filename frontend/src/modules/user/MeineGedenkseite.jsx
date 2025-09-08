// frontend/src/modules/user/MeineGedenkseite.jsx
// AKTUALISIERT: Zeigt einen "Gedenkseite anlegen"-Button an, wenn keine Seite existiert.

import React from 'react';
import { Link } from 'react-router-dom';

const MeineGedenkseite = ({ pageData }) => {
    if (!pageData) {
        return (
            <div>
                <h2>Meine Gedenkseite</h2>
                <p className="placeholder-text">
                    Sie haben noch keine persönliche Gedenkseite vorbereitet. 
                    Legen Sie jetzt den Grundstein, um Ihre Wünsche und Erinnerungen für die Zukunft festzuhalten.
                </p>
                <Link to="/mein-bereich/gedenkseite-erstellen" className="bereich-button" style={{marginTop: '1rem'}}>
                    Gedenkseite jetzt anlegen
                </Link>
            </div>
        );
    }

    return (
        <div>
            <h2>Meine Gedenkseite</h2>
            <p>Verwalten Sie hier die Gedenkseite für <strong>{pageData.first_name} {pageData.last_name}</strong>.</p>
            <p className="placeholder-text">Status: <strong>{pageData.status === 'active' ? 'Aktiv' : 'Inaktiv (Vorbereitung)'}</strong></p>
            <Link to={`/gedenken/${pageData.slug}/verwalten`} className="bereich-button" style={{marginTop: '1rem'}}>
                Seite bearbeiten & verwalten
            </Link>
        </div>
    );
};

export default MeineGedenkseite;

