// backend/static/admin/js/custom_admin.js

document.addEventListener('DOMContentLoaded', function() {
    // --- BENUTZERDEFINIERTE SIDEBAR (NEUER, STABILER ANSATZ) ---
    // Wir modifizieren die existierende Unfold-Sidebar, anstatt eine neue zu erstellen.

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

    // 2. Funktion zum Erstellen des HTML-Menüs, das zur Unfold-Struktur passt
    function createMenuHTML(items) {
        let html = '';
        items.forEach(item => {
            // Unfold-Struktur für ein aufklappbares Menü
            if (item.submenu) {
                html += `<li class="nav-item has-treeview">
                            <a href="#" class="nav-link">
                                <i class="nav-icon fas ${item.icon}"></i>
                                <p>${item.title}<i class="right fas fa-angle-left"></i></p>
                            </a>
                            <ul class="nav nav-treeview">${createMenuHTML(item.submenu)}</ul>
                         </li>`;
            } else {
                 // Unfold-Struktur für einen einfachen Menüpunkt
                const isActive = window.location.pathname.startsWith(item.link);
                html += `<li class="nav-item">
                            <a href="${item.link}" class="nav-link ${isActive ? 'active' : ''}">
                                <i class="nav-icon fas ${item.icon || 'fa-circle'}"></i>
                                <p>${item.title}</p>
                            </a>
                         </li>`;
            }
        });
        return html;
    }

    // 3. Funktion zum Ersetzen des Menüs
    function replaceSidebarMenu() {
        const sidebarNav = document.querySelector('.main-sidebar .nav-sidebar');
        if (sidebarNav) {
            const newMenuHTML = createMenuHTML(menuConfig);
            sidebarNav.innerHTML = newMenuHTML;

            // Fügt die Klick-Funktionalität für die neuen Submenüs hinzu
            sidebarNav.querySelectorAll('.has-treeview > .nav-link').forEach(link => {
                link.addEventListener('click', (e) => {
                    e.preventDefault();
                    const parentLi = link.parentElement;
                    parentLi.classList.toggle('menu-open');
                });
            });
        }
    }

    // Führt die Ersetzung aus, sobald die Seite bereit ist
    replaceSidebarMenu();
    
    // --- Bestehende Logik (Modal, Uhr, Kalender etc.) ---
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

    const events = window.calendarEvents || [];
    const calendarModal = document.getElementById('calendar-modal');
    const openCalendarBtn = document.getElementById('open-calendar-modal');
    // ... (Rest der Kalender- und Modal-Logik bleibt unverändert)
});

