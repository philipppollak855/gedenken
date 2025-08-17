// frontend/src/modules/vorsorge/FinancialItems.jsx
// KORRIGIERT: 'api' zur Abhängigkeiten-Liste des useEffect-Hooks hinzugefügt.

import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';

const FinancialItems = () => {
    const [items, setItems] = useState([]);
    const api = useApi();

    useEffect(() => {
        const fetchItems = async () => {
            const response = await api('/financials/');
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
            product_type: e.target.product_type.value,
            institute: e.target.institute.value,
            contract_number: e.target.contract_number.value,
        };
        const response = await api('/financials/', { method: 'POST', body: JSON.stringify(newItem) });
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
            <h2>Finanzen</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Neuen Finanz-Eintrag hinzufügen</h3>
                <input name="product_type" placeholder="Art des Produkts (z.B. Girokonto)" required />
                <input name="institute" placeholder="Bank / Institut" required />
                <input name="contract_number" placeholder="IBAN / Vertragsnummer" required />
                <button type="submit">Speichern</button>
            </form>
            <div>
                <h3>Ihre Einträge</h3>
                {items.length > 0 ? items.map(item => (
                    <div key={item.item_id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                        <strong>{item.product_type}</strong> bei {item.institute}
                        <p>Nummer: {item.contract_number}</p>
                    </div>
                )) : <p>Keine Finanz-Einträge vorhanden.</p>}
            </div>
        </section>
    );
};

export default FinancialItems;
