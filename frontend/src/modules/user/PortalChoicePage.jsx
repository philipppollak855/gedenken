// frontend/src/modules/user/PortalChoicePage.jsx
// ERWEITERT: Die Komponente ist nun vollständig über den Admin-Bereich personalisierbar.
// Alle Texte, Farben, Schriftgrößen und Hintergründe werden dynamisch aus den API-Settings geladen.

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './PortalChoicePage.css';

const PortalChoicePage = () => {
    const { settings } = useOutletContext();

    // --- Dynamische Stile basierend auf den Admin-Einstellungen ---

    // Allgemeines Seiten-Styling
    const pageStyle = {
        '--title-color': settings.login_text_color || '#3a3a3a',
        '--subtitle-color': settings.login_text_color || '#6b7280',
    };

    // Styling für die Gedenken-Säule
    const gedenkenColumnStyle = {
        backgroundColor: settings.gedenken_card_background_color || '#8c8073',
    };
    const gedenkenBackgroundStyle = {
        backgroundImage: settings.gedenken_card_image ? `url(${settings.gedenken_card_image.url})` : 'none',
    };
    const gedenkenSidetextStyle = {
        color: settings.gedenken_card_sidetext_color || 'rgba(255, 255, 255, 0.4)',
        fontSize: settings.gedenken_card_sidetext_size || '3.2rem',
    };
    const gedenkenContentStyle = {
        backgroundColor: settings.gedenken_card_content_background || 'rgba(0, 0, 0, 0.5)',
    };
    const gedenkenTitleStyle = {
        color: settings.gedenken_card_title_color || '#FFFFFF',
        fontSize: settings.gedenken_card_title_size || '2.5rem',
    };
    const gedenkenDetailsStyle = {
        color: settings.gedenken_card_details_text_color || '#FFFFFF',
        fontSize: settings.gedenken_card_details_text_size || '0.95rem',
    };

    // Styling für die Vorsorge-Säule
    const vorsorgeColumnStyle = {
        backgroundColor: settings.vorsorge_card_background_color || '#6d6d6d',
    };
    const vorsorgeBackgroundStyle = {
        backgroundImage: settings.vorsorge_card_image ? `url(${settings.vorsorge_card_image.url})` : 'none',
    };
    const vorsorgeSidetextStyle = {
        color: settings.vorsorge_card_sidetext_color || 'rgba(255, 255, 255, 0.4)',
        fontSize: settings.vorsorge_card_sidetext_size || '3.2rem',
    };
    const vorsorgeContentStyle = {
        backgroundColor: settings.vorsorge_card_content_background || 'rgba(0, 0, 0, 0.5)',
    };
    const vorsorgeTitleStyle = {
        color: settings.vorsorge_card_title_color || '#FFFFFF',
        fontSize: settings.vorsorge_card_title_size || '2.5rem',
    };
    const vorsorgeDetailsStyle = {
        color: settings.vorsorge_card_details_text_color || '#FFFFFF',
        fontSize: settings.vorsorge_card_details_text_size || '0.95rem',
    };
    
    // Standard-HTML für die Beschreibung, falls im Admin nichts eingetragen ist
    const defaultGedenkenDetails = "<ul><li><strong>Gedenkseiten verwalten:</strong> Erstellen und pflegen Sie eine persönliche Seite.</li><li><strong>Angehörige einladen:</strong> Vergeben Sie Berechtigungen.</li><li><strong>Meine Beiträge:</strong> Sehen Sie all Ihre Kondolenzen und Gedenkkerzen.</li></ul>";
    const defaultVorsorgeDetails = "<ul><li><strong>Meine Vorsorge:</strong> Regeln Sie alles Wichtige von Verträgen bis zum digitalen Nachlass.</li><li><strong>Eigene Gedenkseite:</strong> Gestalten Sie zu Lebzeiten Ihre persönliche Gedenkseite.</li><li><strong>Wichtige Medien:</strong> Verwalten Sie sicher alle Dokumente und Bilder.</li></ul>";

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
                <Link to="/mein-bereich/gedenken" className="portal-column portal-column--gedenken" style={gedenkenColumnStyle}>
                    <div className="portal-column-background" style={gedenkenBackgroundStyle}></div>
                    <div className="portal-column-overlay"></div>
                    <div className="portal-column-sidetext" style={gedenkenSidetextStyle}>
                        <span>{settings.gedenken_card_sidetext || 'Gedenken'}</span>
                    </div>
                    <div className="portal-column-content" style={gedenkenContentStyle}>
                        <h2 style={gedenkenTitleStyle}>{settings.gedenken_card_title || 'Gedenken'}</h2>
                        <div 
                            style={gedenkenDetailsStyle}
                            dangerouslySetInnerHTML={{ __html: settings.gedenken_card_details_text || defaultGedenkenDetails }}
                        />
                    </div>
                </Link>

                {/* Vorsorge-Säule */}
                <Link to="/mein-bereich/vorsorge" className="portal-column portal-column--vorsorge" style={vorsorgeColumnStyle}>
                    <div className="portal-column-background" style={vorsorgeBackgroundStyle}></div>
                    <div className="portal-column-overlay"></div>
                     <div className="portal-column-sidetext" style={vorsorgeSidetextStyle}>
                        <span>{settings.vorsorge_card_sidetext || 'Vorsorge'}</span>
                    </div>
                    <div className="portal-column-content" style={vorsorgeContentStyle}>
                        <h2 style={vorsorgeTitleStyle}>{settings.vorsorge_card_title || 'Vorsorge'}</h2>
                        <div
                            style={vorsorgeDetailsStyle}
                            dangerouslySetInnerHTML={{ __html: settings.vorsorge_card_details_text || defaultVorsorgeDetails }}
                        />
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PortalChoicePage;

