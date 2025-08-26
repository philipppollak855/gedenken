# backend/core/production.py
# FINAL: Bereinigt, um nur noch produktionsspezifische Overrides zu enthalten.

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

# CORS - Erlaubt dem Frontend, mit dem Backend zu kommunizieren
CORS_ALLOWED_ORIGINS_STRING = os.environ.get('CORS_ALLOWED_ORIGINS', '')
CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STRING.split(' ') if CORS_ALLOWED_ORIGINS_STRING else []

# CSRF-Einstellungen für die Produktion
CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host and host != 'localhost']
