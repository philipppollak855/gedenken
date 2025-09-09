// frontend/src/modules/gedenken/MemorialListingPage.jsx
// ERWEITERT: Zusätzliche Suchfelder für Geburts-/Sterbedatum und Friedhof hinzugefügt.
// Die Filterlogik wurde entsprechend angepasst.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './MemorialListingPage.css';

const MemorialCard = ({ page, animate }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Link to={`/gedenken/${page.slug}`} className={`memorial-card ${animate ? 'animate-in' : ''}`}>
            <div className="card-image-wrapper">
                <img src={page.main_photo?.url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Gedenkbild von ${page.first_name}`} />
            </div>
            <div className="card-info">
                <h3>{page.first_name} {page.last_name}</h3>
                <p>
                    * {formatDate(page.date_of_birth)} &nbsp;&nbsp; † {formatDate(page.date_of_death)}
                </p>
            </div>
        </Link>
    );
};

const MemorialListingPage = () => {
    const [pages, setPages] = useState([]);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState(null);
    
    // NEU: Eigene State-Variablen für jedes Suchfeld
    const [searchName, setSearchName] = useState('');
    const [searchBirthDate, setSearchBirthDate] = useState('');
    const [searchDeathDate, setSearchDeathDate] = useState('');
    const [searchCemetery, setSearchCemetery] = useState('');
    
    const [heroCurrentPage, setHeroCurrentPage] = useState(0);
    const [animateCards, setAnimateCards] = useState(false);

    const searchSectionRef = useRef(null);
    const apiCalled = useRef(false);

    useEffect(() => {
        if (apiCalled.current) return;
        apiCalled.current = true;

        const fetchData = async () => {
            // ... (bestehender Code zum Laden der Daten bleibt unverändert)
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
                if (!apiUrl) throw new Error("API URL ist nicht definiert.");

                const [pagesRes, settingsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/memorial-pages/listing/`, { signal: controller.signal }),
                    fetch(`${apiUrl}/api/settings/`, { signal: controller.signal })
                ]);
                
                clearTimeout(timeoutId);

                if (!pagesRes.ok) throw new Error(`Gedenkseiten konnten nicht geladen werden (Status: ${pagesRes.status})`);
                if (!settingsRes.ok) throw new Error(`Einstellungen konnten nicht geladen werden (Status: ${settingsRes.status})`);
                
                const pagesData = await pagesRes.json();
                const settingsData = await settingsRes.json();
                
                setPages(pagesData);
                setSettings(settingsData);
                setAnimateCards(true);

            } catch (err) {
                clearTimeout(timeoutId);
                setError(err.name === 'AbortError' ? 'Der Server antwortet nicht.' : `Fehler: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const sortedPages = useMemo(() => {
        return [...pages].sort((a, b) => new Date(b.date_of_death) - new Date(a.date_of_death));
    }, [pages]);

    const heroPageCount = Math.ceil(sortedPages.length / 8);
    const heroPaginatedPages = sortedPages.slice(heroCurrentPage * 8, (heroCurrentPage + 1) * 8);
    
    // ERWEITERT: Filterlogik berücksichtigt nun alle Suchfelder
    const filteredSearchPages = useMemo(() => {
        const hasSearchTerm = searchName || searchBirthDate || searchDeathDate || searchCemetery;
        if (!hasSearchTerm) return [];

        const formatDateForSearch = (dateString) => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}.${month}.${year}`;
        };

        return pages.filter(page => {
            const nameMatch = searchName ? `${page.first_name} ${page.last_name}`.toLowerCase().includes(searchName.toLowerCase()) : true;
            const birthDateMatch = searchBirthDate ? formatDateForSearch(page.date_of_birth).includes(searchBirthDate) : true;
            const deathDateMatch = searchDeathDate ? formatDateForSearch(page.date_of_death).includes(searchDeathDate) : true;
            const cemeteryMatch = searchCemetery ? (page.cemetery || '').toLowerCase().includes(searchCemetery.toLowerCase()) : true;
            return nameMatch && birthDateMatch && deathDateMatch && cemeteryMatch;
        }).slice(0, 12); // Zeigt bis zu 12 Ergebnisse an
    }, [pages, searchName, searchBirthDate, searchDeathDate, searchCemetery]);

    const handleHeroPageChange = (direction) => {
        setAnimateCards(false);
        setTimeout(() => {
            setHeroCurrentPage(prev => {
                if (direction === 'next') return (prev + 1) % heroPageCount;
                return (prev - 1 + heroPageCount) % heroPageCount;
            });
            setAnimateCards(true);
        }, 50); 
    };

    if (isLoading) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }
    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const heroStyle = {
        backgroundColor: settings.listing_background_color || '#F1EFEA',
        color: settings.listing_text_color || '#3a3a3a',
    };
    if (settings.listing_background_image?.url) {
        heroStyle.backgroundImage = `url(${settings.listing_background_image.url})`;
    }
    
    const searchStyle = {
        backgroundColor: settings.search_background_color || '#e5e0da',
        color: settings.search_text_color || '#3a3a3a',
    };
    if (settings.search_background_image?.url) {
        searchStyle.backgroundImage = `url(${settings.search_background_image.url})`;
    }

    return (
        <div className="listing-page-wrapper">
            <section className="hero-listing-section" style={heroStyle}>
                <div className="section-content">
                    <h1>{settings.listing_title || "Wir gedenken"}</h1>
                    <div className="carousel-container">
                        <button onClick={() => handleHeroPageChange('prev')} className="carousel-arrow">‹</button>
                        <div className="memorial-grid">
                            {heroPaginatedPages.map(page => (
                                <MemorialCard key={page.slug} page={page} animate={animateCards} />
                            ))}
                        </div>
                        <button onClick={() => handleHeroPageChange('next')} className="carousel-arrow">›</button>
                    </div>
                </div>
                <div className="scroll-down-indicator" onClick={() => searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    ›
                </div>
            </section>

            <section ref={searchSectionRef} className="search-listing-section" style={searchStyle}>
                <div className="section-content">
                    <h2>{settings.search_title || "Verstorbenen Suche"}</h2>
                    
                    {/* NEU: Suchformular mit Grid-Layout */}
                    <div className="search-form-grid">
                        <input
                            type="text"
                            placeholder="Name..."
                            value={searchName}
                            onChange={(e) => setSearchName(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Geburtsdatum (TT.MM.JJJJ)..."
                            value={searchBirthDate}
                            onChange={(e) => setSearchBirthDate(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Sterbedatum (TT.MM.JJJJ)..."
                            value={searchDeathDate}
                            onChange={(e) => setSearchDeathDate(e.target.value)}
                            className="search-input"
                        />
                        <input
                            type="text"
                            placeholder="Friedhof..."
                            value={searchCemetery}
                            onChange={(e) => setSearchCemetery(e.target.value)}
                            className="search-input"
                        />
                    </div>

                    <p className="search-helper-text">{settings.search_helper_text || "Geben Sie einen oder mehrere Suchbegriffe ein."}</p>
                    <div className="memorial-grid search-results-grid">
                        {(searchName || searchBirthDate || searchDeathDate || searchCemetery) && filteredSearchPages.length > 0 ? (
                            filteredSearchPages.map(page => (
                                <MemorialCard key={page.slug} page={page} animate={true} />
                            ))
                        ) : (searchName || searchBirthDate || searchDeathDate || searchCemetery) && (
                            <p className="no-results">Keine passenden Gedenkseiten gefunden.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MemorialListingPage;
