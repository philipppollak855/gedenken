// backend/static/admin/js/custom_admin.js

/**
 * Diese Datei enthält die gesamte Logik für die interaktiven
 * Dashboard-Elemente. Sie ist so aufgebaut, dass sie mit der
 * dynamischen Turbo-Navigation von Unfold kompatibel ist.
 */

// #####################################################################
// # 1. Funktionsdefinitionen
// #####################################################################

/**
 * Öffnet eine gegebene URL in einem IFrame-Modal.
 */
function openInIframeModal(url, title) {
    const iframeModal = document.getElementById('iframe-modal');
    const iframe = document.getElementById('content-iframe');
    const iframeTitle = document.getElementById('iframe-modal-title');
    if (iframe && iframeModal && iframeTitle) {
        const cleanUrl = url.split('?')[0];
        // Wichtig: _popup=1 sorgt dafür, dass Django die Seite in einer modal-freundlichen Ansicht rendert
        iframe.src = cleanUrl + '?_popup=1'; 
        iframeTitle.textContent = title;
        iframeModal.style.display = 'flex';
    } else {
        window.location.href = url;
    }
}

/**
 * Fügt den "Zum Dashboard" Button auf Unterseiten hinzu.
 */
function addDashboardButton() {
    // Prüfen, ob wir auf der Dashboard-Seite sind
    if (window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin')) {
        // Wenn ja, und ein alter Button existiert, entfernen wir ihn
        const existingBtn = document.querySelector('.dashboard-btn');
        if (existingBtn) existingBtn.remove();
        return; // Nichts weiter tun
    }

    // Auf allen anderen Seiten
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs && !breadcrumbs.querySelector('.dashboard-btn')) {
        const dashboardBtn = document.createElement('a');
        dashboardBtn.href = '/admin/';
        dashboardBtn.textContent = 'Zum Dashboard';
        dashboardBtn.classList.add('dashboard-btn');
        breadcrumbs.appendChild(dashboardBtn);
    }
}


/**
 * Verschiebt alle Modal-Elemente direkt in den Body, um z-index Probleme zu vermeiden.
 */
function moveModalsToBody() {
    document.querySelectorAll('.modal, #side-dock-container').forEach(el => {
        if (el && el.parentNode !== document.body) {
            document.body.appendChild(el);
        }
    });
}

/**
 * Initialisiert und aktualisiert die Live-Uhr im Dashboard.
 */
function updateTime() {
    const timeElement = document.getElementById('current-datetime');
    if (timeElement && !timeElement.hasAttribute('data-interval-id')) {
        const update = () => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            timeElement.textContent = now.toLocaleString('de-AT', options);
        };
        const intervalId = setInterval(update, 1000);
        timeElement.setAttribute('data-interval-id', intervalId);
        update();
    }
}

/**
 * Initialisiert das Kalender-Modal und seine Steuerelemente.
 */
