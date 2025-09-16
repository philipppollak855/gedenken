// frontend/src/modules/user/Trauerdruck.jsx
// Trauerdruck-Verwaltung für Unterlagen-Säule

import React from 'react';
import TrauerdruckFreigabenListe from './TrauerdruckFreigabenListe';

const Trauerdruck = () => {
    return (
        <div className="page-content">
            <TrauerdruckFreigabenListe />
        </div>
    );
};

export default Trauerdruck;
