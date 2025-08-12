// frontend/src/modules/gedenken/InlineExpandArea.jsx
// STARK ERWEITERT: Kerzen-Paginierung und komplett neuer, detaillierter Terminbereich.
// KORRIGIERT: ESLint-Warnung bezüglich fehlender Abhängigkeiten im useEffect-Hook behoben.

import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import useApi from '../../hooks/useApi';
import AuthContext from '../../context/AuthContext';
import './InlineExpandArea.css';

const ArrowIcon = ({ direction = 'right' }) => (
    <svg xmlns="http://www.w3.org/2000/svg" className="h-10 w-10" fill="none" viewBox="0 0 24 24" stroke="currentColor" style={{ transform: direction === 'left' ? 'rotate(180deg)' : 'none' }}>
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
    </svg>
);

const CondolenceCard = ({ condolence, onClick, style }) => {
    const [isOverflowing, setIsOverflowing] = useState(false);
    const messageRef = useRef(null);

    useLayoutEffect(() => {
        const element = messageRef.current;
        if (element) {
            if (element.scrollHeight > element.clientHeight) {
                setIsOverflowing(true);
            } else {
                setIsOverflowing(false);
            }
        }
    }, [condolence.message]);

    const isShortText = condolence.message.length < 120;

    return (
        <div className="inline-condolence-card" onClick={onClick} style={{...style, '--card-bg': style.backgroundColor || 'white'}}>
            <h4>{condolence.guest_name}</h4>
            <div className="inline-condolence-card-message-wrapper">
                <p 
                    ref={messageRef} 
                    className={`inline-condolence-card-message ${isShortText ? 'short-text' : ''}`}
                >
                    {condolence.message}
                </p>
                {isOverflowing && (
                    <div className="read-more-fade">
                        klicken für weiterlesen
                    </div>
                )}
            </div>
            <p className="inline-condolence-card-date">{new Date(condolence.created_at).toLocaleDateString('de-DE')}</p>
        </div>
    );
};

const CondolenceListItem = ({ condolence, style }) => (
     <div className="inline-condolence-list-item" style={style}>
        <div className="inline-list-item-header">
            <h4>{condolence.guest_name}</h4>
            <span>{new Date(condolence.created_at).toLocaleString('de-DE')}</span>
        </div>
        <p>{condolence.message}</p>
    </div>
);

const MemorialCandleDisplay = ({ candle, onClick, isAnniversary, isBirthday }) => {
    let specialDayText = null;
    if (isAnniversary) {
        specialDayText = `${isAnniversary}. Todestag`;
    } else if (isBirthday) {
        specialDayText = "Geburtstagskerze";
    }

    const message = candle.message || "In stillem Gedenken.";
    const isLongMessage = message.length > 70;

    return (
        <div className="memorial-candle" onClick={onClick}>
            {specialDayText && <div className="special-day-banner">{specialDayText}</div>}
            <div className="memorial-candle-image-wrapper">
                <img src={candle.candle_image_url || 'https://placehold.co/200x300/ffffff/3a3a3a?text=?'} alt="Gedenkkerze" />
            </div>
            <div className="candle-info">
                <strong>{candle.guest_name}</strong>
                <p>
                    {isLongMessage ? `${message.substring(0, 70)}...` : message}
                    {isLongMessage && <span className="read-more-candle"> weiter lesen...</span>}
                </p>
                <span>{new Date(candle.created_at).toLocaleDateString('de-DE')}</span>
            </div>
        </div>
    );
};

