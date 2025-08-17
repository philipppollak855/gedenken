// frontend/src/components/layout/Header.jsx
// AKTUALISIERT: Link zu "Meine Beiträge" hinzugefügt.

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
        navigate('/gedenken');
        setTimeout(() => {
            const searchSection = document.querySelector('.search-section');
            if (searchSection) {
                searchSection.scrollIntoView({ behavior: 'smooth' });
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
                            <Link to="/dashboard" className="action-link">Mein Bereich</Link>
                            <Link to="/meine-beitraege" className="action-link">Meine Beiträge</Link>
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
