// frontend/src/modules/user/MeinBereich.jsx
// KORRIGIERT: Das Layout wendet das allgemeine Hintergrundbild nur noch auf den
// Dashboard-Seiten an und nicht mehr auf der Auswahlseite, um den Bild-Konflikt zu lösen.

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useLocation, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const location = useLocation();
    const { api } = useApi();

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const settingsRes = await api('/settings/');
                if (settingsRes.ok) {
                    setSettings(await settingsRes.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Einstellungen für 'Mein Bereich':", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchSettings();
    }, [api]);

    // Prüfen, ob wir uns auf der Auswahlseite befinden
    const isChoicePage = location.pathname === '/mein-bereich/auswahl';

    // KORREKTUR: Das allgemeine Hintergrundbild wird nur angewendet, wenn es NICHT die Auswahlseite ist.
    const pageStyle = {
        '--bg-color': settings.mein_bereich_background_color || '#f4f1ee',
        '--bg-image': !isChoicePage && settings.mein_bereich_background_image ? `url(${settings.mein_bereich_background_image.url})` : 'none',
        '--container-bg': settings.mein_bereich_container_background_color || '#FFFFFF',
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f8f9fa',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#3a3a3a',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#FFFFFF',
    };
    
    const isDashboard = location.pathname.startsWith('/mein-bereich/gedenken') || location.pathname.startsWith('/mein-bereich/vorsorge');

    if (isLoading) {
        return <div style={{paddingTop: '80px'}}>Lade Mein Bereich...</div>;
    }

    return (
        <div className={`mein-bereich-page ${isChoicePage ? 'is-choice-page' : ''}`} style={pageStyle}>
            {isDashboard && (
                <div className="portal-switcher-header">
                    <nav className="portal-switcher-nav">
                        <NavLink to="/mein-bereich/gedenken">Gedenken</NavLink>
                        <span>|</span>
                        <NavLink to="/mein-bereich/vorsorge">Vorsorge</NavLink>
                        <span>|</span>
                        <Link to="/mein-bereich/auswahl">Zurück zur Auswahl</Link>
                    </nav>
                </div>
            )}

            {/* Der Container mit maximaler Breite wird nur noch fÃ¼r die Dashboards verwendet */}
            {isChoicePage ? (
                <Outlet context={{ settings }} />
            ) : (
                <div className="mein-bereich-container">
                    <Outlet context={{ settings }} />
                </div>
            )}
        </div>
    );
};

export default MeinBereich;

