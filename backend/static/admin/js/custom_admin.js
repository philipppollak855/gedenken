// backend/static/admin/js/custom_admin.js

document.addEventListener('DOMContentLoaded', function() {
    // HINZUGEFÜGT: Verschiebt die Modals an das Ende des Body.
    // Dies ist der robusteste Weg, um zu verhindern, dass sie von anderen Elementen
    // mit "overflow: hidden" abgeschnitten werden.
    document.querySelectorAll('.modal').forEach(modal => {
        document.body.appendChild(modal);
    });

    // Live-Uhr
    function updateTime() {
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        const formattedDateTime = now.toLocaleString('de-AT', options);
        const timeElement = document.getElementById('current-datetime');
        if (timeElement) {
            timeElement.textContent = formattedDateTime;
        }
    }
    setInterval(updateTime, 1000);
    updateTime();

    // Globale Variable für Kalender-Events, die vom Template gefüllt wird
    const events = window.calendarEvents || [];

    const calendarModal = document.getElementById('calendar-modal');
    const openCalendarBtn = document.getElementById('open-calendar-modal');
    const calendarBody = document.getElementById('calendar-body');
    const monthYearEl = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventListPopup = document.getElementById('event-list-popup');
    let currentDate = new Date();

    function renderCalendar() {
        if (!monthYearEl || !calendarBody) return; // Sicherstellen, dass die Elemente existieren
        calendarBody.innerHTML = '';
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        monthYearEl.textContent = `${currentDate.toLocaleString('de-DE', { month: 'long' })} ${year}`;

        const firstDayOfMonth = new Date(year, month, 1).getDay();
        const daysInMonth = new Date(year, month + 1, 0).getDate();

        const dayOffset = (firstDayOfMonth === 0) ? 6 : firstDayOfMonth - 1;

        for (let i = 0; i < dayOffset; i++) {
            calendarBody.innerHTML += `<div></div>`;
        }

        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            dayEl.classList.add('calendar-day');
            
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) {
                dayEl.classList.add('today');
            }

            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            // KORRIGIERT: Fügt eine Prüfung hinzu, um den "startsWith of undefined" Fehler zu verhindern.
            const dayEvents = events.filter(e => e && e.date && e.date.startsWith(dateStr));

            if (dayEvents.length > 0) {
                dayEl.classList.add('has-events');
                dayEl.onclick = () => showEventsForDay(dayEvents, dayEl);
            }
            calendarBody.appendChild(dayEl);
        }
    }
    
    function showEventsForDay(dayEvents, dayEl) {
        eventListPopup.innerHTML = '';
        const list = document.createElement('ul');
        dayEvents.forEach(event => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = event.url;
            // KORRIGIERT: Verwendet jetzt event.time, das vom Backend korrekt bereitgestellt wird.
            link.textContent = `${event.time} - ${event.title}`;
            item.appendChild(link);
            list.appendChild(item);
        });
        eventListPopup.appendChild(list);
        
        // Positionieren und anzeigen
        dayEl.appendChild(eventListPopup);
        eventListPopup.style.display = 'block';

        // Event Listener, um das Popup zu schließen, wenn man woanders hinklickt
        setTimeout(() => {
            document.addEventListener('click', function hidePopup(e) {
                if (!dayEl.contains(e.target)) {
                    eventListPopup.style.display = 'none';
                    document.removeEventListener('click', hidePopup);
                }
            });
        }, 0);
    }

    if (openCalendarBtn) {
        openCalendarBtn.onclick = () => { if(calendarModal) { calendarModal.style.display = 'block'; renderCalendar(); }};
    }
    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    }
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
    }
    
    const widgetModal = document.getElementById('widget-modal');
    const widgetModalTitle = document.getElementById('widget-modal-title');
    const widgetModalBody = document.getElementById('widget-modal-body');

    document.querySelectorAll('.toggle-widget-icon').forEach(icon => {
        icon.addEventListener('click', function() {
            const widget = this.closest('.dashboard-widget');
            const title = widget.querySelector('h2').textContent;
            const contentSource = widget.querySelector('.widget-content-source');
            
            if (contentSource && widgetModal && widgetModalTitle && widgetModalBody) {
                widgetModalTitle.textContent = title;
                widgetModalBody.innerHTML = '';
                widgetModalBody.appendChild(contentSource.cloneNode(true));
                widgetModalBody.firstChild.style.display = 'flex';
                widgetModal.style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) {
            closeBtn.onclick = () => { modal.style.display = 'none'; };
        }
        window.addEventListener('click', (event) => {
            if (event.target == modal) {
                modal.style.display = 'none';
            }
        });
    });

    document.body.addEventListener('input', function(event) {
        if (event.target.matches('.filter-input')) {
            const filterValue = event.target.value.toLowerCase();
            const targetListId = event.target.dataset.target;
            const list = document.getElementById(targetListId) || (widgetModalBody ? widgetModalBody.querySelector(`#${targetListId}`) : null);

            if (list) {
                list.querySelectorAll('li, .list-item-link').forEach(item => { // Sucht nach li oder dem a-tag
                    const text = item.textContent.toLowerCase();
                    const parentLink = item.closest('.list-item-link') || item;
                    if (text.includes(filterValue)) {
                        parentLink.style.display = '';
                    } else {
                        parentLink.style.display = 'none';
                    }
                });
            }
        }
    });
});

