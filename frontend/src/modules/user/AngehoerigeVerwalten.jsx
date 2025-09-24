// frontend/src/modules/user/AngehoerigeVerwalten.jsx
// VOLLSTÄNDIG IMPLEMENTIERT: FamilyLink-Verwaltung für Angehörige

import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import './AngehoerigeVerwalten.css';

const AngehoerigeVerwalten = () => {
    const { apiGet, apiPost, apiPut, apiDelete } = useApi();
    const [familyLinks, setFamilyLinks] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [editingLink, setEditingLink] = useState(null);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');

    // Formular-Daten
    const [formData, setFormData] = useState({
        relative_user: null,
        role: 'family_member',
        permission_level: 'view_only',
        relationship: '',
        notes: ''
    });

    const loadFamilyLinks = useCallback(async () => {
        try {
            setLoading(true);
            setError(null);
            const response = await apiGet('/family-links/');
            
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }
            
            const data = await response.json();
            setFamilyLinks(data.results || data || []);
        } catch (err) {
            setError('Fehler beim Laden der Angehörigen-Verknüpfungen');
            console.error('Error loading family links:', err);
        } finally {
            setLoading(false);
        }
    }, [apiGet]);

    useEffect(() => {
        loadFamilyLinks();
    }, [loadFamilyLinks]);

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const response = await apiPost('/family-links/', formData);
            if (response.ok) {
                setShowModal(false);
                setFormData({
                    relative_user: null,
                    role: 'family_member',
                    permission_level: 'view_only',
                    relationship: '',
                    notes: ''
                });
                loadFamilyLinks();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Fehler beim Erstellen der Verknüpfung');
            }
        } catch (err) {
            setError('Fehler beim Erstellen der Verknüpfung');
            console.error('Error creating family link:', err);
        }
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            const response = await apiPut(`/family-links/${editingLink.id}/`, formData);
            if (response.ok) {
                setShowModal(false);
                setEditingLink(null);
                setFormData({
                    relative_user: null,
                    role: 'family_member',
                    permission_level: 'view_only',
                    relationship: '',
                    notes: ''
                });
                loadFamilyLinks();
            } else {
                const errorData = await response.json();
                setError(errorData.detail || 'Fehler beim Aktualisieren der Verknüpfung');
            }
        } catch (err) {
            setError('Fehler beim Aktualisieren der Verknüpfung');
            console.error('Error updating family link:', err);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm('Möchten Sie diese Verknüpfung wirklich löschen?')) {
            return;
        }
        
        try {
            const response = await apiDelete(`/family-links/${id}/`);
            if (response.ok) {
                loadFamilyLinks();
            } else {
                setError('Fehler beim Löschen der Verknüpfung');
            }
        } catch (err) {
            setError('Fehler beim Löschen der Verknüpfung');
            console.error('Error deleting family link:', err);
        }
    };

    const openEditModal = (link) => {
        setEditingLink(link);
        setFormData({
            relative_user: link.relative_user,
            role: link.role,
            permission_level: link.permission_level,
            relationship: link.relationship || '',
            notes: link.notes || ''
        });
        setShowModal(true);
    };

    const openCreateModal = () => {
        setEditingLink(null);
        setFormData({
            relative_user: '',
            role: 'family_member',
            permission_level: 'view_only',
            relationship: '',
            notes: ''
        });
        setShowModal(true);
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingLink(null);
        setFormData({
            relative_user: '',
            role: 'family_member',
            permission_level: 'view_only',
            relationship: '',
            notes: ''
        });
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { class: 'status-pending', text: 'Ausstehend' },
            'active': { class: 'status-active', text: 'Aktiv' },
            'suspended': { class: 'status-suspended', text: 'Gesperrt' },
            'revoked': { class: 'status-revoked', text: 'Widerrufen' }
        };
        const statusInfo = statusMap[status] || { class: 'status-unknown', text: status };
        return <span className={`status-badge ${statusInfo.class}`}>{statusInfo.text}</span>;
    };

    const getPermissionBadge = (level) => {
        const permissionMap = {
            'view_only': { class: 'permission-view', text: 'Nur anzeigen' },
            'edit_memorial': { class: 'permission-edit', text: 'Gedenkseite bearbeiten' },
            'manage_all': { class: 'permission-manage', text: 'Vollzugriff' },
            'admin_level': { class: 'permission-admin', text: 'Admin-Berechtigung' }
        };
        const permissionInfo = permissionMap[level] || { class: 'permission-unknown', text: level };
        return <span className={`permission-badge ${permissionInfo.class}`}>{permissionInfo.text}</span>;
    };

    const filteredLinks = familyLinks.filter(link => {
        const matchesFilter = filter === 'all' || link.status === filter;
        const matchesSearch = searchTerm === '' || 
            link.relative_user_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            link.relationship.toLowerCase().includes(searchTerm.toLowerCase());
        return matchesFilter && matchesSearch;
    });

    if (loading) {
        return <div className="loading">Lade Angehörigen-Verknüpfungen...</div>;
    }

    return (
        <div className="angehoerige-verwalten">
            <div className="page-header">
            <h2>Angehörige verwalten</h2>
                <p className="page-description">
                    Verwalten Sie hier alle Personen, die als Angehörige Zugriff auf Ihre Vorsorgedaten oder Gedenkseite haben.
                </p>
            </div>

            {error && (
                <div className="error-message">
                    {error}
                    <button onClick={() => setError(null)}>×</button>
                </div>
            )}

            <div className="controls">
                <div className="search-filter">
                    <input
                        type="text"
                        placeholder="Angehörige suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="filter-select"
                    >
                        <option value="all">Alle Status</option>
                        <option value="pending">Ausstehend</option>
                        <option value="active">Aktiv</option>
                        <option value="suspended">Gesperrt</option>
                        <option value="revoked">Widerrufen</option>
                    </select>
                </div>
                <button onClick={openCreateModal} className="btn btn-primary">
                    + Neue Verknüpfung
                </button>
            </div>

            <div className="family-links-list">
                {filteredLinks.length === 0 ? (
                    <div className="empty-state">
                        <p>Keine Angehörigen-Verknüpfungen gefunden.</p>
                        <button onClick={openCreateModal} className="btn btn-primary">
                            Erste Verknüpfung erstellen
                        </button>
                    </div>
                ) : (
                    filteredLinks.map(link => (
                        <div key={link.id} className="family-link-card">
                            <div className="link-header">
                                <div className="user-info">
                                    <h3>{link.relative_user_name}</h3>
                                    <p className="relationship">{link.relationship || 'Keine Beziehung angegeben'}</p>
                                </div>
                                <div className="link-status">
                                    {getStatusBadge(link.status)}
                                    {getPermissionBadge(link.permission_level)}
                                </div>
                            </div>
                            
                            <div className="link-details">
                                <div className="detail-item">
                                    <strong>Rolle:</strong> {link.role_display}
                                </div>
                                <div className="detail-item">
                                    <strong>Berechtigung:</strong> {link.permission_level_display}
                                </div>
                                {link.last_accessed && (
                                    <div className="detail-item">
                                        <strong>Letzter Zugriff:</strong> {new Date(link.last_accessed).toLocaleDateString('de-DE')}
                                    </div>
                                )}
                                {link.access_count > 0 && (
                                    <div className="detail-item">
                                        <strong>Zugriffe:</strong> {link.access_count}
                                    </div>
                                )}
                            </div>

                            <div className="link-actions">
                                <button 
                                    onClick={() => openEditModal(link)}
                                    className="btn btn-secondary"
                                >
                                    Bearbeiten
                                </button>
                                <button 
                                    onClick={() => handleDelete(link.id)}
                                    className="btn btn-danger"
                                >
                                    Löschen
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {showModal && (
                <div className="modal-overlay">
                    <div className="modal">
                        <div className="modal-header">
                            <h3>{editingLink ? 'Verknüpfung bearbeiten' : 'Neue Verknüpfung erstellen'}</h3>
                            <button onClick={closeModal} className="close-btn">×</button>
                        </div>
                        
                        <form onSubmit={editingLink ? handleUpdate : handleCreate}>
                            <div className="form-group">
                                <label htmlFor="relative_user">Angehöriger (User-ID):</label>
                                <input
                                    type="number"
                                    id="relative_user"
                                    value={formData.relative_user || ''}
                                    onChange={(e) => setFormData({...formData, relative_user: e.target.value ? parseInt(e.target.value) : null})}
                                    placeholder="User-ID des Angehörigen"
                                    required
                                />
                                <small className="form-help">
                                    Die User-ID des Angehörigen (muss ein existierender Benutzer sein)
                                </small>
                            </div>

                            <div className="form-group">
                                <label htmlFor="role">Rolle:</label>
                                <select
                                    id="role"
                                    value={formData.role}
                                    onChange={(e) => setFormData({...formData, role: e.target.value})}
                                >
                                    <option value="family_member">Familienmitglied</option>
                                    <option value="main_contact">Hauptansprechpartner</option>
                                    <option value="executor">Testamentsvollstrecker</option>
                                    <option value="guardian">Vormund/Betreuer</option>
                                    <option value="friend">Freund/Bekannter</option>
                                    <option value="legal_representative">Rechtsvertreter</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="permission_level">Berechtigungsstufe:</label>
                                <select
                                    id="permission_level"
                                    value={formData.permission_level}
                                    onChange={(e) => setFormData({...formData, permission_level: e.target.value})}
                                >
                                    <option value="view_only">Nur anzeigen</option>
                                    <option value="edit_memorial">Gedenkseite bearbeiten</option>
                                    <option value="manage_all">Vollzugriff (Vorsorge + Gedenkseite)</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label htmlFor="relationship">Verwandtschaftsbezeichnung:</label>
                                <input
                                    type="text"
                                    id="relationship"
                                    value={formData.relationship}
                                    onChange={(e) => setFormData({...formData, relationship: e.target.value})}
                                    placeholder="z.B. Sohn, Ehefrau, Guter Freund"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="notes">Interne Notizen:</label>
                                <textarea
                                    id="notes"
                                    value={formData.notes}
                                    onChange={(e) => setFormData({...formData, notes: e.target.value})}
                                    rows="3"
                                    placeholder="Interne Notizen für Admins..."
                                />
                            </div>

                            <div className="modal-actions">
                                <button type="button" onClick={closeModal} className="btn btn-secondary">
                                    Abbrechen
                                </button>
                                <button type="submit" className="btn btn-primary">
                                    {editingLink ? 'Aktualisieren' : 'Erstellen'}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AngehoerigeVerwalten;

