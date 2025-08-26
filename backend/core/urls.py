# backend/core/urls.py
# KORRIGIERT: Behebt den SystemCheckError (urls.E004) durch Verwendung der korrekten `include` Syntax für Namespaces.

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from api.admin import custom_admin_site # Importieren der benutzerdefinierten Admin-Site

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    # KORREKTUR: Die vorherige Tuple-Syntax war inkorrekt. 
    # Die korrekte Methode, um die URLs einer Admin-Site-Instanz mit einem
    # benutzerdefinierten Namespace einzubinden, ist die `include()`-Funktion.
    # Wir übergeben die URL-Patterns und den app_name ('admin') und setzen den
    # instance namespace explizit auf 'admin', um den NoReverseMatch-Fehler zu beheben.
    path('admin/', include((custom_admin_site.get_urls(), 'admin'), namespace='admin')),
    
    path('api/', include('api.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
