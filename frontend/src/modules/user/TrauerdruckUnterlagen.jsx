import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import TrauerdruckFreigabeModal from './TrauerdruckFreigabeModal';
import './TrauerdruckUnterlagen.css';

const TrauerdruckUnterlagen = () => {
    const { apiGet } = useApi();
    const [freigaben, setFreigaben] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntwurf, setSelectedEntwurf] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all');
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        approved: 0,
        revision_requested: 0
    });

    const loadFreigaben = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGet('/trauerdruck-entwuerfe/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            const entwuerfeData = data.results || data || [];
            setFreigaben(entwuerfeData);
            
            // Statistiken berechnen
            const newStats = {
                total: entwuerfeData.length,
                pending: entwuerfeData.filter(f => f.status === 'pending_approval').length,
                approved: entwuerfeData.filter(f => f.status === 'approved').length,
                revision_requested: entwuerfeData.filter(f => f.status === 'revision_requested').length
            };
            setStats(newStats);
        } catch (err) {
            setError('Fehler beim Laden der Trauerdruck-Freigaben');
            console.error('Error loading freigaben:', err);
        } finally {
            setLoading(false);
        }
    }, [apiGet]);

    useEffect(() => {
        loadFreigaben();
    }, [loadFreigaben]);

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
        if (!dateString) return 'Nicht verfügbar';
        try {
            return new Date(dateString).toLocaleDateString('de-DE', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit'
            });
        } catch (error) {
            console.error('Error formatting date:', error);
            return 'Ungültiges Datum';
        }
    };

    const filteredFreigaben = freigaben.filter(entwurf => {
        if (filter === 'all') return true;
        return entwurf.status === filter;
    });

    const handleEntwurfClick = (entwurf) => {
        setSelectedEntwurf(entwurf);
        setShowModal(true);
    };

    if (loading) {
        return (
            <div className="trauerdruck-unterlagen-container">
                <div className="loading">Lade Trauerdruck-Freigaben...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="trauerdruck-unterlagen-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="trauerdruck-unterlagen-container">
            <div className="trauerdruck-header">
                <h1>Trauerdruck Freigaben</h1>
                <p>Hier können Sie alle Trauerdruck-Entwürfe würdevoll betrachten, kommentieren und freigeben.</p>
            </div>

            {/* Statistiken */}
            <div className="trauerdruck-stats">
                <div className="stat-card">
                    <div className="stat-number">{stats.total}</div>
                    <div className="stat-label">Gesamt</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.pending}</div>
                    <div className="stat-label">Warten auf Freigabe</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.approved}</div>
                    <div className="stat-label">Freigegeben</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">{stats.revision_requested}</div>
                    <div className="stat-label">Revision angefordert</div>
                </div>
            </div>

            {/* Filter */}
            <div className="trauerdruck-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Alle ({stats.total})
                </button>
                <button 
                    className={`filter-btn ${filter === 'pending_approval' ? 'active' : ''}`}
                    onClick={() => setFilter('pending_approval')}
                >
                    Ausstehend ({stats.pending})
                </button>
                <button 
                    className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    Freigegeben ({stats.approved})
                </button>
                <button 
                    className={`filter-btn ${filter === 'revision_requested' ? 'active' : ''}`}
                    onClick={() => setFilter('revision_requested')}
                >
                    Revision ({stats.revision_requested})
                </button>
            </div>

            {/* Entwürfe Liste */}
            <div className="trauerdruck-liste">
                {filteredFreigaben.length === 0 ? (
                    <div className="no-freigaben">
                        <div className="no-freigaben-icon">📄</div>
                        <h3>Keine Trauerdruck-Entwürfe gefunden</h3>
                        <p>Es sind derzeit keine Entwürfe in dieser Kategorie vorhanden.</p>
                    </div>
                ) : (
                    filteredFreigaben.map((entwurf) => (
                        <div 
                            key={entwurf.id} 
                            className="trauerdruck-item"
                            onClick={() => handleEntwurfClick(entwurf)}
                        >
                            <div className="trauerdruck-item-header">
                                <div className="item-title-section">
                                    <h3>{entwurf.title}</h3>
                                    <div className="item-badges">
                                        {getStatusBadge(entwurf.status)}
                                        {getPriorityBadge(entwurf.priority)}
                                    </div>
                                </div>
                                <div className="item-actions">
                                    <button className="btn-primary">
                                        Details ansehen
                                    </button>
                                </div>
                            </div>
                            
                            <div className="trauerdruck-item-details">
                                <div className="detail-grid">
                                    <div className="detail-item">
                                        <span className="detail-label">Verstorbener:</span>
                                        <span className="detail-value">{entwurf.memorial_page_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Trauerdruckart:</span>
                                        <span className="detail-value">{entwurf.trauerdruck_type_name}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Gesendet am:</span>
                                        <span className="detail-value">{formatDate(entwurf.created_at)}</span>
                                    </div>
                                    <div className="detail-item">
                                        <span className="detail-label">Version:</span>
                                        <span className="detail-value">v{entwurf.version}</span>
                                    </div>
                                    {entwurf.deadline && (
                                        <div className="detail-item">
                                            <span className="detail-label">Deadline:</span>
                                            <span className={`detail-value ${new Date(entwurf.deadline) < new Date() ? 'overdue' : ''}`}>
                                                {formatDate(entwurf.deadline)}
                                            </span>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Vorschau */}
                            {entwurf.designs && entwurf.designs.length > 0 && (
                                <div className="trauerdruck-preview">
                                    <h4>Design-Varianten ({entwurf.designs.length})</h4>
                                    <div className="preview-thumbnails">
                                        {entwurf.designs.slice(0, 3).map((design, index) => (
                                            <div key={design.id} className="preview-thumbnail">
                                                {design.design_file_url ? (
                                                    <img 
                                                        src={design.design_file_url} 
                                                        alt={`${design.title} - Vorschau`}
                                                        className="thumbnail-image"
                                                    />
                                                ) : (
                                                    <div className="no-thumbnail">
                                                        <span>Keine Vorschau</span>
                                                    </div>
                                                )}
                                                <div className="thumbnail-label">{design.title}</div>
                                            </div>
                                        ))}
                                        {entwurf.designs.length > 3 && (
                                            <div className="preview-thumbnail more">
                                                <div className="more-count">+{entwurf.designs.length - 3}</div>
                                                <div className="thumbnail-label">Weitere</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    ))
                )}
            </div>

            {showModal && selectedEntwurf && (
                <TrauerdruckFreigabeModal 
                    entwurf={selectedEntwurf}
                    onClose={() => {
                        setShowModal(false);
                        setSelectedEntwurf(null);
                    }}
                    onUpdate={loadFreigaben}
                />
            )}
        </div>
    );
};

export default TrauerdruckUnterlagen;
