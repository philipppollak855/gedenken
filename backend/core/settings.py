# backend/core/settings.py
# HINZUGEFÜGT: Link zum neuen Termin-Dashboard in der Admin-Navigation.
# ERWEITERT: Logische Gruppierung der Modelle im Admin-Menü.

import os
from pathlib import Path
from dotenv import load_dotenv
from django.urls import reverse_lazy

BASE_DIR = Path(__file__).resolve().parent.parent
load_dotenv(os.path.join(BASE_DIR, '.env.dev'))

SECRET_KEY = os.getenv('SECRET_KEY', 'default-insecure-secret-key-for-dev')
DEBUG = os.getenv('DEBUG', '1') == '1'
ALLOWED_HOSTS = os.getenv('DJANGO_ALLOWED_HOSTS', 'localhost 127.0.0.1 backend').split(' ')

BACKEND_URL = os.getenv('BACKEND_URL', 'http://localhost:8000')

INSTALLED_APPS = [
    'jazzmin',
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

MIDDLEWARE = [
    'corsheaders.middleware.CorsMiddleware',
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

AUTH_PASSWORD_VALIDATORS = [{'NAME': 'django.contrib.auth.password_validation.UserAttributeSimilarityValidator'}, {'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator'}, {'NAME': 'django.contrib.auth.password_validation.CommonPasswordValidator'}, {'NAME': 'django.contrib.auth.password_validation.NumericPasswordValidator'}]

LANGUAGE_CODE = 'de-at'
TIME_ZONE = 'Europe/Vienna'
USE_I18N = True
USE_TZ = True

STATIC_URL = 'static/'
STATICFILES_DIRS = [os.path.join(BASE_DIR, 'static')]
STATIC_ROOT = os.path.join(BASE_DIR, 'staticfiles')

DEFAULT_AUTO_FIELD = 'django.db.models.BigAutoField'
AUTH_USER_MODEL = 'api.User'

REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': ('rest_framework_simplejwt.authentication.JWTAuthentication',)
}
CORS_ALLOWED_ORIGINS = ["http://localhost:3000", "http://127.0.0.1:3000"]

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
    "order_with_respect_to": [], # Wird durch die "apps" unten gesteuert
    "apps": {
        "api": {
            "name": "Gedenken & Inhalte",
            "icon": "fas fa-book-dead",
            "models": {
                "memorialpage": {"label": "Gedenkseiten", "icon": "fas fa-book-dead"},
                "memorialevent": {"label": "Termine", "icon": "fas fa-calendar-alt"},
                "condolence": {"label": "Kondolenzen", "icon": "fas fa-comment-dots"},
                "memorialcandle": {"label": "Gedenkkerzen", "icon": "fas fa-lightbulb"},
                "galleryitem": {"label": "Galerie-Einträge", "icon": "fas fa-images"},
                "timelineevent": {"label": "Chronik-Einträge", "icon": "fas fa-stream"},
            }
        },
        "auth": {
             "name": "Benutzer & Zugriffe",
             "icon": "fas fa-users-cog",
             "models": {
                "user": {"label": "Benutzerkonten"},
             }
        },
         "api_custom_user": {
            "name": "Benutzer & Zugriffe",
            "icon": "fas fa-users-cog",
            "models": {
                "user": {"label": "Benutzerkonten"},
                "releaserequest": {"label": "Freigabe-Anfragen", "icon": "fas fa-key"},
                "familylink": {"label": "Angehörigen-Verknüpfungen", "icon": "fas fa-link"},
            }
        },
        "api_custom_system": {
            "name": "System & Vorlagen",
            "icon": "fas fa-cogs",
            "models": {
                "sitesettings": {"label": "Globale Einstellungen", "icon": "fas fa-sliders-h"},
                "mediaasset": {"label": "Mediathek", "icon": "fas fa-photo-video"},
                "eventlocation": {"label": "Veranstaltungsorte", "icon": "fas fa-map-marker-alt"},
                "condolencetemplate": {"label": "Kondolenz-Vorlagen", "icon": "fas fa-paste"},
                "candleimage": {"label": "Kerzenbilder-Sammlung", "icon": "fas fa-image"},
                "candlemessagetemplate": {"label": "Kerzen-Textvorlagen", "icon": "fas fa-comment-alt"},
            }
        },
    },
    "icons": {
        "auth.Group": "fas fa-users",
    },
    "show_ui_builder": True,
}

JAZZMIN_UI_TWEAKS = {
    "navbar_small_text": False, "footer_small_text": False, "body_small_text": True,
    "brand_small_text": False, "brand_colour": "navbar-dark", "accent": "accent-primary",
    "navbar": "navbar-dark", "no_navbar_border": False, "navbar_fixed": True,
    "layout_boxed": False, "footer_fixed": True, "sidebar_fixed": True,
    "sidebar": "sidebar-dark-primary", "sidebar_nav_small_text": False, "sidebar_disable_expand": False,
    "sidebar_nav_child_indent": False, "sidebar_nav_compact_style": False, "sidebar_nav_legacy_style": False,
    "sidebar_nav_flat_style": False, "theme": "darkly",
    "button_classes": {
        "primary": "btn-primary", "secondary": "btn-secondary", "info": "btn-info",
        "warning": "btn-warning", "danger": "btn-danger", "success": "btn-success"
    }
}

if os.environ.get('DJANGO_ENV') == 'production':
    from .production import *
