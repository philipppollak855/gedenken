# backend/core/production.py
# KORRIGIERT: Fügt die entscheidende STATICFILES_STORAGE-Einstellung hinzu,
# damit WhiteNoise die statischen Dateien korrekt verwalten kann.

import os
import dj_database_url
from .settings import *

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't']

ALLOWED_HOSTS_STRING = os.environ.get('ALLOWED_HOSTS', '')
ALLOWED_HOSTS = ALLOWED_HOSTS_STRING.split(' ') if ALLOWED_HOSTS_STRING else []

DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600,
        ssl_require=True
    )
}

# Statische Dateien (für Admin-Panel) mit Whitenoise
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'

# DIESE ZEILE IST ENTSCHEIDEND:
# Sie weist Django an, WhiteNoise für die Verwaltung der statischen Dateien zu verwenden.
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Fügt Whitenoise zur Middleware hinzu (an der korrekten Position)
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    # Fügt die Middleware nach der SecurityMiddleware ein
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# CORS - Erlaubt dem Frontend, mit dem Backend zu kommunizieren
CORS_ALLOWED_ORIGINS_STRING = os.environ.get('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STRING.split(' ') if CORS_ALLOWED_ORIGINS_STRING else []

# CSRF-Einstellungen für die Produktion
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host and host != 'localhost']
