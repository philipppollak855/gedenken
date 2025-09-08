// frontend/src/modules/user/MeinBereich.jsx
// KORRIGIERT: Alle Navigationspunkte, einschließlich der Platzhalter, werden jetzt korrekt angezeigt.
// ERWEITERT: "Meine Beiträge" wurde in die Seitennavigation integriert.

import React, { useState, useEffect, useCallback } from 'react';
import { NavLink, Routes, Route, Navigate } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

// Import der Komponenten für die verschiedenen Bereiche
import MeineVorsorge from './MeineVorsorge';
import MeineGedenkseite from './MeineGedenkseite';
import MeineGedenkseiteErstellen from './MeineGedenkseiteErstellen';
import MeineDaten from './MeineDaten';
import MeineMedien from './MeineMedien';
import VerwalteteSeiten from './VerwalteteSeiten';
import KontoVerwalten from './KontoVerwalten';
import GespeicherteSeiten from './GespeicherteSeiten';
import AngehoerigeVerwalten from './AngehoerigeVerwalten';
import MyContributions from './MyContributions'; // NEU importiert

const MeinBereich = () => {
    const [userData, setUserData] = useState({ own_page: null, managed_pages: [] });
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();

    const fetchUserData = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api('/mein-bereich-data/');
            if (response.ok) {
                setUserData(await response.json());
            }
        } catch (error) {
            console.error("Fehler beim Laden der Benutzerdaten für 'Mein Bereich':", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchUserData();
    }, [fetchUserData]);

    if (isLoading) {
        return <div className="loading-container">Lade Daten für Mein Bereich...</div>;
    }

    return (
        <div className="mein-bereich-container">
            <aside className="bereich-sidebar">
                <nav>
                    <NavLink to="vorsorge">Meine Vorsorge</NavLink>
                    <NavLink to="gedenkseite">Meine Gedenkseite</NavLink>
                    <NavLink to="gespeicherte-seiten">Gespeicherte Seiten</NavLink>
                    <NavLink to="angehoerige">Angehörige verwalten</NavLink>
                    <NavLink to="beitraege">Meine Beiträge</NavLink> {/* NEU */}
                    <NavLink to="daten">Meine Daten</NavLink>
                    <NavLink to="medien">Meine Medien</NavLink>
                    {userData.managed_pages && userData.managed_pages.length > 0 && (
                         <NavLink to="verwaltet">Verwaltete Seiten</NavLink>
                    )}
                    <NavLink to="konto">Konto verwalten</NavLink>
                </nav>
            </aside>
            <main className="bereich-content">
                <Routes>
                    <Route path="vorsorge" element={<MeineVorsorge />} />
                    <Route path="gedenkseite" element={<MeineGedenkseite pageData={userData.own_page} onPageCreated={fetchUserData} />} />
                    <Route path="gedenkseite-erstellen" element={<MeineGedenkseiteErstellen onPageCreated={fetchUserData} />} />
                    <Route path="gespeicherte-seiten" element={<GespeicherteSeiten />} />
                    <Route path="angehoerige" element={<AngehoerigeVerwalten />} />
                    <Route path="beitraege" element={<MyContributions />} /> {/* NEU */}
                    <Route path="daten" element={<MeineDaten />} />
                    <Route path="medien" element={<MeineMedien />} />
                    <Route path="verwaltet" element={<VerwalteteSeiten pages={userData.managed_pages} />} />
                    <Route path="konto" element={<KontoVerwalten />} />
                    <Route path="*" element={<Navigate to="vorsorge" replace />} />
                </Routes>
            </main>
        </div>
    );
};

export default MeinBereich;

