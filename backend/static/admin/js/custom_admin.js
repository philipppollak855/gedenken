// backend/static/admin/js/custom_admin.js

document.addEventListener('DOMContentLoaded', function() {
    // Verschiebt die Modals an das Ende des body-Tags, um abgeschnittene Popups zu verhindern
    function moveModalsToBody() {
        document.querySelectorAll('.modal').forEach(modal => {
            document.body.appendChild(modal);
        });
    }
    moveModalsToBody();
    
    // --- Live-Uhr ---
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

    // --- BENUTZERDEFINIERTE SIDEBAR ---
    
    // 1. Definiere die Menüstruktur
    const menuConfig = [
        { title: "Dashboard", link: "/admin/", icon: "fa-tachometer-alt" },
        { 
            title: "Hauptverwaltung", 
            icon: "fa-users-cog",
            submenu: [
                { title: "Benutzer", link: "/admin/api/user/" },
                { title: "Gedenkseiten", link: "/admin/api/memorialpage/" },
                { title: "Freigabe-Anfragen", link: "/admin/api/releaserequest/" },
            ]
        },
        {
            title: "Inhalte & Vorsorge",
            icon: "fa-layer-group",
            submenu: [
                 { title: "Mediathek", link: "/admin/api/mediaasset/" },
                 { title: "Letzte Wünsche", link: "/admin/api/lastwishes/" },
                 { title: "Dokumente", link: "/admin/api/document/" },
                 { title: "Digitaler Nachlass", link: "/admin/api/digitallegacyitem/" },
            ]
        },
        {
            title: "Ereignisse & Interaktion",
            icon: "fa-calendar-check",
            submenu: [
                 { title: "Termine", link: "/admin/api/memorialevent/" },
                 { title: "Teilnahmen", link: "/admin/api/eventattendance/" },
                 { title: "Kondolenzen", link: "/admin/api/condolence/" },
                 { title: "Gedenkkerzen", link: "/admin/api/memorialcandle/" },
                 { title: "Galerie", link: "/admin/api/galleryitem/" },
                 { title: "Chronik", link: "/admin/api/timelineevent/" },
            ]
        },
        {
            title: "Finanzen & Verträge",
            icon: "fa-file-invoice-dollar",
            submenu: [
                { title: "Verträge", link: "/admin/api/contractitem/" },
                { title: "Versicherungen", link: "/admin/api/insuranceitem/" },
                { title: "Finanzen", link: "/admin/api/financialitem/" },
            ]
        },
        {
            title: "System & Stammdaten",
            icon: "fa-cogs",
            submenu: [
                { title: "Globale Einstellungen", link: "/admin/api/sitesettings/" },
                { title: "Veranstaltungsorte", link: "/admin/api/eventlocation/" },
                { title: "Kondolenz-Vorlagen", link: "/admin/api/condolencetemplate/" },
                { title: "Kerzenbilder", link: "/admin/api/candleimage/" },
                { title: "Kerzen-Vorlagen", link: "/admin/api/candlemessagetemplate/" },
                { title: "System-Verknüpfungen", link: "/admin/api/familylink/" },
                { title: "Benutzergruppen", link: "/admin/auth/group/" },
            ]
        },
    ];

    // 2. Funktion zum Erstellen des HTML-Menüs
    function createMenuHTML(items) {
        let html = '<ul>';
        items.forEach(item => {
            if (item.submenu) {
                html += `<li class="has-submenu">
                            <a href="#">
                                <i class="fas ${item.icon}"></i>
                                <span>${item.title}</span>
                                <i class="fas fa-chevron-right submenu-arrow"></i>
                            </a>
                            <div class="submenu">${createMenuHTML(item.submenu)}</div>
                         </li>`;
            } else {
                html += `<li>
                            <a href="${item.link}">
                                <i class="fas ${item.icon}"></i>
                                <span>${item.title}</span>
                            </a>
                         </li>`;
            }
        });
        html += '</ul>';
        return html;
    }

    // 3. Erstelle und injiziere die Sidebar und den Toggle-Button
    const sidebar = document.createElement('aside');
    sidebar.id = 'custom-sidebar';
    sidebar.innerHTML = `
        <div class="sidebar-header">
            <h3>Verwaltung</h3>
        </div>
        <nav class="sidebar-nav">${createMenuHTML(menuConfig)}</nav>
    `;
    document.body.appendChild(sidebar);

    const toggleButton = document.createElement('button');
    toggleButton.id = 'custom-sidebar-toggle';
    toggleButton.innerHTML = '<i class="fas fa-bars"></i>';
    
    const headerNav = document.querySelector('.main-header .navbar-nav');
    if (headerNav) {
        const wrapper = document.createElement('li');
        wrapper.classList.add('nav-item');
        wrapper.appendChild(toggleButton);
        headerNav.prepend(wrapper);
    }
    
    const overlay = document.createElement('div');
    overlay.id = 'custom-sidebar-overlay';
    document.body.appendChild(overlay);

    // 4. Füge Event Listeners hinzu
    toggleButton.addEventListener('click', () => {
        sidebar.classList.toggle('is-visible');
        overlay.classList.toggle('is-visible');
    });
    
    overlay.addEventListener('click', () => {
        sidebar.classList.remove('is-visible');
        overlay.classList.remove('is-visible');
    });

    sidebar.querySelectorAll('.has-submenu > a').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            link.parentElement.classList.toggle('submenu-open');
        });
    });


    // --- KALENDER & MODAL LOGIK ---
    const events = window.calendarEvents || [];
    const calendarModal = document.getElementById('calendar-modal');
    // ... (Rest der Kalender- und Modal-Logik bleibt unverändert)
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
                dayEl.onclick = () => showEventsForDay(dayEvents, dayEl);
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
                widgetModalBody.appendChild(contentSource.cloneNode(true));
                widgetModalBody.firstChild.style.display = 'block';
                widgetModal.style.display = 'block';
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

    document.body.addEventListener('input', function(event) {
        if (event.target.matches('.filter-input')) {
            const filterValue = event.target.value.toLowerCase();
            const targetListId = event.target.dataset.target;
            const list = document.getElementById(targetListId) || (widgetModalBody ? widgetModalBody.querySelector(`#${targetListId}`) : null);

            if (list) {
                list.querySelectorAll('li').forEach(item => {
                    const text = item.textContent.toLowerCase();
                    if (text.includes(filterValue)) {
                        item.style.display = '';
                    } else {
                        item.style.display = 'none';
                    }
                });
            }
        }
    });
});

