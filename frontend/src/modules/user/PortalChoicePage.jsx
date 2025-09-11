// frontend/src/modules/user/PortalChoicePage.jsx
// ERWEITERT: Die Beschreibungen für "Gedenken" und "Vorsorge" wurden um
// eine detaillierte Auflistung der Kernfunktionen erweitert.

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './PortalChoicePage.css';

const PortalChoicePage = () => {
    const { settings } = useOutletContext();

    const pageStyle = {
        '--title-color': settings.login_text_color || '#3a3a3a',
        '--subtitle-color': settings.login_text_color || '#6b7280',
    };

    const gedenkenStyle = {
        backgroundImage: settings.gedenken_card_image ? `url(${settings.gedenken_card_image.url})` : 'none',
    };

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
                        {/* NEU: Detaillierte Beschreibung */}
                        <ul>
                            <li><strong>Gedenkseiten verwalten:</strong> Erstellen und pflegen Sie eine persönliche Seite für einen geliebten Menschen.</li>
                            <li><strong>Angehörige einladen:</strong> Vergeben Sie Berechtigungen an Familie und Freunde.</li>
                            <li><strong>Meine Beiträge:</strong> Sehen Sie all Ihre Kondolenzen und Gedenkkerzen an einem Ort.</li>
                        </ul>
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
                        {/* NEU: Detaillierte Beschreibung */}
                        <ul>
                            <li><strong>Meine Vorsorge:</strong> Regeln Sie alles Wichtige von Verträgen bis zum digitalen Nachlass.</li>
                            <li><strong>Eigene Gedenkseite:</strong> Gestalten Sie zu Lebzeiten Ihre persönliche Gedenkseite.</li>
                            <li><strong>Wichtige Medien:</strong> Verwalten Sie sicher alle Dokumente und Bilder an einem zentralen Ort.</li>
                        </ul>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PortalChoicePage;

