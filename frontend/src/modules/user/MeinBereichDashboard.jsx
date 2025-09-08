// frontend/src/modules/user/MeinBereichDashboard.jsx
// ERWEITERT: Zeigt jetzt dynamische Texte aus den Admin-Einstellungen an.

import React from 'react';
import { useOutletContext } from 'react-router-dom';

const MeinBereichDashboard = () => {
    // Holt die `settings`, die von der Hauptkomponente `MeinBereich` bereitgestellt werden
    const { settings } = useOutletContext();

    return (
        <div className="dashboard-willkommen">
            <h1>{settings?.mein_bereich_dashboard_title || "Willkommen..."}</h1>
            <p className="willkommen-untertitel">
                {settings?.mein_bereich_dashboard_subtitle || "Hier haben Sie den zentralen Überblick."}
            </p>

            <div className="dashboard-karten-container">
                <div className="dashboard-karte">
                    <h3>Meine Vorsorge</h3>
                    <p>Verwalten Sie hier alle Aspekte Ihrer persönlichen Vorsorge, von Dokumenten bis hin zu Ihren letzten Wünschen.</p>
                </div>
                <div className="dashboard-karte">
                    <h3>Meine Gedenkseite</h3>
                    <p>Bereiten Sie Ihre Gedenkseite vor oder verwalten Sie eine bestehende Seite für einen geliebten Menschen.</p>
                </div>
                <div className="dashboard-karte">
                    <h3>Angehörige & Vertrauenspersonen</h3>
                    <p>Bestimmen Sie, wer im Ernstfall Zugriff auf welche Ihrer Daten erhalten soll und verwalten Sie Ihre Kontakte.</p>
                </div>
                <div className="dashboard-karte">
                    <h3>Meine Daten & Konto</h3>
                    <p>Aktualisieren Sie Ihre persönlichen Informationen und verwalten Sie Ihre Kontoeinstellungen.</p>
                </div>
            </div>
        </div>
    );
};

export default MeinBereichDashboard;

