# backend/core/wsgi.py
# KORRIGIERT: Die manuelle WhiteNoise-Integration wurde entfernt.
# Die Middleware und die Einstellungen in 'production.py' sind ausreichend und die empfohlene Methode.

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
application = get_wsgi_application()
