// backend/static/admin/js/custom_admin.js
// ... (existing code from previous steps) ...
// KORREKTUR: Logik für die verschachtelte Rad-Navigation, um die Positionierung zu verbessern.

document.addEventListener('DOMContentLoaded', function() {
    // ... (unveränderte Setup-Funktionen wie Sidebar-Kollaps, moveModalsToBody, updateTime, addHeaderNavigation) ...
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
    
    // ... (unveränderte Kalender-, Widget-Modal- und Filter-Logik) ...
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
        for (let i = 0; i < dayOffset; i++) { calendarBody.innerHTML += `<div></div>`; }
        for (let day = 1; day <= daysInMonth; day++) {
            const dayEl = document.createElement('div');
            dayEl.textContent = day;
            dayEl.classList.add('calendar-day');
            const today = new Date();
            if (day === today.getDate() && month === today.getMonth() && year === today.getFullYear()) { dayEl.classList.add('today'); }
            const dateStr = `${year}-${String(month + 1).padStart(2, '0')}-${String(day).padStart(2, '0')}`;
            const dayEvents = events.filter(e => e.date && e.date.startsWith(dateStr));
            if (dayEvents.length > 0) {
                dayEl.classList.add('has-events');
                dayEl.onclick = (e) => { e.stopPropagation(); showEventsForDay(dayEvents, dayEl); };
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
    if (openCalendarBtn) { openCalendarBtn.onclick = () => { if(calendarModal) calendarModal.style.display = 'block'; renderCalendar(); }; }
    if (prevMonthBtn) { prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); }; }
    if (nextMonthBtn) { nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); }; }
    document.body.addEventListener('click', (e) => {
        if(eventListPopup && !eventListPopup.contains(e.target) && !e.target.classList.contains('has-events')) { eventListPopup.style.display = 'none'; }
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
                const filterInputInModal = clonedContent.querySelector('.filter-input');
                if (filterInputInModal) { filterInputInModal.addEventListener('input', handleFilter); }
            }
        });
    });
    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn) { closeBtn.onclick = () => { modal.style.display = 'none'; }; }
        window.addEventListener('click', (event) => { if (event.target == modal) { modal.style.display = 'none'; } });
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
    document.querySelectorAll('.filter-input').forEach(input => { input.addEventListener('input', handleFilter); });

    // KORREKTUR: Logik für seitliche Dock-Navigation
    const sideDockContainer = document.getElementById('side-dock-container');
    const dockTrigger = document.getElementById('side-dock-trigger');
    const navWheelOverlay = document.getElementById('nav-wheel-overlay');

    const navData = {
        'main': [
            { id: 'verwaltung', icon: 'fa-cog', label: 'Hauptverwaltung', children: 'verwaltung_sub' },
            { id: 'gedenken', icon: 'fa-book-dead', label: 'Gedenken', children: 'gedenken_sub' },
            { id: 'vorsorge', icon: 'fa-file-invoice', label: 'Vorsorge', children: 'vorsorge_sub' },
            { id: 'stammdaten', icon: 'fa-database', label: 'Stammdaten', children: 'stammdaten_sub' },
            { id: 'design', icon: 'fa-sliders-h', label: 'Design', children: 'design_sub' },
            { id: 'mediathek', icon: 'fa-photo-video', label: 'Mediathek', url: '/admin/api/mediaasset/' },
            { id: 'logout', icon: 'fa-sign-out-alt', label: 'Logout', url: '/admin/logout/' }
        ],
        'verwaltung_sub': [
            { icon: 'fa-users', label: 'Benutzer', url: '/admin/api/user/' },
            { icon: 'fa-users-cog', label: 'Gruppen', url: '/admin/auth/group/' },
            { icon: 'fa-key', label: 'Freigaben', url: '/admin/api/releaserequest/' },
        ],
        'gedenken_sub': [
             { icon: 'fa-book-dead', label: 'Gedenkseiten', url: '/admin/api/memorialpage/' },
             { icon: 'fa-comment-dots', label: 'Kondolenzen', url: '/admin/api/condolence/' },
             { icon: 'fa-candle-holder', label: 'Gedenkkerzen', url: '/admin/api/memorialcandle/' },
             { icon: 'fa-calendar-alt', label: 'Termine', url: '/admin/api/memorialevent/' },
             { icon: 'fa-images', label: 'Galerien', url: '/admin/api/galleryitem/' },
             { icon: 'fa-stream', label: 'Chroniken', url: '/admin/api/timelineevent/' },
        ],
         'vorsorge_sub': [
            { icon: 'fa-hand-holding-heart', label: 'Letzte Wünsche', url: '/admin/api/lastwishes/' },
            { icon: 'fa-file-alt', label: 'Dokumente', url: '/admin/api/document/' },
            { icon: 'fa-file-signature', label: 'Verträge', url: '/admin/api/contractitem/' },
            { icon: 'fa-shield-alt', label: 'Versicherungen', url: '/admin/api/insuranceitem/' },
            { icon: 'fa-euro-sign', label: 'Finanzen', url: '/admin/api/financialitem/' },
            { icon: 'fa-cloud', label: 'Digitaler Nachlass', url: '/admin/api/digitallegacyitem/' },
        ],
        'stammdaten_sub': [
            { icon: 'fa-map-marker-alt', label: 'Orte', url: '/admin/api/eventlocation/' },
            { icon: 'fa-image', label: 'Kerzenbilder', url: '/admin/api/candleimage/' },
            { icon: 'fa-comment-alt', label: 'Kerzen-Vorlagen', url: '/admin/api/candlemessagetemplate/' },
            { icon: 'fa-paste', label: 'Kondolenz-Vorlagen', url: '/admin/api/condolencetemplate/' },
        ],
        'design_sub': [
             { icon: 'fa-palette', label: 'Globale Einstellungen', url: '/admin/api/sitesettings/1/change/' },
        ],
    };

    function createWheel(items, level, backTargetKey = null) {
        const wheel = document.createElement('div');
        wheel.className = `nav-wheel level-${level}`;
        wheel.dataset.level = level;
        
        const centerButton = document.createElement('button');
        centerButton.className = 'wheel-center-button';
        centerButton.innerHTML = `<i class="fas ${backTargetKey ? 'fa-arrow-left' : 'fa-times'}"></i>`;
        centerButton.onclick = () => {
            if (backTargetKey) {
                showWheel(backTargetKey);
            } else {
                toggleNav(false);
            }
        };
        wheel.appendChild(centerButton);
        
        items.forEach(item => {
            const element = document.createElement(item.url ? 'a' : 'button');
            element.className = 'wheel-item';
            if (item.url) element.href = item.url;
            element.innerHTML = `<i class="fas ${item.icon}"></i><span class="wheel-item-label">${item.label}</span>`;
            
            if (item.children) {
                element.onclick = () => showWheel(item.children, level + 1, item.id);
            }
            wheel.appendChild(element);
        });
        return wheel;
    }

    function positionItemsOnWheel(wheelElement) {
        const items = wheelElement.querySelectorAll('.wheel-item');
        const numItems = items.length;
        const angle = 360 / numItems;
        const radius = 170;
        items.forEach((item, index) => {
            const rotation = angle * index - 90;
            const transform = `rotate(${rotation}deg) translate(${radius}px) rotate(${-rotation}deg)`;
            item.style.transitionDelay = `${index * 40}ms`;
            item.style.transform = transform;
        });
    }
    
    let wheelCache = {};
    let currentWheelKey = 'main';

    function showWheel(key, level = 1, backTargetKey = null) {
        navWheelOverlay.querySelectorAll('.nav-wheel').forEach(w => w.classList.add('hidden'));

        currentWheelKey = key;

        let wheel = wheelCache[key];
        if (!wheel) {
            const items = navData[key];
            if (!items) return;
            wheel = createWheel(items, level, backTargetKey);
            wheelCache[key] = wheel;
            navWheelOverlay.appendChild(wheel);
        }
        
        setTimeout(() => {
            wheel.classList.remove('hidden');
            wheel.classList.add('active');
            
            // KORREKTUR: Verschiebt das Rad weiter nach links
            if (level === 1) {
                wheel.style.left = 'calc(50% - 150px)';
            } else {
                 wheel.style.left = '50%';
            }
            
            positionItemsOnWheel(wheel);
        }, 50);
    }

    function toggleNav(show) {
        if (show) {
            sideDockContainer.classList.add('active');
            navWheelOverlay.classList.add('active');
            showWheel(currentWheelKey || 'main');
        } else {
            sideDockContainer.classList.remove('active');
            navWheelOverlay.classList.remove('active');
        }
    }
    
    if (dockTrigger && navWheelOverlay) {
        dockTrigger.addEventListener('click', () => {
            const isActive = sideDockContainer.classList.contains('active');
            toggleNav(!isActive);
        });
        navWheelOverlay.addEventListener('click', function(e) {
            if (e.target === navWheelOverlay) {
                toggleNav(false);
            }
        });
    }
});

