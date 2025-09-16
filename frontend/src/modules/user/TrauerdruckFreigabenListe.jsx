import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import TrauerdruckFreigabeModal from './TrauerdruckFreigabeModal';
import './TrauerdruckFreigabenListe.css';

const TrauerdruckFreigabenListe = () => {
    const { get } = useApi();
    const [freigaben, setFreigaben] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [selectedEntwurf, setSelectedEntwurf] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [filter, setFilter] = useState('all'); // all, pending, approved, revision_requested

    useEffect(() => {
        loadFreigaben();
    }, []);

    const loadFreigaben = async () => {
        try {
            setLoading(true);
            const response = await get('/api/trauerdruck-entwuerfe/');
            setFreigaben(response.data);
        } catch (err) {
            setError('Fehler beim Laden der Freigaben');
            console.error('Error loading freigaben:', err);
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
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
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
            <div className="freigaben-liste-container">
                <div className="loading">Lade Freigaben...</div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="freigaben-liste-container">
                <div className="error">{error}</div>
            </div>
        );
    }

    return (
        <div className="freigaben-liste-container">
            <div className="freigaben-header">
                <h1>Trauerdruck Freigaben</h1>
                <p>Verwalten Sie hier alle Trauerdruck-Entwürfe und deren Freigaben.</p>
            </div>

            <div className="freigaben-filters">
                <button 
                    className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                    onClick={() => setFilter('all')}
                >
                    Alle ({freigaben.length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'pending_approval' ? 'active' : ''}`}
                    onClick={() => setFilter('pending_approval')}
                >
                    Ausstehend ({freigaben.filter(f => f.status === 'pending_approval').length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'approved' ? 'active' : ''}`}
                    onClick={() => setFilter('approved')}
                >
                    Freigegeben ({freigaben.filter(f => f.status === 'approved').length})
                </button>
                <button 
                    className={`filter-btn ${filter === 'revision_requested' ? 'active' : ''}`}
                    onClick={() => setFilter('revision_requested')}
                >
                    Revision ({freigaben.filter(f => f.status === 'revision_requested').length})
                </button>
            </div>

            <div className="freigaben-liste">
                {filteredFreigaben.length === 0 ? (
                    <div className="no-freigaben">
                        <p>Keine Freigaben gefunden.</p>
                    </div>
                ) : (
                    filteredFreigaben.map((entwurf) => (
                        <div 
                            key={entwurf.id} 
                            className="freigaben-item"
                            onClick={() => handleEntwurfClick(entwurf)}
                        >
                            <div className="freigaben-item-header">
                                <h3>{entwurf.title}</h3>
                                <div className="freigaben-badges">
                                    {getStatusBadge(entwurf.status)}
                                    {getPriorityBadge(entwurf.priority)}
                                </div>
                            </div>
                            
                            <div className="freigaben-item-details">
                                <div className="detail-row">
                                    <span className="detail-label">Verstorbener:</span>
                                    <span className="detail-value">{entwurf.memorial_page_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Trauerdruckart:</span>
                                    <span className="detail-value">{entwurf.trauerdruck_type_name}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Gesendet am:</span>
                                    <span className="detail-value">{formatDate(entwurf.created_at)}</span>
                                </div>
                                <div className="detail-row">
                                    <span className="detail-label">Version:</span>
                                    <span className="detail-value">v{entwurf.version}</span>
                                </div>
                                {entwurf.deadline && (
                                    <div className="detail-row">
                                        <span className="detail-label">Deadline:</span>
                                        <span className={`detail-value ${new Date(entwurf.deadline) < new Date() ? 'overdue' : ''}`}>
                                            {formatDate(entwurf.deadline)}
                                        </span>
                                    </div>
                                )}
                            </div>
                            
                            <div className="freigaben-item-actions">
                                <button className="btn-primary">
                                    Details ansehen
                                </button>
                            </div>
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

export default TrauerdruckFreigabenListe;
