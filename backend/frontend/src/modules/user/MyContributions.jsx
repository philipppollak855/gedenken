// frontend/src/modules/user/MyContributions.jsx
// DIESE DATEI IST NEU.
// Zeigt alle Beiträge des eingeloggten Benutzers an und erlaubt die Bearbeitung.

import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import './MyContributions.css';

const MyContributions = () => {
    const [contributions, setContributions] = useState({ condolences: [], candles: [] });
    const [isLoading, setIsLoading] = useState(true);
    const [editingEntry, setEditingEntry] = useState(null); // { type: 'condolence'/'candle', data: {...} }
    const api = useApi();

    const fetchContributions = useCallback(async () => {
        setIsLoading(true);
        try {
            const response = await api('/my-contributions/');
            if (response.ok) {
                const data = await response.json();
                setContributions(data);
            }
        } catch (error) {
            console.error("Fehler beim Laden der eigenen Beiträge:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchContributions();
    }, [fetchContributions]);

    const handleEditClick = (type, data) => {
        setEditingEntry({ type, data: { ...data } });
    };

    const handleCancelEdit = () => {
        setEditingEntry(null);
    };

    const handleSaveEdit = async (e) => {
        e.preventDefault();
        if (!editingEntry) return;

        const { type, data } = editingEntry;
        const url = type === 'condolence' ? `/condolences/${data.condolence_id}/` : `/candles/${data.candle_id}/`;
        
        const body = type === 'condolence' 
            ? { message: data.message } 
            : { message: data.message, is_private: data.is_private };

        try {
            const response = await api(url, {
                method: 'PATCH',
                body: JSON.stringify(body),
            });

            if (response.ok) {
                setEditingEntry(null);
                fetchContributions();
                alert("Änderung erfolgreich gespeichert.");
            } else {
                const errorData = await response.json();
                alert(`Fehler beim Speichern: ${JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Fehler beim Speichern der Änderung:", error);
        }
    };
    
    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setEditingEntry(prev => ({
            ...prev,
            data: {
                ...prev.data,
                [name]: type === 'checkbox' ? checked : value
            }
        }));
    };

    if (isLoading) {
        return <div className="loading-container">Lade meine Beiträge...</div>;
    }

    return (
        <div className="my-contributions-container">
            <h1>Meine Beiträge</h1>
            <p>Hier sehen Sie eine Übersicht aller von Ihnen verfassten Kondolenzen und angezündeten Gedenkkerzen. Sie können Ihre Beiträge hier auch nachträglich bearbeiten.</p>

            <div className="contributions-section">
                <h2>Meine Kondolenzen</h2>
                {contributions.condolences.length > 0 ? (
                    contributions.condolences.map(condolence => (
                        <div key={condolence.condolence_id} className="contribution-item">
                            <div className="item-content">
                                <p className="item-message">"{condolence.message}"</p>
                                <span className="item-meta">
                                    Verfasst am {new Date(condolence.created_at).toLocaleString('de-DE')} für die <Link to={`/gedenken/${condolence.page_slug}`}>Gedenkseite</Link>
                                </span>
                            </div>
                            <button onClick={() => handleEditClick('condolence', condolence)}>Bearbeiten</button>
                        </div>
                    ))
                ) : (
                    <p>Sie haben noch keine Kondolenzen verfasst.</p>
                )}
            </div>

            <div className="contributions-section">
                <h2>Meine Gedenkkerzen</h2>
                {contributions.candles.length > 0 ? (
                     contributions.candles.map(candle => (
                        <div key={candle.candle_id} className="contribution-item">
                           <div className="item-content">
                                <p className="item-message">"{candle.message || 'Eine stille Kerze'}"</p>
                                <span className="item-meta">
                                    Angeündet am {new Date(candle.created_at).toLocaleString('de-DE')} für die <Link to={`/gedenken/${candle.page_slug}`}>Gedenkseite</Link>
                                    {candle.is_private && <span> (Privat)</span>}
                                </span>
                            </div>
                            <button onClick={() => handleEditClick('candle', candle)}>Bearbeiten</button>
                        </div>
                    ))
                ) : (
                    <p>Sie haben noch keine Gedenkkerzen angezündet.</p>
                )}
            </div>
            
            {editingEntry && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Beitrag bearbeiten</h3>
                        <form onSubmit={handleSaveEdit}>
                            {editingEntry.type === 'condolence' && (
                                <textarea 
                                    name="message" 
                                    value={editingEntry.data.message}
                                    onChange={handleInputChange}
                                    rows="8"
                                />
                            )}
                             {editingEntry.type === 'candle' && (
                                <>
                                    <input 
                                        type="text"
                                        name="message" 
                                        value={editingEntry.data.message}
                                        onChange={handleInputChange}
                                        placeholder="Ihre kurze Nachricht"
                                    />
                                    <label>
                                        <input 
                                            type="checkbox"
                                            name="is_private"
                                            checked={editingEntry.data.is_private}
                                            onChange={handleInputChange}
                                        />
                                        Kerze als "privat" markieren (nur für Familie sichtbar)
                                    </label>
                                </>
                            )}
                            <div className="popup-actions">
                                <button type="button" onClick={handleCancelEdit}>Abbrechen</button>
                                <button type="submit">Speichern</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MyContributions;
