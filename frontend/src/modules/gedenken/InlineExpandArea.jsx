// frontend/src/modules/gedenken/InlineExpandArea.jsx
// ERWEITERT: Fügt die Logik und das Markup für die neuen Sektionen "Chronik", "Galerie" und "Geschichten" hinzu.
// AKTUALISIERT: Bild-URLs werden jetzt aus der neuen, verschachtelten API-Struktur geladen (z.B. item.image.url).

import React, { useState, useEffect, useContext, useRef, useLayoutEffect } from 'react';
import useApi from '../../hooks/useApi';
import AuthContext from '../../context/AuthContext';
import EventCard from './EventCard';
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
                <img src={candle.candle_image?.image?.url || 'https://placehold.co/200x300/ffffff/3a3a3a?text=?'} alt="Gedenkkerze" />
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

const SearchPopup = ({ onClose, pageData, onResultClick }) => {
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

const TimelineView = ({ timelineEvents, style }) => (
    <div className="inline-list-view" style={style}>
        {timelineEvents && timelineEvents.length > 0 ? (
            timelineEvents.map(event => (
                <div key={event.event_id} className="inline-condolence-list-item">
                    <div className="inline-list-item-header">
                        <h4>{new Date(event.date).toLocaleDateString('de-DE', { year: 'numeric', month: 'long' })} - {event.title}</h4>
                    </div>
                    <p>{event.description}</p>
                </div>
            ))
        ) : (
            <p className="placeholder-content">Es wurden noch keine Einträge in der Chronik hinterlegt.</p>
        )}
    </div>
);

const GalleryView = ({ galleryItems, style }) => (
    <div className="inline-gallery-view" style={style}>
        {galleryItems && galleryItems.length > 0 ? (
            galleryItems.map(item => (
                <div key={item.item_id} className="gallery-image-container">
                    <img src={item.image?.url} alt={item.caption || 'Galeriebild'} />
                    {item.caption && <p>{item.caption}</p>}
                </div>
            ))
        ) : (
            <p className="placeholder-content">Es sind noch keine Bilder in der Galerie vorhanden.</p>
        )}
    </div>
);

const StoriesView = ({ style }) => (
    <div className="inline-list-view" style={style}>
        <div className="placeholder-content">
            <h3>Geschichten & Anekdoten</h3>
            <p>Hier könnten bald geteilte Geschichten und Erinnerungen erscheinen.</p>
        </div>
    </div>
);


const InlineExpandArea = ({ view, pageData, settings, onDataReload, onAttendClick, onCalendarClick, onNavigateClick }) => {
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

    const api = useApi();
    const { user } = useContext(AuthContext);

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

    }, [api]);

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
    const candlesPerPage = 15;
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
        if (!candleImages) return [];
        if (isBirthday) return candleImages.filter(c => c.type === 'birthday' || c.type === 'standard');
        if (isAnniversary) return candleImages.filter(c => c.type === 'anniversary' || c.type === 'standard');
        return candleImages.filter(c => c.type === 'standard');
    };

    const areaStyle = {
        backgroundColor: settings?.expend_background_color || '#f4f1ee',
        backgroundImage: settings?.expend_background_image?.url ? `url(${settings.expend_background_image.url})` : 'none',
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
                                <button onClick={() => setCondolenceView('cards')} className={condolenceView === 'cards' ? 'active' : ''}>Karten</button>
                                <button onClick={() => setCondolenceView('list')} className={condolenceView === 'list' ? 'active' : ''}>Liste</button>
                                <button onClick={() => setShowSearchPopup(true)} className="nav-button">Eintrag suchen</button>
                            </div>
                        </div>
                        {condolenceView === 'cards' ? (
                            <div className="inline-cards-view">
                                <button onClick={() => handlePageChange('prev')} className="inline-nav-arrow left" disabled={pageCount <= 1}><ArrowIcon direction="left" /></button>
                                <div 
                                    className="inline-condolence-carousel"
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
                                <button onClick={() => handlePageChange('next')} className="inline-nav-arrow right" disabled={pageCount <= 1}><ArrowIcon direction="right" /></button>
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
                                pageData.events.map(event => 
                                    <EventCard 
                                        key={event.id} 
                                        event={event} 
                                        pageData={pageData} 
                                        onAttendClick={onAttendClick}
                                        onCalendarClick={onCalendarClick}
                                        onNavigateClick={onNavigateClick}
                                    />
                                )
                            ) : (
                                <p className="placeholder-content">Derzeit sind keine öffentlichen Termine bekannt.</p>
                            )}
                        </div>
                    </>
                );
            case 'chronik':
                return (
                    <>
                        <div className="inline-view-controls"><h3>Chronik des Lebens</h3></div>
                        <TimelineView timelineEvents={pageData.timeline_events} style={cardStyle} />
                    </>
                );
            case 'galerie':
                return (
                    <>
                        <div className="inline-view-controls"><h3>Galerie der Erinnerungen</h3></div>
                        <GalleryView galleryItems={pageData.gallery_items} style={cardStyle} />
                    </>
                );
            case 'geschichten':
                return (
                     <>
                        <div className="inline-view-controls"><h3>Geteilte Geschichten</h3></div>
                        <StoriesView style={cardStyle} />
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
                 <div className="popup-overlay" onClick={() => setShowCondolencePopup(false)}>
                    <div className="popup-content" onClick={e => e.stopPropagation()}>
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
                <div className="popup-overlay" onClick={() => setShowCandlePopup(false)}>
                    <div className="popup-content candle-popup" onClick={e => e.stopPropagation()}>
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
                                        <img src={candle.image?.url} alt={candle.name} />
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
                        <button onClick={() => setSelectedCondolence(null)} className="close-button lightbox-close">×</button>
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
                        <button onClick={() => setSelectedCandle(null)} className="close-button lightbox-close">×</button>
                        <div className="candle-lightbox-image-wrapper">
                            <img src={selectedCandle.candle_image?.image?.url} alt="Gedenkkerze" />
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

