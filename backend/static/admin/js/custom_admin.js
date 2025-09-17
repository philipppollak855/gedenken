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
        iframe.src = cleanUrl;
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
    document.querySelectorAll('.modal').forEach(modal => {
        if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
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
        update(); // Sofort ausführen
    }
}

/**
 * Initialisiert das Kalender-Modal und seine Steuerelemente.
 */
function initializeCalendar() {
    const calendarModal = document.getElementById('calendar-modal');
    if (!calendarModal) return;

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
        // Zuerst alle offenen Popups schließen
        document.querySelectorAll('#event-list-popup').forEach(p => p.style.display = 'none');
        
        eventListPopup.innerHTML = '<ul></ul>';
        const list = eventListPopup.querySelector('ul');
        dayEvents.forEach(event => {
            const item = document.createElement('li');
            const link = document.createElement('a');
            link.href = event.url;
            link.innerHTML = `<strong>${event.time}</strong><span>${event.title}</span>`;
            // Verhindert das Standardverhalten und öffnet im Iframe-Modal
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

        // Positionierung des Popups prüfen (rechts oder links vom Tag)
        if ((rect.left + rect.width + eventListPopup.offsetWidth) < calendarRect.right) {
            eventListPopup.style.left = `${rect.left - calendarRect.left + rect.width + 10}px`;
            if (eventListPopup.querySelector('::before')) eventListPopup.querySelector('::before').style.right = '100%';
        } else {
            eventListPopup.style.left = `${rect.left - calendarRect.left - eventListPopup.offsetWidth - 10}px`;
            if (eventListPopup.querySelector('::before')) eventListPopup.querySelector('::before').style.left = '100%';
        }
    }
    
    // Sicherstellen, dass die Listener nur einmal hinzugefügt werden
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
    // Bricht ab, wenn das Element nicht existiert oder bereits initialisiert wurde.
    if (!dockContainer || dockContainer.hasAttribute('data-initialized')) return;
    dockContainer.setAttribute('data-initialized', 'true');
    
    const wheelContainer = document.getElementById('wheel-container');
    const searchModal = document.getElementById('global-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    
    // Datenstruktur für die Navigations-Items
    const navData = {
        id: 'main',
        items: [
            { id: 'logout', label: 'Logout', icon: 'fa-sign-out-alt', url: '/admin/logout/' },
            { id: 'search', label: 'Suchen', icon: 'fa-search', action: 'openSearch' },
            { id: 'test', label: 'App-Tests', icon: 'fa-flask', action: 'runApplicationTests' },
            { id: 'home', label: 'Dashboard', icon: 'fa-home', url: '/admin/' },
            { id: 'verwaltung', label: 'Hauptverwaltung', icon: 'fa-users-cog', children: [
                { id: 'users', label: 'Benutzer', icon: 'fa-users', url: '/admin/api/user/' },
                { id: 'releases', label: 'Freigabe-Anfragen', icon: 'fa-key', url: '/admin/api/releaserequest/' },
                { id: 'familylinks', label: 'Familien-Verknüpfungen', icon: 'fa-link', url: '/admin/api/familylink/' },
                { id: 'familylink-mgmt', label: 'FamilyLink-Verwaltung', icon: 'fa-sitemap', url: '/admin/family-link-management/' },
            ]},
            { id: 'gedenken', label: 'Gedenken', icon: 'fa-book-dead', children: [
                { id: 'pages', label: 'Gedenkseiten', icon: 'fa-book-open', url: '/admin/api/memorialpage/' },
                { id: 'events', label: 'Termine', icon: 'fa-calendar-alt', url: '/admin/api/memorialevent/' },
                { id: 'condolences', label: 'Kondolenzen', icon: 'fa-comment-dots', url: '/admin/api/condolence/' },
                { id: 'candles', label: 'Gedenkkerzen', icon: 'fa-lightbulb', url: '/admin/api/memorialcandle/' },
            ]},
            { id: 'trauerdruck', label: 'Trauerdruck', icon: 'fa-print', children: [
                { id: 'neuer-entwurf', label: 'Neuer Entwurf', icon: 'fa-plus-circle', url: '/admin/trauerdruck-entwurf-form/' },
                { id: 'dashboard', label: 'Dashboard', icon: 'fa-tachometer-alt', url: '/admin/trauerdruck-dashboard/' },
                { id: 'entwuerfe', label: 'Alle Entwürfe', icon: 'fa-file-image', url: '/admin/api/trauerdruckentwurf/' },
                { id: 'designs', label: 'Designs', icon: 'fa-palette', url: '/admin/api/trauerdruckdesign/' },
                { id: 'freigaben', label: 'Freigaben', icon: 'fa-check-circle', url: '/admin/api/trauerdruckfreigabe/' },
                { id: 'kommentare', label: 'Kommentare', icon: 'fa-comments', url: '/admin/api/trauerdruckkommentar/' },
                { id: 'benachrichtigungen', label: 'Benachrichtigungen', icon: 'fa-bell', url: '/admin/api/trauerdruckbenachrichtigung/' },
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
                { id: 'trauerdruck-typen', label: 'Trauerdruck-Typen', icon: 'fa-tags', url: '/admin/api/trauerdrucktype/' },
                { id: 'trauerdruck-templates', label: 'Trauerdruck-Templates', icon: 'fa-copy', url: '/admin/api/trauerdrucktemplate/' },
            ]},
             { id: 'design', label: 'Design & Medien', icon: 'fa-palette', children: [
                { id: 'settings', label: 'Globale Einstellungen', icon: 'fa-sliders-h', url: '/admin/api/sitesettings/' },
                { id: 'media', label: 'Mediathek', icon: 'fa-photo-video', url: '/admin/api/mediaasset/' },
            ]},
        ]
    };
    
    /**
     * Erstellt rekursiv die Navigationsräder basierend auf der Datenstruktur.
     */
    function createWheel(items, parentId = null, parentData = null) {
        const wheel = document.createElement('div');
        const wheelId = parentId ? `wheel-${parentId}` : 'main-wheel';
        wheel.id = wheelId;
        wheel.className = 'nav-wheel';
        wheelContainer.appendChild(wheel);
        
        const radius = 170; // Radius für die Positionierung der Items

        // Erstellt den zentralen Button (Zurück oder Haupt-Icon)
        if (parentId) {
            const backButton = document.createElement('button');
            backButton.className = 'wheel-center-button';
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;
            backButton.onclick = () => showWheel(parentData ? parentData.id === 'main' ? 'main-wheel' : `wheel-${parentData.id}` : 'main-wheel');
            wheel.appendChild(backButton);
        } else {
             const centerLogo = document.createElement('div');
             centerLogo.className = 'wheel-center-button';
             centerLogo.innerHTML = `<i class="fas fa-times"></i>`; // Geändertes Icon
             centerLogo.onclick = () => { // Schließ-Funktion hinzugefügt
                 document.getElementById('nav-wheel-overlay')?.classList.remove('active');
                 document.getElementById('side-dock-container')?.classList.remove('active');
             };
             wheel.appendChild(centerLogo);
        }

        // Positioniert die Items im Kreis
        const angleStep = (2 * Math.PI) / items.length;
        items.forEach((item, index) => {
            const angle = index * angleStep - (Math.PI / 2); // Startet oben
            const x = Math.cos(angle) * radius;
            const y = Math.sin(angle) * radius;
            
            const wheelItem = document.createElement('a');
            wheelItem.className = 'wheel-item';
            // Setzt die Position relativ zur Mitte des Containers
            wheelItem.style.transform = `translate(-50%, -50%) translate(${x}px, ${y}px)`;
            wheelItem.style.top = '50%';
            wheelItem.style.left = '50%';

            wheelItem.innerHTML = `<i class="fas ${item.icon}"></i><span class="wheel-item-label">${item.label}</span>`;
            
            // Weist die korrekte Aktion zu
            if (item.action === 'openSearch') {
                wheelItem.onclick = openSearchModal;
            } else if (item.action === 'runApplicationTests') {
                wheelItem.onclick = runApplicationTests;
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

    /**
     * Zeigt das gewünschte Rad an und blendet die anderen aus.
     */
    function showWheel(wheelId) {
        document.querySelectorAll('.nav-wheel').forEach(w => w.classList.remove('active'));
        const wheelToShow = document.getElementById(wheelId);
        if (wheelToShow) {
            wheelToShow.classList.add('active');
        }
    }
    
    /**
     * Öffnet das globale Such-Modal.
     */
    function openSearchModal() {
        if(searchModal) searchModal.style.display = 'flex';
        if(searchInput) searchInput.focus();
        document.getElementById('nav-wheel-overlay')?.classList.remove('active');
        document.getElementById('side-dock-container')?.classList.remove('active');
    }
    
    /**
     * Führt die globale Suche aus.
     */
    function performSearch() {
        if (!searchInput || !searchResults) return;

        const query = searchInput.value;
        const activeFilter = document.querySelector('.search-filter-btn.active').dataset.filter;
        
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

    // Initialisiert das Rad
    if(wheelContainer) {
        wheelContainer.innerHTML = '';
        createWheel(navData.items, null, navData);
        showWheel('main-wheel');
    }

    // Listener für das Such-Input-Feld (nur einmal binden)
     if (searchInput && !searchInput.hasAttribute('data-listener')) {
         searchInput.setAttribute('data-listener', 'true');
         let debounceTimer;
         searchInput.addEventListener('input', () => {
             clearTimeout(debounceTimer);
             debounceTimer = setTimeout(performSearch, 300); // Wartet 300ms nach der Eingabe
         });
     }

    // Listener für die Filter-Buttons (nur einmal binden)
    const filterContainer = document.getElementById('global-search-filters');
    if (filterContainer && !filterContainer.hasAttribute('data-listener')) {
        filterContainer.setAttribute('data-listener', 'true');
        filterContainer.addEventListener('click', (e) => {
            if (e.target.classList.contains('search-filter-btn')) {
                filterContainer.querySelectorAll('.search-filter-btn').forEach(btn => btn.classList.remove('active'));
                e.target.classList.add('active');
                performSearch(); // Führt die Suche mit dem neuen Filter erneut aus
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
        // Schließen der Modals
        const modal = e.target.closest('.modal');
        if (e.target.matches('.close-modal') || e.target === modal) {
            if (modal) {
                modal.style.display = 'none';
                // IFrame-Inhalt zurücksetzen, um Ressourcen zu sparen
                if (modal.id === 'iframe-modal') {
                    const iframe = document.getElementById('content-iframe');
                    if(iframe) iframe.src = 'about:blank';
                }
            }
        }
        
        // Schließen des Navigationsrads beim Klick daneben
        if (e.target.id === 'nav-wheel-overlay') {
            e.target.classList.remove('active');
            document.getElementById('side-dock-container')?.classList.remove('active');
        }
        
        // Schließen des Event-Popups im Kalender beim Klick daneben
        const eventPopup = document.getElementById('event-list-popup');
        if (eventPopup && !e.target.closest('.has-events') && !e.target.closest('#event-list-popup')) {
            eventPopup.style.display = 'none';
        }
    });
}

/**
 * Diese Funktion initialisiert alle Elemente, die auf der Seite gefunden werden.
 * Sie wird nach jedem Laden (initial und via Turbo) aufgerufen.
 */
function initializePageFeatures() {
    // Stellt sicher, dass alle Modals im Body sind
    moveModalsToBody();
    
    // Initialisiert oder aktualisiert alle Dashboard-spezifischen Features
    addDashboardButton();
    updateTime();
    initializeCalendar();
    initializeSideDock();

    // Bindet Klick-Events an spezifische Elemente, falls sie existieren
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

    document.querySelectorAll('.quick-links a, .stat-item-link, .event-card-link').forEach(link => {
        if (link.hasAttribute('data-click-listener')) return;
        link.setAttribute('data-click-listener', 'true');
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const url = link.href;
            const title = link.dataset.modalTitle || link.textContent.trim() || 'Eintrag ansehen';
            openInIframeModal(url, title);
        });
    });
    
    // Blendet alle Modals standardmäßig aus, um ein Aufblitzen zu verhindern.
    // KORRIGIERT: #nav-wheel-overlay aus dem Selektor entfernt
    document.querySelectorAll('.modal').forEach(el => {
        // Ausnahme für den Fall, dass ein Modal absichtlich geöffnet bleiben soll (z.B. nach einer Formular-Validierung)
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

// #####################################################################
// # 3. Globale Anwendungs-Tests
// #####################################################################

/**
 * Umfassende Anwendungs-Tests für die gesamte Plattform
 */
function runApplicationTests() {
    const testResults = [];
    const startTime = new Date();
    
    // Test 1: Grundlegende DOM-Struktur
    try {
        const adminElements = [
            { name: 'Admin-Header', selector: '.admin-header, header, .header' },
            { name: 'Navigation', selector: '.nav, .navigation, .sidebar, .nav-wheel' },
            { name: 'Hauptinhalt', selector: '.content, .main-content, .admin-content' },
            { name: 'Footer', selector: '.footer, .admin-footer' }
        ];
        
        adminElements.forEach(element => {
            const found = document.querySelector(element.selector);
            if (found) {
                testResults.push(`✅ ${element.name}: Vorhanden`);
            } else {
                testResults.push(`❌ ${element.name}: Fehlt`);
            }
        });
    } catch (e) {
        testResults.push(`❌ DOM-Struktur: ${e.message}`);
    }
    
    // Test 2: CSRF-Token
    try {
        const csrfToken = document.querySelector('[name=csrfmiddlewaretoken]');
        if (csrfToken && csrfToken.value) {
            testResults.push('✅ CSRF-Token: Vorhanden');
        } else {
            testResults.push('❌ CSRF-Token: Fehlt');
        }
    } catch (e) {
        testResults.push(`❌ CSRF-Token: ${e.message}`);
    }
    
    // Test 3: Formulare
    try {
        const forms = document.querySelectorAll('form');
        let validForms = 0;
        forms.forEach(form => {
            const requiredFields = form.querySelectorAll('[required]');
            const hasAction = form.action || form.querySelector('[name="action"]');
            if (hasAction) validForms++;
        });
        testResults.push(`✅ Formulare: ${validForms}/${forms.length} gültig`);
    } catch (e) {
        testResults.push(`❌ Formular-Test: ${e.message}`);
    }
    
    // Test 4: Links und Navigation
    try {
        const links = document.querySelectorAll('a[href]');
        let internalLinks = 0;
        let externalLinks = 0;
        let brokenLinks = 0;
        
        links.forEach(link => {
            const href = link.href;
            if (href.startsWith(window.location.origin) || href.startsWith('/')) {
                internalLinks++;
            } else if (href.startsWith('http')) {
                externalLinks++;
            } else if (href === '#' || href === 'javascript:void(0)') {
                brokenLinks++;
            }
        });
        
        testResults.push(`✅ Links: ${internalLinks} intern, ${externalLinks} extern, ${brokenLinks} problematisch`);
    } catch (e) {
        testResults.push(`❌ Link-Test: ${e.message}`);
    }
    
    // Test 5: JavaScript-Funktionen
    try {
        const jsFunctions = [
            'openInIframeModal',
            'initializePageFeatures',
            'setupGlobalClickListeners'
        ];
        
        let availableFunctions = 0;
        jsFunctions.forEach(funcName => {
            if (typeof window[funcName] === 'function') {
                availableFunctions++;
            }
        });
        
        testResults.push(`✅ JavaScript-Funktionen: ${availableFunctions}/${jsFunctions.length} verfügbar`);
    } catch (e) {
        testResults.push(`❌ JavaScript-Test: ${e.message}`);
    }
    
    // Test 6: API-Endpoints testen
    const apiEndpoints = [
        { url: '/admin/api/familylink/add/', expectedStatus: 405, name: 'FamilyLink API' },
        { url: '/admin/api/user/', expectedStatus: 200, name: 'User API' },
        { url: '/admin/api/memorialpage/', expectedStatus: 200, name: 'MemorialPage API' }
    ];
    
    let apiTestsCompleted = 0;
    const totalApiTests = apiEndpoints.length;
    
    apiEndpoints.forEach(endpoint => {
        fetch(endpoint.url, {
            method: 'GET',
            headers: {
                'X-Requested-With': 'XMLHttpRequest'
            }
        })
        .then(response => {
            apiTestsCompleted++;
            if (response.status === endpoint.expectedStatus) {
                testResults.push(`✅ ${endpoint.name}: Status ${response.status} (erwartet)`);
            } else {
                testResults.push(`⚠️ ${endpoint.name}: Status ${response.status} (erwartet: ${endpoint.expectedStatus})`);
            }
            
            if (apiTestsCompleted === totalApiTests) {
                finalizeTests();
            }
        })
        .catch(e => {
            apiTestsCompleted++;
            testResults.push(`❌ ${endpoint.name}: ${e.message}`);
            
            if (apiTestsCompleted === totalApiTests) {
                finalizeTests();
            }
        });
    });
    
    // Test 7: Local Storage und Session
    try {
        const hasLocalStorage = typeof(Storage) !== "undefined";
        const hasSessionStorage = typeof(sessionStorage) !== "undefined";
        const hasCookies = document.cookie.length > 0;
        
        testResults.push(`✅ Storage: LocalStorage ${hasLocalStorage ? 'OK' : 'N/A'}, SessionStorage ${hasSessionStorage ? 'OK' : 'N/A'}, Cookies ${hasCookies ? 'OK' : 'N/A'}`);
    } catch (e) {
        testResults.push(`❌ Storage-Test: ${e.message}`);
    }
    
    // Test 8: Responsive Design
    try {
        const viewport = {
            width: window.innerWidth,
            height: window.innerHeight,
            devicePixelRatio: window.devicePixelRatio || 1
        };
        
        const isMobile = viewport.width < 768;
        const isTablet = viewport.width >= 768 && viewport.width < 1024;
        const isDesktop = viewport.width >= 1024;
        
        testResults.push(`✅ Viewport: ${viewport.width}x${viewport.height} (${isMobile ? 'Mobile' : isTablet ? 'Tablet' : 'Desktop'})`);
    } catch (e) {
        testResults.push(`❌ Viewport-Test: ${e.message}`);
    }
    
    // Test 9: Performance-Metriken
    try {
        const performance = window.performance;
        if (performance && performance.timing) {
            const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
            const domReady = performance.timing.domContentLoadedEventEnd - performance.timing.navigationStart;
            
            testResults.push(`✅ Performance: Load ${loadTime}ms, DOM Ready ${domReady}ms`);
        } else {
            testResults.push('ℹ️ Performance: Metriken nicht verfügbar');
        }
    } catch (e) {
        testResults.push(`❌ Performance-Test: ${e.message}`);
    }
    
    // Test 10: Spezifische Admin-Features
    try {
        const adminFeatures = [
            { name: 'Side Dock', selector: '#side-dock-container' },
            { name: 'Navigation Wheel', selector: '.nav-wheel' },
            { name: 'Search Modal', selector: '#global-search-modal' },
            { name: 'Calendar Modal', selector: '#calendar-modal' },
            { name: 'IFrame Modal', selector: '#iframe-modal' }
        ];
        
        let availableFeatures = 0;
        adminFeatures.forEach(feature => {
            const found = document.querySelector(feature.selector);
            if (found) {
                availableFeatures++;
                testResults.push(`✅ ${feature.name}: Verfügbar`);
            } else {
                testResults.push(`❌ ${feature.name}: Fehlt`);
            }
        });
        
        testResults.push(`✅ Admin-Features: ${availableFeatures}/${adminFeatures.length} verfügbar`);
    } catch (e) {
        testResults.push(`❌ Admin-Features: ${e.message}`);
    }
    
    // Finalisierung der Tests
    function finalizeTests() {
        const endTime = new Date();
        const duration = endTime - startTime;
        
        // Ergebnisse zusammenstellen
        const results = [
            `🧪 UMFASSENDE ANWENDUNGS-TESTS ABGESCHLOSSEN`,
            `⏱️ Dauer: ${duration}ms`,
            `📅 Zeit: ${endTime.toLocaleString()}`,
            `🌐 URL: ${window.location.href}`,
            ``,
            ...testResults,
            ``,
            `📋 System-Informationen:`,
            `- User-Agent: ${navigator.userAgent}`,
            `- Browser: ${navigator.appName} ${navigator.appVersion}`,
            `- Platform: ${navigator.platform}`,
            `- Language: ${navigator.language}`,
            `- Online: ${navigator.onLine ? 'Ja' : 'Nein'}`,
            `- Cookies: ${document.cookie ? 'Vorhanden' : 'Keine'}`,
            `- LocalStorage: ${typeof(Storage) !== "undefined" ? 'Verfügbar' : 'Nicht verfügbar'}`,
            `- SessionStorage: ${typeof(sessionStorage) !== "undefined" ? 'Verfügbar' : 'Nicht verfügbar'}`,
            `- IndexedDB: ${typeof(window.indexedDB) !== "undefined" ? 'Verfügbar' : 'Nicht verfügbar'}`,
            `- WebGL: ${document.createElement('canvas').getContext('webgl') ? 'Verfügbar' : 'Nicht verfügbar'}`,
            `- Touch: ${('ontouchstart' in window) ? 'Unterstützt' : 'Nicht unterstützt'}`,
            `- Service Worker: ${navigator.serviceWorker ? 'Verfügbar' : 'Nicht verfügbar'}`
        ].join('\n');
        
        // In Konsole ausgeben
        console.log(results);
        
        // Alert anzeigen
        alert(results);
        
        // Detailliertes Log in separatem Fenster
        const logWindow = window.open('', '_blank', 'width=1000,height=700,scrollbars=yes');
        logWindow.document.write(`
            <html>
                <head>
                    <title>🧪 Anwendungs-Test-Log - ${new Date().toLocaleString()}</title>
                    <style>
                        body { font-family: 'Consolas', 'Monaco', monospace; padding: 20px; background: #f5f5f5; }
                        pre { background: white; padding: 15px; border-radius: 5px; border: 1px solid #ddd; white-space: pre-wrap; }
                        .summary { background: #e8f5e8; padding: 10px; border-radius: 5px; margin-bottom: 20px; }
                        .error { color: #d32f2f; }
                        .warning { color: #f57c00; }
                        .success { color: #388e3c; }
                    </style>
                </head>
                <body>
                    <h1>🧪 Umfassendes Anwendungs-Test-Log</h1>
                    <div class="summary">
                        <strong>Test-Zusammenfassung:</strong><br>
                        - ${testResults.filter(r => r.includes('✅')).length} erfolgreiche Tests<br>
                        - ${testResults.filter(r => r.includes('❌')).length} fehlgeschlagene Tests<br>
                        - ${testResults.filter(r => r.includes('⚠️')).length} Warnungen<br>
                        - ${testResults.filter(r => r.includes('ℹ️')).length} Informationen
                    </div>
                    <pre>${results}</pre>
                    <button onclick="window.close()" style="padding: 10px 20px; background: #007cba; color: white; border: none; border-radius: 5px; cursor: pointer;">Schließen</button>
                </body>
            </html>
        `);
    }
    
    // Falls keine API-Tests vorhanden sind, sofort finalisieren
    if (totalApiTests === 0) {
        finalizeTests();
    }
}
