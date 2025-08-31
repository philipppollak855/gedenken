# backend/core/urls.py
# KORRIGIERT: static() helper hinzugefügt, um die URL-Auflösung für statische Dateien zu unterstützen.

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

# Liefert Mediendateien aus MEDIA_ROOT
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Hinzufügen der static()-Funktion für statische Dateien.
# Obwohl WhiteNoise in der Produktion die Auslieferung übernimmt,
# stellt dies sicher, dass die URL-Muster für andere Teile des Frameworks korrekt sind.
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
