// backend/static/admin/js/custom_admin.js

document.addEventListener('DOMContentLoaded', function() {
    // Diese Funktion wird jetzt zentral aufgerufen
    initializeDashboardFeatures();
});

// NEU: Wir lauschen auf das "turbo:load" Event von Unfold.
// Dies stellt sicher, dass unsere Funktionen nach JEDEM Seitenwechsel im Admin-Bereich erneut ausgeführt werden.
document.addEventListener("turbo:load", function() {
    initializeDashboardFeatures();
});


// NEU: Eine Hauptfunktion, die alle unsere Anpassungen bündelt.
function initializeDashboardFeatures() {
    // Stellt sicher, dass Modals korrekt über der gesamten Seite angezeigt werden
    moveModalsToBody();
    
    // Live-Uhr für das Dashboard
    updateTime();

    // Kalender-Logik initialisieren
    initializeCalendar();
    
    // Widget-Modals initialisieren
    initializeWidgetModals();

    // Filter-Funktion für die Modals initialisieren
    initializeFilters();

    // Fügt den "Zum Dashboard" Button in den Breadcrumbs hinzu
    addDashboardButton();

    // Initialisiert das seitliche Navigationsrad
    initializeSideDock();

    // NEU: Initialisiert das IFrame-Modal
    initializeIframeModal();
}


function addDashboardButton() {
    // Funktion wird nur auf Unterseiten ausgeführt, nicht auf dem Dashboard selbst
    if (window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin')) {
        // Entfernen, falls er von einer vorherigen Seite noch da ist
        const existingBtn = document.querySelector('.dashboard-btn');
        if (existingBtn) existingBtn.remove();
        return;
    }

    const breadcrumbs = document.querySelector('.breadcrumbs');
    // Prüfen, ob der Button nicht bereits existiert
    if (breadcrumbs && !breadcrumbs.querySelector('.dashboard-btn')) {
        const dashboardBtn = document.createElement('a');
        dashboardBtn.href = '/admin/';
        dashboardBtn.textContent = 'Zum Dashboard';
        dashboardBtn.classList.add('dashboard-btn');
        
        // Fügt den Button als erstes Element in die Breadcrumbs ein
        // CSS kümmert sich um die Positionierung ganz rechts
        breadcrumbs.appendChild(dashboardBtn);
    }
}


function moveModalsToBody() {
    document.querySelectorAll('.modal').forEach(modal => {
        // Nur verschieben, wenn es nicht schon direkt im body ist
        if (modal.parentNode !== document.body) {
            document.body.appendChild(modal);
        }
    });
}

function updateTime() {
    const timeElement = document.getElementById('current-datetime');
    if (timeElement && !timeElement.hasAttribute('data-interval-id')) {
        const intervalId = setInterval(() => {
            const now = new Date();
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
            timeElement.textContent = now.toLocaleString('de-AT', options);
        }, 1000);
        timeElement.setAttribute('data-interval-id', intervalId);
        // Initialer Aufruf
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        timeElement.textContent = now.toLocaleString('de-AT', options);
    }
}

