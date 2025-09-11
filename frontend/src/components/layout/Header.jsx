// frontend/src/components/layout/Header.jsx
// ERWEITERT: Der Header ist nun vollständig über den Admin-Bereich anpassbar.
// KORRIGIERT: Der "Mein Bereich"-Link führt zur neuen Auswahlseite.
// KORRIGIERT: Unbenutzte 'useApi' hook entfernt, um den Build-Fehler zu beheben.

import React, { useState, useEffect, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
// import useApi from '../../hooks/useApi'; // Nicht benötigt, da 'fetch' verwendet wird
import './Header.css';

const Header = () => {
    const { user, logoutUser } = useContext(AuthContext);
    const [isScrolled, setIsScrolled] = useState(false);
    const [settings, setSettings] = useState({});
    const navigate = useNavigate();
    // const api = useApi(); // Entfernt, da nicht verwendet

    useEffect(() => {
        // Fetch settings on component mount
        const fetchSettings = async () => {
            try {
                // Using a non-authenticated fetch here since settings are public
                const response = await fetch(`${process.env.REACT_APP_API_URL}/api/settings/`);
                if (response.ok) {
                    setSettings(await response.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Design-Einstellungen für den Header:", error);
            }
        };
        fetchSettings();
    }, []);


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

    // --- Dynamic Styles from Settings ---
    const siteTitleStyle = {
        color: settings.header_site_title_color || '#3a3a3a',
        fontSize: settings.header_site_title_size || '1.5rem',
    };

    const logoStyle = {
        height: settings.header_logo_height || '40px',
    };

    const buttonStyle = {
        fontSize: settings.header_button_text_size || '1rem',
    };

    return (
        <header className={`main-header ${isScrolled ? 'scrolled' : ''}`}>
            <div className="header-container">
                <Link to="/" className="logo">
                    {settings.header_logo_image ? (
                        <img 
                            src={settings.header_logo_image.url} 
                            alt={settings.header_site_title_text || 'Logo'} 
                            style={logoStyle} 
                        />
                    ) : (
                        <span style={siteTitleStyle}>
                            {settings.header_site_title_text || 'Gedenken & Vorsorge'}
                        </span>
                    )}
                </Link>
                <nav className="main-nav">
                    <Link to="/gedenken" style={buttonStyle}>GEDENKEN</Link>
                    <button onClick={handleSearchClick} className="nav-button" style={buttonStyle}>
                        Verstorbenen Suche
                    </button>
                </nav>
                <div className="header-actions">
                    {user ? (
                        <>
                            {/* KORRIGIERT: Link führt jetzt zur neuen Auswahlseite */}
                            <Link to="/mein-bereich/auswahl" className="action-link" style={buttonStyle}>
                                Mein Bereich
                            </Link>
                            <button onClick={logoutUser} className="logout-button" style={buttonStyle}>
                                Logout
                            </button>
                        </>
                    ) : (
                        <Link to="/login" className="action-link" style={buttonStyle}>
                            Login
                        </Link>
                    )}
                </div>
            </div>
        </header>
    );
};

export default Header;

