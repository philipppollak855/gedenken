// frontend/src/modules/user/MeinBereich.jsx
// ERWEITERT: Lädt und wendet die Design-Einstellungen dynamisch an.

import React, { useState, useEffect, useContext } from 'react';
import { NavLink, Outlet, useLocation } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [managementData, setManagementData] = useState({ own_page: null, managed_pages: [] });
    const [settings, setSettings] = useState({});
    const api = useApi();
    const { user } = useContext(AuthContext);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [managementRes, settingsRes] = await Promise.all([
                    api('/mein-bereich-data/'),
                    api('/settings/')
                ]);

                if (managementRes.ok) {
                    setManagementData(await managementRes.json());
                }
                if (settingsRes.ok) {
                    setSettings(await settingsRes.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Bereichsdaten:", error);
            }
        };
        fetchData();
    }, [api]);

    // Dynamische Stile für den Container basierend auf den Admin-Einstellungen
    const areaStyle = {
        '--container-bg': settings.mein_bereich_container_background_color || '#FFFFFF',
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f9f9f9',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#6d6d6d',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#FFFFFF',
    };

    const pageWrapperStyle = {
        backgroundColor: settings.mein_bereich_background_color || '#f4f1ee',
        backgroundImage: settings.mein_bereich_background_image ? `url(${settings.mein_bereich_background_image.url})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
    };
    
    // Logik zur bedingten Anzeige der Navigationslinks
    const showOwnPageLink = user.role === 'vorsorgender' || managementData.own_page;
    const showManagedPagesLink = managementData.managed_pages && managementData.managed_pages.length > 0;

    return (
        <div className="mein-bereich-page-wrapper" style={pageWrapperStyle}>
            <div className="mein-bereich-container" style={areaStyle}>
                <aside className="bereich-sidebar">
                    <nav>
                        <NavLink to="/mein-bereich/dashboard">Dashboard</NavLink>
                        <NavLink to="/mein-bereich/vorsorge">Meine Vorsorge</NavLink>
                        {showOwnPageLink && <NavLink to="/mein-bereich/gedenkseite">Meine Gedenkseite</NavLink>}
                        <NavLink to="/mein-bereich/beitraege">Meine Beiträge</NavLink>
                        <NavLink to="/mein-bereich/gespeicherte-seiten">Gespeicherte Seiten</NavLink>
                        {showManagedPagesLink && <NavLink to="/mein-bereich/verwaltete-seiten">Verwaltete Seiten</NavLink>}
                        <NavLink to="/mein-bereich/angehoerige">Angehörige verwalten</NavLink>
                        <NavLink to="/mein-bereich/meine-daten">Meine Daten</NavLink>
                        <NavLink to="/mein-bereich/konto">Konto verwalten</NavLink>
                    </nav>
                </aside>
                <main className="bereich-content">
                    <Outlet context={{ managementData, settings }} />
                </main>
            </div>
        </div>
    );
};

export default MeinBereich;

