// frontend/src/modules/user/MeinBereich.jsx
// Vollständiger Code der "Mein Bereich"-Seite.

import React, { useState, useEffect, useCallback } from 'react';
import { Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';
import './MeinBereich.css';

const MeinBereich = () => {
    const [managedPages, setManagedPages] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();

    const fetchManagedPages = useCallback(async () => {
        try {
            const response = await api('/manage/memorial-pages/');
            if (response.ok) {
                setManagedPages(await response.json());
            }
        } catch (error) {
            console.error("Fehler beim Laden der verwalteten Seiten:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchManagedPages();
    }, [fetchManagedPages]);

    return (
        <div className="mein-bereich-container">
            <h1>Mein Bereich</h1>
            
            <div className="bereich-sektion">
                <h2>Meine Gedenkseiten verwalten</h2>
                {isLoading ? (
                    <p>Lade Seiten...</p>
                ) : managedPages.length > 0 ? (
                    <ul className="seiten-liste">
                        {managedPages.map(page => (
                            <li key={page.slug}>
                                <Link to={`/gedenken/${page.slug}/verwalten`}>
                                    Gedenkseite von {page.first_name} {page.last_name}
                                </Link>
                            </li>
                        ))}
                    </ul>
                ) : (
                    <p>Sie verwalten aktuell keine Gedenkseiten.</p>
                )}
            </div>

            <div className="bereich-sektion">
                <h2>Meine Vorsorge</h2>
                <p>Hier können Sie Ihre persönlichen Vorsorgedaten einsehen und bearbeiten.</p>
                <Link to="/dashboard" className="bereich-button">Zur Vorsorge</Link>
            </div>
        </div>
    );
};

export default MeinBereich;
