// frontend/src/modules/gedenken/MemorialListingPage.jsx
// Revamped to a two-section layout: a hero carousel and a search area.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './MemorialListingPage.css';

const MemorialCard = ({ page }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Link to={`/gedenken/${page.slug}`} className="memorial-card">
            <div className="card-image-wrapper">
                <img src={page.main_photo_url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Gedenkbild von ${page.first_name}`} />
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
    const [searchTerm, setSearchTerm] = useState('');
    const [heroCurrentPage, setHeroCurrentPage] = useState(0);
    const searchSectionRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 15000);

            try {
                const apiUrl = process.env.REACT_APP_API_URL;
                if (!apiUrl) {
                    throw new Error("API URL ist nicht definiert.");
                }

                const [pagesRes, settingsRes] = await Promise.all([
                    fetch(`${apiUrl}/api/memorial-pages/listing/`, { signal: controller.signal }),
                    fetch(`${apiUrl}/api/settings/`, { signal: controller.signal })
                ]);
                
                clearTimeout(timeoutId);

                if (!pagesRes.ok) throw new Error(`Gedenkseiten konnten nicht geladen werden (Status: ${pagesRes.status})`);
                if (!settingsRes.ok) throw new Error(`Einstellungen konnten nicht geladen werden (Status: ${settingsRes.status})`);
                
                const pagesData = await pagesRes.json();
                const settingsData = await settingsRes.json();
                
                // Sort pages by date of death, most recent first
                const sortedPages = pagesData.sort((a, b) => new Date(b.date_of_death) - new Date(a.date_of_death));
                setPages(sortedPages);
                setSettings(settingsData);

            } catch (err) {
                clearTimeout(timeoutId);
                setError(err.name === 'AbortError' ? 'Der Server antwortet nicht.' : `Fehler beim Laden: ${err.message}`);
                console.error(err);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);
    
    // Search results logic
    const searchResults = useMemo(() => {
        if (searchTerm.length < 2) return [];
        return pages.filter(page =>
            `${page.first_name} ${page.last_name}`.toLowerCase().includes(searchTerm.toLowerCase())
        ).slice(0, 5); // Show top 5 results
    }, [pages, searchTerm]);

    // Hero carousel logic
    const heroItemsPerPage = 8;
    const heroPageCount = Math.ceil(pages.length / heroItemsPerPage);
    const heroPaginatedPages = pages.slice(heroCurrentPage * heroItemsPerPage, (heroCurrentPage + 1) * heroItemsPerPage);

    const handleHeroPageChange = (direction) => {
        setHeroCurrentPage(prev => {
            if (direction === 'next') {
                return (prev + 1) % heroPageCount;
            }
            return (prev - 1 + heroPageCount) % heroPageCount;
        });
    };
    
    const scrollToSearch = () => {
        searchSectionRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    if (isLoading) {
        return <div className="loading-spinner"><div className="spinner"></div></div>;
    }

    if (error) {
        return <div className="error-message">{error}</div>;
    }

    const heroStyle = {
        backgroundColor: settings.listing_background_color || '#f4f1ee',
        backgroundImage: settings.listing_background_image_url ? `url(${settings.listing_background_image_url})` : 'none',
        color: settings.listing_text_color || '#3a3a3a',
    };
    
    const searchStyle = {
        backgroundColor: settings.search_background_color || '#e5e0da',
        backgroundImage: settings.search_background_image_url ? `url(${settings.search_background_image_url})` : 'none',
        color: settings.search_text_color || '#3a3a3a',
    };

    return (
        <div className="listing-page-wrapper">
            <section className="hero-listing-section" style={heroStyle}>
                <div className="section-content">
                    <h1>{settings.listing_title || "Wir gedenken"}</h1>
                    <div className="carousel-container">
                        <button onClick={() => handleHeroPageChange('prev')} className="carousel-arrow left" style={{color: settings.listing_arrow_color || '#8c8073'}}>&#10094;</button>
                        <div className="memorial-grid">
                            {heroPaginatedPages.map(page => (
                                <MemorialCard key={page.slug} page={page} />
                            ))}
                        </div>
                        <button onClick={() => handleHeroPageChange('next')} className="carousel-arrow right" style={{color: settings.listing_arrow_color || '#8c8073'}}>&#10095;</button>
                    </div>
                </div>
                <div className="scroll-down-indicator" onClick={scrollToSearch}>&#10095;</div>
            </section>

            <section className="search-listing-section" ref={searchSectionRef} style={searchStyle}>
                 <div className="section-content">
                    <h2>{settings.search_title || "Verstorbenen Suche"}</h2>
                    <input
                        type="text"
                        placeholder="Namen suchen..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="search-input"
                    />
                     <p className="search-helper-text">{settings.search_helper_text || 'Geben Sie einen Namen ein, um die Suche zu starten.'}</p>
                    
                    <div className="memorial-grid search-results-grid">
                         {searchTerm.length >= 2 && (
                            searchResults.length > 0 ? (
                                searchResults.map(page => <MemorialCard key={page.slug} page={page} />)
                            ) : (
                                <p className="no-results">Keine passenden Gedenkseiten gefunden.</p>
                            )
                        )}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default MemorialListingPage;
