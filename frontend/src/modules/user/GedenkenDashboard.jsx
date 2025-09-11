// frontend/src/modules/user/GedenkenDashboard.jsx
// NEUE KOMPONENTE: Dient als Layout für den gesamten "Gedenken"-Bereich.
// Sie enthält eine eigene Sidebar-Navigation und lädt die Daten zu den verwalteten Seiten.

import React, { useState, useEffect } from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './Dashboard.css'; // Geteilte Dashboard-Styles

const GedenkenDashboard = () => {
    const [data, setData] = useState({ own_page: null, managed_pages: [] });
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();
    const { settings } = useOutletContext(); // Globale Settings vom MeinBereich-Layout

    useEffect(() => {
        const fetchData = async () => {
            try {
                const res = await api('/mein-bereich-data/');
                if (res.ok) {
                    setData(await res.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Gedenken-Daten:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [api]);

    // Style-Variablen für die Sidebar aus den globalen Settings
    const sidebarStyle = {
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f8f9fa',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#3a3a3a',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#FFFFFF',
    };

    if (isLoading) {
        return <div className="loading-container">Lade Gedenken-Portal...</div>;
    }

    return (
        <div className="dashboard-layout" style={sidebarStyle}>
            <aside className="dashboard-sidebar">
                <nav>
                    {/* Gedenkseiten verwalten (Link zur eigenen oder verwalteten Seite) */}
                    {data.own_page ? (
                         <NavLink to={`/gedenken/${data.own_page.slug}/verwalten`}>Meine Gedenkseite</NavLink>
                    ) : (
                        // Optional: Link zum Erstellen, falls keine eigene Seite existiert
                         <NavLink to="/mein-bereich/gedenkseite-erstellen">Gedenkseite erstellen</NavLink>
                    )}
                    
                    {data.managed_pages && data.managed_pages.length > 0 && (
                        <NavLink to="/mein-bereich/gedenken/verwaltete-seiten">Verwaltete Seiten</NavLink>
                    )}

                    <NavLink to="/mein-bereich/gedenken/beitraege">Meine Beiträge</NavLink>
                    <NavLink to="/mein-bereich/gedenken/gespeicherte-seiten">Gespeicherte Seiten</NavLink>
                    <NavLink to="/mein-bereich/gedenken/angehoerige-verwalten">Angehörige verwalten</NavLink>
                </nav>
            </aside>
            <main className="dashboard-content">
                {/* Übergibt die Daten an die Kind-Routen (z.B. für die Liste der verwalteten Seiten) */}
                <Outlet context={{ data, settings }} />
            </main>
        </div>
    );
};

export default GedenkenDashboard;

