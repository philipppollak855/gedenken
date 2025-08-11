# backend/core/production.py

import os
import dj_database_url
from .settings import * # Lädt alle Standard-Einstellungen

SECRET_KEY = os.environ.get('SECRET_KEY')
DEBUG = os.environ.get('DEBUG', 'False').lower() in ['true', '1', 't']

# Die ALLOWED_HOSTS und CORS_ALLOWED_ORIGINS werden von den Umgebungsvariablen auf Render gelesen
ALLOWED_HOSTS = os.environ.get('ALLOWED_HOSTS', '').split(' ')
CORS_ALLOWED_ORIGINS = os.environ.get('CORS_ALLOWED_ORIGINS', '').split(' ')

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
MIDDLEWARE.insert(1, 'whitenoise.middleware.WhiteNoiseMiddleware')

# CSRF-Einstellungen für die Produktion
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host != 'localhost']
