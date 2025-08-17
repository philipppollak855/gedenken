// frontend/src/modules/gedenken/MemorialPageAdmin.jsx
// Vollständig implementiert mit Funktionen zum Verwalten von Chronik und Galerie.

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import useApi from '../../hooks/useApi';

const MemorialPageAdmin = () => {
    const [pageData, setPageData] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const { userId } = useParams();
    const api = useApi();
    const navigate = useNavigate();

    const fetchPageData = useCallback(async () => {
        try {
            // Holt die Daten über den geschützten 'manage' Endpunkt
            const response = await api(`/manage/memorial-pages/${userId}/`);
            if (response.ok) {
                const data = await response.json();
                setPageData(data);
            } else {
                alert("Sie sind nicht berechtigt, diese Seite zu verwalten.");
                navigate('/');
            }
        } catch (error) {
            console.error("Fehler beim Laden der Verwaltungsdaten:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api, userId, navigate]);

    useEffect(() => {
        fetchPageData();
    }, [fetchPageData]);

    const handleGeneralSubmit = async (e) => {
        e.preventDefault();
        const updatedData = {
            first_name: e.target.first_name.value,
            last_name: e.target.last_name.value,
            obituary: e.target.obituary.value,
        };
        const response = await api(`/manage/memorial-pages/${userId}/`, {
            method: 'PATCH',
            body: JSON.stringify(updatedData),
        });
        if (response.ok) {
            alert("Daten gespeichert.");
            fetchPageData();
        } else {
            alert("Fehler beim Speichern.");
        }
    };

    // NEU: Funktion zum Hinzufügen eines Chronik-Eintrags
    const handleTimelineSubmit = async (e) => {
        e.preventDefault();
        const newEvent = {
            date: e.target.date.value,
            title: e.target.title.value,
            description: e.target.description.value,
        };
        const response = await api(`/manage/memorial-pages/${userId}/timeline-events/`, {
            method: 'POST',
            body: JSON.stringify(newEvent),
        });
        if (response.ok) {
            fetchPageData();
            e.target.reset();
        } else {
            alert("Fehler beim Hinzufügen des Eintrags.");
        }
    };

    // NEU: Funktion zum Löschen eines Chronik-Eintrags
    const deleteTimelineEvent = async (eventId) => {
        if (window.confirm("Möchten Sie diesen Chronik-Eintrag wirklich löschen?")) {
            await api(`/manage/memorial-pages/${userId}/timeline-events/${eventId}/`, { method: 'DELETE' });
            fetchPageData();
        }
    };

    // NEU: Funktion zum Hinzufügen eines Galerie-Bildes
    const handleGallerySubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            image_url: e.target.image_url.value,
            caption: e.target.caption.value,
        };
        const response = await api(`/manage/memorial-pages/${userId}/gallery-items/`, {
            method: 'POST',
            body: JSON.stringify(newItem),
        });
        if (response.ok) {
            fetchPageData();
            e.target.reset();
        } else {
            alert("Fehler beim Hinzufügen des Bildes.");
        }
    };

    // NEU: Funktion zum Löschen eines Galerie-Bildes
    const deleteGalleryItem = async (itemId) => {
        if (window.confirm("Möchten Sie dieses Bild wirklich aus der Galerie löschen?")) {
            await api(`/manage/memorial-pages/${userId}/gallery-items/${itemId}/`, { method: 'DELETE' });
            fetchPageData();
        }
    };

    if (isLoading) {
        return <p>Verwaltungsseite wird geladen...</p>;
    }

    if (!pageData) {
        return <h1>Seite nicht gefunden oder keine Berechtigung</h1>;
    }

    return (
        <div>
            <h1>Verwaltung für Gedenkseite von {pageData.first_name} {pageData.last_name}</h1>
            <Link to={`/gedenken/${userId}`}>Zur öffentlichen Ansicht</Link>
            
            <section style={{marginTop: '2rem'}}>
                <h3>Allgemeine Informationen</h3>
                <form onSubmit={handleGeneralSubmit}>
                    <input name="first_name" defaultValue={pageData.first_name} placeholder="Vorname" />
                    <input name="last_name" defaultValue={pageData.last_name} placeholder="Nachname" />
                    <textarea name="obituary" defaultValue={pageData.obituary} placeholder="Nachruf" style={{height: '150px'}}/>
                    <button type="submit">Allgemeine Infos speichern</button>
                </form>
            </section>

            <hr style={{margin: '2rem 0'}} />

            <section>
                <h3>Lebens-Chronik verwalten</h3>
                <form onSubmit={handleTimelineSubmit} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                    <h4>Neues Ereignis hinzufügen</h4>
                    <input type="date" name="date" required />
                    <input name="title" placeholder="Titel des Ereignisses" required />
                    <textarea name="description" placeholder="Beschreibung" />
                    <button type="submit">+ Hinzufügen</button>
                </form>
                {pageData.timeline_events && pageData.timeline_events.map(event => (
                    <div key={event.event_id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee'}}>
                        <span>{event.date}: {event.title}</span>
                        <button onClick={() => deleteTimelineEvent(event.event_id)} style={{backgroundColor: '#dc3545'}}>Löschen</button>
                    </div>
                ))}
            </section>

             <hr style={{margin: '2rem 0'}} />

            <section>
                <h3>Galerie verwalten</h3>
                <form onSubmit={handleGallerySubmit} style={{ marginBottom: '1rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                    <h4>Neues Bild hinzufügen</h4>
                    <input name="image_url" placeholder="Bild-URL" required />
                    <input name="caption" placeholder="Bildunterschrift (optional)" />
                    <button type="submit">+ Hinzufügen</button>
                </form>
                {pageData.gallery_items && pageData.gallery_items.map(item => (
                    <div key={item.item_id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem', borderBottom: '1px solid #eee'}}>
                        <span>{item.caption || 'Bild ohne Unterschrift'}</span>
                        <button onClick={() => deleteGalleryItem(item.item_id)} style={{backgroundColor: '#dc3545'}}>Löschen</button>
                    </div>
                ))}
            </section>
        </div>
    );
};

export default MemorialPageAdmin;
