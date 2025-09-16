import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './TrauerdruckFreigabeModal.css';

const TrauerdruckFreigabeModal = ({ entwurf, onClose, onUpdate }) => {
    const { get, post, put } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [kommentare, setKommentare] = useState([]);
    const [freigaben, setFreigaben] = useState([]);
    const [showFullscreen, setShowFullscreen] = useState(false);
    const [activeTab, setActiveTab] = useState('design'); // design, comments, history
    
    // Form States
    const [newComment, setNewComment] = useState('');
    const [revisionNotes, setRevisionNotes] = useState('');
    const [decision, setDecision] = useState('pending');
    const [decisionComment, setDecisionComment] = useState('');

    useEffect(() => {
        if (entwurf) {
            loadKommentare();
            loadFreigaben();
        }
    }, [entwurf]);

    const loadKommentare = async () => {
        try {
            const response = await get(`/api/trauerdruck-entwuerfe/${entwurf.id}/kommentare/`);
            setKommentare(response.data);
        } catch (err) {
            console.error('Error loading kommentare:', err);
        }
    };

    const loadFreigaben = async () => {
        try {
            const response = await get(`/api/trauerdruck-entwuerfe/${entwurf.id}/freigaben/`);
            setFreigaben(response.data);
        } catch (err) {
            console.error('Error loading freigaben:', err);
        }
    };

    const handleAddComment = async () => {
        if (!newComment.trim()) return;
        
        try {
            setLoading(true);
            await post(`/api/trauerdruck-kommentare/`, {
                entwurf: entwurf.id,
                content: newComment,
                is_internal: false
            });
            setNewComment('');
            loadKommentare();
        } catch (err) {
            setError('Fehler beim Hinzufügen des Kommentars');
        } finally {
            setLoading(false);
        }
    };

    const handleDecision = async () => {
        if (!decision || decision === 'pending') return;
        
        try {
            setLoading(true);
            await post(`/api/trauerdruck-freigaben/`, {
                entwurf: entwurf.id,
                decision: decision,
                comment: decisionComment,
                revision_notes: revisionNotes
            });
            
            // Update entwurf status
            await put(`/api/trauerdruck-entwuerfe/${entwurf.id}/`, {
                ...entwurf,
                status: decision === 'approved' ? 'approved' : 
                       decision === 'revision_requested' ? 'revision_requested' : 'rejected'
            });
            
            onUpdate();
            onClose();
        } catch (err) {
            setError('Fehler beim Speichern der Entscheidung');
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

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('de-DE', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    if (!entwurf) return null;

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal-content freigabe-modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <div className="modal-title">
                        <h2>{entwurf.title}</h2>
                        {getStatusBadge(entwurf.status)}
                    </div>
                    <button className="modal-close" onClick={onClose}>×</button>
                </div>

                <div className="modal-body">
                    {/* Tabs */}
                    <div className="modal-tabs">
                        <button 
                            className={`tab-btn ${activeTab === 'design' ? 'active' : ''}`}
                            onClick={() => setActiveTab('design')}
                        >
                            Design
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'comments' ? 'active' : ''}`}
                            onClick={() => setActiveTab('comments')}
                        >
                            Kommentare ({kommentare.length})
                        </button>
                        <button 
                            className={`tab-btn ${activeTab === 'history' ? 'active' : ''}`}
                            onClick={() => setActiveTab('history')}
                        >
                            Historie
                        </button>
                    </div>

                    {/* Tab Content */}
                    <div className="tab-content">
                        {activeTab === 'design' && (
                            <div className="design-tab">
                                <div className="design-info">
                                    <div className="info-grid">
                                        <div className="info-item">
                                            <label>Verstorbener:</label>
                                            <span>{entwurf.memorial_page_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Trauerdruckart:</label>
                                            <span>{entwurf.trauerdruck_type_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Version:</label>
                                            <span>v{entwurf.version}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Erstellt von:</label>
                                            <span>{entwurf.created_by_name}</span>
                                        </div>
                                        <div className="info-item">
                                            <label>Erstellt am:</label>
                                            <span>{formatDate(entwurf.created_at)}</span>
                                        </div>
                                        {entwurf.deadline && (
                                            <div className="info-item">
                                                <label>Deadline:</label>
                                                <span className={new Date(entwurf.deadline) < new Date() ? 'overdue' : ''}>
                                                    {formatDate(entwurf.deadline)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="design-preview">
                                    <div className="preview-header">
                                        <h3>Design-Vorschau</h3>
                                        <div className="preview-actions">
                                            <button 
                                                className="btn-secondary"
                                                onClick={() => setShowFullscreen(true)}
                                            >
                                                Vollbild anzeigen
                                            </button>
                                            <button 
                                                className="btn-secondary"
                                                onClick={() => window.open(entwurf.design_file_url, '_blank')}
                                                disabled={!entwurf.design_file_url}
                                            >
                                                In neuem Tab öffnen
                                            </button>
                                        </div>
                                    </div>
                                    <div className="preview-container">
                                        {entwurf.designs && entwurf.designs.length > 0 ? (
                                            <div className="design-variants">
                                                {entwurf.designs.map((design, index) => (
                                                    <div key={design.id} className="design-variant">
                                                        <div className="variant-header">
                                                            <h4>{design.title}</h4>
                                                            <div className="variant-badges">
                                                                {design.is_approved && (
                                                                    <span className="badge-approved">✓ Freigegeben</span>
                                                                )}
                                                                {design.approval_count > 0 && (
                                                                    <span className="badge-approvals">
                                                                        {design.approval_count} Freigaben
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        <div className="variant-preview">
                                                            {design.design_file_url ? (
                                                                <img 
                                                                    src={design.design_file_url} 
                                                                    alt={`${design.title} - Vorschau`}
                                                                    className="preview-image"
                                                                    onClick={() => setShowFullscreen(true)}
                                                                />
                                                            ) : (
                                                                <div className="no-preview">
                                                                    <p>Keine Vorschau verfügbar</p>
                                                                </div>
                                                            )}
                                                        </div>
                                                        {design.description && (
                                                            <div className="variant-description">
                                                                <p>{design.description}</p>
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        ) : entwurf.design_file_url ? (
                                            <img 
                                                src={entwurf.design_file_url} 
                                                alt="Design-Vorschau"
                                                className="preview-image"
                                                onClick={() => setShowFullscreen(true)}
                                            />
                                        ) : (
                                            <div className="no-preview">
                                                <p>Keine Vorschau verfügbar</p>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {entwurf.description && (
                                    <div className="design-description">
                                        <h3>Beschreibung</h3>
                                        <p>{entwurf.description}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {activeTab === 'comments' && (
                            <div className="comments-tab">
                                <div className="collaboration-header">
                                    <h3>Zusammenarbeit & Abstimmung</h3>
                                    <p>Hier können Sie mit anderen Angehörigen über die Entwürfe diskutieren und abstimmen.</p>
                                </div>

                                <div className="comments-list">
                                    {kommentare.length === 0 ? (
                                        <div className="no-comments">
                                            <p>Noch keine Kommentare vorhanden. Seien Sie der Erste, der einen Kommentar hinzufügt.</p>
                                        </div>
                                    ) : (
                                        kommentare.map((kommentar) => (
                                            <div key={kommentar.id} className="comment-item">
                                                <div className="comment-header">
                                                    <div className="comment-author-info">
                                                        <span className="comment-author">{kommentar.author_name}</span>
                                                        <span className="comment-date">{formatDate(kommentar.created_at)}</span>
                                                    </div>
                                                    <div className="comment-badges">
                                                        {kommentar.is_internal && (
                                                            <span className="comment-internal">Intern</span>
                                                        )}
                                                    </div>
                                                </div>
                                                <div className="comment-content">
                                                    {kommentar.content}
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>

                                <div className="add-comment">
                                    <h3>Kommentar hinzufügen</h3>
                                    <div className="comment-types">
                                        <label className="comment-type-option">
                                            <input
                                                type="radio"
                                                name="commentType"
                                                value="public"
                                                defaultChecked
                                            />
                                            <span>Öffentlicher Kommentar (für alle Angehörigen sichtbar)</span>
                                        </label>
                                        <label className="comment-type-option">
                                            <input
                                                type="radio"
                                                name="commentType"
                                                value="internal"
                                            />
                                            <span>Interner Kommentar (nur für Bestatter sichtbar)</span>
                                        </label>
                                    </div>
                                    <textarea
                                        value={newComment}
                                        onChange={(e) => setNewComment(e.target.value)}
                                        placeholder="Ihren Kommentar hier eingeben... Teilen Sie Ihre Gedanken und Wünsche mit anderen Angehörigen."
                                        rows={4}
                                    />
                                    <div className="comment-actions">
                                        <button 
                                            className="btn-primary"
                                            onClick={handleAddComment}
                                            disabled={loading || !newComment.trim()}
                                        >
                                            {loading ? 'Speichern...' : 'Kommentar hinzufügen'}
                                        </button>
                                        <button 
                                            className="btn-secondary"
                                            onClick={() => setNewComment('')}
                                            disabled={loading}
                                        >
                                            Abbrechen
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}

                        {activeTab === 'history' && (
                            <div className="history-tab">
                                <div className="history-list">
                                    {freigaben.length === 0 ? (
                                        <div className="no-history">
                                            <p>Noch keine Entscheidungen getroffen.</p>
                                        </div>
                                    ) : (
                                        freigaben.map((freigabe) => (
                                            <div key={freigabe.id} className="history-item">
                                                <div className="history-header">
                                                    <span className="history-reviewer">{freigabe.reviewer_name}</span>
                                                    <span className="history-date">{formatDate(freigabe.created_at)}</span>
                                                    <span className={`history-decision ${freigabe.decision}`}>
                                                        {freigabe.decision_display}
                                                    </span>
                                                </div>
                                                {freigabe.comment && (
                                                    <div className="history-comment">
                                                        <strong>Kommentar:</strong> {freigabe.comment}
                                                    </div>
                                                )}
                                                {freigabe.revision_notes && (
                                                    <div className="history-revision">
                                                        <strong>Revisionshinweise:</strong> {freigabe.revision_notes}
                                                    </div>
                                                )}
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Decision Section */}
                    {entwurf.status === 'pending_approval' && (
                        <div className="decision-section">
                            <h3>Entscheidung treffen</h3>
                            <div className="decision-options">
                                <label className="decision-option">
                                    <input
                                        type="radio"
                                        name="decision"
                                        value="approved"
                                        checked={decision === 'approved'}
                                        onChange={(e) => setDecision(e.target.value)}
                                    />
                                    <span className="decision-label approved">Freigeben</span>
                                </label>
                                <label className="decision-option">
                                    <input
                                        type="radio"
                                        name="decision"
                                        value="revision_requested"
                                        checked={decision === 'revision_requested'}
                                        onChange={(e) => setDecision(e.target.value)}
                                    />
                                    <span className="decision-label revision">Revision anfordern</span>
                                </label>
                                <label className="decision-option">
                                    <input
                                        type="radio"
                                        name="decision"
                                        value="rejected"
                                        checked={decision === 'rejected'}
                                        onChange={(e) => setDecision(e.target.value)}
                                    />
                                    <span className="decision-label rejected">Ablehnen</span>
                                </label>
                            </div>

                            {decision === 'revision_requested' && (
                                <div className="revision-notes">
                                    <label>Was soll geändert werden?</label>
                                    <textarea
                                        value={revisionNotes}
                                        onChange={(e) => setRevisionNotes(e.target.value)}
                                        placeholder="Beschreiben Sie, was am Design geändert werden soll..."
                                        rows={3}
                                        required
                                    />
                                </div>
                            )}

                            <div className="decision-comment">
                                <label>Kommentar (optional)</label>
                                <textarea
                                    value={decisionComment}
                                    onChange={(e) => setDecisionComment(e.target.value)}
                                    placeholder="Ihren Kommentar zur Entscheidung..."
                                    rows={2}
                                />
                            </div>

                            <div className="decision-actions">
                                <button 
                                    className="btn-primary"
                                    onClick={handleDecision}
                                    disabled={loading || !decision || decision === 'pending'}
                                >
                                    {loading ? 'Speichern...' : 'Entscheidung speichern'}
                                </button>
                                <button 
                                    className="btn-secondary"
                                    onClick={onClose}
                                >
                                    Abbrechen
                                </button>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className="error-message">
                            {error}
                        </div>
                    )}
                </div>
            </div>

            {/* Fullscreen Modal */}
            {showFullscreen && (
                <div className="fullscreen-overlay" onClick={() => setShowFullscreen(false)}>
                    <div className="fullscreen-content" onClick={(e) => e.stopPropagation()}>
                        <button 
                            className="fullscreen-close"
                            onClick={() => setShowFullscreen(false)}
                        >
                            ×
                        </button>
                        {entwurf.design_file_url && (
                            <img 
                                src={entwurf.design_file_url} 
                                alt="Design-Vollbild"
                                className="fullscreen-image"
                            />
                        )}
                    </div>
                </div>
            )}
        </div>
    );
};

export default TrauerdruckFreigabeModal;
