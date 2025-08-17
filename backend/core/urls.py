# backend/core/urls.py
# KORRIGIERT: Mediendateien werden jetzt auch im Produktionsmodus korrekt ausgeliefert.

from django.contrib import admin
from django.urls import path, include
from django.conf import settings
from django.conf.urls.static import static

urlpatterns = [
    path('admin/', admin.site.urls),
    path('api/', include('api.urls')),
]

# Die URL-Route für Mediendateien wird jetzt immer hinzugefügt,
# damit WhiteNoise sie auch in der Produktionsumgebung auf Render finden und ausliefern kann.
# Der 'if settings.DEBUG:'-Check wurde entfernt, da WhiteNoise die Auslieferung sicher handhabt.
urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