function initializeCalendar() {
    const calendarModal = document.getElementById('calendar-modal');
    if (!calendarModal || calendarModal.hasAttribute('data-initialized')) return;
    calendarModal.setAttribute('data-initialized', 'true');

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
    };
    
    function showEventsForDay(dayEvents, dayEl) {
        document.querySelectorAll('#event-list-popup').forEach(p => p.style.display = 'none');
        
        eventListPopup.innerHTML = '<ul></ul>';
        const list = eventListPopup.querySelector('ul');
        dayEvents.forEach(event => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = event.url;
            link.innerHTML = `<strong>${event.time}</strong><span>${event.title}</span>`;
            link.onclick = (e) => {
                e.preventDefault();
                openInIframeModal(event.url, 'Termin bearbeiten');
            };
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
 * Erstellt das Navigationsrad. Wird nur einmal ausgeführt.
 */
function initializeSideDock() {
    const dockContainer = document.getElementById('side-dock-container');
    if (!dockContainer || dockContainer.hasAttribute('data-initialized')) return;
    dockContainer.setAttribute('data-initialized', 'true');
    
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
        const wheel = document.createElement('div');
        const wheelId = parentId ? `wheel-${parentId}` : 'main-wheel';
        wheel.id = wheelId;
        wheel.className = 'nav-wheel';
        wheelContainer.appendChild(wheel);
        
        const radius = 170;

        if (parentId) {
            const backButton = document.createElement('button');
            backButton.className = 'wheel-center-button';
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;
            backButton.onclick = () => showWheel(parentData ? parentData.id === 'main' ? 'main-wheel' : `wheel-${parentData.id}` : 'main-wheel');
            wheel.appendChild(backButton);
        } else {
             const centerLogo = document.createElement('div');
             centerLogo.className = 'wheel-center-button';
             centerLogo.innerHTML = `<i class="fas fa-times"></i>`;
             centerLogo.onclick = () => {
                 document.getElementById('nav-wheel-overlay')?.classList.remove('active');
                 document.getElementById('side-dock-container')?.classList.remove('active');
             };
             wheel.appendChild(centerLogo);
        }

        const angleStep = (2 * Math.PI) / items.length;
        items.forEach((item, index) => {
            const angle = index * angleStep - (Math.PI / 2);
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const wheelItem = document.createElement('a');
            wheelItem.className = 'wheel-item';
            wheelItem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            wheelItem.style.top = '50%';
            wheelItem.style.left = '50%';
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
    
    function performSearch() {
        if (!searchInput || !searchResults) return;

        const query = searchInput.value;
        const activeFilterBtn = document.querySelector('.search-filter-btn.active');
        const activeFilter = activeFilterBtn ? activeFilterBtn.dataset.filter : 'all';
        
        searchResults.innerHTML = '';
        if (query.length < 3) return;

        fetch(`/api/global-search/?q=${encodeURIComponent(query)}&type=${encodeURIComponent(activeFilter)}`)
            .then(res => res.json())
            .then(data => {
                if (data.length === 0) {
                    searchResults.innerHTML = '<li>Keine Ergebnisse gefunden.</li>';
                    return;
                }
                data.forEach(item => {
                    const li = document.createElement('li');
                    li.innerHTML = `<a href="${item.url}"><span class="search-result-title">${item.title}</span> <span class="search-result-category">${item.type}</span></a>`;
                    li.querySelector('a').onclick = (e) => {
                        e.preventDefault();
                        openInIframeModal(item.url, item.title);
                        if (searchModal) searchModal.style.display = 'none';
                    };
                    searchResults.appendChild(li);
                });
            });
    }

    if(wheelContainer) {
        wheelContainer.innerHTML = '';
        createWheel(navData.items, null, navData);
        showWheel('main-wheel');
    }

     if (searchInput && !searchInput.hasAttribute('data-listener')) {
         searchInput.setAttribute('data-listener', 'true');
         let debounceTimer;
         searchInput.addEventListener('input', () => {
             clearTimeout(debounceTimer);
             debounceTimer = setTimeout(performSearch, 300);
         });
     }

    const filterContainer = document.getElementById('global-search-filters');
    if (filterContainer && !filterContainer.hasAttribute('data-listener')) {
        filterContainer.setAttribute('data-listener', 'true');
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-filter-btn')) {
                filterContainer.querySelectorAll('.search-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                performSearch();
            }
        });
    }
}


// #####################################################################
// # 2. Haupt-Event-Listener und Initialisierungs-Aufrufe
// #####################################################################

/**
 * Einmalige Einrichtung der globalen Event-Listener für Klicks.
 */
function setupGlobalClickListeners() {
    if (document.body.hasAttribute('data-global-click-listener')) return;
    document.body.setAttribute('data-global-click-listener', 'true');

    document.body.addEventListener('click', function(e) {
        const modal = e.target.closest('.modal');
        if (e.target.matches('.close-modal') || e.target === modal) {
            if (modal) {
                modal.style.display = 'none';
                if (modal.id === 'iframe-modal') {
                    const iframe = document.getElementById('content-iframe');
                    if(iframe) iframe.src = 'about:blank';
                }
            }
        }
        
        if (e.target.id === 'nav-wheel-overlay') {
            e.target.classList.remove('active');
            document.getElementById('side-dock-container')?.classList.remove('active');
        }
        
        const eventPopup = document.getElementById('event-list-popup');
        if (eventPopup && !e.target.closest('.has-events') && !e.target.closest('#event-list-popup')) {
            eventPopup.style.display = 'none';
        }
    });
}

/**
 * Diese Funktion initialisiert alle Elemente, die auf der Seite gefunden werden.
 */
function initializePageFeatures() {
    moveModalsToBody();
    
    // Dashboard-spezifische Features
    addDashboardButton();
    updateTime();
    initializeCalendar();
    initializeSideDock();

    const sideDockTrigger = document.getElementById('side-dock-trigger');
    if (sideDockTrigger && !sideDockTrigger.hasAttribute('data-click-listener')) {
        sideDockTrigger.setAttribute('data-click-listener', 'true');
        sideDockTrigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('side-dock-container')?.classList.toggle('active');
            document.getElementById('nav-wheel-overlay')?.classList.toggle('active');
        });
    }
    
    const calendarIcon = document.getElementById('open-calendar-modal');
    if(calendarIcon && !calendarIcon.hasAttribute('data-click-listener')) {
        calendarIcon.setAttribute('data-click-listener', 'true');
        calendarIcon.addEventListener('click', () => {
             const calendarModal = document.getElementById('calendar-modal');
             if (calendarModal) {
                calendarModal.style.display = 'flex';
                if (window.renderCalendar) window.renderCalendar();
             }
        });
    }

    document.querySelectorAll('.toggle-widget-icon').forEach(icon => {
        if (icon.hasAttribute('data-click-listener')) return;
        icon.setAttribute('data-click-listener', 'true');
        icon.addEventListener('click', () => {
            const widgetModal = document.getElementById('widget-modal');
            const widgetModalTitle = document.getElementById('widget-modal-title');
            const widgetModalBody = document.getElementById('widget-modal-body');
            const widget = icon.closest('.dashboard-widget');
            
            if (widget && widgetModal && widgetModalTitle && widgetModalBody) {
                const title = widget.querySelector('h2').textContent;
                const contentSource = widget.querySelector('.widget-content-source');
                
                widgetModalTitle.textContent = title;
                widgetModalBody.innerHTML = ''; 
                const clonedContent = contentSource.cloneNode(true);
                clonedContent.style.display = 'flex';
                widgetModalBody.appendChild(clonedContent);
                widgetModal.style.display = 'flex';
            }
        });
    });

    document.querySelectorAll('.quick-links a, .stat-item-link, .event-card-link, .manage-button, .manage-button-list, [data-modal-title]').forEach(link => {
        if (link.hasAttribute('data-click-listener')) return;
        link.setAttribute('data-click-listener', 'true');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;
            const title = link.dataset.modalTitle || link.textContent.trim() || 'Eintrag ansehen';
            openInIframeModal(url, title);
        });
    });
    
    document.querySelectorAll('.modal').forEach(el => {
        if (el.style.display !== 'flex' && el.style.display !== 'block') {
             el.style.display = 'none';
        }
    });
}

// Haupt-Event-Listener für das initiale Laden und die Turbo-Navigation.
document.addEventListener('DOMContentLoaded', () => {
    setupGlobalClickListeners();
    initializePageFeatures();
});

document.addEventListener("turbo:load", initializePageFeatures);

