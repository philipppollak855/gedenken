// frontend/src/modules/gedenken/MemorialListingPage.jsx
// KORRIGIERT: Stellt sicher, dass Hintergrundbilder nur angewendet werden, wenn eine URL vorhanden ist.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import './MemorialListingPage.css';

const MemorialCard = ({ page, animate }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Link to={`/gedenken/${page.slug}`} className={`memorial-card ${animate ? 'animate-in' : ''}`}>
            <div className="card-image-wrapper">
                <img src={page.main_photo_url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Gedenkbild von ${page.first_name}`} />
            </div>
            <div className="card-info">
                <h3>{page.first_name} {page.last_name}</h3>
                <p>
                    * {formatDate(page.date_of_birth)} &nbsp;&nbsp; â€  {formatDate(page.date_of_death)}
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
    const [searchTerm, setSearchTerm] = useState('');
    const [heroCurrentPage, setHeroCurrentPage] = useState(0);
    const [animateCards, setAnimateCards] = useState(false);

    const searchSectionRef = useRef(null);
    const apiCalled = useRef(false);

    useEffect(() => {
        if (apiCalled.current) return;
        apiCalled.current = true;

        const fetchData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const apiUrl = process.env.REACT_APP_API_URL;
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

    const filteredSearchPages = useMemo(() => {
        if (!searchTerm) return [];
        return pages.filter(page =>
            `${page.first_name} ${page.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5);
    }, [pages, searchTerm]);

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
    if (settings.listing_background_image_url) {
        heroStyle.backgroundImage = `url(${settings.listing_background_image_url})`;
    }
    
    const searchStyle = {
        backgroundColor: settings.search_background_color || '#e5e0da',
        color: settings.search_text_color || '#3a3a3a',
    };
    if (settings.search_background_image_url) {
        searchStyle.backgroundImage = `url(${settings.search_background_image_url})`;
    }

    return (
        <div className="listing-page-wrapper">
            <section className="hero-listing-section" style={heroStyle}>
                <div className="section-content">
                    <h1>{settings.listing_title || "Wir gedenken"}</h1>
                    <div className="carousel-container">
                        <button onClick={() => handleHeroPageChange('prev')} className="carousel-arrow">âŸ¨</button>
                        <div className="memorial-grid">
                            {heroPaginatedPages.map(page => (
                                <MemorialCard key={page.slug} page={page} animate={animateCards} />
                            ))}
                        </div>
                        <button onClick={() => handleHeroPageChange('next')} className="carousel-arrow">âŸ©</button>
                    </div>
                </div>
                <div className="scroll-down-indicator" onClick={() => searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' })}>
                    âŸ©
                </div>
            </section>

            <section ref={searchSectionRef} className="search-listing-section" style={searchStyle}>
                <div className="section-content">
                    <h2>{settings.search_title || "Verstorbenen Suche"}</h2>
                    <input
                        type="text"
                        placeholder="Namen suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                    <p className="search-helper-text">{settings.search_helper_text || "Geben Sie einen Namen ein, um die Gedenkseiten zu durchsuchen."}</p>
                    <div className="memorial-grid search-results-grid">
                        {searchTerm && filteredSearchPages.length > 0 ? (
                            filteredSearchPages.map(page => (
                                <MemorialCard key={page.slug} page={page} animate={true} />
                            ))
                        ) : searchTerm && (
                            <p className="no-results">Keine passenden Gedenkseiten gefunden.</p>
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MemorialListingPage;

