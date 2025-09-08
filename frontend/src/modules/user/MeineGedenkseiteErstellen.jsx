// frontend/src/modules/user/MeineGedenkseiteErstellen.jsx
// NEU: Diese Komponente ermöglicht es dem Benutzer, seine eigene Gedenkseite anzulegen.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';

const MeineGedenkseiteErstellen = ({ onPageCreated }) => {
    const [isLoading, setIsLoading] = useState(false);
    const api = useApi();
    const navigate = useNavigate();

    const handleCreatePage = async () => {
        setIsLoading(true);
        try {
            const response = await api('/create-memorial-page/', { method: 'POST' });
            if (response.ok) {
                const data = await response.json();
                alert("Ihre Gedenkseite wurde erfolgreich als Entwurf angelegt. Sie können sie nun bearbeiten.");
                onPageCreated(); // Lädt die Daten in "Mein Bereich" neu
                navigate(`/gedenken/${data.slug}/verwalten`); // Leitet zur neuen Verwaltungsseite weiter
            } else {
                const errorData = await response.json();
                alert(`Fehler: ${errorData.error || "Die Seite konnte nicht erstellt werden."}`);
            }
        } catch (error) {
            console.error("Fehler beim Erstellen der Gedenkseite:", error);
            alert("Ein Netzwerkfehler ist aufgetreten.");
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h2>Gedenkseite vorbereiten</h2>
            <p>
                Sie sind dabei, eine persönliche Gedenkseite für sich selbst anzulegen. 
                Diese Seite wird als **inaktiver Entwurf** erstellt und ist **nicht öffentlich sichtbar**.
            </p>
            <p>
                Sie können alle Inhalte in Ruhe vorbereiten. Die Seite wird erst dann veröffentlicht, 
                wenn ein von Ihnen bestimmter Angehöriger dies nach Ihrem Ableben veranlasst und ein Administrator die Seite freischaltet.
            </p>
            <button 
                onClick={handleCreatePage} 
                disabled={isLoading} 
                className="bereich-button" 
                style={{marginTop: '1rem'}}
            >
                {isLoading ? 'Wird angelegt...' : 'Ja, Gedenkseite jetzt anlegen'}
            </button>
        </div>
    );
};

export default MeineGedenkseiteErstellen;