function initializeCalendar() {
    const events = window.calendarEvents || [];
    const calendarModal = document.getElementById('calendar-modal');
    if (!calendarModal) return;

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
        
        if ( (rect.left + rect.width + eventListPopup.offsetWidth) < calendarRect.right ) {
             eventListPopup.style.left = `${rect.left - calendarRect.left + rect.width + 10}px`;
             eventListPopup.querySelector('::before').style.right = '100%';
        } else {
             eventListPopup.style.left = `${rect.left - calendarRect.left - eventListPopup.offsetWidth - 10}px`;
             eventListPopup.querySelector('::before').style.left = '100%';
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
    
    document.body.addEventListener('click', () => {
        if(eventListPopup && eventListPopup.style.display === 'block') {
             eventListPopup.style.display = 'none';
        }
    }, true);
}

function initializeWidgetModals() {
    const widgetModal = document.getElementById('widget-modal');
    if (!widgetModal) return;

    const widgetModalTitle = document.getElementById('widget-modal-title');
    const widgetModalBody = document.getElementById('widget-modal-body');

    document.querySelectorAll('.toggle-widget-icon').forEach(icon => {
        // Verhindert doppelte Event-Listener
        if (icon.getAttribute('data-listener') === 'true') return;
        icon.setAttribute('data-listener', 'true');

        icon.addEventListener('click', function() {
            const widget = this.closest('.dashboard-widget');
            const title = widget.querySelector('h2').textContent;
            const contentSource = widget.querySelector('.widget-content-source');
            
            if (contentSource && widgetModal && widgetModalTitle && widgetModalBody) {
                widgetModalTitle.textContent = title;
                widgetModalBody.innerHTML = ''; 
                widgetModalBody.appendChild(contentSource.cloneNode(true));
                widgetModalBody.firstChild.style.display = 'flex'; // Sicherstellen, dass der Container sichtbar ist
                widgetModal.style.display = 'block';
            }
        });
    });

    document.querySelectorAll('.modal').forEach(modal => {
        const closeBtn = modal.querySelector('.close-modal');
        if (closeBtn && !closeBtn.getAttribute('data-listener')) {
            closeBtn.setAttribute('data-listener', 'true');
            closeBtn.onclick = () => { modal.style.display = 'none'; };
        }
        if (!modal.getAttribute('data-listener')) {
             modal.setAttribute('data-listener', 'true');
             modal.addEventListener('click', (event) => {
                if (event.target == modal) {
                    modal.style.display = 'none';
                }
            });
        }
    });
}

function initializeFilters() {
     // Wichtig: Event-Delegation am Body, da der Inhalt der Modals dynamisch ist.
    document.body.addEventListener('input', function(event) {
        if (event.target.matches('.filter-input')) {
            const filterValue = event.target.value.toLowerCase();
            const list = event.target.closest('.widget-content-source').querySelector('.activity-list');

            if (list) {
                list.querySelectorAll('li, .activity-item').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    item.style.display = text.includes(filterValue) ? '' : 'none';
                });
            }
        }
    });
}


