# backend/core/production.py
# KORRIGIERT: Syntaxfehler und Einrückungsprobleme behoben.

import os
import dj_database_url
from .settings import *

SECRET_KEY = os.environ.get('SECRET_KEY')
# Setzt DEBUG auf False, wenn die Variable nicht explizit auf 'true' gesetzt ist
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't']

# Stellt einen Standardwert bereit, um Abstürze zu vermeiden
ALLOWED_HOSTS_STRING = os.environ.get('ALLOWED_HOSTS', '')
ALLOWED_HOSTS = ALLOWED_HOSTS_STRING.split(' ') if ALLOWED_HOSTS_STRING else []

# Datenbank-Konfiguration von Render
DATABASES = {
    'default': dj_database_url.config(
        conn_max_age=600,
        ssl_require=True
    )
}

# Statische Dateien (für Admin-Panel) mit Whitenoise
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATIC_URL = '/static/'
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# Fügt Whitenoise zur Middleware hinzu
if 'whitenoise.middleware.WhiteNoiseMiddleware' not in MIDDLEWARE:
    MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# CORS - Erlaubt dem Frontend, mit dem Backend zu kommunizieren
CORS_ALLOWED_ORIGINS_STRING = os.environ.get('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STRING.split(' ') if CORS_ALLOWED_ORIGINS_STRING else []

# CSRF-Einstellungen für die Produktion
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host and host != 'localhost']
