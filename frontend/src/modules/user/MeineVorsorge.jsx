// frontend/src/modules/user/MeineVorsorge.jsx
// NEU: Diese Komponente dient als Wrapper für das bestehende Vorsorge-Dashboard.

import React from 'react';
import VorsorgeDashboard from '../vorsorge/VorsorgeDashboard';

const MeineVorsorge = () => {
    return (
        <div>
            <h2>Meine Vorsorge</h2>
            <VorsorgeDashboard />
        </div>
    );
};

export default MeineVorsorge;
