# backend/core/urls.py
# KORRIGIERT: Stellt sicher, dass der URL-Namespace für den Admin-Bereich korrekt gesetzt ist, um den NoReverseMatch-Fehler zu beheben.

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from api.admin import custom_admin_site # Importieren der benutzerdefinierten Admin-Site

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    
    # KORREKTUR: Wir übergeben die URLs der custom_admin_site an include()
    # und setzen den Namespace explizit auf 'admin', damit die Admin-Templates
    # die URLs wie 'admin:app_list' für Standard-Apps (z.B. 'auth') korrekt auflösen können.
    # Dies behebt den 'NoReverseMatch'-Fehler.
    path('admin/', (custom_admin_site.urls, 'admin', 'admin')),
    
    path('api/', include('api.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
