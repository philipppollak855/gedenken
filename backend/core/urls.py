# backend/core/urls.py
# HINZUGEFÜGT: Verweist auf die neue, benutzerdefinierte Admin-Site.

from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView
from api.admin import custom_admin_site # Importieren der benutzerdefinierten Admin-Site

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', custom_admin_site.urls), # Verwendet die URLs unserer custom_admin_site
    path('api/', include('api.urls')),
]

urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
