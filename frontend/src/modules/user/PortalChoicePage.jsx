// frontend/src/modules/user/PortalChoicePage.jsx
// KORRIGIERT: Die HTML-Struktur wurde vereinfacht und die Hintergrund-Logik
// überarbeitet, um die Anzeige der Bilder robust zu gewährleisten.

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './PortalChoicePage.css';

const PortalChoicePage = () => {
    const { settings } = useOutletContext();

    // Allgemeines Seiten-Styling, inklusive des spezifischen Hintergrunds
    const pageStyle = {
        backgroundColor: settings.portal_choice_background_color || '#f4f1ee',
        backgroundImage: settings.portal_choice_background_image ? `url(${settings.portal_choice_background_image.url})` : 'none',
        '--title-color': settings.portal_choice_title_color || '#3a3a3a',
        '--subtitle-color': settings.portal_choice_subtitle_color || '#6b7280',
    };

    // Robuste Hintergrund-Logik für die Gedenken-Säule
    const gedenkenColumnStyle = {
        '--card-image': (settings.gedenken_card_image && settings.gedenken_card_image.url) ? `url(${settings.gedenken_card_image.url})` : 'none',
        '--card-bg-color': settings.gedenken_card_background_color || '#8c8073',
        '--sidetext-color': settings.gedenken_card_sidetext_color || '#FFFFFF',
        '--sidetext-size': settings.gedenken_card_sidetext_size || '3.2rem',
        '--content-bg': settings.gedenken_card_content_background || '#3a3a3a',
        '--title-card-color': settings.gedenken_card_title_color || '#FFFFFF',
        '--title-card-size': settings.gedenken_card_title_size || '2.5rem',
        '--details-text-color': settings.gedenken_card_details_text_color || '#FFFFFF',
        '--details-text-size': settings.gedenken_card_details_text_size || '0.95rem',
    };

    // Robuste Hintergrund-Logik für die Vorsorge-Säule
    const vorsorgeColumnStyle = {
        '--card-image': (settings.vorsorge_card_image && settings.vorsorge_card_image.url) ? `url(${settings.vorsorge_card_image.url})` : 'none',
        '--card-bg-color': settings.vorsorge_card_background_color || '#6d6d6d',
        '--sidetext-color': settings.vorsorge_card_sidetext_color || '#FFFFFF',
        '--sidetext-size': settings.vorsorge_card_sidetext_size || '3.2rem',
        '--content-bg': settings.vorsorge_card_content_background || '#3a3a3a',
        '--title-card-color': settings.vorsorge_card_title_color || '#FFFFFF',
        '--title-card-size': settings.vorsorge_card_title_size || '2.5rem',
        '--details-text-color': settings.vorsorge_card_details_text_color || '#FFFFFF',
        '--details-text-size': settings.vorsorge_card_details_text_size || '0.95rem',
    };
    
    const defaultGedenkenDetails = "<ul><li><strong>Gedenkseiten verwalten:</strong> Erstellen und pflegen Sie eine persönliche Seite.</li><li><strong>Angehörige einladen:</strong> Vergeben Sie Berechtigungen.</li><li><strong>Meine Beiträge:</strong> Sehen Sie all Ihre Kondolenzen und Gedenkkerzen.</li></ul>";
    const defaultVorsorgeDetails = "<ul><li><strong>Meine Vorsorge:</strong> Regeln Sie alles Wichtige von Verträgen bis zum digitalen Nachlass.</li><li><strong>Eigene Gedenkseite:</strong> Gestalten Sie zu Lebzeiten Ihre persönliche Gedenkseite.</li><li><strong>Wichtige Medien:</strong> Verwalten Sie sicher alle Dokumente und Bilder.</li></ul>";

    return (
        <div className="portal-choice-container" style={pageStyle}>
            <div className="portal-choice-inner">
                <div className="portal-choice-header">
                    <h1 className="portal-choice-title">
                        {settings.portal_choice_title || 'Mein Bereich'}
                    </h1>
                    <p className="portal-choice-subtitle">
                        {settings.portal_choice_subtitle || 'Bitte wählen Sie den Bereich aus, den Sie verwalten möchten.'}
                    </p>
                </div>

                <div className="portal-choice-grid">
                    <Link to="/mein-bereich/gedenken" className="portal-column portal-column--gedenken" style={gedenkenColumnStyle}>
                        <div className="portal-column-sidetext">
                            <span>{settings.gedenken_card_sidetext || 'Gedenken'}</span>
                        </div>
                        <div className="portal-column-content">
                            <h2>{settings.gedenken_card_title || 'Gedenken'}</h2>
                            <div 
                                className="portal-column-details"
                                dangerouslySetInnerHTML={{ __html: settings.gedenken_card_details_text || defaultGedenkenDetails }}
                            />
                        </div>
                    </Link>

                    <Link to="/mein-bereich/vorsorge" className="portal-column portal-column--vorsorge" style={vorsorgeColumnStyle}>
                        <div className="portal-column-sidetext">
                            <span>{settings.vorsorge_card_sidetext || 'Vorsorge'}</span>
                        </div>
                        <div className="portal-column-content">
                            <h2>{settings.vorsorge_card_title || 'Vorsorge'}</h2>
                            <div
                                className="portal-column-details"
                                dangerouslySetInnerHTML={{ __html: settings.vorsorge_card_details_text || defaultVorsorgeDetails }}
                            />
                        </div>
                    </Link>
                </div>
            </div>
        </div>
    );
};

export default PortalChoicePage;

