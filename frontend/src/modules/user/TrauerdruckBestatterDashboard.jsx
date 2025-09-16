import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import './TrauerdruckBestatterDashboard.css';

const TrauerdruckBestatterDashboard = () => {
    const { get } = useApi();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        revision_requested: 0,
        rejected: 0,
        completed: 0
    });
    const [recentEntwuerfe, setRecentEntwuerfe] = useState([]);
    const [urgentEntwuerfe, setUrgentEntwuerfe] = useState([]);

    useEffect(() => {
        loadDashboardData();
    }, []);

    const loadDashboardData = async () => {
        try {
            setLoading(true);
            
            // Load stats
            const statsResponse = await get('/api/trauerdruck-entwuerfe/stats/');
            setStats(statsResponse.data);
            
            // Load recent entwuerfe
            const recentResponse = await get('/api/trauerdruck-entwuerfe/?limit=5&ordering=-created_at');
            setRecentEntwuerfe(recentResponse.data);
            
            // Load urgent entwuerfe
            const urgentResponse = await get('/api/trauerdruck-entwuerfe/?priority=urgent&status=pending_approval');
            setUrgentEntwuerfe(urgentResponse.data);
            
        } catch (err) {
            console.error('Error loading dashboard data:', err);
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusConfig = {
            'pending_approval': { text: 'Wartet auf Freigabe', class: 'status-pending' },
            'approved': { text: 'Freigegeben', class: 'status-approved' },
            'revision_requested': { text: 'Revision angefordert', class: 'status-revision' },
            'rejected': { text: 'Abgelehnt', class: 'status-rejected' },
            'completed': { text: 'Abgeschlossen', class: 'status-completed' },
            'draft': { text: 'Entwurf', class: 'status-draft' }
        };
        
        const config = statusConfig[status] || { text: status, class: 'status-default' };
        return <span className={`status-badge ${config.class}`}>{config.text}</span>;
    };

    const getPriorityBadge = (priority) => {
        const priorityConfig = {
            'urgent': { text: 'Dringend', class: 'priority-urgent' },
            'high': { text: 'Hoch', class: 'priority-high' },
            'normal': { text: 'Normal', class: 'priority-normal' },
            'low': { text: 'Niedrig', class: 'priority-low' }
        };
        
        const config = priorityConfig[priority] || { text: priority, class: 'priority-normal' };
        return <span className={`priority-badge ${config.class}`}>{config.text}</span>;
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="bestatter-dashboard">
                <div className="loading">Lade Dashboard...</div>
            </div>
        );
    }

    return (
        <div className="bestatter-dashboard">
            <div className="dashboard-header">
                <h1>Trauerdruck-Verwaltung</h1>
                <p>Verwalten Sie alle Trauerdruck-Entwürfe und deren Freigaben.</p>
            </div>

            {/* Quick Actions */}
            <div className="quick-actions">
                <Link to="/mein-bereich/trauerdruck/neuen-entwurf" className="action-card primary">
                    <div className="action-icon">➕</div>
                    <div className="action-content">
                        <h3>Neuen Entwurf erstellen</h3>
                        <p>Erstellen Sie einen neuen Trauerdruck-Entwurf und senden Sie ihn zur Freigabe</p>
                    </div>
                </Link>
                
                <Link to="/mein-bereich/unterlagen/trauerdruck" className="action-card">
                    <div className="action-icon">📊</div>
                    <div className="action-content">
                        <h3>Freigaben verwalten</h3>
                        <p>Übersicht aller Entwürfe und deren Freigabestatus</p>
                    </div>
                </Link>
                
                <Link to="/mein-bereich/trauerdruck/templates" className="action-card">
                    <div className="action-icon">📋</div>
                    <div className="action-content">
                        <h3>Templates verwalten</h3>
                        <p>Vorlagen für häufige Entwürfe (optional)</p>
                    </div>
                </Link>
            </div>

            {/* Stats Cards */}
            <div className="stats-grid">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Gesamt</div>
                </div>
                <div className="stat-card pending">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Ausstehend</div>
                </div>
                <div className="stat-card approved">
                    <div className="stat-number">{stats.approved}</div>
                    <div className="stat-label">Freigegeben</div>
                </div>
                <div className="stat-card revision">
                    <div className="stat-number">{stats.revision_requested}</div>
                    <div className="stat-label">Revision</div>
                </div>
                <div className="stat-card completed">
                    <div className="stat-number">{stats.completed}</div>
                    <div className="stat-label">Abgeschlossen</div>
                </div>
            </div>

            {/* Urgent Entwuerfe */}
            {urgentEntwuerfe.length > 0 && (
                <div className="urgent-section">
                    <h2>🚨 Dringende Entwürfe</h2>
                    <div className="entwuerfe-list">
                        {urgentEntwuerfe.map((entwurf) => (
                            <div key={entwurf.id} className="entwurf-item urgent">
                                <div className="entwurf-header">
                                    <h3>{entwurf.title}</h3>
                                    <div className="entwurf-badges">
                                        {getStatusBadge(entwurf.status)}
                                        {getPriorityBadge(entwurf.priority)}
                                    </div>
                                </div>
                                <div className="entwurf-details">
                                    <span>{entwurf.memorial_page_name}</span>
                                    <span>•</span>
                                    <span>{entwurf.trauerdruck_type_name}</span>
                                    <span>•</span>
                                    <span>{formatDate(entwurf.created_at)}</span>
                                </div>
                                {entwurf.deadline && (
                                    <div className="entwurf-deadline">
                                        ⏰ Deadline: {formatDate(entwurf.deadline)}
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Recent Entwuerfe */}
            <div className="recent-section">
                <div className="section-header">
                    <h2>Neueste Entwürfe</h2>
                    <Link to="/mein-bereich/unterlagen/trauerdruck" className="view-all-link">
                        Alle anzeigen →
                    </Link>
                </div>
                <div className="entwuerfe-list">
                    {recentEntwuerfe.length === 0 ? (
                        <div className="no-entwuerfe">
                            <p>Noch keine Entwürfe vorhanden.</p>
                            <Link to="/mein-bereich/trauerdruck/neuen-entwurf" className="btn-primary">
                                Ersten Entwurf erstellen
                            </Link>
                        </div>
                    ) : (
                        recentEntwuerfe.map((entwurf) => (
                            <div key={entwurf.id} className="entwurf-item">
                                <div className="entwurf-header">
                                    <h3>{entwurf.title}</h3>
                                    <div className="entwurf-badges">
                                        {getStatusBadge(entwurf.status)}
                                        {getPriorityBadge(entwurf.priority)}
                                    </div>
                                </div>
                                <div className="entwurf-details">
                                    <span>{entwurf.memorial_page_name}</span>
                                    <span>•</span>
                                    <span>{entwurf.trauerdruck_type_name}</span>
                                    <span>•</span>
                                    <span>v{entwurf.version}</span>
                                    <span>•</span>
                                    <span>{formatDate(entwurf.created_at)}</span>
                                </div>
                                <div className="entwurf-actions">
                                    <Link 
                                        to={`/mein-bereich/trauerdruck/entwurf/${entwurf.id}`}
                                        className="btn-secondary"
                                    >
                                        Details
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};

export default TrauerdruckBestatterDashboard;
