# backend/core/urls.py
# Wir erweitern diese Datei, damit der Entwicklungs-Server die Mediendateien ausliefern kann.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# NEU: Fügt die URL-Route für Mediendateien hinzu, aber nur im DEBUG-Modus
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
