// frontend/src/modules/user/PortalChoicePage.jsx
// REDESIGNED: Die Struktur wurde komplett überarbeitet, um ein modernes Zwei-Säulen-Layout
// für die Auswahl zwischen "Gedenken" und "Vorsorge" zu ermöglichen.

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './PortalChoicePage.css'; // Zugehörige CSS-Datei für das neue Design

const PortalChoicePage = () => {
    // Holt die globalen Design-Einstellungen aus dem übergeordneten Layout
    const { settings } = useOutletContext();

    // Dynamische Style-Variablen für die Seite, basierend auf den Admin-Einstellungen
    const pageStyle = {
        '--title-color': settings.login_text_color || '#3a3a3a',
        '--subtitle-color': settings.login_text_color || '#6b7280',
    };

    // Stile für die "Gedenken"-Säule
    const gedenkenStyle = {
        backgroundImage: settings.gedenken_card_image ? `url(${settings.gedenken_card_image.url})` : 'none',
    };

    // Stile für die "Vorsorge"-Säule
    const vorsorgeStyle = {
        backgroundImage: settings.vorsorge_card_image ? `url(${settings.vorsorge_card_image.url})` : 'none',
    };
    
    return (
        <div className="portal-choice-container" style={pageStyle}>
            <div className="portal-choice-header">
                <h1 className="portal-choice-title">
                    {settings.portal_choice_title || 'Mein Bereich'}
                </h1>
                <p className="portal-choice-subtitle">
                    {settings.portal_choice_subtitle || 'Bitte wählen Sie den Bereich aus, den Sie verwalten möchten.'}
                </p>
            </div>

            <div className="portal-choice-grid">
                {/* Gedenken-Säule */}
                <Link to="/mein-bereich/gedenken" className="portal-column portal-column--gedenken">
                    <div className="portal-column-background" style={gedenkenStyle}></div>
                    <div className="portal-column-overlay"></div>
                    <div className="portal-column-sidetext">
                        <span>Gedenken</span>
                    </div>
                    <div className="portal-column-content">
                        <h2>{settings.gedenken_card_title || 'Gedenken'}</h2>
                        <p>{settings.gedenken_card_subtitle || 'Verwalten Sie Gedenkseiten und teilen Sie Erinnerungen.'}</p>
                    </div>
                </Link>

                {/* Vorsorge-Säule */}
                <Link to="/mein-bereich/vorsorge" className="portal-column portal-column--vorsorge">
                    <div className="portal-column-background" style={vorsorgeStyle}></div>
                    <div className="portal-column-overlay"></div>
                     <div className="portal-column-sidetext">
                        <span>Vorsorge</span>
                    </div>
                    <div className="portal-column-content">
                        <h2>{settings.vorsorge_card_title || 'Vorsorge'}</h2>
                        <p>{settings.vorsorge_card_subtitle || 'Treffen Sie Vorkehrungen und sichern Sie Ihr digitales Erbe.'}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PortalChoicePage;

