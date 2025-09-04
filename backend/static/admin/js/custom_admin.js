// backend/static/admin/js/custom_admin.js

// Globale Variablen für Modals, um wiederholte DOM-Abfragen zu vermeiden
let iframeModal, iframe, iframeTitle;

/**
 * Haupt-Initialisierungslogik, die bei jedem Seitenaufbau (auch nach Turbo-Navigation) ausgeführt wird.
 * Stellt sicher, dass alle interaktiven Elemente ihre Funktionalität erhalten.
 */
function initializeOnPageLoad() {
    // Weist die globalen Modal-Variablen zu
    iframeModal = document.getElementById('iframe-modal');
    iframe = document.getElementById('content-iframe');
    iframeTitle = document.getElementById('iframe-modal-title');

    // Initialisiert alle interaktiven Komponenten des Dashboards.
    // Jede dieser Funktionen ist so geschrieben, dass sie sicher mehrfach aufgerufen werden kann.
    initializeSideDock();
    initializeCalendar();
    initializeWidgetModals();
    initializeModalLinks();
    initializeFilters();
    addDashboardButton();
    updateTime();
}

/**
 * Einmalige Einrichtung der globalen Event-Listener für Aktionen, die robust über Event Delegation funktionieren.
 */
function setupGlobalEventListeners() {
    // Verhindert, dass die Listener mehrfach an das body-Element gehängt werden.
    if (document.body.hasAttribute('data-global-listeners-attached')) return;
    document.body.setAttribute('data-global-listeners-attached', 'true');

    document.body.addEventListener('click', function(e) {
        // Schließt das Navigationsrad durch Klick auf das Overlay
        if (e.target.id === 'nav-wheel-overlay') {
            e.target.classList.remove('active');
            document.getElementById('side-dock-container')?.classList.remove('active');
            return;
        }
        
        // Schließt jedes Modal (Klick auf 'X' oder außerhalb des Inhalts)
        const modal = e.target.closest('.modal');
        if (e.target.classList.contains('close-modal') || e.target === modal) {
            if (modal) {
                modal.style.display = 'none';
                if (modal.id === 'iframe-modal' && iframe) {
                    iframe.src = 'about:blank'; // Iframe-Inhalt leeren
                }
            }
        }
    });
}


/**
 * Öffnet eine gegebene URL in einem IFrame-Modal.
 */
function openInIframeModal(url, title) {
    if (iframe && iframeModal && iframeTitle) {
        const cleanUrl = url.split('?')[0];
        iframe.src = cleanUrl;
        iframeTitle.textContent = title;
        iframeModal.style.display = 'flex'; // WICHTIG: 'flex' für Zentrierung
    } else {
        // Fallback, falls das Modal aus irgendeinem Grund nicht gefunden wird.
        window.location.href = url;
    }
}

// Event-Listener für den Seitenaufbau
document.addEventListener('DOMContentLoaded', function() {
    moveModalsToBody(); // Modals einmalig verschieben
    setupGlobalEventListeners(); // Globale Listener einmalig einrichten
    initializeOnPageLoad(); // Features initialisieren
});
document.addEventListener("turbo:load", initializeOnPageLoad);


// --- Einzelne Initialisierungsfunktionen ---

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

function initializeSideDock() {
    const dockContainer = document.getElementById('side-dock-container');
    const trigger = document.getElementById('side-dock-trigger');
    const overlay = document.getElementById('nav-wheel-overlay');
    
    if (trigger && !trigger.hasAttribute('data-click-listener')) {
        trigger.setAttribute('data-click-listener', 'true');
        trigger.addEventListener('click', (e) => {
            e.preventDefault();
            e.stopPropagation(); // Verhindert, dass der Klick andere Listener auslöst
            dockContainer?.classList.toggle('active');
            overlay?.classList.toggle('active');
        });
    }
    // Der Rest der SideDock-Initialisierung (Räder erstellen etc.) bleibt hier
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
                     const allAdminLinks = Array.from(document.querySelectorAll('.sidebar-wrapper a'));
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

function initializeCalendar() {
    const calendarModal = document.getElementById('calendar-modal');
    const calendarIcon = document.getElementById('open-calendar-modal');
    if (!calendarModal || !calendarIcon) return;

    if (!calendarIcon.hasAttribute('data-click-listener')) {
        calendarIcon.setAttribute('data-click-listener', 'true');
        calendarIcon.addEventListener('click', () => {
            calendarModal.style.display = 'flex';
            if(window.renderCalendar) window.renderCalendar();
        });
    }

    const events = window.calendarEvents || [];
    const calendarBody = document.getElementById('calendar-body');
    const monthYearEl = document.getElementById('calendar-month-year');
    const prevMonthBtn = document.getElementById('prev-month');
    const nextMonthBtn = document.getElementById('next-month');
    const eventListPopup = document.getElementById('event-list-popup');
    let currentDate = new Date();

    window.renderCalendar = function() { /* ... unverändert ... */ };
    
    // ... restlicher Kalender-Code bleibt gleich ...
}


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
                widgetModalBody.appendChild(contentSource.cloneNode(true));
                widgetModalBody.firstChild.style.display = 'flex';
                widgetModal.style.display = 'flex'; // WICHTIG: flex für Zentrierung
            }
        });
    });
}


function initializeFilters() {
    // Dieser Listener kann global bleiben, da er nicht an spezifische, neu geladene Elemente gebunden ist.
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

