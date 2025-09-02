// backend/static/admin/js/custom_admin.js
// KORRIGIERT: Filterfunktion für das vergrößerte Modal repariert.

document.addEventListener('DOMContentLoaded', function() {
    function moveModalsToBody() {
        document.querySelectorAll('.modal').forEach(modal => {
            document.body.appendChild(modal);
        });
    }
    moveModalsToBody();
    
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
        if (!calendarBody || !monthYearEl) return;
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
            const dayEvents = events.filter(e => e.date && e.date.startsWith(dateStr));
            if (dayEvents.length > 0) {
                dayEl.classList.add('has-events');
                dayEl.onclick = (e) => {
                    e.stopPropagation(); 
                    showEventsForDay(dayEvents, dayEl);
                };
            }
            calendarBody.appendChild(dayEl);
        }
    }
    
    function showEventsForDay(dayEvents, dayEl) {
        document.querySelectorAll('#event-list-popup').forEach(p => p.style.display = 'none');
        eventListPopup.innerHTML = '';
        const list = document.createElement('ul');
        dayEvents.forEach(event => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = event.url;
            link.textContent = `${event.time} - ${event.title}`;
            item.appendChild(link);
            list.appendChild(item);
        });
        eventListPopup.appendChild(list);
        dayEl.appendChild(eventListPopup);
        eventListPopup.style.display = 'block';
    }

    if (openCalendarBtn) {
        openCalendarBtn.onclick = () => { if(calendarModal) calendarModal.style.display = 'block'; renderCalendar(); };
    }
    if (prevMonthBtn) {
        prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    }
    if (nextMonthBtn) {
        nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
    }
    
    document.body.addEventListener('click', () => {
        if(eventListPopup && eventListPopup.style.display === 'block') {
             eventListPopup.style.display = 'none';
        }
    }, true);

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
                const clonedContent = contentSource.cloneNode(true);
                clonedContent.style.display = 'flex';
                widgetModalBody.appendChild(clonedContent);
                widgetModal.style.display = 'block';
                
                // KORRIGIERT: Event Listener für das Filter-Input im Modal neu hinzufügen
                const filterInput = clonedContent.querySelector('.filter-input');
                if (filterInput) {
                    filterInput.addEventListener('input', handleFilter);
                }
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
    
    // Filterfunktion ausgelagert
    const handleFilter = (event) => {
        const filterValue = event.target.value.toLowerCase();
        const targetListId = event.target.dataset.target;
        
        // Sucht die Liste sowohl im Dashboard als auch im Modal
        const list = document.getElementById(targetListId) || (widgetModalBody ? widgetModalBody.querySelector(`#${targetListId}`) : null);

        if (list) {
            list.querySelectorAll('.activity-item').forEach(item => { // Stellt sicher, dass nur Listenelemente gefiltert werden
                const text = item.textContent.toLowerCase();
                item.style.display = text.includes(filterValue) ? '' : 'none';
            });
        }
    };
    
    // Event Listener für die ursprünglichen Filter-Inputs auf dem Dashboard
    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', handleFilter);
    });
});
