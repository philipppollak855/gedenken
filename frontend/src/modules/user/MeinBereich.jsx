// frontend/src/modules/user/MeinBereich.jsx
// HINWEIS: Diese Komponente wurde grundlegend umgebaut. Sie dient nun als allgemeines Layout
// für den "Mein Bereich", enthält die Logik für den Hintergrund und einen neuen Header zum
// Wechseln zwischen den Portalen. Die alte Sidebar wurde entfernt.

import React, { useState, useEffect } from 'react';
import { Outlet, useLocation, NavLink } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();
    const location = useLocation();

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

    const containerStyle = {
        '--bg-color': settings.mein_bereich_background_color || '#f4f1ee',
        '--bg-image': settings.mein_bereich_background_image ? `url(${settings.mein_bereich_background_image.url})` : 'none',
        '--container-bg': settings.mein_bereich_container_background_color || '#FFFFFF',
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f8f9fa',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#3a3a3a',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#FFFFFF',
    };
    
    // Der Portal-Wechsler wird nur angezeigt, wenn man sich in einem der Dashboards befindet
    const showPortalSwitcher = location.pathname.startsWith('/mein-bereich/gedenken') || location.pathname.startsWith('/mein-bereich/vorsorge');

    if (isLoading) {
        return <div className="loading-container">Lade Mein Bereich...</div>;
    }

    return (
        <div className="mein-bereich-page" style={containerStyle}>
            <div className="mein-bereich-container">
                {showPortalSwitcher && (
                    <header className="portal-switcher-header">
                        <nav className="portal-switcher-nav">
                            <NavLink to="/mein-bereich/gedenken">Gedenken</NavLink>
                            <NavLink to="/mein-bereich/vorsorge">Vorsorge</NavLink>
                        </nav>
                    </header>
                )}
                {/* Der Outlet rendert hier entweder die PortalChoicePage oder die Dashboards */}
                <Outlet context={{ settings }} />
            </div>
        </div>
    );
};

export default MeinBereich;

