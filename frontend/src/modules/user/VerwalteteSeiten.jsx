// frontend/src/modules/user/VerwalteteSeiten.jsx
// NEU: Komponente zur Anzeige der verwalteten Gedenkseiten.

import React from 'react';
import { Link } from 'react-router-dom';

const VerwalteteSeiten = ({ pages }) => {
    return (
        <div>
            <h2>Verwaltete Gedenkseiten</h2>
            <p>Dies sind die Gedenkseiten, für die Sie von den Vorsorgenden als Angehöriger mit Verwaltungsrechten eingetragen wurden.</p>
            
            {pages && pages.length > 0 ? (
                <ul className="seiten-liste">
                    {pages.map(page => (
                        <li key={page.slug}>
                            <Link to={`/gedenken/${page.slug}/verwalten`}>
                                Gedenkseite von {page.first_name} {page.last_name}
                            </Link>
                        </li>
                    ))}
                </ul>
            ) : (
                <p className="placeholder-text">Sie verwalten derzeit keine Gedenkseiten für andere Personen.</p>
            )}
        </div>
    );
};

export default VerwalteteSeiten;
