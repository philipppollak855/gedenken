# backend/core/wsgi.py
# KORRIGIERT: Die manuelle WhiteNoise-Integration wurde entfernt, da dies
# bereits durch die Middleware und den STATICFILES_STORAGE in den
# Produktionseinstellungen (production.py) abgedeckt ist.
# Dies behebt den MIME-Type-Fehler in der Produktionsumgebung.

import os
from django.core.wsgi import get_wsgi_application

# Standard-Anwendung laden
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()

# Die manuelle WhiteNoise-Umwicklung wird hier nicht mehr benötigt,
# da 'whitenoise.storage.CompressedManifestStaticFilesStorage'
# in production.py als STATICFILES_STORAGE definiert ist.
# Diese moderne Methode ist robuster und wird empfohlen.
