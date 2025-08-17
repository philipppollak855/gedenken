// frontend/src/modules/vorsorge/InsuranceItems.jsx
// KORRIGIERT: 'api' zur Abhängigkeiten-Liste des useEffect-Hooks hinzugefügt.

import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const InsuranceItems = () => {
    const [items, setItems] = useState([]);
    const api = useApi();

    useEffect(() => {
        const fetchItems = async () => {
            const response = await api('/insurances/');
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
            insurance_type: e.target.insurance_type.value,
            company: e.target.company.value,
            policy_number: e.target.policy_number.value,
        };
        const response = await api('/insurances/', { method: 'POST', body: JSON.stringify(newItem) });
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
            <h2>Versicherungen</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Neue Versicherung hinzufügen</h3>
                <input name="insurance_type" placeholder="Art der Versicherung (z.B. Lebensversicherung)" required />
                <input name="company" placeholder="Versicherungsgesellschaft" required />
                <input name="policy_number" placeholder="Policennummer" required />
                <button type="submit">Speichern</button>
            </form>
            <div>
                <h3>Ihre Policen</h3>
                {items.length > 0 ? items.map(item => (
                    <div key={item.item_id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                        <strong>{item.insurance_type}</strong> bei {item.company}
                        <p>Policennr.: {item.policy_number}</p>
                    </div>
                )) : <p>Keine Versicherungen vorhanden.</p>}
            </div>
        </section>
    );
};

export default InsuranceItems;