const EventCard = ({ event, pageData }) => {
    if (!event.is_public) {
        return null;
    }

    const eventDate = new Date(event.date);
    const day = eventDate.toLocaleDateString('de-DE', { day: '2-digit' });
    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' });
    const weekday = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const time = eventDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

    const handleSaveToCalendar = () => {
        const formatDateForICS = (date) => {
            return date.toISOString().replace(/[-:]/g, '').split('.')[0] + 'Z';
        }
        const startDate = formatDateForICS(eventDate);
        const endDate = formatDateForICS(new Date(eventDate.getTime() + (60 * 60 * 1000)));

        const icsContent = [
            'BEGIN:VCALENDAR',
            'VERSION:2.0',
            'BEGIN:VEVENT',
            `UID:${event.id}@gedenkseite.at`,
            `DTSTAMP:${formatDateForICS(new Date())}`,
            `DTSTART:${startDate}`,
            `DTEND:${endDate}`,
            `SUMMARY:${event.title} für ${pageData.first_name} ${pageData.last_name}`,
            `DESCRIPTION:${event.description.replace(/\n/g, '\\n')}`,
            `LOCATION:${event.location.name}, ${event.location.address}`,
            'END:VEVENT',
            'END:VCALENDAR'
        ].join('\r\n');

        const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `${event.title}.ics`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleNavigation = () => {
        const query = encodeURIComponent(event.location.address || event.location.name);
        window.open(`https://www.google.com/maps/search/?api=1&query=${query}`, '_blank');
    };

    return (
        <div className="event-card">
            <div className="event-date-box">
                <span className="day">{day}</span>
                <span className="month">{month}</span>
            </div>
            <div className="event-details">
                <div className="event-header">
                    <div>
                        <h3>{event.title}</h3>
                        <div className="event-time-location">
                            <span className="weekday-time">{weekday}, {time} Uhr</span>
                            {event.show_location && event.location && (
                                <span className="location-info">{event.location.name}</span>
                            )}
                        </div>
                    </div>
                    <div className="event-actions">
                         {event.show_location && event.location?.address && (
                            <button onClick={handleNavigation} className="action-button nav-button">Navigation</button>
                         )}
                        <button onClick={handleSaveToCalendar} className="action-button calendar-button">Im Kalender speichern</button>
                    </div>
                </div>
                <div className="event-info-grid">
                    {event.show_dresscode && event.dresscode && (
                        <div className="info-item">
                            <strong>Kleidung:</strong>
                            <span>{event.dresscode}</span>
                        </div>
                    )}
                    {event.show_condolence_note && event.condolence_note && (
                        <div className="info-item">
                            <strong>Kondolenz:</strong>
                            <span>{event.condolence_note}</span>
                        </div>
                    )}
                    {event.show_donation_info && event.donation_for && (
                         <div className="info-item info-item-full">
                            <strong>Spende:</strong>
                            <span>Anstelle von Blumen bitten wir um eine Spende zugunsten von: <strong>{event.donation_for}</strong></span>
                        </div>
                    )}
                </div>
                {event.description && <p className="event-description">{event.description}</p>}
            </div>
        </div>
    );
};

const SearchPopup = ({ onSearch, onClose, pageData, onResultClick }) => {
    const [searchName, setSearchName] = useState('');
    const [searchText, setSearchText] = useState('');
    const [searchDate, setSearchDate] = useState('');
    const [results, setResults] = useState([]);

    const handleSearch = () => {
        const filtered = pageData.condolences.filter(c => {
            const nameMatch = searchName ? c.guest_name.toLowerCase().includes(searchName.toLowerCase()) : true;
            const textMatch = searchText ? c.message.toLowerCase().includes(searchText.toLowerCase()) : true;
            const dateMatch = searchDate ? new Date(c.created_at).toLocaleDateString('de-DE').includes(searchDate) : true;
            return nameMatch && textMatch && dateMatch;
        });
        setResults(filtered);
    };

    return (
        <div className="popup-overlay" onClick={onClose}>
            <div className="popup-content search-popup" onClick={e => e.stopPropagation()}>
                <h3>Eintrag suchen</h3>
                <div className="search-form">
                    <input type="text" value={searchName} onChange={e => setSearchName(e.target.value)} placeholder="Nach Name suchen..." />
                    <input type="text" value={searchText} onChange={e => setSearchText(e.target.value)} placeholder="Nach Text suchen..." />
                    <input type="text" value={searchDate} onChange={e => setSearchDate(e.target.value)} placeholder="Nach Datum suchen (TT.MM.JJJJ)..." />
                    <button onClick={handleSearch}>Suchen</button>
                </div>
                <div className="search-results">
                    {results.map(condolence => (
                        <div key={condolence.condolence_id} className="search-result-card" onClick={() => onResultClick(condolence)}>
                            <strong>{condolence.guest_name}</strong>
                            <p>{condolence.message.substring(0, 50)}...</p>
                            <span>{new Date(condolence.created_at).toLocaleDateString('de-DE')}</span>
                        </div>
                    ))}
                </div>
                <div className="popup-actions">
                    <button type="button" onClick={onClose}>Schließen</button>
                </div>
            </div>
        </div>
    );
};


const InlineExpandArea = ({ view, pageData, settings, onDataReload }) => {
    const [condolenceView, setCondolenceView] = useState('cards');
    const [showCondolencePopup, setShowCondolencePopup] = useState(false);
    const [currentPage, setCurrentPage] = useState(0);
    const [selectedCondolence, setSelectedCondolence] = useState(null);
    const [templates, setTemplates] = useState([]);
    const [message, setMessage] = useState('');
    
    const [showCandlePopup, setShowCandlePopup] = useState(false);
    const [candleTemplates, setCandleTemplates] = useState([]);
    const [candleImages, setCandleImages] = useState([]);
    const [selectedCandleImageId, setSelectedCandleImageId] = useState(null);
    const [candleMessage, setCandleMessage] = useState('');
    const [selectedCandle, setSelectedCandle] = useState(null);
    const [candleCurrentPage, setCandleCurrentPage] = useState(0);

    const [showSearchPopup, setShowSearchPopup] = useState(false);
    const navBarRef = useRef(null);

    const api = useApi();
    const { user } = useContext(AuthContext);
    const carouselRef = useRef(null);

    useEffect(() => {
        const fetchCandleData = async () => {
            try {
                const [templatesRes, imagesRes] = await Promise.all([
                    api('/candle-message-templates/'),
                    api('/candle-images/')
                ]);
                if (templatesRes.ok) setCandleTemplates(await templatesRes.json());
                if (imagesRes.ok) setCandleImages(await imagesRes.json());
            } catch (error) {
                console.error("Fehler beim Laden der Kerzen-Daten:", error);
            }
        };
        const fetchCondolenceTemplates = async () => {
            try {
                const response = await api('/condolence-templates/');
                if (response.ok) {
                    setTemplates(await response.json());
                }
            } catch (error) {
                console.error("Fehler beim Laden der Vorlagen:", error);
            }
        };
        
        fetchCandleData();
        fetchCondolenceTemplates();

        const observer = new IntersectionObserver(
            ([entry]) => {
                if (navBarRef.current) {
                    navBarRef.current.style.opacity = entry.isIntersecting ? '1' : '0';
                    navBarRef.current.style.visibility = entry.isIntersecting ? 'visible' : 'hidden';
                }
            },
            { rootMargin: "0px", threshold: 0.1 }
        );

        const currentCarousel = carouselRef.current;
        if (currentCarousel) {
            observer.observe(currentCarousel);
        }

        return () => {
            if (currentCarousel) {
                observer.unobserve(currentCarousel);
            }
        };

    }, [api, carouselRef, navBarRef]);

    const handleTemplateChange = (e) => {
        setMessage(e.target.value);
    };

    const condolencesPerPage = 8;
    const pageCount = Math.ceil((pageData.condolences?.length || 0) / condolencesPerPage);

    const handlePageChange = (direction) => {
        const newPage = direction === 'next'
            ? (currentPage + 1) % pageCount
            : (currentPage - 1 + pageCount) % pageCount;
        setCurrentPage(newPage);
    };
    
    const candlesPerPage = 24;
    const candlePageCount = Math.ceil((pageData.candles?.length || 0) / candlesPerPage);

    const handleCandlePageChange = (direction) => {
        setCandleCurrentPage(prev => {
            if (direction === 'next') {
                return (prev + 1) % candlePageCount;
            }
            return (prev - 1 + candlePageCount) % candlePageCount;
        });
    };

    const handleCondolenceSubmit = async (e) => {
        e.preventDefault();
        const body = {
            guest_name: e.target.guestName.value,
            message: message,
        };
        try {
            const response = await api(`/memorial-pages/${pageData.slug}/condolences/`, { 
                method: 'POST', 
                body: JSON.stringify(body) 
            });

            if (response.ok) {
                const successMessage = pageData.condolence_moderation === 'not_moderated'
                    ? "Vielen Dank für Ihren Eintrag."
                    : "Vielen Dank für Ihren Eintrag. Er wird nach Prüfung freigeschaltet.";
                alert(successMessage);
                
                setShowCondolencePopup(false);
                setMessage('');
                onDataReload();
            } else {
                const errorData = await response.json();
                alert(`Fehler: ${errorData.detail || JSON.stringify(errorData)}`);
            }
        } catch (error) {
            console.error("Fehler beim Senden der Kondolenz:", error);
            alert("Ein Netzwerkfehler ist aufgetreten.");
        }
    };

    const handleCandleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedCandleImageId) {
            alert("Bitte wählen Sie eine Kerze aus.");
            return;
        }
        const body = {
            guest_name: e.target.guestName.value,
            message: candleMessage,
            candle_image_id: selectedCandleImageId,
        };
        try {
            const response = await api(`/memorial-pages/${pageData.slug}/candles/`, { method: 'POST', body: JSON.stringify(body) });
            if (response.ok) {
                alert("Vielen Dank, Ihre Kerze wurde angezündet.");
                setShowCandlePopup(false);
                setCandleMessage('');
                setSelectedCandleImageId(null);
                onDataReload();
            } else {
                alert(`Fehler: ${JSON.stringify(await response.json())}`);
            }
        } catch (error) {
            console.error("Fehler beim Anzünden der Kerze:", error);
        }
    };
    
    const openCondolenceLightbox = (condolence) => {
        setSelectedCondolence(condolence);
    };

    const handleSearchResultClick = (condolence) => {
        setShowSearchPopup(false);
        openCondolenceLightbox(condolence);
    };

    const today = new Date();
    const isBirthday = today.getDate() === new Date(pageData.date_of_birth).getDate() && today.getMonth() === new Date(pageData.date_of_birth).getMonth();
    const yearsSinceDeath = today.getFullYear() - new Date(pageData.date_of_death).getFullYear();
    const isAnniversary = today.getDate() === new Date(pageData.date_of_death).getDate() && today.getMonth() === new Date(pageData.date_of_death).getMonth() && yearsSinceDeath > 0;
    
    const getAvailableCandles = () => {
        if (isBirthday) return candleImages.filter(c => c.type === 'birthday' || c.type === 'standard');
        if (isAnniversary) return candleImages.filter(c => c.type === 'anniversary' || c.type === 'standard');
        return candleImages.filter(c => c.type === 'standard');
    };

    const areaStyle = {
        backgroundColor: settings?.expend_background_color || '#f4f1ee',
        backgroundImage: settings?.expend_background_image_url ? `url(${settings.expend_background_image_url})` : 'none',
        color: settings?.expend_text_color || '#3a3a3a',
        '--bg-color': settings?.expend_background_color || '#f4f1ee'
    };
    const cardStyle = { backgroundColor: settings?.expend_card_color || '#ffffff' };

    const renderContent = () => {
        switch (view) {
            case 'condolences':
                return (
                    <>
                        <div className="inline-view-controls">
                            <h3>Kondolenzbuch</h3>
                            <div>
                                <button onClick={() => setShowSearchPopup(true)} className="nav-button">Eintrag suchen</button>
                                <button onClick={() => setCondolenceView('cards')} className={condolenceView === 'cards' ? 'active' : ''}>Karten</button>
                                <button onClick={() => setCondolenceView('list')} className={condolenceView === 'list' ? 'active' : ''}>Liste</button>
                            </div>
                        </div>
                        {condolenceView === 'cards' ? (
                            <div className="inline-cards-view">
                                <div ref={navBarRef} className="wide-nav-bar">
                                    <button onClick={() => handlePageChange('prev')} disabled={pageCount <= 1}><ArrowIcon direction="left" /></button>
                                    <button onClick={() => handlePageChange('next')} disabled={pageCount <= 1}><ArrowIcon direction="right" /></button>
                                </div>
                                <div 
                                    className="inline-condolence-carousel" 
                                    ref={carouselRef}
                                    style={{ transform: `translateX(-${currentPage * 100}%)` }}
                                >
                                    {Array.from({ length: pageCount || 1 }).map((_, pageIndex) => (
                                        <div className="inline-condolence-page" key={pageIndex}>
                                            {pageData.condolences.slice(pageIndex * condolencesPerPage, (pageIndex + 1) * condolencesPerPage).map(c => (
                                                <CondolenceCard key={c.condolence_id} condolence={c} onClick={() => openCondolenceLightbox(c)} style={cardStyle} />
                                            ))}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className="inline-list-view">
                               {pageData.condolences.map(c => <CondolenceListItem key={c.condolence_id} condolence={c} style={cardStyle} />)}
                            </div>
                        )}
                        <div className="inline-action-button-container">
                            <button className="inline-prominent-button" onClick={() => setShowCondolencePopup(true)}>Kondolenz schreiben</button>
                        </div>
                    </>
                );
            case 'candles':
                return (
                    <>
                        <div className="inline-view-controls">
                            <h3>Gedenkkerzen ({pageData.candle_count || 0})</h3>
                        </div>
                        <div className="inline-cards-view">
                             <button onClick={() => handleCandlePageChange('prev')} className="inline-nav-arrow left" disabled={candlePageCount <= 1}><ArrowIcon direction="left" /></button>
                             <div className="inline-condolence-carousel" style={{ transform: `translateX(-${candleCurrentPage * 100}%)` }}>
                                {Array.from({ length: candlePageCount || 1 }).map((_, pageIndex) => (
                                    <div className="memorial-candle-page" key={pageIndex}>
                                        {pageData.candles.slice(pageIndex * candlesPerPage, (pageIndex + 1) * candlesPerPage).map(candle => {
                                            const candleDate = new Date(candle.created_at);
                                            const candleIsBirthday = candleDate.getDate() === new Date(pageData.date_of_birth).getDate() && candleDate.getMonth() === new Date(pageData.date_of_birth).getMonth();
                                            const candleYearsSinceDeath = candleDate.getFullYear() - new Date(pageData.date_of_death).getFullYear();
                                            const candleIsAnniversary = candleDate.getDate() === new Date(pageData.date_of_death).getDate() && candleDate.getMonth() === new Date(pageData.date_of_death).getMonth() && candleYearsSinceDeath > 0;

                                            return (
                                                <MemorialCandleDisplay 
                                                    key={candle.candle_id} 
                                                    candle={candle} 
                                                    onClick={() => setSelectedCandle(candle)}
                                                    isBirthday={candleIsBirthday}
                                                    isAnniversary={candleIsAnniversary ? candleYearsSinceDeath : null}
                                                />
                                            );
                                        })}
                                    </div>
                                ))}
                             </div>
                             <button onClick={() => handleCandlePageChange('next')} className="inline-nav-arrow right" disabled={candlePageCount <= 1}><ArrowIcon direction="right" /></button>
                        </div>
                        <div className="inline-action-button-container">
                            <button className="inline-prominent-button" onClick={() => setShowCandlePopup(true)}>Gedenkkerze anzünden</button>
                        </div>
                    </>
                );
            case 'events':
                return (
                    <>
                        <div className="inline-view-controls">
                            <h3>Termine</h3>
                        </div>
                        <div className="event-list">
                            {pageData.events.length > 0 ? (
                                pageData.events.map(event => <EventCard key={event.id} event={event} pageData={pageData} />)
                            ) : (
                                <p className="placeholder-content">Derzeit sind keine öffentlichen Termine bekannt.</p>
                            )}
                        </div>
                    </>
                );
            default: return null;
        }
    };

    return (
        <>
            <section className="inline-expand-area" style={areaStyle}>
                {renderContent()}
            </section>

            {showCondolencePopup && (
                <div className="popup-overlay">
                    <div className="popup-content">
                        <h3>Kondolenz verfassen</h3>
                        <form onSubmit={handleCondolenceSubmit}>
                            <input 
                                type="text" 
                                name="guestName" 
                                placeholder="Ihr Vor- & Nachname oder Familienname" 
                                defaultValue={(user && user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : ''} 
                                required 
                            />
                            <select onChange={handleTemplateChange} defaultValue="">
                                <option value="" disabled>Oder eine Vorlage auswählen...</option>
                                {templates.map(t => <option key={t.title} value={t.text}>{t.title}</option>)}
                            </select>
                            <textarea 
                                name="message" 
                                rows="8" 
                                placeholder="Ihre persönliche Nachricht..." 
                                value={message} 
                                onChange={(e) => setMessage(e.target.value)} 
                                required
                            ></textarea>
                            <div className="popup-actions">
                                <button type="button" onClick={() => setShowCondolencePopup(false)}>Abbrechen</button>
                                <button type="submit">Senden</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {showCandlePopup && (
                <div className="popup-overlay">
                    <div className="popup-content candle-popup">
                        <h3>Gedenkkerze anzünden</h3>
                        <p className="popup-helper-text">Wählen Sie eine Kerze aus und hinterlassen Sie eine kurze Botschaft für die Angehörigen.</p>
                        <form onSubmit={handleCandleSubmit}>
                            <div className="candle-selection">
                                {getAvailableCandles().map(candle => (
                                    <div 
                                        key={candle.id} 
                                        className={`candle-option ${selectedCandleImageId === candle.id ? 'selected' : ''}`}
                                        onClick={() => setSelectedCandleImageId(candle.id)}
                                    >
                                        <img src={candle.image_url} alt={candle.name} />
                                        <span>{candle.name}</span>
                                    </div>
                                ))}
                            </div>

                            <input type="text" name="guestName" placeholder="Ihr Name oder Familie" defaultValue={(user && user.first_name && user.last_name) ? `${user.first_name} ${user.last_name}` : ''} required />
                            <select onChange={(e) => setCandleMessage(e.target.value)} defaultValue="">
                                <option value="" disabled>Nachrichtenvorlage auswählen...</option>
                                {candleTemplates.map(t => <option key={t.title} value={t.text}>{t.title}</option>)}
                            </select>
                            <input type="text" placeholder="Oder eigene kurze Botschaft" value={candleMessage} onChange={(e) => setCandleMessage(e.target.value)} maxLength="100" />
                            
                            <div className="popup-actions">
                                <button type="button" onClick={() => setShowCandlePopup(false)}>Abbrechen</button>
                                <button type="submit">Kerze anzünden</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
            
            {selectedCondolence && (
                <div className="lightbox-overlay" onClick={() => setSelectedCondolence(null)}>
                    <div className="lightbox-content" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedCondolence(null)} className="close-button lightbox-close">&times;</button>
                        <div className="lightbox-main">
                            <h3>{selectedCondolence.guest_name}</h3>
                            <p>{selectedCondolence.message}</p>
                            <span>{new Date(selectedCondolence.created_at).toLocaleString('de-DE')}</span>
                        </div>
                    </div>
                </div>
            )}

            {selectedCandle && (
                 <div className="lightbox-overlay" onClick={() => setSelectedCandle(null)}>
                    <div className="lightbox-content candle-lightbox" onClick={e => e.stopPropagation()}>
                        <button onClick={() => setSelectedCandle(null)} className="close-button lightbox-close">&times;</button>
                        <div className="candle-lightbox-image-wrapper">
                            <img src={selectedCandle.candle_image_url} alt="Gedenkkerze" />
                        </div>
                        <div className="lightbox-main">
                            <h3>{selectedCandle.guest_name}</h3>
                            <p>{selectedCandle.message || "In stillem Gedenken."}</p>
                            <span>Angezündet am {new Date(selectedCandle.created_at).toLocaleString('de-DE')}</span>
                        </div>
                    </div>
                 </div>
            )}

            {showSearchPopup && (
                <SearchPopup 
                    onClose={() => setShowSearchPopup(false)}
                    pageData={pageData}
                    onResultClick={handleSearchResultClick}
                />
            )}
        </>
    );
};

export default InlineExpandArea;
