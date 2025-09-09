// frontend/src/modules/user/MeinBereich.jsx
// Vollständiger Code der Layout-Komponente für "Mein Bereich".

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [data, setData] = useState({ own_page: null, managed_pages: [] });
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        const fetchData = async () => {
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
        };
        fetchData();
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

    if (isLoading) {
        return <div>Lade Mein Bereich...</div>;
    }

    return (
        <div className="mein-bereich-page" style={containerStyle}>
            <div className="mein-bereich-layout">
                <aside className="mein-bereich-sidebar">
                    <nav>
                        <NavLink to="/mein-bereich/dashboard">Dashboard</NavLink>
                        <NavLink to="/mein-bereich/vorsorge">Meine Vorsorge</NavLink>
                        <NavLink to={data.own_page ? `/gedenken/${data.own_page.slug}/verwalten` : "/mein-bereich/gedenkseite-erstellen"}>Meine Gedenkseite</NavLink>
                        <NavLink to="/mein-bereich/daten">Meine Daten</NavLink>
                        <NavLink to="/mein-bereich/medien">Meine Medien</NavLink>
                        <NavLink to="/mein-bereich/beitraege">Meine Beiträge</NavLink>
                        {data.managed_pages && data.managed_pages.length > 0 && (
                            <NavLink to="/mein-bereich/verwaltete-seiten">Verwaltete Seiten</NavLink>
                        )}
                        <NavLink to="/mein-bereich/angehoerige">Angehörige verwalten</NavLink>
                        <NavLink to="/mein-bereich/gespeicherte-seiten">Gespeicherte Seiten</NavLink>
                        <NavLink to="/mein-bereich/konto">Konto verwalten</NavLink>
                    </nav>
                </aside>
                <main className="mein-bereich-content">
                    <Outlet context={{ settings, data }} />
                </main>
            </div>
        </div>
    );
};

export default MeinBereich;

