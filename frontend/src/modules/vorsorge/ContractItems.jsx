// frontend/src/modules/vorsorge/ContractItems.jsx
// KORRIGIERT: 'api' zur Abhängigkeiten-Liste des useEffect-Hooks hinzugefügt.

import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const ContractItems = () => {
    const [items, setItems] = useState([]);
    const api = useApi();

    useEffect(() => {
        const fetchItems = async () => {
            const response = await api('/contracts/');
            if (response.ok) {
                const data = await response.json();
                setItems(data);
            }
        };
        fetchItems();
    }, [api]); // KORREKTUR: 'api' als Abhängigkeit hinzugefügt.

    const handleSubmit = async (e) => {
        e.preventDefault();
        const newItem = {
            contract_type: e.target.contract_type.value,
            provider: e.target.provider.value,
        };
        const response = await api('/contracts/', { method: 'POST', body: JSON.stringify(newItem) });
        if (response.ok) {
            const data = await response.json();
            setItems([...items, data]);
            e.target.reset();
        } else {
            alert("Fehler beim Speichern.");
        }
    };

    return (
        <section>
            <h2>Laufende Verträge</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Neuen Vertrag hinzufügen</h3>
                <input name="contract_type" placeholder="Art des Vertrags (z.B. Mietvertrag)" required />
                <input name="provider" placeholder="Anbieter / Vertragspartner" required />
                <button type="submit">Speichern</button>
            </form>
            <div>
                <h3>Ihre Verträge</h3>
                {items.length > 0 ? items.map(item => (
                    <div key={item.item_id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                        <strong>{item.contract_type}</strong> mit {item.provider}
                    </div>
                )) : <p>Keine Verträge vorhanden.</p>}
            </div>
        </section>
    );
};

export default ContractItems;
