# backend/core/wsgi.py
# KORRIGIERT: Die Anwendung wird mit WhiteNoise umwickelt, um statische UND Mediendateien in der Produktion korrekt auszuliefern.

import os
from django.core.wsgi import get_wsgi_application
from django.conf import settings
from whitenoise import WhiteNoise

# Standard-Anwendung laden
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()

# WhiteNoise-Wrapper fÃƒÂ¼r statische und Mediendateien
# Dieser Code wird nur ausgefÃƒÂ¼hrt, wenn DEBUG=False ist (also in der Produktion auf Render)
if not settings.DEBUG:
    # WhiteNoise anweisen, die statischen Dateien aus STATIC_ROOT zu bedienen
    application = WhiteNoise(application, root=settings.STATIC_ROOT)
    # WhiteNoise anweisen, ZUSÃƒâ€žTZLICH die Mediendateien aus MEDIA_ROOT zu bedienen
    application.add_files(settings.MEDIA_ROOT, prefix=settings.MEDIA_URL)
