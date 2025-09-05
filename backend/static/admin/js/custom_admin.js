// backend/static/admin/js/custom_admin.js

document.addEventListener('DOMContentLoaded', () => {
    // Diese Funktionen werden nur einmal beim ersten Laden der Seite ausgeführt.
    moveModalsToBody();
    setupGlobalEventListeners();
    initializeSideDock(); // Das Rad muss nur einmal erstellt werden.
    
    // Diese Funktionen werden bei jedem Laden (auch nach Turbo-Navigation) aufgerufen.
    initializePageSpecificFeatures();
});

document.addEventListener("turbo:load", initializePageSpecificFeatures);


/**
 * Einmalige Einrichtung der globalen Event-Listener, die durch Event Delegation funktionieren.
 * Das macht sie robust gegenüber Turbo-Navigation.
 */
function setupGlobalEventListeners() {
    if (document.body.hasAttribute('data-global-listeners-attached')) return;
    document.body.setAttribute('data-global-listeners-attached', 'true');

    document.body.addEventListener('click', function(e) {
        // --- ZENTRALE KLICK-VERARBEITUNG ---
        const sideDockTrigger = e.target.closest('#side-dock-trigger');
        const navWheelOverlay = e.target.id === 'nav-wheel-overlay' ? e.target : null;
        const modalLink = e.target.closest('.quick-links a, .stat-item-link, .event-card-link');
        const calendarIcon = e.target.closest('.calendar-icon');
        const widgetToggleIcon = e.target.closest('.toggle-widget-icon');
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

        // 3. Links im Dashboard im Modal öffnen
        if (modalLink) {
            e.preventDefault();
            const url = modalLink.href;
            const title = modalLink.dataset.modalTitle || modalLink.textContent.trim() || 'Eintrag ansehen';
            openInIframeModal(url, title);
            return;
        }

        // 4. Kalender-Modal öffnen
        if (calendarIcon) {
            const calendarModal = document.getElementById('calendar-modal');
            if (calendarModal) {
                calendarModal.style.display = 'flex';
                if (window.renderCalendar) window.renderCalendar();
            }
            return;
        }

        // 5. Widget-Vergrößerung öffnen
        if (widgetToggleIcon) {
            const widgetModal = document.getElementById('widget-modal');
            const widgetModalTitle = document.getElementById('widget-modal-title');
            const widgetModalBody = document.getElementById('widget-modal-body');
            const widget = widgetToggleIcon.closest('.dashboard-widget');
            const title = widget.querySelector('h2').textContent;
            const contentSource = widget.querySelector('.widget-content-source');
            
            if (contentSource && widgetModal && widgetModalTitle && widgetModalBody) {
                widgetModalTitle.textContent = title;
                widgetModalBody.innerHTML = ''; 
                const clonedContent = contentSource.cloneNode(true);
                clonedContent.style.display = 'flex';
                widgetModalBody.appendChild(clonedContent);
                widgetModal.style.display = 'flex';
            }
            return;
        }

        // 6. Jedes Modal schließen (Klick auf 'X' oder außerhalb des Inhalts)
        if (closeModalButton || e.target === modal) {
            if (modal) {
                modal.style.display = 'none';
                if (modal.id === 'iframe-modal') {
                    const iframe = document.getElementById('content-iframe');
                    if(iframe) iframe.src = 'about:blank';
                }
            }
        }
    });
    
    initializeFilters(); // Filter-Listener ebenfalls global einrichten
}

/**
 * Initialisiert Funktionen, die bei jedem Seitenaufbau neu ausgeführt werden müssen.
 */
function initializePageSpecificFeatures() {
    initializeCalendar();
    addDashboardButton();
    updateTime();
}

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

function addDashboardButton() {
    // Fügt den "Zum Dashboard" Button auf Unterseiten hinzu
    if (window.location.pathname.endsWith('/admin/') || window.location.pathname.endsWith('/admin')) {
        const existingBtn = document.querySelector('.dashboard-btn');
        if (existingBtn) existingBtn.remove();
        return;
    }
    const breadcrumbs = document.querySelector('.breadcrumbs');
    if (breadcrumbs && !breadcrumbs.querySelector('.dashboard-btn')) {
        const dashboardBtn = document.createElement('a');
        dashboardBtn.href = '/admin/';
        dashboardBtn.textContent = 'Zum Dashboard';
        dashboardBtn.classList.add('dashboard-btn');
        breadcrumbs.appendChild(dashboardBtn);
    }
}

function moveModalsToBody() {
    document.querySelectorAll('.modal').forEach(modal => {
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
        const now = new Date();
        const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit', second: '2-digit' };
        timeElement.textContent = now.toLocaleString('de-AT', options);
    }
}

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

    window.renderCalendar = function() { /* ... unverändert ... */ };
    
    // ... restlicher Kalender-Code bleibt gleich ...
    if (prevMonthBtn && !prevMonthBtn.hasAttribute('data-listener')) {
         prevMonthBtn.setAttribute('data-listener', 'true');
         prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); window.renderCalendar(); };
    }
    if (nextMonthBtn && !nextMonthBtn.hasAttribute('data-listener')) {
        nextMonthBtn.setAttribute('data-listener', 'true');
        nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); window.renderCalendar(); };
    }
}

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
             const query = e.target.value.toLowerCase();
             searchResults.innerHTML = '';
             if (query.length < 2) return;
             fetch(`/api/global-search/?q=${query}`)
                 .then(res => res.json())
                 .then(data => {
                     // ... Suchlogik bleibt unverändert ...
                 });
         });
     }
}

