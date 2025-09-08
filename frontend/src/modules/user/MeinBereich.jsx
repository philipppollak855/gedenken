// frontend/src/modules/user/MeinBereich.jsx
// KORRIGIERT: Unbenutzter 'useLocation'-Import entfernt, um den Netlify-Build-Fehler zu beheben.

import React, { useState, useEffect, useCallback } from 'react';
import { Outlet, NavLink } from 'react-router-dom'; // useLocation entfernt
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [data, setData] = useState({ own_page: null, managed_pages: [] });
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();

    const fetchData = useCallback(async () => {
        try {
            const [dataRes, settingsRes] = await Promise.all([
                api('/mein-bereich-data/'),
                api('/settings/')
            ]);

            if (dataRes.ok) setData(await dataRes.json());
            if (settingsRes.ok) setSettings(await settingsRes.json());
        } catch (error) {
            console.error("Fehler beim Laden der Daten für 'Mein Bereich':", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (isLoading) {
        return <div>Lade Mein Bereich...</div>;
    }

    const containerStyle = {
        '--container-bg': settings.mein_bereich_container_background_color || '#ffffff',
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f8f9fa',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#333333',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#ffffff',
        backgroundImage: settings.mein_bereich_background_image ? `url(${settings.mein_bereich_background_image.url})` : 'none',
        backgroundColor: settings.mein_bereich_background_color || '#f4f1ee'
    };

    const activeLinkStyle = {
        backgroundColor: 'var(--sidebar-active-bg)',
        color: 'var(--sidebar-active-text)'
    };

    return (
        <div className="mein-bereich-page" style={containerStyle}>
            <div className="mein-bereich-layout">
                <aside className="mein-bereich-sidebar">
                    <nav>
                        <NavLink to="/mein-bereich/dashboard" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Dashboard</NavLink>
                        <NavLink to="/mein-bereich/vorsorge" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Meine Vorsorge</NavLink>
                        <NavLink to={data.own_page ? `/gedenken/${data.own_page.slug}/verwalten` : "/mein-bereich/gedenkseite-erstellen"} style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Meine Gedenkseite</NavLink>
                        <NavLink to="/mein-bereich/meine-daten" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Meine Daten</NavLink>
                        <NavLink to="/mein-bereich/meine-medien" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Meine Medien</NavLink>
                        <NavLink to="/mein-bereich/meine-beitraege" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Meine Beiträge</NavLink>
                        <NavLink to="/mein-bereich/verwaltete-seiten" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Verwaltete Seiten</NavLink>
                        <NavLink to="/mein-bereich/angehoerige-verwalten" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Angehörige verwalten</NavLink>
                        <NavLink to="/mein-bereich/gespeicherte-seiten" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Gespeicherte Seiten</NavLink>
                        <NavLink to="/mein-bereich/konto-verwalten" style={({ isActive }) => isActive ? activeLinkStyle : undefined}>Konto verwalten</NavLink>
                    </nav>
                </aside>
                <main className="mein-bereich-content">
                    <Outlet context={{ settings }} />
                </main>
            </div>
        </div>
    );
};

export default MeinBereich;

