// frontend/src/modules/user/UnterlagenDashboard.jsx
// NEUE KOMPONENTE: Dient als Layout für den gesamten "Unterlagen"-Bereich.
// Sie enthält die spezifische Sidebar-Navigation für die Unterlagen-Funktionen.

import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import './Dashboard.css'; // Geteilte Dashboard-Styles

const UnterlagenDashboard = () => {
    // Globale Settings vom MeinBereich-Layout für das Styling
    const { settings } = useOutletContext();

    // Style-Variablen für die Sidebar aus den globalen Settings
    const sidebarStyle = {
        '--sidebar-bg': settings.mein_bereich_sidebar_background_color || '#f8f9fa',
        '--sidebar-text': settings.mein_bereich_sidebar_text_color || '#3a3a3a',
        '--sidebar-active-bg': settings.mein_bereich_sidebar_active_background_color || '#8c8073',
        '--sidebar-active-text': settings.mein_bereich_sidebar_active_text_color || '#FFFFFF',
    };

    return (
        <div className="dashboard-layout" style={sidebarStyle}>
            <aside className="dashboard-sidebar">
                <nav>
                    <NavLink to="/mein-bereich/unterlagen/freigaben" end>Freigaben</NavLink>
                    <NavLink to="/mein-bereich/unterlagen/dokumente">Dokumente</NavLink>
                    <NavLink to="/mein-bereich/unterlagen/trauerdruck">Trauerdruck</NavLink>
                </nav>
            </aside>
            <main className="dashboard-content">
                {/* Die Kind-Routen (z.B. die Freigaben-Übersicht) werden hier gerendert */}
                <Outlet context={{ settings }} />
            </main>
        </div>
    );
};

export default UnterlagenDashboard;
