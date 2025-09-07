#!/bin/sh

# Bricht bei Fehlern sofort ab
set -e

# Erstellt das media-Verzeichnis, falls es nicht existiert.
# Das ist wichtig, da Render den Mount-Pfad, aber nicht den Unterordner erstellt.
echo "Creating media directory if it doesn't exist..."
mkdir -p /app/media

# Führt die Datenbank-Migrationen aus
echo "Applying database migrations..."
python manage.py migrate

# Erstellt den Superuser, falls er nicht existiert
echo "Creating superuser..."
cat <<EOF | python manage.py shell
import os
from api.models import User

email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

if email and password and not User.objects.filter(email=email).exists():
    User.objects.create_superuser(email=email, password=password)
    print('Superuser created.')
else:
    print('Superuser already exists or environment variables not set.')
EOF

# Startet den Gunicorn Webserver, damit die Anwendung online ist
echo "Starting Gunicorn server..."
# ÄNDERUNG: Der Port wird jetzt auf 8000 gesetzt, um Konsistenz zu wahren
gunicorn core.wsgi:application --bind 0.0.0.0:8000

