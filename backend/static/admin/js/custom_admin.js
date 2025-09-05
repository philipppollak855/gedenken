// backend/static/admin/js/custom_admin.js

/**
 * Diese Datei enthält die gesamte Logik für die interaktiven
 * Dashboard-Elemente. Sie ist so aufgebaut, dass sie mit der
 * dynamischen Turbo-Navigation von Unfold kompatibel ist.
 */

// #####################################################################
// # Event Listeners Setup
// #####################################################################

// Initialisiert alles beim ersten Laden der Seite.
document.addEventListener('DOMContentLoaded', () => {
    moveModalsToBody();
    setupGlobalEventListeners();
    initializePageFeatures();
});

// Initialisiert die seiten-spezifischen Features bei jeder Turbo-Navigation neu.
document.addEventListener("turbo:load", initializePageFeatures);

/**
 * Richtet einmalige, globale Event-Listener ein, die durch Event-Delegation
 * robust auf Klicks im gesamten Dokument reagieren.
 */
function setupGlobalEventListeners() {
    if (document.body.hasAttribute('data-global-listeners-attached')) return;
    document.body.setAttribute('data-global-listeners-attached', 'true');

    document.body.addEventListener('click', function(e) {
        handleGlobalClicks(e);
    });

    initializeFilters();
}

/**
 * Initialisiert Funktionen, die bei jedem (Neu-)Aufbau der Seite ausgeführt werden müssen.
 */
function initializePageFeatures() {
    initializeSideDock();
    initializeCalendar();
    initializeWidgetModals();
    initializeModalLinks();
    addDashboardButton();
    updateTime();
}


// #####################################################################
// # Zentrale Klick-Verarbeitung (Event Delegation)
// #####################################################################

function handleGlobalClicks(e) {
    const sideDockTrigger = e.target.closest('#side-dock-trigger');
    const navWheelOverlay = e.target.id === 'nav-wheel-overlay' ? e.target : null;
    const modal = e.target.closest('.modal');
    const closeModalButton = e.target.closest('.close-modal');

    // 1. Navigationsrad öffnen/schließen
    if (sideDockTrigger) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('side-dock-container')?.classList.toggle('active');
        document.getElementById('nav-wheel-overlay')?.classList.toggle('active');
        return;
    }

    // 2. Navigationsrad durch Klick auf Overlay schließen
    if (navWheelOverlay) {
        navWheelOverlay.classList.remove('active');
        document.getElementById('side-dock-container')?.classList.remove('active');
        return;
    }

    // 3. Jedes Modal schließen (Klick auf 'X' oder außerhalb des Inhalts)
    if (closeModalButton || e.target === modal) {
        if (modal) {
            modal.style.display = 'none';
            if (modal.id === 'iframe-modal') {
                const iframe = document.getElementById('content-iframe');
                if (iframe) iframe.src = 'about:blank';
            }
        }
    }
}


// #####################################################################
// # Initialisierungsfunktionen für spezifische Features
// #####################################################################

/**
 * Bindet Klick-Events an alle Links, die in einem Modal geöffnet werden sollen.
 * Überprüft, ob der Listener bereits existiert, um Duplikate zu vermeiden.
 */
function initializeModalLinks() {
    document.querySelectorAll('.quick-links a, .stat-item-link, .event-card-link').forEach(link => {
        if (link.hasAttribute('data-modal-listener')) return;
        link.setAttribute('data-modal-listener', 'true');
        link.addEventListener('click', function(e) {
            e.preventDefault();
            const url = this.href;
            const title = this.dataset.modalTitle || this.textContent.trim() || 'Eintrag ansehen';
            openInIframeModal(url, title);
        });
    });
}

/**
 * Initialisiert das Kalender-Modal und seine Steuerelemente.
 */
function initializeCalendar() {
    const calendarModal = document.getElementById('calendar-modal');
    const calendarIcon = document.getElementById('open-calendar-modal');
    if (!calendarModal || !calendarIcon) return;

    // Direkter Klick-Listener für das Icon
    if (!calendarIcon.hasAttribute('data-click-listener')) {
        calendarIcon.setAttribute('data-click-listener', 'true');
        calendarIcon.addEventListener('click', () => {
            calendarModal.style.display = 'flex'; // Zentriert das Modal
            if (window.renderCalendar) window.renderCalendar();
        });
    }
    
    // ... (Restlicher Kalender-Code bleibt gleich, da er intern funktioniert) ...
    const events = window.calendarEvents || [];
    const calendarBody = document.getElementById('calendar-body');
    const monthYearEl = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventListPopup = document.getElementById('event-list-popup');
    let currentDate = new Date();

    window.renderCalendar = function() {
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
        eventListPopup.innerHTML = '<ul></ul>';
        const list = eventListPopup.querySelector('ul');
        dayEvents.forEach(event => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = event.url;
            link.innerHTML = `<strong>${event.time}</strong><span>${event.title}</span>`;
            item.appendChild(link);
            list.appendChild(item);
        });
        const rect = dayEl.getBoundingClientRect();
        const calendarRect = calendarModal.querySelector('.modal-content').getBoundingClientRect();
        eventListPopup.style.display = 'block';
        eventListPopup.style.top = `${rect.top - calendarRect.top}px`;
        if ((rect.left + rect.width + eventListPopup.offsetWidth) < calendarRect.right) {
            eventListPopup.style.left = `${rect.left - calendarRect.left + rect.width + 10}px`;
             if (eventListPopup.querySelector('::before')) eventListPopup.querySelector('::before').style.right = '100%';
        } else {
            eventListPopup.style.left = `${rect.left - calendarRect.left - eventListPopup.offsetWidth - 10}px`;
             if (eventListPopup.querySelector('::before')) eventListPopup.querySelector('::before').style.left = '100%';
        }
    }
     if (prevMonthBtn && !prevMonthBtn.hasAttribute('data-listener')) {
         prevMonthBtn.setAttribute('data-listener', 'true');
         prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); window.renderCalendar(); };
    }
    if (nextMonthBtn && !nextMonthBtn.hasAttribute('data-listener')) {
        nextMonthBtn.setAttribute('data-listener', 'true');
        nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); window.renderCalendar(); };
    }
}


