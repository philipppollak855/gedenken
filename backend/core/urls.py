# backend/core/urls.py
# FINALE KORREKTUR: Fügt die korrekte und notwendige Konfiguration hinzu,
# damit der lokale Entwicklungs-Server hochgeladene Mediendateien ausliefern kann.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    # Leitet die Haupt-URL ("/") direkt zum Admin-Interface weiter.
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Dieser Block ist entscheidend für die LOKALE ENTWICKLUNG.
# Er wird NUR ausgeführt, wenn DEBUG=True ist (also in Ihrer Docker-Umgebung).
# Er weist Djangos Entwicklungs-Server an, Anfragen an MEDIA_URL (/media/)
# zu beantworten, indem er die Dateien aus dem MEDIA_ROOT-Verzeichnis bereitstellt.
# In der Produktion (Render) wird dieser Block ignoriert und WhiteNoise übernimmt.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

