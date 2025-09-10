// frontend/src/components/layout/Header.jsx
// KORRIGIERT: Die handleSearchClick-Funktion wurde an die korrekte Sektions-Referenz angepasst.

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
import './Header.css';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const navigate = useNavigate();

    useEffect(() => {
        const handleScroll = () => {
            if (window.scrollY > 10) {
                setIsScrolled(true);
            } else {
                setIsScrolled(false);
            }
        };
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleSearchClick = () => {
        // Zuerst zur richtigen Seite navigieren
        navigate('/gedenken');
        
        // Mit einem kurzen Timeout sicherstellen, dass die Seite geladen ist,
        // bevor wir versuchen, zu scrollen.
        setTimeout(() => {
            const searchSection = document.getElementById('verstorbenen-suche-sektion');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    };

    return (
        <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo">
                    Bestattung Stranz - Gedenken & Vorsorgen
                </Link>
                <nav className="main-nav">
                    <Link to="/gedenken">GEDENKEN</Link>
                    <button onClick={handleSearchClick} className="nav-button">Verstorbenen Suche</button>
                </nav>
                <div className="header-actions">
                    {user ? (
                        <>
                            <Link to="/mein-bereich/dashboard" className="action-link">Mein Bereich</Link>
                            <button onClick={logoutUser} className="logout-button">Logout</button>
                        </>
                    ) : (
                        <Link to="/login" className="action-link">Login</Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

