# backend/core/settings.py
# KORRIGIERT: Expliziter Pfad für benutzerdefinierte CSS-Dateien zum UNFOLD-Dictionary hinzugefügt.

import os
import dj_database_url
from pathlib import Path
from dotenv import load_dotenv
from django.urls import reverse_lazy

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env.dev'))

SECRET_KEY = os.getenv('SECRET_KEY', 'default-insecure-secret-key-for-development')

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
    'unfold',
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

UNFOLD = {
    "SITE_TITLE": "Vorsorge-Plattform Admin",
    "SITE_HEADER": "Vorsorge-Plattform",
    "SITE_BRAND": "Verwaltung",
    "WELCOME_SIGN": "Willkommen in der Verwaltung der Vorsorge-Plattform.",
    "COPYRIGHT": "Ihre Bestattung GmbH",
    "THEME": "dark",
    # HINZUGEFÜGT: Dieser Block lädt Ihre benutzerdefinierte CSS-Datei.
    "STYLES": [
        "admin/css/custom_admin.css",
    ],
    "SIDEBAR": {
        "navigation": [
            {
                "title": "Hauptverwaltung",
                "icon": "fas fa-tachometer-alt",
                "items": [
                    {"title": "Dashboard", "link": reverse_lazy("admin:index")},
                    {"title": "Benutzer", "link": reverse_lazy("admin:api_user_changelist")},
                    {"title": "Gedenkseiten", "link": reverse_lazy("admin:api_memorialpage_changelist")},
                    {"title": "Freigabe-Anfragen", "link": reverse_lazy("admin:api_releaserequest_changelist")},
                ],
            },
            {
                "title": "Inhaltsverwaltung",
                "icon": "fas fa-photo-video",
                "items": [
                     {"title": "Mediathek", "link": reverse_lazy("admin:api_mediaasset_changelist")},
                     {"title": "Termine", "link": reverse_lazy("admin:api_memorialevent_changelist")},
                     {"title": "Kondolenzen", "link": reverse_lazy("admin:api_condolence_changelist")},
                     {"title": "Gedenkkerzen", "link": reverse_lazy("admin:api_memorialcandle_changelist")},
                     {"title": "Galerie-Einträge", "link": reverse_lazy("admin:api_galleryitem_changelist")},
                     {"title": "Chronik-Ereignisse", "link": reverse_lazy("admin:api_timelineevent_changelist")},
                     {"title": "Teilnahmen", "link": reverse_lazy("admin:api_eventattendance_changelist")},
                ],
            },
            {
                "title": "Vorsorge-Daten",
                "icon": "fas fa-file-invoice",
                "items": [
                    {"title": "Letzte Wünsche", "link": reverse_lazy("admin:api_lastwishes_changelist")},
                    {"title": "Dokumente", "link": reverse_lazy("admin:api_document_changelist")},
                    {"title": "Vertrags-Einträge", "link": reverse_lazy("admin:api_contractitem_changelist")},
                    {"title": "Versicherungs-Einträge", "link": reverse_lazy("admin:api_insuranceitem_changelist")},
                    {"title": "Finanz-Einträge", "link": reverse_lazy("admin:api_financialitem_changelist")},
                    {"title": "Digitaler Nachlass", "link": reverse_lazy("admin:api_digitallegacyitem_changelist")},
                ],
            },
            {
                "title": "System & Stammdaten",
                "icon": "fas fa-cogs",
                "items": [
                    {"title": "Globale Einstellungen", "link": reverse_lazy("admin:api_sitesettings_changelist")},
                    {"title": "Veranstaltungsorte", "link": reverse_lazy("admin:api_eventlocation_changelist")},
                    {"title": "Kondolenz-Vorlagen", "link": reverse_lazy("admin:api_condolencetemplate_changelist")},
                    {"title": "Kerzenbilder", "link": reverse_lazy("admin:api_candleimage_changelist")},
                    {"title": "Kerzen-Vorlagen", "link": reverse_lazy("admin:api_candlemessagetemplate_changelist")},
                ],
            },
        ]
    },
}
