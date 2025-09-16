from django.core.management.base import BaseCommand
from api.models import TrauerdruckType


class Command(BaseCommand):
    help = 'Erstellt initiale Trauerdruck-Typen'

    def handle(self, *args, **options):
        trauerdruck_types = [
            {
                'name': 'Trauerkarte',
                'description': 'Klassische Trauerkarte mit Foto und Text'
            },
            {
                'name': 'Gedenkbild',
                'description': 'Großformatiges Gedenkbild für die Trauerfeier'
            },
            {
                'name': 'Parte',
                'description': 'Todesanzeige für Zeitungen und Online-Portale'
            },
            {
                'name': 'Danksagung',
                'description': 'Danksagungskarte nach der Beerdigung'
            },
            {
                'name': 'Erinnerungsbuch',
                'description': 'Persönliches Erinnerungsbuch mit Fotos und Texten'
            },
            {
                'name': 'Gedenkkerze',
                'description': 'Persönliche Gedenkkerze mit Gravur'
            },
            {
                'name': 'Urnenschild',
                'description': 'Schild für die Urne mit Namen und Daten'
            },
            {
                'name': 'Grabstein-Entwurf',
                'description': 'Entwurf für Grabstein oder Gedenktafel'
            }
        ]

        created_count = 0
        for type_data in trauerdruck_types:
            trauerdruck_type, created = TrauerdruckType.objects.get_or_create(
                name=type_data['name'],
                defaults={
                    'description': type_data['description'],
                    'is_active': True
                }
            )
            
            if created:
                created_count += 1
                self.stdout.write(
                    self.style.SUCCESS(f'✓ Trauerdruck-Typ "{type_data["name"]}" erstellt')
                )
            else:
                self.stdout.write(
                    self.style.WARNING(f'⚠ Trauerdruck-Typ "{type_data["name"]}" existiert bereits')
                )

        self.stdout.write(
            self.style.SUCCESS(f'\n🎉 {created_count} neue Trauerdruck-Typen erstellt!')
        )
