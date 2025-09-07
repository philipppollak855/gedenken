# backend/core/settings.py
# BEREINIGT: Die fehlerhafte SIDEBAR-Konfiguration wurde vollständig entfernt.
# Unfold wird nun die stabile Standard-Sidebar generieren.
# KORRIGIERT: MEDIA_ROOT und BACKEND_URL für korrekte Bildauslieferung angepasst.

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env.dev'))

SECRET_KEY = os.getenv('SECRET_KEY', 'default-insecure-secret-key-for-development')

IS_PRODUCTION = os.environ.get('DJANGO_ENV') == 'production'

if IS_PRODUCTION:
    DEBUG = False
    ALLOWED_HOSTS_STRING = os.environ.get('ALLOWED_HOSTS', '')
    ALLOWED_HOSTS = ALLOWED_HOSTS_STRING.split(' ') if ALLOWED_HOSTS_STRING else []
    
    DATABASES = {
        'default': dj_database_url.config(conn_max_age=600, ssl_require=True)
    }
    
    CORS_ALLOWED_ORIGINS_STRING = os.environ.get('CORS_ALLOWED_ORIGINS', '')
    CORS_ALLOWED_ORIGINS = CORS_ALLOWED_ORIGINS_STRING.split(' ') if CORS_ALLOWED_ORIGINS_STRING else []
    
    CSRF_TRUSTED_ORIGINS = [f"https://{host}" for host in ALLOWED_HOSTS if host]
    
    # Produktions-spezifische URL für die API
    BACKEND_URL = os.getenv('BACKEND_URL', f'https://{ALLOWED_HOSTS[0]}' if ALLOWED_HOSTS else '')

else:
    DEBUG = True
    ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost 127.0.0.1 backend').split(' ')
    
    DATABASES = {
        'default': {
            'ENGINE': os.getenv('DATABASE_ENGINE'),
            'NAME': os.getenv('DATABASE_DB'),
            'USER': os.getenv('DATABASE_USER'),
            'PASSWORD': os.getenv('DATABASE_PASSWORD'),
            'HOST': os.getenv('DATABASE_HOST'),
            'PORT': os.getenv('DATABASE_PORT'),
        }
    }
    CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]
    
    # Entwicklungs-spezifische URL für die API
    BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')


INSTALLED_APPS = [
    'unfold',
    'api.apps.ApiConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'import_export',
]

if not IS_PRODUCTION:
    INSTALLED_APPS.insert(INSTALLED_APPS.index('django.contrib.staticfiles'), 'whitenoise.runserver_nostatic')


MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'corsheaders.middleware.CorsMiddleware',
    'whitenoise.middleware.WhiteNoiseMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

ROOT_URLCONF = 'core.urls'
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [os.path.join(BASE_DIR, 'api', 'templates')],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]
WSGI_APPLICATION = 'core.wsgi.application'

AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}]

LANGUAGE_CODE = 'de-at'
TIME_ZONE = 'Europe/Vienna'
USE_I18N = True
USE_TZ = True

STATIC_URL = '/static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'api.User'
X_FRAME_OPTIONS = 'SAMEORIGIN'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}

# --- KORREKTE KONFIGURATION FÜR HOCHGELADENE MEDIEN ---
MEDIA_URL = '/media/'
# In der Entwicklung verweisen wir auf den Ordner innerhalb des Containers.
# In der Produktion (Render) verweist dies auf den gemounteten Disk.
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join(BASE_DIR, 'media'))

UNFOLD = {
    "SITE_TITLE": "Vorsorge-Plattform Admin",
    "SITE_HEADER": "Vorsorge-Plattform",
    "SITE_BRAND": "Verwaltung",
    "WELCOME_SIGN": "Willkommen in der Verwaltung der Vorsorge-Plattform.",
    "COPYRIGHT": "Ihre Bestattung GmbH",
    "THEME": "dark",
    "STYLES": [],
    "SCRIPTS": [
        "/static/admin/js/custom_admin.js",
    ],
}

