// frontend/src/modules/gedenken/MemorialListingPage.jsx
// Überarbeitet mit dynamischer Schriftgröße und neuen Anzeigeregeln.

import React, { useState, useEffect, useRef, useLayoutEffect } from 'react';
import { Link } from 'react-router-dom';
import './MemorialListingPage.css';

// Eigene Komponente, um Text an die Breite des Containers anzupassen
const AutoFitText = ({ text, className }) => {
    const textRef = useRef(null);

    useLayoutEffect(() => {
        const el = textRef.current;
        if (!el) return;

        const parent = el.parentElement;
        if (!parent) return;

        // Reset font size before measuring
        el.style.fontSize = ''; 
        const initialSize = parseFloat(window.getComputedStyle(el).fontSize);
        
        const resize = () => {
            let currentSize = initialSize;
            el.style.whiteSpace = 'nowrap';
            el.style.display = 'inline-block';

            while (el.scrollWidth > parent.clientWidth && currentSize > 8) {
                currentSize--;
                el.style.fontSize = `${currentSize}px`;
            }
        };
        resize();
    }, [text]);

    return <h3 className={className} ref={textRef}>{text}</h3>;
};


const MemorialListingPage = () => {
    const [pages, setPages] = useState([]);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [filters, setFilters] = useState({
        firstName: '',
        lastName: '',
        year: '',
        cemetery: ''
    });
    const scrollContainerRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            setIsLoading(true);
            try {
                const [pagesRes, settingsRes] = await Promise.all([
                    fetch('http://localhost:8000/api/memorial-pages/listing/'),
                    fetch('http://localhost:8000/api/settings/')
                ]);
                const pagesData = await pagesRes.json();
                const settingsData = await settingsRes.json();
                
                setPages(pagesData);
                setSettings(settingsData);

            } catch (error) {
                console.error("Fehler beim Laden der Daten:", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleScroll = (direction) => {
        if (scrollContainerRef.current) {
            const scrollAmount = scrollContainerRef.current.clientWidth;
            scrollContainerRef.current.scrollBy({ 
                left: direction === 'left' ? -scrollAmount : scrollAmount, 
                behavior: 'smooth' 
            });
        }
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters(prev => ({ ...prev, [name]: value }));
    };

    const filteredPages = pages.filter(page => {
        const deathYear = new Date(page.date_of_death).getFullYear().toString();
        return (
            page.first_name.toLowerCase().includes(filters.firstName.toLowerCase()) &&
            page.last_name.toLowerCase().includes(filters.lastName.toLowerCase()) &&
            (filters.year === '' || deathYear.includes(filters.year)) &&
            (page.cemetery || '').toLowerCase().includes(filters.cemetery.toLowerCase())
        );
    });
    
    const chunk = (arr, size) =>
        Array.from({ length: Math.ceil(arr.length / size) }, (v, i) =>
            arr.slice(i * size, i * size + size)
        );

    const pageChunks = chunk(pages, 12);

    const noSearchInput = Object.values(filters).every(val => val === '');

    if (isLoading) {
        return <div>Lade Gedenkseiten...</div>;
    }

    const listingStyle = {
        backgroundColor: settings.listing_background_color || '#f4f1ee',
        backgroundImage: settings.listing_background_image ? `url(${settings.listing_background_image})` : 'none',
        color: settings.listing_text_color || '#3a3a3a'
    };
    
    const searchStyle = {
        backgroundColor: settings.search_background_color || '#e5e0da',
        backgroundImage: settings.search_background_image ? `url(${settings.search_background_image})` : 'none',
        color: settings.search_text_color || '#3a3a3a'
    };

    const arrowStyle = {
        color: settings.listing_arrow_color || '#8c8073'
    };

    return (
        <div className="memorial-listing-page">
            <section className="listing-hero-section" style={listingStyle}>
                <h2 className="listing-title">{settings.listing_title || "Wir trauern um"}</h2>
                <div className="carousel-container">
                    <button className="scroll-arrow left" style={arrowStyle} onClick={() => handleScroll('left')}>&#8249;</button>
                    <div className="memorial-cards-carousel" ref={scrollContainerRef}>
                        {pageChunks.map((chunk, index) => (
                            <div className="carousel-page" key={index}>
                                {chunk.map(page => (
                                    <Link to={`/gedenken/${page.slug}`} key={page.slug} className="memorial-card" style={{backgroundColor: settings.listing_card_color}}>
                                        <img src={page.main_photo_url || 'https://placehold.co/300x400'} alt={`${page.first_name} ${page.last_name}`} />
                                        <div className="card-info">
                                            <AutoFitText text={page.first_name} className="card-firstname" />
                                            <AutoFitText text={page.last_name} className="card-lastname" />
                                            {page.birth_name_or_title && (
                                                <div className="card-birthname-container">
                                                    <AutoFitText
                                                        text={page.birth_name_type === 'geb' ? `geb. ${page.birth_name_or_title}` : page.birth_name_or_title}
                                                        className="card-birthname"
                                                    />
                                                </div>
                                            )}
                                            <p className="card-deathdate">&#10013; {new Date(page.date_of_death).toLocaleDateString()}</p>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        ))}
                    </div>
                    <button className="scroll-arrow right" style={arrowStyle} onClick={() => handleScroll('right')}>&#8250;</button>
                </div>
            </section>
            <section className="search-section" style={searchStyle}>
                <h2>{settings.search_title || "Verstorbenen Suche"}</h2>
                <div className="search-controls">
                    <input name="firstName" type="text" placeholder="Vorname..." value={filters.firstName} onChange={handleFilterChange} />
                    <input name="lastName" type="text" placeholder="Nachname..." value={filters.lastName} onChange={handleFilterChange} />
                    <input name="year" type="text" placeholder="Sterbejahr..." value={filters.year} onChange={handleFilterChange} />
                    <input name="cemetery" type="text" placeholder="Friedhof..." value={filters.cemetery} onChange={handleFilterChange} />
                </div>
                <div className="search-results">
                    {noSearchInput ? (
                        <p className="search-helper-text">
                            {settings.search_helper_text || "Bitte geben Sie einen oder mehrere Suchbegriffe in die obenstehenden Felder ein, um nach einem Verstorbenen zu suchen."}
                        </p>
                    ) : (
                        filteredPages.slice(0, 5).map((page, index) => (
                            <Link 
                                to={`/gedenken/${page.slug}`} 
                                key={page.slug} 
                                className={`memorial-card ${index === 0 ? 'highlighted' : ''}`} 
                                style={{backgroundColor: settings.listing_card_color}}
                            >
                                <img src={page.main_photo_url || 'https://placehold.co/300x400'} alt={`${page.first_name} ${page.last_name}`} />
                                <div className="card-info">
                                    <AutoFitText text={page.first_name} className="card-firstname" />
                                    <AutoFitText text={page.last_name} className="card-lastname" />
                                    {page.birth_name_or_title && (
                                        <div className="card-birthname-container">
                                            <AutoFitText
                                                text={page.birth_name_type === 'geb' ? `geb. ${page.birth_name_or_title}` : page.birth_name_or_title}
                                                className="card-birthname"
                                            />
                                        </div>
                                    )}
                                    <p className="card-deathdate">&#10013; {new Date(page.date_of_death).toLocaleDateString()}</p>
                                </div>
                            </Link>
                        ))
                    )}
                </div>
            </section>
        </div>
    );
};

export default MemorialListingPage;
