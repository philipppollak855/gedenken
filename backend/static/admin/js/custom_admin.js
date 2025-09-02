// backend/static/admin/js/custom_admin.js
// ... (existing code from previous steps) ...
// NEU: Fügt die Logik für die Dock-Navigation hinzu.

document.addEventListener('DOMContentLoaded', function() {
    // NEU: Sidebar standardmäßig einklappen
    if (!document.body.classList.contains('sidebar-collapse')) {
        document.body.classList.add('sidebar-collapse');
    }

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

    // Header-Navigation
    function addHeaderNavigation() {
        const headerActionsContainer = document.querySelector('header .flex.items-center.gap-x-4');
        if (!headerActionsContainer) return;

        const navContainer = document.createElement('div');
        navContainer.className = 'header-navigation-tools';

        const backButton = document.createElement('button');
        backButton.innerHTML = '<i class="fas fa-arrow-left"></i>';
        backButton.title = 'Zurück';
        backButton.onclick = () => window.history.back();
        backButton.className = 'btn';

        const forwardButton = document.createElement('button');
        forwardButton.innerHTML = '<i class="fas fa-arrow-right"></i>';
        forwardButton.title = 'Vorwärts';
        forwardButton.onclick = () => window.history.forward();
        forwardButton.className = 'btn';
        
        const homeLink = document.createElement('a');
        homeLink.href = '/admin/';
        homeLink.title = 'Dashboard';
        homeLink.className = 'btn';
        homeLink.innerHTML = '<i class="fas fa-home"></i>';

        navContainer.appendChild(backButton);
        navContainer.appendChild(forwardButton);
        navContainer.appendChild(homeLink);

        headerActionsContainer.prepend(navContainer);
    }
    addHeaderNavigation();

    // Kalender-Logik
    const events = window.calendarEvents || [];
    const calendarModal = document.getElementById('calendar-modal');
    // ... (rest of the calendar logic remains unchanged) ...
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
        const calendarGrid = document.querySelector('.calendar-grid-container');
        if (calendarGrid) {
            calendarGrid.appendChild(eventListPopup);
            eventListPopup.style.left = `${dayEl.offsetLeft + dayEl.offsetWidth}px`;
            eventListPopup.style.top = `${dayEl.offsetTop}px`;
            eventListPopup.style.display = 'block';
        }
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
    
    document.body.addEventListener('click', (e) => {
        if(eventListPopup && !eventListPopup.contains(e.target) && !e.target.classList.contains('has-events')) {
             eventListPopup.style.display = 'none';
        }
    }, true);

    // Widget Modal & Filter Logic
    // ... (this part remains unchanged) ...
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
                
                const filterInputInModal = clonedContent.querySelector('.filter-input');
                if (filterInputInModal) {
                    filterInputInModal.addEventListener('input', handleFilter);
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
    
    const handleFilter = (event) => {
        const inputElement = event.target;
        const filterValue = inputElement.value.toLowerCase();
        const targetListId = inputElement.dataset.target;
        const container = inputElement.closest('.widget-modal-content') || inputElement.closest('.dashboard-widget');
        
        if (container) {
            const list = container.querySelector(`#${targetListId}`);
            if (list) {
                list.querySelectorAll('li.activity-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(filterValue) ? '' : 'none';
                });
            }
        }
    };
    
    document.querySelectorAll('.filter-input').forEach(input => {
        input.addEventListener('input', handleFilter);
    });

    // NEU: Logik für Dock-Navigation
    const dockTrigger = document.getElementById('dock-trigger');
    const navWheelContainer = document.getElementById('nav-wheel-container');
    const navWheelToggle = document.getElementById('nav-wheel-toggle');

    function toggleNavWheel(show) {
        if (show) {
            navWheelContainer.classList.add('active');
            const items = navWheelContainer.querySelectorAll('.wheel-item');
            const numItems = items.length;
            const angle = 360 / numItems;
            const radius = 150; // Radius in px
            items.forEach((item, index) => {
                const rotation = angle * index;
                const transform = `rotate(${rotation}deg) translate(${radius}px) rotate(${-rotation}deg)`;
                item.style.transitionDelay = `${index * 50}ms`;
                item.style.transform = transform;
            });
        } else {
            navWheelContainer.classList.remove('active');
            navWheelContainer.querySelectorAll('.wheel-item').forEach(item => {
                item.style.transform = 'scale(0)';
                item.style.transitionDelay = '0ms';
            });
        }
    }

    if (dockTrigger && navWheelContainer && navWheelToggle) {
        dockTrigger.addEventListener('click', () => toggleNavWheel(true));
        navWheelToggle.addEventListener('click', () => toggleNavWheel(false));
        
        // Klick außerhalb schließt das Rad
        navWheelContainer.addEventListener('click', function(e) {
            if (e.target === navWheelContainer) {
                toggleNavWheel(false);
            }
        });
    }

});

