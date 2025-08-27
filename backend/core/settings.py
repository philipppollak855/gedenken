# backend/core/settings.py
# FINAL: Zentralisiert die gesamte Konfiguration, um Fehler in der Produktion zu beheben.

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env.dev'))

SECRET_KEY = os.getenv('SECRET_KEY', 'default-insecure-secret-key-for-development')

# Erkennt automatisch, ob die Anwendung auf Render läuft
IS_PRODUCTION = os.environ.get('RENDER') == 'true'

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
else:
    # Lokale Entwicklungs-Einstellungen
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


BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')

INSTALLED_APPS = [
    'jazzmin',
    'api.apps.ApiConfig',
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'whitenoise.runserver_nostatic',
    'django.contrib.staticfiles',
    'rest_framework',
    'rest_framework_simplejwt',
    'corsheaders',
    'import_export',
]

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
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

STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'api.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}

MEDIA_URL = '/media/'
MEDIA_ROOT = os.getenv('MEDIA_ROOT', os.path.join('/var/media', 'media'))

JAZZMIN_SETTINGS = {
    "site_title": "Vorsorge-Plattform Admin",
    "site_header": "Vorsorge-Plattform",
    "site_brand": "Verwaltung",
    "welcome_sign": "Willkommen in der Verwaltung der Vorsorge-Plattform",
    "copyright": "Ihre Bestattung GmbH",
    "topmenu_links": [
        {"name": "Home",  "url": "admin:index", "permissions": ["auth.view_user"]},
        {"name": "Frontend ansehen", "url": "http://localhost:3000", "new_window": True},
    ],
    "order_with_respect_to": ["api", "auth"],
    "apps": {
        "api": {
            "name": "Hauptverwaltung",
            "icon": "fas fa-cogs",
            "models": {
                "user": {"label": "Plattform-Benutzer", "icon": "fas fa-user"},
                "memorialpage": {"label": "Gedenkseiten", "icon": "fas fa-book-dead"},
                "releaserequest": {"label": "Freigabe-Anfragen", "icon": "fas fa-key"},
            }
        },
    },
    "custom_links": {
        "api": [
            {
                "name": "System & Vorlagen", "icon": "fas fa-cogs",
                "models": ("api.sitesettings", "api.mediaasset", "api.eventlocation", "api.condolencetemplate", "api.candleimage", "api.candlemessagetemplate")
            },
            {
                "name": "Nutzerinhalte", "icon": "fas fa-stream",
                "models": ("api.memorialevent", "api.condolence", "api.memorialcandle", "api.galleryitem", "api.timelineevent", "api.eventattendance")
            },
            {
                "name": "Vorsorge-Daten", "icon": "fas fa-file-invoice",
                "models": ("api.lastwishes", "api.document", "api.contractitem", "api.insuranceitem", "api.financialitem", "api.digitallegacyitem")
            },
             {
                "name": "System-Verknüpfungen", "icon": "fas fa-link",
                "models": ("api.familylink", "auth.group")
            }
        ]
    },
    "hide_apps": ["auth"],
    "icons": {
        "api.sitesettings": "fas fa-sliders-h", "api.mediaasset": "fas fa-photo-video", "api.eventlocation": "fas fa-map-marker-alt",
        "api.condolencetemplate": "fas fa-paste", "api.candleimage": "fas fa-image", "api.candlemessagetemplate": "fas fa-comment-alt",
        "api.memorialevent": "fas fa-calendar-alt", "api.galleryitem": "fas fa-images", "api.timelineevent": "fas fa-stream",
        "api.eventattendance": "fas fa-user-check", "api.lastwishes": "fas fa-hand-holding-heart", "api.document": "fas fa-file-alt",
        "api.contractitem": "fas fa-file-signature", "api.insuranceitem": "fas fa-shield-alt", "api.financialitem": "fas fa-euro-sign",
        "api.digitallegacyitem": "fas fa-cloud", "auth.group": "fas fa-users",
    },
    "show_ui_builder": True,
    # Diese Zeile sorgt dafür, dass deine CSS-Datei geladen wird.
    "custom_css": "admin/css/custom_admin.css",
}
JAZZMIN_UI_TWEAKS = {
    "theme": "darkly",
    "button_classes": {
        "primary": "btn-primary", "secondary": "btn-secondary", "info": "btn-info",
        "warning": "btn-warning", "danger": "btn-danger", "success": "btn-success"
    }
}