/**
 * Bindet Klick-Events an die Vergrößerungs-Icons der Widgets.
 */
function initializeWidgetModals() {
    document.querySelectorAll('.toggle-widget-icon').forEach(icon => {
        if (icon.hasAttribute('data-click-listener')) return;
        icon.setAttribute('data-click-listener', 'true');

        icon.addEventListener('click', function() {
            const widgetModal = document.getElementById('widget-modal');
            const widgetModalTitle = document.getElementById('widget-modal-title');
            const widgetModalBody = document.getElementById('widget-modal-body');
            const widget = this.closest('.dashboard-widget');
            const title = widget.querySelector('h2').textContent;
            const contentSource = widget.querySelector('.widget-content-source');
            
            if (contentSource && widgetModal && widgetModalTitle && widgetModalBody) {
                widgetModalTitle.textContent = title;
                widgetModalBody.innerHTML = ''; 
                const clonedContent = contentSource.cloneNode(true);
                clonedContent.style.display = 'flex';
                widgetModalBody.appendChild(clonedContent);
                widgetModal.style.display = 'flex'; // WICHTIG: flex für Zentrierung
            }
        });
    });
}

/**
 * Richtet den Filter-Input ein. Funktioniert global über Delegation.
 */
function initializeFilters() {
    if (document.body.hasAttribute('data-filter-listener')) return;
    document.body.setAttribute('data-filter-listener', 'true');

    document.body.addEventListener('input', function(event) {
        if (event.target.matches('.filter-input')) {
            const filterValue = event.target.value.toLowerCase();
            const list = event.target.closest('.widget-content-source, #widget-modal-body').querySelector('.activity-list');
            if (list) {
                list.querySelectorAll('li, .activity-item').forEach(item => {
                    item.style.display = item.textContent.toLowerCase().includes(filterValue) ? '' : 'none';
                });
            }
        }
    });
}

/**
 * Erstellt das Navigationsrad. Wird nur einmal ausgeführt.
 */
