// frontend/src/modules/gedenken/MemorialPage.jsx
// ERWEITERT: Verwendet die neuen _url-Felder aus dem Serializer.

import React, { useState, useEffect, useCallback, useContext, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import AuthContext from '../../context/AuthContext';
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
    const { user } = useContext(AuthContext);
    const expandAreaRef = useRef(null);

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
    };

    const fetchPageData = useCallback(async () => {
        setIsLoading(true);
        try {
            const [pageRes, settingsRes] = await Promise.all([
                 fetch(`http://localhost:8000/api/memorial-pages/${slug}/`),
                 fetch('http://localhost:8000/api/settings/')
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
        backgroundImage: pageData.hero_background_image_url ? `url(${pageData.hero_background_image_url})` : 'none',
        backgroundSize: pageData.hero_background_size || 'cover',
    };

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
                <a href="#abschied" onClick={(e) => { e.preventDefault(); document.getElementById('farewell-section')?.scrollIntoView({ behavior: 'smooth' }); }} title="Mein Abschied">🕊️</a>
                <a href="#leben" onClick={(e) => { e.preventDefault(); /* Scroll zu 'Mein Leben' kann hier hinzugefügt werden */ }} title="Mein Leben">📖</a>
                <a href="#kondolieren" onClick={(e) => { e.preventDefault(); toggleExpandedView('condolences'); }} title="Kondolieren">✍️</a>
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
                        <button>Mein Abschied</button>
                        <button>Mein Leben</button>
                        <button onClick={() => toggleExpandedView('condolences')}>Kondolieren</button>
                    </nav>
                </div>
            </header>
            
            <section id="farewell-section" className="farewell-section" style={farewellStyle}>
                <div className="farewell-grid">
                    <div className="farewell-title-area">
                        <h2>Abschied nehmen</h2>
                        <p>UND KONDOLIEREN</p>
                    </div>
                    <div className="farewell-media-area">
                        {pageData.obituary_card_image_url && (
                            <div className="media-container parte-container">
                                <div className="media-label">Parte</div>
                                <img src={pageData.obituary_card_image_url} alt="Partezettel" className="obituary-card" onClick={() => setLightboxImage(pageData.obituary_card_image_url)} />
                                <small className="media-helper-text">Klicken zum Vergrößern</small>
                            </div>
                        )}
                        
                        {pageData.acknowledgement_type === 'text' && pageData.acknowledgement_text && (
                            <div className="acknowledgement-text-container">
                                <p>{pageData.acknowledgement_text}</p>
                            </div>
                        )}
                        {pageData.acknowledgement_type === 'image' && pageData.acknowledgement_image_url && (
                            <div className="media-container">
                                <div className="media-label">Danksagung</div>
                                <img src={pageData.acknowledgement_image_url} alt="Danksagung" className="acknowledgement-image" onClick={() => setLightboxImage(pageData.acknowledgement_image_url)} />
                                <small className="media-helper-text">Klicken zum Vergrößern</small>
                            </div>
                        )}

                        {pageData.show_memorial_picture && pageData.memorial_picture_url && (
                            <div className="media-container gedenkbild-container">
                                <div className="media-label">Gedenkbild</div>
                                <div className="flip-card-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                    <div className="zoom-button" onClick={openSideBySideLightbox}>&#x26F6;</div>
                                    <div className={`flip-card-inner ${isCardFlipped ? 'is-flipped' : ''}`}>
                                        <div className="flip-card-front">
                                            <img src={pageData.memorial_picture_url} alt="Gedenkbild Vorderseite" />
                                        </div>
                                        <div className="flip-card-back">
                                            <img src={pageData.memorial_picture_back_url || 'https://placehold.co/350x262/EFEFEF/AAAAAA&text=Rückseite'} alt="Gedenkbild Rückseite" />
                                        </div>
                                    </div>
                                </div>
                                <small className="media-helper-text">Klicken zum Umblättern</small>
                            </div>
                        )}
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
