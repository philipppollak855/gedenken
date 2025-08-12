// frontend/src/modules/gedenken/MemorialPage.jsx
// KORRIGIERT: Layout im Abschiedsbereich gemäß den neuen Vorgaben umstrukturiert.

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams } from 'react-router-dom';
import InlineExpandArea from './InlineExpandArea';
import './MemorialPage.css';

const MemorialPage = () => {
    const [pageData, setPageData] = useState(null);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showSideBySideLightbox, setShowSideBySideLightbox] = useState(false);
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [expandedView, setExpandedView] = useState(null);
    const { slug } = useParams();
    const expandAreaRef = useRef(null);
    const farewellSectionRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    };
    
    const formatEventDate = (dateString) => {
        if (!dateString) return '';
        const date = new Date(dateString);
        return {
            day: date.toLocaleDateString('de-DE', { day: '2-digit' }),
            month: date.toLocaleDateString('de-DE', { month: 'short' }),
            time: date.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' })
        };
    };

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        try {
            const apiUrl = process.env.REACT_APP_API_URL || 'http://localhost:8000';
            const [pageRes, settingsRes] = await Promise.all([
                 fetch(`${apiUrl}/api/memorial-pages/${slug}/`),
                 fetch(`${apiUrl}/api/settings/`)
            ]);
            if (pageRes.ok) setPageData(await pageRes.json()); else setPageData(null);
            if (settingsRes.ok) setSettings(await settingsRes.json());
        } catch (error) {
            console.error("Fehler beim Laden der Gedenkseite:", error);
        } finally {
            setIsLoading(false);
        }
    }, [slug]);

    useEffect(() => {
        if (slug) fetchPageData();
    }, [slug, fetchPageData]);

    const handleHeroLinkClick = (e, view) => {
        e.preventDefault();
        if (view === 'abschied') {
            farewellSectionRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
        } else if (view === 'kondolieren') {
            toggleExpandedView('condolences');
        }
    };

    const toggleExpandedView = (view) => {
        const isOpening = expandedView !== view;
        setExpandedView(prev => prev === view ? null : view);
        
        if (isOpening) {
            setTimeout(() => {
                expandAreaRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 100);
        }
    };
    
    const openSideBySideLightbox = (e) => {
        e.stopPropagation();
        setShowSideBySideLightbox(true);
    };

    if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!pageData) return <h1 className="text-center text-2xl font-bold mt-10">Gedenkseite nicht gefunden</h1>;
    
    const farewellStyle = {
        backgroundColor: pageData.farewell_background_color || '#6d6d6d',
        backgroundImage: pageData.farewell_background_image_url ? `url(${pageData.farewell_background_image_url})` : 'none',
        backgroundSize: pageData.farewell_background_size || 'cover',
    };
    const heroStyle = {
        backgroundImage: pageData.hero_background_image_url ? `url(${pageData.hero_background_image_url})` : `url(https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)`,
        backgroundSize: pageData.hero_background_size || 'cover',
    };

    const farewellSectionClasses = `farewell-section ${pageData.farewell_text_inverted ? 'text-inverted' : ''}`;
    const hasPublicEvents = pageData.events && pageData.events.filter(e => e.is_public).length > 0;
    const parteContainerClasses = `media-container parte-container ${hasPublicEvents ? 'align-stretch' : 'align-center'}`;


    return (
        <div className="memorial-page-wrapper">
            {lightboxImage && <div className="lightbox" onClick={() => setLightboxImage(null)}><img src={lightboxImage} alt="Vollbildansicht" /></div>}
            {showSideBySideLightbox && (
                <div className="lightbox" onClick={() => setShowSideBySideLightbox(false)}>
                    <div className="lightbox-side-by-side">
                        <img src={pageData.memorial_picture_url} alt="Gedenkbild Vorderseite" />
                        <img src={pageData.memorial_picture_back_url || 'https://placehold.co/350x262/EFEFEF/AAAAAA&text=Rückseite'} alt="Gedenkbild Rückseite" />
                    </div>
                </div>
            )}
            
            <aside className="quick-links">
                <a href="#abschied" onClick={(e) => handleHeroLinkClick(e, 'abschied')} title="Mein Abschied">🕊️</a>
                <a href="#leben" onClick={(e) => { e.preventDefault(); /* Scroll zu 'Mein Leben' kann hier hinzugefügt werden */ }} title="Mein Leben">📖</a>
                <a href="#kondolieren" onClick={(e) => handleHeroLinkClick(e, 'kondolieren')} title="Kondolieren">✍️</a>
            </aside>

            <header className="hero-section" style={heroStyle}>
                <div className="hero-overlay"></div>
                <div className="hero-content">
                    <div className="info-box">
                        <div className="info-text">
                            <p className="deceased-title">IN GEDENKEN AN</p>
                            <h1 className="deceased-name">{pageData.first_name} {pageData.last_name}</h1>
                            <p className="deceased-dates">
                                * {formatDate(pageData.date_of_birth)} &nbsp;&nbsp; † {formatDate(pageData.date_of_death)}
                            </p>
                        </div>
                        <img className="profile-photo" src={pageData.main_photo_url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Profilbild von ${pageData.first_name}`} />
                    </div>
                    <nav className="tab-navigation">
                        <button onClick={(e) => handleHeroLinkClick(e, 'abschied')}>Abschied</button>
                        <button>Mein Leben</button>
                        <button onClick={(e) => handleHeroLinkClick(e, 'kondolieren')}>Kondolieren</button>
                    </nav>
                </div>
            </header>
            
            <section id="farewell-section" ref={farewellSectionRef} className={farewellSectionClasses} style={farewellStyle}>
                <div className="farewell-grid">
                    <div className="farewell-title-area">
                        <h2>Abschied nehmen</h2>
                        <p>UND KONDOLIEREN</p>
                    </div>
                    <div className={`farewell-main-content ${!hasPublicEvents ? 'centered-layout' : ''}`}>
                        {pageData.obituary_card_image_url && (
                            <div className={parteContainerClasses}>
                                <img src={pageData.obituary_card_image_url} alt="Partezettel" className="obituary-card" onClick={() => setLightboxImage(pageData.obituary_card_image_url)} />
                            </div>
                        )}
                        <div className="right-column">
                            <div className="right-column-top">
                                {pageData.acknowledgement_type === 'text' && pageData.acknowledgement_text && (
                                    <div className="acknowledgement-text-container">
                                        <p>{pageData.acknowledgement_text}</p>
                                    </div>
                                )}
                                {pageData.acknowledgement_type === 'image' && pageData.acknowledgement_image_url && (
                                    <div className="media-container">
                                        <img src={pageData.acknowledgement_image_url} alt="Danksagung" className="acknowledgement-image" onClick={() => setLightboxImage(pageData.acknowledgement_image_url)} />
                                    </div>
                                )}
                                {pageData.show_memorial_picture && pageData.memorial_picture_url && (
                                    <div className="media-container gedenkbild-container">
                                        <div className="flip-card-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                            <div className="zoom-button" onClick={openSideBySideLightbox}>🔍</div>
                                            <div className={`flip-card-inner ${isCardFlipped ? 'is-flipped' : ''}`}>
                                                <div className="flip-card-front">
                                                    <img src={pageData.memorial_picture_url} alt="Gedenkbild Vorderseite" />
                                                </div>
                                                <div className="flip-card-back">
                                                    <img src={pageData.memorial_picture_back_url || 'https://placehold.co/350x262/EFEFEF/AAAAAA&text=Rückseite'} alt="Gedenkbild Rückseite" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                            {hasPublicEvents && (
                                <div className="farewell-events-area">
                                    <h3>Termine</h3>
                                    {pageData.events.filter(e => e.is_public).map(event => {
                                        const { day, month, time } = formatEventDate(event.date);
                                        return (
                                            <div key={event.id} className="event-info-line">
                                                <div className="event-date-display">
                                                    <span className="event-day">{day}</span>
                                                    <span className="event-month">{month}</span>
                                                </div>
                                                <div className="event-details-display">
                                                    <strong>{event.title}</strong>
                                                    <span>{time} Uhr{event.show_location && event.location && `, ${event.location.name}`}</span>
                                                </div>
                                            </div>
                                        );
                                    })}
                                </div>
                            )}
                        </div>
                    </div>
                    <div className="farewell-actions-area">
                        <button onClick={() => toggleExpandedView('condolences')}>
                            Kondolenz schreiben {pageData.condolence_count > 0 && `(${pageData.condolence_count})`}
                        </button>
                        <button onClick={() => toggleExpandedView('candles')}>Kerze anzünden</button>
                        <button onClick={() => toggleExpandedView('events')}>Termine</button>
                    </div>
                </div>
            </section>

            <div ref={expandAreaRef}>
                {expandedView && (
                    <InlineExpandArea
                        view={expandedView}
                        pageData={pageData}
                        settings={settings}
                        onDataReload={fetchPageData}
                    />
                )}
            </div>
        </div>
    );
};

export default MemorialPage;
