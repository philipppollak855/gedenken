# backend/core/urls.py
# KORRIGIERT: Verwendet die standardmäßige und robusteste Methode zur Einbindung der Admin-Site-URLs.

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from api.admin import custom_admin_site # Importieren der benutzerdefinierten Admin-Site

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    # KORREKTUR: Die einfachste und korrekte Methode ist, direkt auf das .urls Attribut der
    # Admin-Site-Instanz zu verweisen. Dies stellt sicher, dass Django die Namespaces
    # korrekt verwaltet und löst die zugrundeliegenden URL-Konflikte.
    path('admin/', custom_admin_site.urls),
    
    path('api/', include('api.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
