// frontend/src/modules/vorsorge/DigitalLegacy.jsx
// KORRIGIERT: 'api' zur Abhängigkeiten-Liste des useEffect-Hooks hinzugefügt.

import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const DigitalLegacy = () => {
    const [items, setItems] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();

    useEffect(() => {
        const fetchItems = async () => {
            try {
                const response = await api('/digital-legacy/');
                const data = await response.json();
                if (response.ok) {
                    setItems(data);
                }
            } catch (error) {
                console.error("Fehler beim Laden der Nachlass-Einträge:", error);
            } finally {
                setIsLoading(false);
            }
        };

        fetchItems();
    }, [api]); // KORREKTUR: 'api' als Abhängigkeit hinzugefügt.

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            provider: e.target.provider.value,
            category: e.target.category.value,
            instruction: e.target.instruction.value,
            username_email: e.target.username_email.value,
            password_hint: e.target.password_hint.value,
            notes: e.target.notes.value,
        };

        try {
            const response = await api('/digital-legacy/', {
                method: 'POST',
                body: JSON.stringify(newItem),
            });
            const data = await response.json();
            if (response.ok) {
                setItems([...items, data]);
                e.target.reset();
            } else {
                alert("Fehler beim Speichern: " + JSON.stringify(data));
            }
        } catch (error) {
            console.error("Fehler beim Speichern des Eintrags:", error);
        }
    };

    if (isLoading) {
        return <p>Lade digitale Nachlass-Einträge...</p>;
    }

    return (
        <section>
            <h2>Digitaler Nachlass</h2>
            <p>Verwalten Sie hier Ihre digitalen Konten und hinterlegen Sie Anweisungen.</p>
            
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Neuen Eintrag hinzufügen</h3>
                <input name="provider" placeholder="Anbieter (z.B. Facebook)" required />
                <input name="category" placeholder="Kategorie (z.B. Soziales Netzwerk)" required />
                <input name="username_email" placeholder="Benutzername / E-Mail" />
                <input name="password_hint" placeholder="Passworthinweis (NICHT das Passwort!)" />
                <textarea name="instruction" placeholder="Handlungsanweisung (z.B. Profil löschen)" required />
                <textarea name="notes" placeholder="Zusätzliche Notizen" />
                <button type="submit">Speichern</button>
            </form>

            <div>
                <h3>Ihre Einträge</h3>
                {items.length > 0 ? (
                    items.map(item => (
                        <div key={item.item_id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                            <strong>{item.provider}</strong> ({item.category})
                            <p>Anweisung: {item.instruction}</p>
                            {item.notes && <p style={{fontSize: '0.9em', color: '#666'}}>Notiz: {item.notes}</p>}
                        </div>
                    ))
                ) : (
                    <p>Sie haben noch keine Einträge für den digitalen Nachlass hinterlegt.</p>
                )}
            </div>
        </section>
    );
};

export default DigitalLegacy;
