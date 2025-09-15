// frontend/src/modules/user/UnterlagenDashboard.jsx
import React from 'react';
import { NavLink, Outlet, useOutletContext } from 'react-router-dom';
import './Dashboard.css';

const UnterlagenDashboard = () => {
    const { settings } = useOutletContext();

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
                    <NavLink to="/mein-bereich/unterlagen/uebersicht" end>Übersicht</NavLink>
                </nav>
            </aside>
            <main className="dashboard-content">
                <Outlet context={{ settings }} />
            </main>
        </div>
    );
};

export default UnterlagenDashboard;


