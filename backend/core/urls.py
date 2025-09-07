# backend/core/urls.py
# KORRIGIERT: static() helper hinzugefügt, um die URL-Auflösung für MEDIEN-Dateien in der ENTWICKLUNG zu ermöglichen.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static
from django.views.generic.base import RedirectView

urlpatterns = [
    path('', RedirectView.as_view(url='/admin/', permanent=True)),
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Diese Einstellung ist entscheidend für die ENTWICKLUNG.
# Sie sorgt dafür, dass Djangos Entwicklungs-Server weiß, wie er Anfragen
# an /media/... an den MEDIA_ROOT-Ordner weiterleiten soll.
# In der PRODUKTION (Render mit WhiteNoise) wird dies nicht verwendet, stört aber auch nicht.
if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)

# Diese Zeile ist für statische Dateien (CSS, JS) und wird von WhiteNoise in der Produktion benötigt.
urlpatterns += static(settings.STATIC_URL, document_root=settings.STATIC_ROOT)
