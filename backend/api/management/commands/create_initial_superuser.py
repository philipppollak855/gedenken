# backend/api/management/commands/create_initial_superuser.py
# DIESE DATEI IST NEU

import os
from django.core.management.base import BaseCommand
from api.models import User

class Command(BaseCommand):
    """
    Dieser Befehl erstellt einen Superuser, falls noch keiner mit der
    angegebenen E-Mail-Adresse existiert. Die Anmeldedaten werden aus
    den Umgebungsvariablen gelesen.
    """
    help = 'Creates a superuser if one does not exist based on environment variables'

    def handle(self, *args, **options):
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not email or not password:
            self.stdout.write(self.style.WARNING(
                'DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD environment variables not set. Skipping superuser creation.'
            ))
            return

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Successfully created superuser: {email}'))
        else:
            self.stdout.write(self.style.SUCCESS(f'Superuser with email {email} already exists.'))
