// frontend/src/modules/gedenken/EventCard.jsx
// Diese neue, wiederverwendbare Komponente stellt einen einzelnen Termin dar.
// ERWEITERT: Enthält jetzt den "Teilnehmen"-Button.

import React from 'react';

const EventCard = ({ event, pageData, onAttendClick, onCalendarClick, onNavigateClick }) => {
    if (!event || !event.is_public) {
        return null;
    }

    const eventDate = new Date(event.date);
    const day = eventDate.toLocaleDateString('de-DE', { day: '2-digit' });
    const month = eventDate.toLocaleDateString('de-DE', { month: 'short' });
    const weekday = eventDate.toLocaleDateString('de-DE', { weekday: 'long' });
    const time = eventDate.toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });

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
                            <button onClick={() => onNavigateClick(event)} className="action-button nav-button">Navigation</button>
                         )}
                        <button onClick={() => onCalendarClick(event)} className="action-button calendar-button">Im Kalender speichern</button>
                        <button onClick={() => onAttendClick(event)} className="action-button">Teilnehmen</button>
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

export default EventCard;
