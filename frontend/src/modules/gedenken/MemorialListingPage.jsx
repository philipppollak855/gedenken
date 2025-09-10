// frontend/src/modules/gedenken/MemorialListingPage.jsx
// KORRIGIERT: Behebt das Anzeige-Problem von Namen und Bildern im Karussell.

import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Link } from 'react-router-dom';
import './MemorialListingPage.css';

const MemorialCard = ({ page, animate, cardStyle }) => {
    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: '2-digit', month: '2-digit', year: 'numeric' });
    };

    return (
        <Link to={`/gedenken/${page.slug}`} className={`memorial-card ${animate ? 'animate-in' : ''}`} style={cardStyle}>
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
    
    // NEU: Zustand für den Suchbegriff und den aktiven Filter
    const [searchTerm, setSearchTerm] = useState('');
    const [activeFilter, setActiveFilter] = useState('name'); // 'name', 'birth_date', 'death_date', 'cemetery'
    const [isFilterMenuOpen, setIsFilterMenuOpen] = useState(false);

    const [heroCurrentPage, setHeroCurrentPage] = useState(0);
    const [animateCards, setAnimateCards] = useState(false);

    const searchSectionRef = useRef(null);
    const apiCalled = useRef(false);
    const filterMenuRef = useRef(null);

    // Effect to close filter menu on outside click
    useEffect(() => {
        function handleClickOutside(event) {
            if (filterMenuRef.current && !filterMenuRef.current.contains(event.target)) {
                setIsFilterMenuOpen(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, [filterMenuRef]);

    useEffect(() => {
        if (apiCalled.current) return;
        apiCalled.current = true;

        const fetchData = async () => {
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
    
    // ERWEITERT: Filterlogik basiert auf dem aktiven Filter
    const filteredSearchPages = useMemo(() => {
        if (!searchTerm) return [];

        const formatDateForSearch = (dateString) => {
            if (!dateString) return '';
            const [year, month, day] = dateString.split('-');
            return `${day}.${month}.${year}`;
        };

        return pages.filter(page => {
            const term = searchTerm.toLowerCase();
            switch (activeFilter) {
                case 'name':
                    return `${page.first_name} ${page.last_name}`.toLowerCase().includes(term);
                case 'birth_date':
                    return formatDateForSearch(page.date_of_birth).includes(term);
                case 'death_date':
                    return formatDateForSearch(page.date_of_death).includes(term);
                case 'cemetery':
                    return (page.cemetery || '').toLowerCase().includes(term);
                default:
                    return false;
            }
        }).slice(0, 12);
    }, [pages, searchTerm, activeFilter]);

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
    
    const filterOptions = {
        name: 'Name',
        birth_date: 'Geburtsdatum',
        death_date: 'Sterbedatum',
        cemetery: 'Friedhof'
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
        '--arrow-color': settings.listing_arrow_color || '#3a3a3a'
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
    
    const cardStyle = {
        backgroundColor: settings.listing_card_color || '#ffffff',
        color: settings.listing_card_text_color || '#3a3a3a',
    };

    return (
        <div className="listing-page-wrapper">
            <section className="hero-listing-section" style={heroStyle}>
                <div className="section-content">
                    <h1>{settings.listing_title || "Wir gedenken"}</h1>
                    <div className="carousel-container">
                        <button onClick={() => handleHeroPageChange('prev')} className="carousel-arrow">‹</button>
                        <div className="memorial-grid">
                            {heroPaginatedPages.map(page => (
                                <MemorialCard 
                                    key={page.slug} 
                                    page={page} 
                                    animate={animateCards} 
                                    cardStyle={cardStyle}
                                />
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
                    
                    {/* NEU: Innovative Suchleiste mit Filter-Button */}
                    <div className="innovative-search-bar" ref={filterMenuRef}>
                        <input
                            type="text"
                            placeholder={`Suche nach ${filterOptions[activeFilter]}...`}
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-input"
                        />
                        <button className="filter-button" onClick={() => setIsFilterMenuOpen(!isFilterMenuOpen)} style={{backgroundColor: settings.search_filter_button_color, color: settings.search_filter_button_icon_color}}>
                            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3"/></svg>
                        </button>
                        {isFilterMenuOpen && (
                            <div className="filter-menu" style={{backgroundColor: settings.search_filter_menu_color}}>
                                {Object.entries(filterOptions).map(([key, value]) => (
                                    <button 
                                        key={key}
                                        className={activeFilter === key ? 'active' : ''}
                                        style={activeFilter === key ? {backgroundColor: settings.search_filter_active_color, color: settings.search_filter_active_text_color} : {color: settings.search_filter_menu_text_color}}
                                        onClick={() => {
                                            setActiveFilter(key);
                                            setIsFilterMenuOpen(false);
                                        }}
                                    >
                                        {value}
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <p className="search-helper-text">{settings.search_helper_text || "Geben Sie einen Suchbegriff ein. Ändern Sie bei Bedarf das Suchfeld mit dem Filter-Button."}</p>
                    <div className="memorial-grid search-results-grid">
                        {searchTerm && filteredSearchPages.length > 0 ? (
                            filteredSearchPages.map(page => (
                                <MemorialCard 
                                    key={page.slug} 
                                    page={page} 
                                    animate={true} 
                                    cardStyle={cardStyle}
                                />
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

