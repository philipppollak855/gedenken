import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';
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
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('created_at'); // created_at, title, priority, deadline
    const [sortOrder, setSortOrder] = useState('desc'); // asc, desc
    const [viewMode, setViewMode] = useState('grid'); // grid, list

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

    const filteredAndSortedFreigaben = freigaben
        .filter(entwurf => {
            // Status filter
            if (filter !== 'all' && entwurf.status !== filter) return false;
            
            // Search filter
            if (searchTerm) {
                const searchLower = searchTerm.toLowerCase();
                return (
                    entwurf.title.toLowerCase().includes(searchLower) ||
                    entwurf.memorial_page_name.toLowerCase().includes(searchLower) ||
                    entwurf.trauerdruck_type_name.toLowerCase().includes(searchLower)
                );
            }
            
            return true;
        })
        .sort((a, b) => {
            let aValue, bValue;
            
            switch (sortBy) {
                case 'title':
                    aValue = a.title.toLowerCase();
                    bValue = b.title.toLowerCase();
                    break;
                case 'priority':
                    const priorityOrder = { urgent: 4, high: 3, normal: 2, low: 1 };
                    aValue = priorityOrder[a.priority] || 0;
                    bValue = priorityOrder[b.priority] || 0;
                    break;
                case 'deadline':
                    aValue = a.deadline ? new Date(a.deadline) : new Date('9999-12-31');
                    bValue = b.deadline ? new Date(b.deadline) : new Date('9999-12-31');
                    break;
                case 'created_at':
                default:
                    aValue = new Date(a.created_at);
                    bValue = new Date(b.created_at);
                    break;
            }
            
            if (sortOrder === 'asc') {
                return aValue > bValue ? 1 : -1;
            } else {
                return aValue < bValue ? 1 : -1;
            }
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
                <div className="header-content">
                    <h1>Trauerdruck Freigaben</h1>
                    <p>Verwalten Sie hier alle Trauerdruck-Entwürfe und deren Freigaben.</p>
                </div>
                <div className="header-actions">
                    <Link to="/mein-bereich/trauerdruck/neuen-entwurf" className="btn-primary">
                        ➕ Neuer Entwurf
                    </Link>
                </div>
            </div>

            {/* Controls */}
            <div className="freigaben-controls">
                <div className="search-section">
                    <div className="search-box">
                        <input
                            type="text"
                            placeholder="Entwürfe durchsuchen..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <span className="search-icon">🔍</span>
                    </div>
                </div>

                <div className="filter-section">
                    <div className="filter-buttons">
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
                </div>

                <div className="sort-section">
                    <div className="sort-controls">
                        <select 
                            value={sortBy} 
                            onChange={(e) => setSortBy(e.target.value)}
                            className="sort-select"
                        >
                            <option value="created_at">Erstellt am</option>
                            <option value="title">Titel</option>
                            <option value="priority">Priorität</option>
                            <option value="deadline">Deadline</option>
                        </select>
                        <button 
                            className={`sort-order-btn ${sortOrder === 'desc' ? 'active' : ''}`}
                            onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                        >
                            {sortOrder === 'asc' ? '↑' : '↓'}
                        </button>
                    </div>
                </div>

                <div className="view-section">
                    <div className="view-toggle">
                        <button 
                            className={`view-btn ${viewMode === 'grid' ? 'active' : ''}`}
                            onClick={() => setViewMode('grid')}
                        >
                            ⊞
                        </button>
                        <button 
                            className={`view-btn ${viewMode === 'list' ? 'active' : ''}`}
                            onClick={() => setViewMode('list')}
                        >
                            ☰
                        </button>
                    </div>
                </div>
            </div>

            {/* Results */}
            <div className="freigaben-results">
                <div className="results-header">
                    <span className="results-count">
                        {filteredAndSortedFreigaben.length} von {freigaben.length} Entwürfen
                    </span>
                </div>

                {filteredAndSortedFreigaben.length === 0 ? (
                    <div className="no-freigaben">
                        <div className="no-freigaben-icon">📋</div>
                        <h3>Keine Entwürfe gefunden</h3>
                        <p>
                            {searchTerm || filter !== 'all' 
                                ? 'Versuchen Sie andere Suchbegriffe oder Filter.'
                                : 'Erstellen Sie Ihren ersten Trauerdruck-Entwurf.'
                            }
                        </p>
                        {!searchTerm && filter === 'all' && (
                            <Link to="/mein-bereich/trauerdruck/neuen-entwurf" className="btn-primary">
                                Ersten Entwurf erstellen
                            </Link>
                        )}
                    </div>
                ) : (
                    <div className={`freigaben-liste ${viewMode}`}>
                        {filteredAndSortedFreigaben.map((entwurf) => (
                            <div 
                                key={entwurf.id} 
                                className={`freigaben-item ${entwurf.priority}`}
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
                        ))}
                    </div>
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
