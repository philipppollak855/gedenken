// frontend/src/modules/user/FamilyLinkStats.jsx
// NEUE KOMPONENTE: FamilyLink-Statistiken für Admins

import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './FamilyLinkStats.css';

const FamilyLinkStats = () => {
    const { apiGet } = useApi();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        loadStats();
    }, []);

    const loadStats = async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGet('/family-links/statistics/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setStats(data);
        } catch (err) {
            setError('Fehler beim Laden der Statistiken');
            console.error('Error loading stats:', err);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return <div className="loading">Lade Statistiken...</div>;
    }

    if (error) {
        return (
            <div className="error-message">
                {error}
                <button onClick={loadStats}>Erneut versuchen</button>
            </div>
        );
    }

    if (!stats) {
        return <div className="no-data">Keine Daten verfügbar</div>;
    }

    return (
        <div className="family-link-stats">
            <div className="stats-header">
                <h2>FamilyLink-Statistiken</h2>
                <p className="stats-description">
                    Übersicht über alle Angehörigen-Verknüpfungen im System
                </p>
            </div>

            <div className="stats-grid">
                <div className="stat-card total">
                    <div className="stat-icon">📊</div>
                    <div className="stat-content">
                        <h3>Gesamt</h3>
                        <div className="stat-value">{stats.total_links}</div>
                        <div className="stat-label">Verknüpfungen</div>
                    </div>
                </div>

                <div className="stat-card active">
                    <div className="stat-icon">✅</div>
                    <div className="stat-content">
                        <h3>Aktiv</h3>
                        <div className="stat-value">{stats.active_links}</div>
                        <div className="stat-label">Aktive Verknüpfungen</div>
                    </div>
                </div>

                <div className="stat-card pending">
                    <div className="stat-icon">⏳</div>
                    <div className="stat-content">
                        <h3>Ausstehend</h3>
                        <div className="stat-value">{stats.pending_links}</div>
                        <div className="stat-label">Warten auf Validierung</div>
                    </div>
                </div>

                <div className="stat-card suspended">
                    <div className="stat-icon">🚫</div>
                    <div className="stat-content">
                        <h3>Gesperrt</h3>
                        <div className="stat-value">{stats.suspended_links}</div>
                        <div className="stat-label">Gesperrte Verknüpfungen</div>
                    </div>
                </div>

                <div className="stat-card revoked">
                    <div className="stat-icon">❌</div>
                    <div className="stat-content">
                        <h3>Widerrufen</h3>
                        <div className="stat-value">{stats.revoked_links}</div>
                        <div className="stat-label">Widerrufene Verknüpfungen</div>
                    </div>
                </div>

                <div className="stat-card validated">
                    <div className="stat-icon">🔒</div>
                    <div className="stat-content">
                        <h3>Validiert</h3>
                        <div className="stat-value">{stats.validated_links}</div>
                        <div className="stat-label">Admin-validiert</div>
                    </div>
                </div>

                <div className="stat-card accesses">
                    <div className="stat-icon">👁️</div>
                    <div className="stat-content">
                        <h3>Zugriffe</h3>
                        <div className="stat-value">{stats.total_accesses}</div>
                        <div className="stat-label">Gesamte Zugriffe</div>
                    </div>
                </div>

                <div className="stat-card recent">
                    <div className="stat-icon">🕒</div>
                    <div className="stat-content">
                        <h3>Letzte Woche</h3>
                        <div className="stat-value">{stats.recent_accesses}</div>
                        <div className="stat-label">Aktive Zugriffe</div>
                    </div>
                </div>
            </div>

            <div className="stats-actions">
                <button onClick={loadStats} className="btn btn-primary">
                    🔄 Aktualisieren
                </button>
            </div>
        </div>
    );
};

export default FamilyLinkStats;
