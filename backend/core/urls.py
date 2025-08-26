# backend/core/urls.py
# HINZUGEFÃœGT: Automatische Weiterleitung von der Startseite zum Admin-Bereich.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    # Leitet die Haupt-URL ("/") direkt zum Admin-Interface weiter.
    path('', RedirectView.as_view(url='/admin/api/', permanent=True)),
    
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Liefert Mediendateien in der Entwicklung und Produktion korrekt aus.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
