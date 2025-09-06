// frontend/src/modules/gedenken/MemorialPage.jsx
// ERWEITERT: Fügt einen neuen Hauptbereich "Mein Leben" mit den Expand-Bereichen "Chronik", "Galerie" und "Geschichten" hinzu.
// KORRIGIERT: Scroll-Verhalten zu den Sektionen zentriert und Timing-Problem beim Klick behoben.
// AKTUALISIERT: Bild-URLs werden jetzt aus der neuen, verschachtelten API-Struktur geladen (z.B. pageData.main_photo.url).

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import InlineExpandArea from './InlineExpandArea';
import EventCard from './EventCard';
import './MemorialPage.css';
import useApi from '../../hooks/useApi';

const MemorialPage = () => {
    const [pageData, setPageData] = useState(null);
    const [settings, setSettings] = useState({});
    const [isLoading, setIsLoading] = useState(true);
    const [lightboxImage, setLightboxImage] = useState(null);
    const [showSideBySideLightbox, setShowSideBySideLightbox] = useState(false);
    const [isCardFlipped, setIsCardFlipped] = useState(false);
    const [expandedView, setExpandedView] = useState(null);
    const [showAttendancePopup, setShowAttendancePopup] = useState(false);
    const [selectedEventForAttendance, setSelectedEventForAttendance] = useState(null);
    const [showCalendarPopup, setShowCalendarPopup] = useState(false);
    const [selectedEventForCalendar, setSelectedEventForCalendar] = useState(null);
    const [activeMainView, setActiveMainView] = useState('abschied');
    const { slug } = useParams();
    const api = useApi();
    const expandAreaRef = useRef(null);
    const farewellSectionRef = useRef(null);
    const lifeSectionRef = useRef(null);
    const isInitialMount = useRef(true); // Verhindert Scrollen beim ersten Laden

    const formatDate = (dateString) => {
        if (!dateString) return '';
        return new Date(dateString).toLocaleDateString('de-DE', { day: 'numeric', month: 'long', year: 'numeric' });
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

    useEffect(() => {
        if (isInitialMount.current) {
            isInitialMount.current = false;
            return;
        }
        const targetRef = activeMainView === 'abschied' ? farewellSectionRef : lifeSectionRef;
        targetRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }, [activeMainView]);

    const displayedEvent = useMemo(() => {
        if (!pageData || !pageData.events || pageData.events.length === 0) return null;
        const now = new Date();
        const publicEvents = pageData.events.filter(e => e.is_public);
        const upcomingEvents = publicEvents
            .filter(event => new Date(event.date) > now)
            .sort((a, b) => new Date(a.date) - new Date(b.date));
        if (upcomingEvents.length > 0) return upcomingEvents[0];
        const pastEvents = publicEvents.sort((a, b) => new Date(b.date) - new Date(a.date));
        return pastEvents.length > 0 ? pastEvents[0] : null;
    }, [pageData]);

    const handleHeroLinkClick = (e, view) => {
        e.preventDefault();
        setActiveMainView(view);
    };

    const handleTabClick = (view) => {
        setActiveMainView(view);
        setExpandedView(null);
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

    const handleNavigate = (event) => {
        const query = encodeURIComponent(event.location.address || event.location.name);
        window.open(`https://maps.google.com/?q=${query}`, '_blank');
    };

    const handleAttendClick = (event) => {
        setSelectedEventForAttendance(event);
        setShowAttendancePopup(true);
    };

    const handleAttendanceSubmit = async (e) => {
        e.preventDefault();
        const guestName = e.target.guestName.value;
        if (!guestName || !selectedEventForAttendance) return;
        const response = await api(`/memorial-pages/${slug}/events/${selectedEventForAttendance.id}/attendees/`, {
            method: 'POST',
            body: JSON.stringify({ guest_name: guestName }),
        });
        if (response.ok) {
            alert("Vielen Dank für Ihre Zusage.");
            setShowAttendancePopup(false);
            setSelectedEventForAttendance(null);
        } else {
            alert("Ein Fehler ist aufgetreten. Bitte versuchen Sie es erneut.");
        }
    };

    const handleCalendarClick = (event) => {
        setSelectedEventForCalendar(event);
        setShowCalendarPopup(true);
    };

    const generateIcsFile = (event) => {
        const eventDate = new Date(event.date);
        const formatDateForICS = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const startDate = formatDateForICS(eventDate);
        const endDate = formatDateForICS(new Date(eventDate.getTime() + (60 * 60 * 1000)));
        const icsContent = [
            'BEGIN:VCALENDAR', 'VERSION:2.0', 'BEGIN:VEVENT',
            `UID:${event.id}@gedenkseite.at`, `DTSTAMP:${formatDateForICS(new Date())}`,
            `DTSTART:${startDate}`, `DTEND:${endDate}`,
            `SUMMARY:${event.title} für ${pageData.first_name} ${pageData.last_name}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location.name}, ${event.location.address}`,
            'END:VEVENT', 'END:VCALENDAR'
        ].join('\r\n');
        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.title}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const generateGoogleCalendarUrl = (event) => {
        const eventDate = new Date(event.date);
        const formatDateForGoogle = (date) => date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        const startDate = formatDateForGoogle(eventDate);
        const endDate = formatDateForGoogle(new Date(eventDate.getTime() + (60 * 60 * 1000)));
        const params = new URLSearchParams({
            action: 'TEMPLATE',
            text: `${event.title} für ${pageData.first_name} ${pageData.last_name}`,
            dates: `${startDate}/${endDate}`,
            details: event.description,
            location: `${event.location.name}, ${event.location.address}`,
        });
        return `https://www.google.com/calendar/render?${params.toString()}`;
    };

    if (isLoading) return <div className="loading-spinner"><div className="spinner"></div></div>;
    if (!pageData) return <h1 className="text-center text-2xl font-bold mt-10">Gedenkseite nicht gefunden</h1>;
    
    const isParteVisible = pageData.obituary_card_image?.url;
    const isAcknowledgementVisible = pageData.acknowledgement_type !== 'none' && (pageData.acknowledgement_text || pageData.acknowledgement_image?.url);
    const isMemorialPictureVisible = pageData.show_memorial_picture && pageData.memorial_picture?.url;
    const hasAnyMediaContent = isParteVisible || isAcknowledgementVisible || isMemorialPictureVisible || displayedEvent;
    
    const farewellStyle = {
        backgroundColor: pageData.farewell_background_color || '#6d6d6d',
        backgroundImage: pageData.farewell_background_image?.url ? `url(${pageData.farewell_background_image.url})` : 'none',
        backgroundSize: pageData.farewell_background_size || 'cover',
    };
    const heroStyle = {
        backgroundImage: pageData.hero_background_image?.url ? `url(${pageData.hero_background_image.url})` : `url(https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1)`,
        backgroundSize: pageData.hero_background_size || 'cover',
    };

    const farewellSectionClasses = `farewell-section ${pageData.farewell_text_inverted ? 'text-inverted' : ''}`;

    return (
        <div className="memorial-page-wrapper">
            {lightboxImage && <div className="lightbox" onClick={() => setLightboxImage(null)}><img src={lightboxImage} alt="Vollbildansicht" /></div>}
            {showSideBySideLightbox && (
                <div className="lightbox" onClick={() => setShowSideBySideLightbox(false)}>
                    <div className="lightbox-side-by-side">
                        <img src={pageData.memorial_picture?.url || 'https://placehold.co/350x262/EFEFEF/AAAAAA&text=Bild'} alt="Gedenkbild Vorderseite" />
                        <img src={pageData.memorial_picture_back?.url || 'https://placehold.co/350x262/EFEFEF/AAAAAA&text=Rückseite'} alt="Gedenkbild Rückseite" />
                    </div>
                </div>
            )}
            
            <aside className="quick-links">
                <a href="#abschied" onClick={(e) => handleHeroLinkClick(e, 'abschied')} title="Abschied nehmen">🕊️</a>
                <a href="#leben" onClick={(e) => handleHeroLinkClick(e, 'leben')} title="Mein Leben">📖</a>
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
                        <img className="profile-photo" src={pageData.main_photo?.url || 'https://placehold.co/400x500/EFEFEF/AAAAAA&text=Foto'} alt={`Profilbild von ${pageData.first_name}`} />
                    </div>
                    <nav className="tab-navigation">
                        <button onClick={() => handleTabClick('abschied')} className={activeMainView === 'abschied' ? 'active' : ''}>Abschied nehmen</button>
                        <button onClick={() => handleTabClick('leben')} className={activeMainView === 'leben' ? 'active' : ''}>Mein Leben</button>
                    </nav>
                </div>
            </header>
            
            {activeMainView === 'abschied' && (
                <section id="abschied" ref={farewellSectionRef} className={farewellSectionClasses} style={farewellStyle}>
                    <div className="farewell-grid">
                        <div className="farewell-title-area">
                            <h2>Abschied nehmen</h2>
                            <p>UND KONDOLIEREN</p>
                        </div>
                        <div className="farewell-content-wrapper">
                            <div className="farewell-main-content">
                                {isParteVisible && (
                                    <div className="parte-container">
                                        <img src={pageData.obituary_card_image.url} alt="Partezettel" className="obituary-card" onClick={() => setLightboxImage(pageData.obituary_card_image.url)} />
                                    </div>
                                )}
                                <div className="right-column">
                                    <div className="right-column-top">
                                        {isAcknowledgementVisible && (
                                            <div className="media-container">
                                                {pageData.acknowledgement_type === 'text' ? (
                                                    <div className="acknowledgement-text-container"><p>{pageData.acknowledgement_text}</p></div>
                                                ) : (
                                                    <img src={pageData.acknowledgement_image.url} alt="Danksagung" className="acknowledgement-image" onClick={() => setLightboxImage(pageData.acknowledgement_image.url)} />
                                                )}
                                            </div>
                                        )}
                                        {isMemorialPictureVisible && (
                                            <div className="media-container gedenkbild-container">
                                                <div className="flip-card-container" onClick={() => setIsCardFlipped(!isCardFlipped)}>
                                                    <div className="zoom-button" onClick={openSideBySideLightbox}>🔍</div>
                                                    <div className={`flip-card-inner ${isCardFlipped ? 'is-flipped' : ''}`}>
                                                        <div className="flip-card-front"><img src={pageData.memorial_picture.url} alt="Gedenkbild Vorderseite" /></div>
                                                        <div className="flip-card-back"><img src={pageData.memorial_picture_back.url} alt="Gedenkbild Rückseite" /></div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                    {displayedEvent && (
                                        <div className="farewell-events-area">
                                            <h3>Nächster Termin</h3>
                                            <EventCard 
                                                event={displayedEvent} 
                                                pageData={pageData}
                                                onAttendClick={handleAttendClick}
                                                onCalendarClick={handleCalendarClick}
                                                onNavigateClick={handleNavigate}
                                                isCompact={true}
                                            />
                                        </div>
                                    )}
                                </div>
                            </div>
                            <div className={`farewell-actions-area ${!hasAnyMediaContent ? 'centered-large' : ''}`}>
                                <button onClick={() => toggleExpandedView('condolences')}>
                                    Kondolenz schreiben {pageData.condolence_count > 0 && `(${pageData.condolence_count})`}
                                </button>
                                <button onClick={() => toggleExpandedView('candles')}>
                                    Kerze anzünden {pageData.candle_count > 0 && `(${pageData.candle_count})`}
                                </button>
                                <button onClick={() => toggleExpandedView('events')}>Alle Termine</button>
                            </div>
                        </div>
                    </div>
                </section>
            )}

            {activeMainView === 'leben' && (
                <section id="leben" ref={lifeSectionRef} className={farewellSectionClasses} style={farewellStyle}>
                     <div className="farewell-grid">
                         <div className="farewell-title-area">
                             <h2>Mein Leben</h2>
                             <p>ERINNERUNGEN TEILEN</p>
                         </div>
                         <div className="farewell-content-wrapper centered-large">
                             <div className="farewell-actions-area centered-large">
                                 <button onClick={() => toggleExpandedView('chronik')}>Chronik</button>
                                 <button onClick={() => toggleExpandedView('galerie')}>Galerie</button>
                                 <button onClick={() => toggleExpandedView('geschichten')}>Geschichten</button>
                             </div>
                         </div>
                     </div>
                </section>
            )}

            {showAttendancePopup && (
                <div className="popup-overlay" onClick={() => setShowAttendancePopup(false)}>
                    <div className="popup-content attendance-popup" onClick={e => e.stopPropagation()}>
                        <h3>Teilnahme bestätigen</h3>
                        <p>für: {selectedEventForAttendance?.title}</p>
                        <form onSubmit={handleAttendanceSubmit}>
                            <input type="text" name="guestName" placeholder="Ihr Name" required />
                            <div className="popup-actions">
                                <button type="button" onClick={() => setShowAttendancePopup(false)}>Abbrechen</button>
                                <button type="submit">Zusagen</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCalendarPopup && selectedEventForCalendar && (
                <div className="popup-overlay" onClick={() => setShowCalendarPopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
                        <h3>Termin speichern</h3>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
                            <a href={generateGoogleCalendarUrl(selectedEventForCalendar)} target="_blank" rel="noopener noreferrer" className="action-button">Google Kalender</a>
                            <button onClick={() => generateIcsFile(selectedEventForCalendar)} className="action-button">iCal / Outlook</button>
                            <button onClick={() => generateIcsFile(selectedEventForCalendar)} className="action-button">Apple Kalender</button>
                        </div>
                         <div className="popup-actions">
                            <button type="button" onClick={() => setShowCalendarPopup(false)}>Schließen</button>
                        </div>
                    </div>
                </div>
            )}

            <div ref={expandAreaRef}>
                {expandedView && (
                    <InlineExpandArea
                        view={expandedView}
                        pageData={pageData}
                        settings={settings}
                        onDataReload={fetchPageData}
                        onAttendClick={handleAttendClick}
                        onCalendarClick={handleCalendarClick}
                        onNavigateClick={handleNavigate}
                    />
                )}
            </div>
        </div>
    );
};

export default MemorialPage;

