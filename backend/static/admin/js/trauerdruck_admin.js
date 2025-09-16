// Trauerdruck Admin JavaScript für Schnellaktionen

// Entwurf-Aktionen
function sendToFamily(entwurfId) {
    if (confirm('Möchten Sie diesen Entwurf wirklich an die Familie senden?')) {
        fetch(`/admin/api/trauerdruckentwurf/${entwurfId}/send-to-family/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Senden an die Familie: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Senden an die Familie');
        });
    }
}

function requestRevision(entwurfId) {
    const reason = prompt('Bitte geben Sie den Grund für die Revision an:');
    if (reason !== null) {
        fetch(`/admin/api/trauerdruckentwurf/${entwurfId}/request-revision/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ reason: reason })
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Anfordern der Revision: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Anfordern der Revision');
        });
    }
}

function markCompleted(entwurfId) {
    if (confirm('Möchten Sie diesen Entwurf wirklich als abgeschlossen markieren?')) {
        fetch(`/admin/api/trauerdruckentwurf/${entwurfId}/mark-completed/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Markieren als abgeschlossen: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Markieren als abgeschlossen');
        });
    }
}

// Design-Aktionen
function activateDesign(designId) {
    if (confirm('Möchten Sie dieses Design wirklich aktivieren?')) {
        fetch(`/admin/api/trauerdruckdesign/${designId}/activate/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Aktivieren des Designs: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Aktivieren des Designs');
        });
    }
}

function deactivateDesign(designId) {
    if (confirm('Möchten Sie dieses Design wirklich deaktivieren?')) {
        fetch(`/admin/api/trauerdruckdesign/${designId}/deactivate/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Deaktivieren des Designs: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Deaktivieren des Designs');
        });
    }
}

function approveDesign(designId) {
    if (confirm('Möchten Sie dieses Design wirklich freigeben?')) {
        fetch(`/admin/api/trauerdruckdesign/${designId}/approve/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Freigeben des Designs: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Freigeben des Designs');
        });
    }
}

function rejectDesign(designId) {
    if (confirm('Möchten Sie dieses Design wirklich ablehnen?')) {
        fetch(`/admin/api/trauerdruckdesign/${designId}/reject/`, {
            method: 'POST',
            headers: {
                'X-CSRFToken': getCookie('csrftoken'),
                'Content-Type': 'application/json',
            },
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                location.reload();
            } else {
                alert('Fehler beim Ablehnen des Designs: ' + (data.error || 'Unbekannter Fehler'));
            }
        })
        .catch(error => {
            console.error('Error:', error);
            alert('Fehler beim Ablehnen des Designs');
        });
    }
}

// Hilfsfunktion für CSRF-Token
function getCookie(name) {
    let cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        const cookies = document.cookie.split(';');
        for (let i = 0; i < cookies.length; i++) {
            const cookie = cookies[i].trim();
            if (cookie.substring(0, name.length + 1) === (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                break;
            }
        }
    }
    return cookieValue;
}

// Dashboard-spezifische Funktionen
function refreshDashboard() {
    location.reload();
}

function filterByStatus(status) {
    const url = new URL(window.location);
    if (status) {
        url.searchParams.set('status', status);
    } else {
        url.searchParams.delete('status');
    }
    window.location.href = url.toString();
}

function filterByPriority(priority) {
    const url = new URL(window.location);
    if (priority) {
        url.searchParams.set('priority', priority);
    } else {
        url.searchParams.delete('priority');
    }
    window.location.href = url.toString();
}

function filterByType(typeId) {
    const url = new URL(window.location);
    if (typeId) {
        url.searchParams.set('type', typeId);
    } else {
        url.searchParams.delete('type');
    }
    window.location.href = url.toString();
}

function filterByTimeframe(timeframe) {
    const url = new URL(window.location);
    if (timeframe) {
        url.searchParams.set('timeframe', timeframe);
    } else {
        url.searchParams.delete('timeframe');
    }
    window.location.href = url.toString();
}

// Auto-refresh für Dashboard (alle 30 Sekunden)
if (window.location.pathname.includes('trauerdruck-dashboard')) {
    setInterval(refreshDashboard, 30000);
}
