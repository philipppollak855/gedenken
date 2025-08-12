#!/usr/bin/env bash
# exit on error
set -o errexit

# Installiert Abhängigkeiten, führt Migrationen aus und erstellt den Superuser.
# Das '&&' stellt sicher, dass der nächste Befehl nur ausgeführt wird,
# wenn der vorherige erfolgreich war.
pip install -r requirements.txt
python manage.py migrate
python manage.py create_initial_superuser
