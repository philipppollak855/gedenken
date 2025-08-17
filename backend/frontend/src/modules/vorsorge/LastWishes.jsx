// frontend/src/modules/vorsorge/LastWishes.jsx
// Verbessert mit Dropdowns, dynamischer Musikliste und besserem Speicher-Feedback.

import React, { useState, useEffect, useCallback } from 'react';
import useApi from '../../hooks/useApi';

const LastWishes = () => {
    const [wishes, setWishes] = useState({
        burial_type: '',
        burial_location: '',
        ceremony_type: '',
        ceremony_details: '',
        music_wishes: [],
        speaker_wishes: '',
        flower_wishes: '',
    });
    const [isLoading, setIsLoading] = useState(true);
    const [saveStatus, setSaveStatus] = useState('idle'); // 'idle', 'saving', 'success'
    const api = useApi();

    const fetchWishes = useCallback(async () => {
        try {
            const response = await api('/last-wishes/');
            if (response.ok) {
                const data = await response.json();
                // Stellt sicher, dass music_wishes immer ein Array ist
                setWishes({ ...data, music_wishes: data.music_wishes || [] });
            }
        } catch (error) {
            console.error("Fehler beim Laden der Wünsche:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchWishes();
    }, [fetchWishes]);

    const handleChange = (e) => {
        setWishes({
            ...wishes,
            [e.target.name]: e.target.value
        });
    };

    const handleMusicChange = (index, e) => {
        const newMusicWishes = [...wishes.music_wishes];
        newMusicWishes[index][e.target.name] = e.target.value;
        setWishes({ ...wishes, music_wishes: newMusicWishes });
    };

    const addMusicTrack = () => {
        setWishes({
            ...wishes,
            music_wishes: [...wishes.music_wishes, { title: '', artist: '' }]
        });
    };

    const removeMusicTrack = (index) => {
        const newMusicWishes = [...wishes.music_wishes];
        newMusicWishes.splice(index, 1);
        setWishes({ ...wishes, music_wishes: newMusicWishes });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSaveStatus('saving');
        const response = await api('/last-wishes/', {
            method: 'PUT',
            body: JSON.stringify(wishes),
        });

        if (response.ok) {
            setSaveStatus('success');
            const data = await response.json();
            setWishes({ ...data, music_wishes: data.music_wishes || [] });
            setTimeout(() => setSaveStatus('idle'), 2000); // Setzt den Status nach 2 Sekunden zurück
        } else {
            alert("Fehler beim Speichern.");
            setSaveStatus('idle');
        }
    };

    if (isLoading) {
        return <p>Lade letzte Wünsche...</p>;
    }

    return (
        <section>
            <h2>Letzte Wünsche & Verabschiedung</h2>
            <form onSubmit={handleSubmit}>
                <h4>Bestattungswünsche</h4>
                <select name="burial_type" value={wishes?.burial_type || ''} onChange={handleChange}>
                    <option value="">-- Bestattungsart wählen --</option>
                    <option value="Erdbestattung">Erdbestattung</option>
                    <option value="Feuerbestattung">Feuerbestattung</option>
                    <option value="Seebestattung">Seebestattung</option>
                    <option value="Baumbestattung">Baumbestattung</option>
                </select>
                <input 
                    name="burial_location" 
                    value={wishes?.burial_location || ''}
                    onChange={handleChange}
                    placeholder="Ort der Bestattung" 
                />
                
                <h4 style={{marginTop: '1.5rem'}}>Trauerfeier</h4>
                <select name="ceremony_type" value={wishes?.ceremony_type || ''} onChange={handleChange}>
                    <option value="">-- Art der Zeremonie wählen --</option>
                    <option value="Religiös">Religiös</option>
                    <option value="Weltlich">Weltlich</option>
                    <option value="Keine Zeremonie">Keine Zeremonie</option>
                </select>
                <textarea 
                    name="ceremony_details"
                    value={wishes?.ceremony_details || ''}
                    onChange={handleChange}
                    placeholder="Details zur Zeremonie..." 
                />
                <textarea 
                    name="speaker_wishes"
                    value={wishes?.speaker_wishes || ''}
                    onChange={handleChange}
                    placeholder="Wünsche zu Rednern..." 
                />
                 <textarea 
                    name="flower_wishes"
                    value={wishes?.flower_wishes || ''}
                    onChange={handleChange}
                    placeholder="Blumenwünsche..." 
                />

                <h4 style={{marginTop: '1.5rem'}}>Musikwünsche</h4>
                {wishes?.music_wishes.map((track, index) => (
                    <div key={index} style={{display: 'flex', alignItems: 'center', marginBottom: '0.5rem'}}>
                        <input 
                            name="title"
                            value={track.title}
                            onChange={(e) => handleMusicChange(index, e)}
                            placeholder={`Titel ${index + 1}`}
                            style={{flex: 1, marginRight: '0.5rem'}}
                        />
                        <input
                            name="artist"
                            value={track.artist}
                            onChange={(e) => handleMusicChange(index, e)}
                            placeholder={`Interpret ${index + 1}`}
                            style={{flex: 1, marginRight: '0.5rem'}}
                        />
                        <button type="button" onClick={() => removeMusicTrack(index)}>X</button>
                    </div>
                ))}
                <button type="button" onClick={addMusicTrack} style={{backgroundColor: '#6c757d'}}>+ Musikstück hinzufügen</button>

                <button type="submit" style={{marginTop: '1rem', display: 'block'}}>
                    {saveStatus === 'saving' ? 'Speichere...' : saveStatus === 'success' ? 'Gespeichert!' : 'Wünsche speichern'}
                </button>
            </form>
        </section>
    );
};

export default LastWishes;
