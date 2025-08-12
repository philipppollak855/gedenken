#!/bin/sh

# Bricht bei Fehlern sofort ab
set -e

# Führt die Datenbank-Migrationen aus
echo "Applying database migrations..."
python manage.py migrate

# Erstellt den Superuser, falls er nicht existiert
echo "Creating superuser..."
python manage.py create_initial_superuser

# Startet den Gunicorn Webserver, damit die Anwendung online ist
echo "Starting Gunicorn server..."
gunicorn core.wsgi:application --bind 0.0.0.0:10000
