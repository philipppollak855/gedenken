# backend/core/wsgi.py
# OPTIMIERT: Vereinfacht für die moderne WhiteNoise-Integration.

import os
from django.core.wsgi import get_wsgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')

# Die WhiteNoise-Middleware in settings.py kümmert sich um die statischen Dateien.
# Eine manuelle Anpassung hier ist nicht mehr notwendig.
application = get_wsgi_application()
