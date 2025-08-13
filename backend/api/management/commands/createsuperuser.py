# backend/api/management/commands/createsuperuser.py
# Ermöglicht die automatische Erstellung eines Superusers ohne manuelle Eingabe.

import os
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

class Command(BaseCommand):
    help = 'Creates a superuser non-interactively.'

    def handle(self, *args, **options):
        User = get_user_model()
        email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
        password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')

        if not email or not password:
            self.stdout.write(self.style.ERROR('DJANGO_SUPERUSER_EMAIL and DJANGO_SUPERUSER_PASSWORD must be set.'))
            return

        if not User.objects.filter(email=email).exists():
            User.objects.create_superuser(email=email, password=password)
            self.stdout.write(self.style.SUCCESS(f'Superuser {email} created successfully.'))
        else:
            self.stdout.write(self.style.WARNING(f'Superuser {email} already exists.'))