function initializeSideDock() {
    const dockContainer = document.getElementById('side-dock-container');
    if (!dockContainer) return;

    const trigger = document.getElementById('side-dock-trigger');
    const overlay = document.getElementById('nav-wheel-overlay');
    const wheelContainer = document.getElementById('wheel-container');
    const iframeModal = document.getElementById('iframe-modal');
    const iframe = document.getElementById('content-iframe');
    const iframeTitle = document.getElementById('iframe-modal-title');
    
    // KORREKTUR: Variablen für die Suche werden hier oben deklariert.
    const searchModal = document.getElementById('global-search-modal');
    const searchInput = document.getElementById('global-search-input');
    const searchResults = document.getElementById('global-search-results');
    const allAdminLinks = Array.from(document.querySelectorAll('.sidebar-wrapper a'));


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
                { id: 'candle-msg-tpl', label: 'Kerzen-Nachrichten', icon: 'fa-comment-alt', url: '/admin/api/candle-message-template/' },
            ]},
             { id: 'design', label: 'Design & Medien', icon: 'fa-palette', children: [
                { id: 'settings', label: 'Globale Einstellungen', icon: 'fa-sliders-h', url: '/admin/api/sitesettings/' },
                { id: 'media', label: 'Mediathek', icon: 'fa-photo-video', url: '/admin/api/mediaasset/' },
            ]},
        ]
    };
    
    function createWheel(items, parentId = null) {
        const wheel = document.createElement('div');
        wheel.id = parentId ? `wheel-${parentId}` : 'main-wheel';
        wheel.className = 'nav-wheel';
        wheelContainer.appendChild(wheel);

        const radius = 150;
        const angleStep = (2 * Math.PI) / (items.length + (parentId ? 1 : 0));

        if (parentId) {
            const backButton = document.createElement('button');
            backButton.className = 'wheel-center-button';
            backButton.innerHTML = `<i class="fas fa-arrow-left"></i>`;
            backButton.onclick = () => showWheel(parentId === 'main' ? 'main-wheel' : `wheel-${navData.items.find(i => i.children?.some(c => c.id === parentId))?.id}`);
            wheel.appendChild(backButton);
        } else {
            const centerLogo = document.createElement('div');
            centerLogo.className = 'wheel-center-button';
            centerLogo.innerHTML = `<i class="fas fa-star"></i>`;
            wheel.appendChild(centerLogo);
        }

        items.forEach((item, index) => {
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
                createWheel(item.children, item.id);
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
    
    function openInIframeModal(url, title) {
        if (iframe && iframeModal && iframeTitle) {
            iframe.src = url;
            iframeTitle.textContent = title;
            iframeModal.style.display = 'block';
            overlay.classList.remove('active');
            dockContainer.classList.remove('active');
        } else {
            window.location.href = url;
        }
    }

    function openSearchModal() {
        if(searchModal) searchModal.style.display = 'block';
        if(searchInput) searchInput.focus();
        overlay.classList.remove('active');
        dockContainer.classList.remove('active');
    }

    if (trigger && !trigger.hasAttribute('data-listener')) {
        trigger.setAttribute('data-listener', 'true');
        wheelContainer.innerHTML = '';
        createWheel(navData.items);
        showWheel('main-wheel');

        trigger.addEventListener('click', () => {
            overlay.classList.toggle('active');
            dockContainer.classList.toggle('active');
        });

        overlay.addEventListener('click', (e) => {
            if (e.target === overlay) {
                overlay.classList.remove('active');
                dockContainer.classList.remove('active');
            }
        });
    }

     if (searchInput && !searchInput.hasAttribute('data-listener')) {
         searchInput.setAttribute('data-listener', 'true');
         searchInput.addEventListener('input', (e) => {
             const query = e.target.value.toLowerCase();
             searchResults.innerHTML = '';
             if (query.length < 2) return;

             // Hier kommt die erweiterte Suche
             fetch(`/api/global-search/?q=${query}`)
                 .then(res => res.json())
                 .then(data => {
                     // Navigations-Links zuerst
                     allAdminLinks.forEach(link => {
                         if (link.textContent.toLowerCase().includes(query)) {
                             const li = document.createElement('li');
                             li.innerHTML = `<a href="${link.href}"><span class="search-result-title">${link.textContent.trim()}</span> <span class="search-result-category">Navigation</span></a>`;
                             li.querySelector('a').onclick = (e) => {
                                 e.preventDefault();
                                 openInIframeModal(link.href, link.textContent.trim());
                                 searchModal.style.display = 'none';
                             }
                             searchResults.appendChild(li);
                         }
                     });
                     
                     // API Ergebnisse
                     Object.keys(data).forEach(category => {
                         data[category].forEach(item => {
                             const li = document.createElement('li');
                             li.innerHTML = `<a href="${item.url}"><span class="search-result-title">${item.name}</span> <span class="search-result-category">${item.type}</span></a>`;
                              li.querySelector('a').onclick = (e) => {
                                 e.preventDefault();
                                 openInIframeModal(item.url, item.name);
                                 searchModal.style.display = 'none';
                             }
                             searchResults.appendChild(li);
                         });
                     });
                 });
         });
     }
}

// NEU: Eigene Funktion für das Iframe-Modal
function initializeIframeModal() {
    const iframeModal = document.getElementById('iframe-modal');
    if (!iframeModal) return;

    const closeBtn = iframeModal.querySelector('.close-modal');
    
    if (closeBtn && !closeBtn.hasAttribute('data-iframe-listener')) {
        closeBtn.setAttribute('data-iframe-listener', 'true');
        closeBtn.onclick = () => {
            iframeModal.style.display = 'none';
            iframeModal.querySelector('#content-iframe').src = 'about:blank';
        };
    }
    
    if (!iframeModal.hasAttribute('data-iframe-listener')) {
        iframeModal.setAttribute('data-iframe-listener', 'true');
        iframeModal.onclick = (event) => {
            if (event.target === iframeModal) {
                iframeModal.style.display = 'none';
                iframeModal.querySelector('#content-iframe').src = 'about:blank';
            }
        };
    }
}

