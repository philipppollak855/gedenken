// backend/static/admin/js/custom_admin.js

// Globale Variablen für Modals, um wiederholte DOM-Abfragen zu vermeiden
let iframeModal, iframe, iframeTitle;

document.addEventListener('DOMContentLoaded', function() {
    initializeDashboardFeatures();
});

document.addEventListener("turbo:load", function() {
    initializeDashboardFeatures();
});

function initializeDashboardFeatures() {
    moveModalsToBody();
    updateTime();
    initializeCalendar();
    initializeWidgetModals();
    initializeFilters();
    addDashboardButton();
    initializeSideDock();
    initializeIframeModal();
    // KORRIGIERT: Zusammengefasste Funktion für alle modalen Links
    initializeModalLinks(); 
}

// HILFSFUNKTION: Öffnet eine URL im IFrame-Modal
function openInIframeModal(url, title) {
    if (iframe && iframeModal && iframeTitle) {
        const cleanUrl = url.split('?')[0];
        iframe.src = cleanUrl;
        iframeTitle.textContent = title;
        iframeModal.style.display = 'flex';
    } else {
        window.location.href = url;
    }
}

// KORRIGIERT: Eine Funktion für ALLE Links, die im Modal geöffnet werden sollen
function initializeModalLinks() {
    // Event Delegation am Hauptcontainer für mehr Robustheit
    const contentMain = document.getElementById('content-main');
    if (contentMain && !contentMain.hasAttribute('data-modal-link-listener')) {
        contentMain.setAttribute('data-modal-link-listener', 'true');
        
        contentMain.addEventListener('click', function(e) {
            // Findet den geklickten Link, auch wenn auf ein Kind-Element geklickt wurde
            const link = e.target.closest('.quick-links a, .stat-item-link, .event-card-link');
            
            if (link) {
                e.preventDefault();
                const url = link.href;
                // Holt den Titel entweder aus einem data-Attribut oder dem Textinhalt
                const title = link.dataset.modalTitle || link.textContent.trim();
                openInIframeModal(url, title);
            }
        });
    }
}


function addDashboardButton() {
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

    const openCalendarBtn = document.getElementById('open-calendar-modal');
    
    // KORRIGIERT: Stellt sicher, dass der Listener nur einmal angehängt wird
    if (openCalendarBtn && !openCalendarBtn.hasAttribute('data-listener')) {
        openCalendarBtn.setAttribute('data-listener', 'true');
        openCalendarBtn.onclick = () => {
             if(calendarModal) calendarModal.style.display = 'block'; 
             renderCalendar(); 
        };
    }
    
    // Der restliche Kalender-Code...
    const events = window.calendarEvents || [];
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
        if ((rect.left + rect.width + eventListPopup.offsetWidth) < calendarRect.right) {
            eventListPopup.style.left = `${rect.left - calendarRect.left + rect.width + 10}px`;
            eventListPopup.querySelector('::before').style.right = '100%';
        } else {
            eventListPopup.style.left = `${rect.left - calendarRect.left - eventListPopup.offsetWidth - 10}px`;
            eventListPopup.querySelector('::before').style.left = '100%';
        }
    }
    
    if (prevMonthBtn && !prevMonthBtn.hasAttribute('data-listener')) {
         prevMonthBtn.setAttribute('data-listener', 'true');
         prevMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() - 1); renderCalendar(); };
    }
    if (nextMonthBtn && !nextMonthBtn.hasAttribute('data-listener')) {
        nextMonthBtn.setAttribute('data-listener', 'true');
        nextMonthBtn.onclick = () => { currentDate.setMonth(currentDate.getMonth() + 1); renderCalendar(); };
    }
    if (!document.body.hasAttribute('data-calendar-listener')) {
        document.body.setAttribute('data-calendar-listener', 'true');
        document.body.addEventListener('click', () => {
            if (eventListPopup && eventListPopup.style.display === 'block') {
                eventListPopup.style.display = 'none';
            }
        }, true);
    }
}


function initializeWidgetModals() {
    const widgetModal = document.getElementById('widget-modal');
    if (!widgetModal) return;

    const widgetModalTitle = document.getElementById('widget-modal-title');
    const widgetModalBody = document.getElementById('widget-modal-body');

    document.querySelectorAll('.toggle-widget-icon').forEach(icon => {
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
                widgetModalBody.firstChild.style.display = 'flex';
                widgetModal.style.display = 'block';
            }
        });
    });
}

function initializeFilters() {
    if (document.body.hasAttribute('data-filter-listener')) return;
    document.body.setAttribute('data-filter-listener', 'true');

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
        if(searchModal) searchModal.style.display = 'block';
        if(searchInput) searchInput.focus();
        overlay.classList.remove('active');
        dockContainer.classList.remove('active');
    }

    if (trigger && !trigger.hasAttribute('data-listener')) {
        trigger.setAttribute('data-listener', 'true');
        wheelContainer.innerHTML = '';
        createWheel(navData.items, null, navData);
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

             fetch(`/api/global-search/?q=${query}`)
                 .then(res => res.json())
                 .then(data => {
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

function initializeIframeModal() {
    iframeModal = document.getElementById('iframe-modal');
    iframe = document.getElementById('content-iframe');
    iframeTitle = document.getElementById('iframe-modal-title');

    if (!iframeModal) return;

    const closeBtn = iframeModal.querySelector('.close-modal');
    
    if (closeBtn && !closeBtn.hasAttribute('data-iframe-listener')) {
        closeBtn.setAttribute('data-iframe-listener', 'true');
        closeBtn.onclick = () => {
            iframeModal.style.display = 'none';
            iframe.src = 'about:blank';
        };
    }
    
    if (!iframeModal.hasAttribute('data-iframe-listener')) {
        iframeModal.setAttribute('data-iframe-listener', 'true');
        iframeModal.onclick = (event) => {
            if (event.target === iframeModal) {
                iframeModal.style.display = 'none';
                iframe.src = 'about:blank';
            }
        };
    }
}

