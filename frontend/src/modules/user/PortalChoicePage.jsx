// frontend/src/modules/user/PortalChoicePage.jsx
// NEUE KOMPONENTE: Zeigt nach dem Login die Auswahl zwischen den beiden Portalen an.
// Die Texte und Bilder sind über das Admin-Panel anpassbar und werden aus den
// 'settings' geladen, die vom übergeordneten MeinBereich-Layout bereitgestellt werden.

import React from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import './PortalChoicePage.css';

const PortalChoicePage = () => {
    // Holt die 'settings', die in MeinBereich.jsx geladen und über den Outlet bereitgestellt werden
    const { settings } = useOutletContext();

    return (
        <div className="portal-choice-page">
            <h1>{settings.portal_choice_title || 'Mein Bereich'}</h1>
            <p className="subtitle">
                {settings.portal_choice_subtitle || 'Bitte wählen Sie den Bereich aus, den Sie verwalten möchten.'}
            </p>
            <div className="choice-cards-container">
                {/* Gedenken Card */}
                <Link to="/mein-bereich/gedenken" className="choice-card">
                    <div className="choice-card-image-container">
                        <img 
                            src={settings.gedenken_card_image?.url || 'https://placehold.co/600x400/8c8073/FFFFFF?text=Gedenken'} 
                            alt={settings.gedenken_card_title || 'Gedenken'} 
                        />
                    </div>
                    <div className="choice-card-content">
                        <h2>{settings.gedenken_card_title || 'Gedenken'}</h2>
                        <p>{settings.gedenken_card_subtitle || 'Verwalten Sie Gedenkseiten und teilen Sie Erinnerungen.'}</p>
                    </div>
                </Link>

                {/* Vorsorge Card */}
                <Link to="/mein-bereich/vorsorge" className="choice-card">
                    <div className="choice-card-image-container">
                        <img 
                            src={settings.vorsorge_card_image?.url || 'https://placehold.co/600x400/a99e92/FFFFFF?text=Vorsorge'} 
                            alt={settings.vorsorge_card_title || 'Vorsorge'}
                        />
                    </div>
                    <div className="choice-card-content">
                        <h2>{settings.vorsorge_card_title || 'Vorsorge'}</h2>
                        <p>{settings.vorsorge_card_subtitle || 'Treffen Sie Vorkehrungen und sichern Sie Ihr digitales Erbe.'}</p>
                    </div>
                </Link>
            </div>
        </div>
    );
};

export default PortalChoicePage;