function initializeSideDock() {
    const dockContainer = document.getElementById('side-dock-container');
    if (!dockContainer || dockContainer.hasAttribute('data-initialized')) return;
    dockContainer.setAttribute('data-initialized', 'true');

    // ... (restlicher Code für das Navigationsrad bleibt identisch) ...
    const wheelContainer = document.getElementById('wheel-container');
    const searchModal = document.getElementById('global-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    
    const navData = {
        id: 'main',
        items: [
            { id: 'logout', label: 'Logout', icon: 'fa-sign-out-alt', url: '/admin/logout/' },
            { id: 'search', label: 'Suchen', icon: 'fa-search', action: 'openSearch' },
            { id: 'home', label: 'Dashboard', icon: 'fa-home', url: '/admin/' },
            { id: 'verwaltung', label: 'Hauptverwaltung', icon: 'fa-users-cog', children: [
                { id: 'users', label: 'Benutzer', icon: 'fa-users', url: '/admin/api/user/' },
                { id: 'releases', label: 'Freigabe-Anfragen', icon: 'fa-key', url: '/admin/api/releaserequest/' },
                { id: 'familylinks', label: 'Familien-Verknüpfungen', icon: 'fa-link', url: '/admin/api/familylink/' },
            ]},
            { id: 'gedenken', label: 'Gedenken', icon: 'fa-book-dead', children: [
                { id: 'pages', label: 'Gedenkseiten', icon: 'fa-book-open', url: '/admin/api/memorialpage/' },
                { id: 'events', label: 'Termine', icon: 'fa-calendar-alt', url: '/admin/api/memorialevent/' },
                { id: 'condolences', label: 'Kondolenzen', icon: 'fa-comment-dots', url: '/admin/api/condolence/' },
                { id: 'candles', label: 'Gedenkkerzen', icon: 'fa-lightbulb', url: '/admin/api/memorialcandle/' },
            ]},
            { id: 'vorsorge', label: 'Vorsorge', icon: 'fa-file-invoice', children: [
                 { id: 'lastwishes', label: 'Letzte Wünsche', icon: 'fa-hand-holding-heart', url: '/admin/api/lastwishes/' },
                 { id: 'documents', label: 'Dokumente', icon: 'fa-file-alt', url: '/admin/api/document/' },
                 { id: 'contracts', label: 'Verträge', icon: 'fa-file-signature', url: '/admin/api/contractitem/' },
                 { id: 'insurances', label: 'Versicherungen', icon: 'fa-shield-alt', url: '/admin/api/insuranceitem/' },
                 { id: 'financials', label: 'Finanzen', icon: 'fa-euro-sign', url: '/admin/api/financialitem/' },
                 { id: 'digitallegacy', label: 'Digitaler Nachlass', icon: 'fa-cloud', url: '/admin/api/digitallegacyitem/' },
            ]},
            { id: 'stammdaten', label: 'Stammdaten', icon: 'fa-database', children: [
                { id: 'locations', label: 'Orte', icon: 'fa-map-marker-alt', url: '/admin/api/eventlocation/' },
                { id: 'condolence-tpl', label: 'Kondolenz-Vorlagen', icon: 'fa-paste', url: '/admin/api/condolencetemplate/' },
                { id: 'candle-img', label: 'Kerzen-Bilder', icon: 'fa-image', url: '/admin/api/candleimage/' },
                { id: 'candle-msg-tpl', label: 'Kerzen-Nachrichten', icon: 'fa-comment-alt', url: '/admin/api/candlemessagetemplate/' },
            ]},
             { id: 'design', label: 'Design & Medien', icon: 'fa-palette', children: [
                { id: 'settings', label: 'Globale Einstellungen', icon: 'fa-sliders-h', url: '/admin/api/sitesettings/' },
                { id: 'media', label: 'Mediathek', icon: 'fa-photo-video', url: '/admin/api/mediaasset/' },
            ]},
        ]
    };
    
    function createWheel(items, parentId = null, parentData = null) {
        // ... Logik zum Erstellen des Rads bleibt unverändert ...
        const wheel = document.createElement('div');
        const wheelId = parentId ? `wheel-${parentId}` : 'main-wheel';
        wheel.id = wheelId;
        wheel.className = 'nav-wheel';
        wheelContainer.appendChild(wheel);
        const radius = 150;
        let effectiveItems = [...items];
        if (parentId) {
            const backButton = document.createElement('button');
            backButton.className = 'wheel-center-button';
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;
            backButton.onclick = () => showWheel(parentData ? parentData.id === 'main' ? 'main-wheel' : `wheel-${parentData.id}` : 'main-wheel');
            wheel.appendChild(backButton);
        } else {
             const centerLogo = document.createElement('div');
             centerLogo.className = 'wheel-center-button';
             centerLogo.innerHTML = `<i class="fas fa-star"></i>`;
             wheel.appendChild(centerLogo);
        }
        const angleStep = (2 * Math.PI) / effectiveItems.length;
        effectiveItems.forEach((item, index) => {
            const angle = index * angleStep - (Math.PI / 2);
            const x = Math.cos(angle) * radius + 170;
            const y = Math.sin(angle) * radius + 170;
            const wheelItem = document.createElement('a');
            wheelItem.className = 'wheel-item';
            wheelItem.style.left = `${x}px`;
            wheelItem.style.top = `${y}px`;
            wheelItem.innerHTML = `<i class="fas ${item.icon}"></i><span class="wheel-item-label">${item.label}</span>`;
            if (item.action === 'openSearch') {
                wheelItem.onclick = openSearchModal;
            } else if (item.url) {
                 wheelItem.href = item.url;
                 if (item.id !== 'logout' && item.url !== '/admin/') {
                     wheelItem.addEventListener('click', function(e) {
                         e.preventDefault();
                         openInIframeModal(this.href, item.label);
                     });
                 }
            } else if (item.children) {
                wheelItem.onclick = () => showWheel(`wheel-${item.id}`);
                createWheel(item.children, item.id, {id: parentId || 'main'});
            }
            wheel.appendChild(wheelItem);
        });
        return wheel;
    }

    function showWheel(wheelId) {
        document.querySelectorAll('.nav-wheel').forEach(w => w.classList.remove('active'));
        const wheelToShow = document.getElementById(wheelId);
        if (wheelToShow) {
            wheelToShow.classList.add('active');
        }
    }
    
    function openSearchModal() {
        if(searchModal) searchModal.style.display = 'flex';
        if(searchInput) searchInput.focus();
        document.getElementById('nav-wheel-overlay')?.classList.remove('active');
        document.getElementById('side-dock-container')?.classList.remove('active');
    }

    wheelContainer.innerHTML = '';
    createWheel(navData.items, null, navData);
    showWheel('main-wheel');

     if (searchInput && !searchInput.hasAttribute('data-listener')) {
         searchInput.setAttribute('data-listener', 'true');
         searchInput.addEventListener('input', (e) => {
             // ... Suchlogik bleibt unverändert ...
         });
     }
}

// --- Hilfsfunktionen ---
function updateTime() { /* ... unverändert ... */ }
function moveModalsToBody() { /* ... unverändert ... */ }

