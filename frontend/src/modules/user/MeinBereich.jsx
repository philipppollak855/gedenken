import React, { useState, useEffect } from 'react';
import { NavLink, Outlet } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

// SVG-Icon-Komponenten
const DashboardIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/></svg>;
const VorsorgeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 4h2a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h2"/><rect x="8" y="2" width="8" height="4" rx="1" ry="1"/></svg>;
const GedenkseiteIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z"/><path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"/></svg>;
const DatenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm0 4c1.93 0 3.5 1.57 3.5 3.5S13.93 13 12 13s-3.5-1.57-3.5-3.5S10.07 6 12 6zm0 14c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>;
const MedienIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg>;
const VerwalteteSeitenIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/></svg>;
const BeitraegeIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/><path d="M10 9H8"/></svg>;
const KontoIcon = () => <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>;


const MeinBereich = () => {
    const [data, setData] = useState({ own_page: null, managed_pages: [] });
    const [settings, setSettings] = useState({});
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
            }
        };
        fetchData();
    }, [api]);
    
    const pageStyle = {
        '--mein-bereich-bg': settings.mein_bereich_background_color || '#f4f1ee',
        '--mein-bereich-bg-image': settings.mein_bereich_background_image ? `url(${settings.mein_bereich_background_image.url})` : 'none',
        '--container-bg': settings.mein_bereich_container_background_color || 'rgba(255, 255, 255, 0.8)',
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#3a3a3a',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#e1e1e1',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#ffffff',
    };

    return (
        <div className="mein-bereich-page" style={pageStyle}>
            <div className="mein-bereich-layout">
                <aside className="mein-bereich-sidebar">
                    <nav>
                        <NavLink to="/mein-bereich/dashboard"><DashboardIcon /> <span>Übersicht</span></NavLink>
                        <NavLink to="/mein-bereich/vorsorge"><VorsorgeIcon /> <span>Meine Vorsorge</span></NavLink>
                        <NavLink to="/mein-bereich/gedenkseite"><GedenkseiteIcon /> <span>Meine Gedenkseite</span></NavLink>
                        <NavLink to="/mein-bereich/daten"><DatenIcon /> <span>Meine Daten</span></NavLink>
                        <NavLink to="/mein-bereich/medien"><MedienIcon /> <span>Meine Medien</span></NavLink>
                        {data.managed_pages?.length > 0 && (
                            <NavLink to="/mein-bereich/verwaltete-seiten"><VerwalteteSeitenIcon /> <span>Verwaltete Seiten</span></NavLink>
                        )}
                        <NavLink to="/mein-bereich/beitraege"><BeitraegeIcon /> <span>Meine Beiträge</span></NavLink>
                        <NavLink to="/mein-bereich/gespeicherte-seiten"><DashboardIcon /> <span>Gespeicherte Seiten</span></NavLink>
                        <NavLink to="/mein-bereich/angehoerige-verwalten"><VerwalteteSeitenIcon /> <span>Angehörige verwalten</span></NavLink>
                        <NavLink to="/mein-bereich/konto-verwalten"><KontoIcon /> <span>Konto verwalten</span></NavLink>
                    </nav>
                </aside>
                <main className="mein-bereich-content">
                    <Outlet context={{ data, settings }} />
                </main>
            </div>
        </div>
    );
};

export default MeinBereich;

