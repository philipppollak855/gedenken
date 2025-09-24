from django.core.management.base import BaseCommand
from api.models import (
    Bestattungsart, Verabschiedungsart, MusikKategorie, VereinsKategorie,
    Grabart, DokumentKategorie, DigitalerNachlassKategorie
)

class Command(BaseCommand):
    help = 'Erstellt alle Kategorien für die Bestattungsvorsorge'

    def handle(self, *args, **options):
        self.stdout.write('Erstelle Bestattungsvorsorge-Kategorien...')
        
        # Bestattungsarten
        bestattungsarten_data = [
            {
                'name': 'Erdbestattung',
                'description': 'Traditionelle Bestattung im Sarg unter der Erde',
                'icon': 'fas fa-cross',
                'order': 1
            },
            {
                'name': 'Feuerbestattung',
                'description': 'Einäscherung und Beisetzung der Urne',
                'icon': 'fas fa-fire',
                'order': 2
            },
            {
                'name': 'Seebestattung',
                'description': 'Beisetzung der Urne im Meer',
                'icon': 'fas fa-water',
                'order': 3
            },
            {
                'name': 'Baumbestattung',
                'description': 'Beisetzung der Urne an einem Baum',
                'icon': 'fas fa-tree',
                'order': 4
            },
            {
                'name': 'Anonyme Bestattung',
                'description': 'Bestattung ohne Grabstein oder Kennzeichnung',
                'icon': 'fas fa-user-secret',
                'order': 5
            },
            {
                'name': 'Diamantbestattung',
                'description': 'Asche wird zu einem Diamanten verarbeitet',
                'icon': 'fas fa-gem',
                'order': 6
            }
        ]
        
        for data in bestattungsarten_data:
            Bestattungsart.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Bestattungsart: {data["name"]}')
        
        # Verabschiedungsarten
        verabschiedungsarten_data = [
            {
                'name': 'Weltliche Trauerfeier',
                'description': 'Nicht-religiöse Verabschiedung',
                'is_religious': False,
                'religion': '',
                'icon': 'fas fa-handshake',
                'order': 1
            },
            {
                'name': 'Katholische Trauerfeier',
                'description': 'Katholische Messe und Segnung',
                'is_religious': True,
                'religion': 'Katholisch',
                'icon': 'fas fa-cross',
                'order': 2
            },
            {
                'name': 'Evangelische Trauerfeier',
                'description': 'Evangelischer Gottesdienst',
                'is_religious': True,
                'religion': 'Evangelisch',
                'icon': 'fas fa-church',
                'order': 3
            },
            {
                'name': 'Jüdische Trauerfeier',
                'description': 'Jüdische Bestattungsriten',
                'is_religious': True,
                'religion': 'Jüdisch',
                'icon': 'fas fa-star-of-david',
                'order': 4
            },
            {
                'name': 'Islamische Trauerfeier',
                'description': 'Islamische Bestattungsriten',
                'is_religious': True,
                'religion': 'Islamisch',
                'icon': 'fas fa-mosque',
                'order': 5
            },
            {
                'name': 'Buddhistische Trauerfeier',
                'description': 'Buddhistische Bestattungsriten',
                'is_religious': True,
                'religion': 'Buddhistisch',
                'icon': 'fas fa-om',
                'order': 6
            }
        ]
        
        for data in verabschiedungsarten_data:
            Verabschiedungsart.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Verabschiedungsart: {data["name"]}')
        
        # Musik-Kategorien
        musik_kategorien_data = [
            {
                'name': 'Klassische Musik',
                'description': 'Klassische Trauermusik und Orgelmusik',
                'icon': 'fas fa-music',
                'order': 1
            },
            {
                'name': 'Moderne Musik',
                'description': 'Zeitgenössische Lieder und Popmusik',
                'icon': 'fas fa-headphones',
                'order': 2
            },
            {
                'name': 'Religiöse Musik',
                'description': 'Kirchenmusik und geistliche Lieder',
                'icon': 'fas fa-church',
                'order': 3
            },
            {
                'name': 'Instrumentalmusik',
                'description': 'Instrumentale Stücke ohne Gesang',
                'icon': 'fas fa-guitar',
                'order': 4
            },
            {
                'name': 'Chormusik',
                'description': 'Gesang und Chormusik',
                'icon': 'fas fa-users',
                'order': 5
            },
            {
                'name': 'Volksmusik',
                'description': 'Traditionelle und volkstümliche Musik',
                'icon': 'fas fa-accordion',
                'order': 6
            }
        ]
        
        for data in musik_kategorien_data:
            MusikKategorie.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Musik-Kategorie: {data["name"]}')
        
        # Vereins-Kategorien
        vereins_kategorien_data = [
            {
                'name': 'Feuerwehr',
                'description': 'Freiwillige Feuerwehr und Berufsfeuerwehr',
                'icon': 'fas fa-fire-extinguisher',
                'order': 1
            },
            {
                'name': 'Musikverein',
                'description': 'Musikvereine und Blaskapellen',
                'icon': 'fas fa-music',
                'order': 2
            },
            {
                'name': 'Sportverein',
                'description': 'Sportvereine und Sportclubs',
                'icon': 'fas fa-futbol',
                'order': 3
            },
            {
                'name': 'Kirchenchor',
                'description': 'Kirchenchöre und Gesangsvereine',
                'icon': 'fas fa-users',
                'order': 4
            },
            {
                'name': 'Veteranenverein',
                'description': 'Veteranen- und Soldatenvereine',
                'icon': 'fas fa-medal',
                'order': 5
            },
            {
                'name': 'Gesangsverein',
                'description': 'Gesangsvereine und Chöre',
                'icon': 'fas fa-microphone',
                'order': 6
            },
            {
                'name': 'Schützenverein',
                'description': 'Schützenvereine und Schützenbruderschaften',
                'icon': 'fas fa-bullseye',
                'order': 7
            },
            {
                'name': 'Karnevalsverein',
                'description': 'Karnevals- und Fastnachtsvereine',
                'icon': 'fas fa-mask',
                'order': 8
            }
        ]
        
        for data in vereins_kategorien_data:
            VereinsKategorie.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Vereins-Kategorie: {data["name"]}')
        
        # Grabarten
        grabarten_data = [
            {
                'name': 'Einzelgrab',
                'description': 'Grab für eine Person, meist 20-25 Jahre Nutzungsrecht',
                'icon': 'fas fa-tombstone',
                'order': 1
            },
            {
                'name': 'Doppelgrab',
                'description': 'Grab für zwei Personen (Ehepartner), längere Nutzungszeit',
                'icon': 'fas fa-heart',
                'order': 2
            },
            {
                'name': 'Familiengrab',
                'description': 'Grab für mehrere Familienmitglieder, oft über Generationen',
                'icon': 'fas fa-users',
                'order': 3
            },
            {
                'name': 'Urnengrab',
                'description': 'Kleineres Grab für Urnenbestattung',
                'icon': 'fas fa-urn',
                'order': 4
            },
            {
                'name': 'Anonymes Grab',
                'description': 'Grab ohne Grabstein oder Kennzeichnung',
                'icon': 'fas fa-user-secret',
                'order': 5
            },
            {
                'name': 'Wahlgrab',
                'description': 'Grab mit freier Wahl der Grabgestaltung',
                'icon': 'fas fa-star',
                'order': 6
            },
            {
                'name': 'Reihengrab',
                'description': 'Grab in einer Reihe, einfache Gestaltung',
                'icon': 'fas fa-list',
                'order': 7
            },
            {
                'name': 'Rasengrab',
                'description': 'Grab mit Rasenfläche, einfache Pflege',
                'icon': 'fas fa-seedling',
                'order': 8
            }
        ]
        
        for data in grabarten_data:
            Grabart.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Grabart: {data["name"]}')
        
        # Dokument-Kategorien
        dokument_kategorien_data = [
            {
                'name': 'Personalausweis',
                'description': 'Gültiger Personalausweis oder Reisepass',
                'is_required': True,
                'icon': 'fas fa-id-card',
                'order': 1
            },
            {
                'name': 'Geburtsurkunde',
                'description': 'Geburtsurkunde oder beglaubigte Kopie',
                'is_required': True,
                'icon': 'fas fa-baby',
                'order': 2
            },
            {
                'name': 'Heiratsurkunde',
                'description': 'Heiratsurkunde oder beglaubigte Kopie',
                'is_required': False,
                'icon': 'fas fa-ring',
                'order': 3
            },
            {
                'name': 'Bestattungsvertrag',
                'description': 'Vertrag mit Bestattungsunternehmen',
                'is_required': True,
                'icon': 'fas fa-file-contract',
                'order': 4
            },
            {
                'name': 'Grabvertrag',
                'description': 'Vertrag für Grabnutzung',
                'is_required': False,
                'icon': 'fas fa-tombstone',
                'order': 5
            },
            {
                'name': 'Sterbegeldversicherung',
                'description': 'Versicherungsunterlagen für Sterbegeld',
                'is_required': False,
                'icon': 'fas fa-shield-alt',
                'order': 6
            },
            {
                'name': 'Lebensversicherung',
                'description': 'Lebensversicherungsunterlagen',
                'is_required': False,
                'icon': 'fas fa-heart',
                'order': 7
            },
            {
                'name': 'Testament',
                'description': 'Testament oder letzter Wille',
                'is_required': False,
                'icon': 'fas fa-scroll',
                'order': 8
            },
            {
                'name': 'Vollmacht',
                'description': 'Vollmacht für Bestattungsangelegenheiten',
                'is_required': False,
                'icon': 'fas fa-signature',
                'order': 9
            },
            {
                'name': 'Arztberichte',
                'description': 'Wichtige medizinische Unterlagen',
                'is_required': False,
                'icon': 'fas fa-stethoscope',
                'order': 10
            }
        ]
        
        for data in dokument_kategorien_data:
            DokumentKategorie.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Dokument-Kategorie: {data["name"]}')
        
        # Digitaler Nachlass-Kategorien
        digitaler_nachlass_kategorien_data = [
            {
                'name': 'Soziale Medien',
                'description': 'Facebook, Instagram, Twitter, LinkedIn, etc.',
                'icon': 'fas fa-share-alt',
                'order': 1
            },
            {
                'name': 'E-Mail & Cloud',
                'description': 'E-Mail-Accounts und Cloud-Speicher',
                'icon': 'fas fa-envelope',
                'order': 2
            },
            {
                'name': 'Banking & Finanzen',
                'description': 'Online-Banking, PayPal, Kryptowährungen',
                'icon': 'fas fa-credit-card',
                'order': 3
            },
            {
                'name': 'E-Commerce',
                'description': 'Amazon, eBay, Online-Shops, Abonnements',
                'icon': 'fas fa-shopping-cart',
                'order': 4
            },
            {
                'name': 'Entertainment',
                'description': 'Netflix, Spotify, Gaming-Accounts',
                'icon': 'fas fa-gamepad',
                'order': 5
            },
            {
                'name': 'Berufliche Accounts',
                'description': 'LinkedIn, XING, berufliche E-Mails',
                'icon': 'fas fa-briefcase',
                'order': 6
            },
            {
                'name': 'Fotografie & Videos',
                'description': 'Flickr, YouTube, Vimeo, Foto-Clouds',
                'icon': 'fas fa-camera',
                'order': 7
            },
            {
                'name': 'Blogs & Websites',
                'description': 'Eigene Websites, Blogs, Domains',
                'icon': 'fas fa-globe',
                'order': 8
            },
            {
                'name': 'Dating & Partnersuche',
                'description': 'Tinder, Parship, eHarmony, etc.',
                'icon': 'fas fa-heart',
                'order': 9
            },
            {
                'name': 'Sonstige Accounts',
                'description': 'Andere Online-Accounts und Services',
                'icon': 'fas fa-ellipsis-h',
                'order': 10
            }
        ]
        
        for data in digitaler_nachlass_kategorien_data:
            DigitalerNachlassKategorie.objects.get_or_create(
                name=data['name'],
                defaults=data
            )
            self.stdout.write(f'✓ Digitaler Nachlass-Kategorie: {data["name"]}')
        
        self.stdout.write(
            self.style.SUCCESS('✓ Alle Bestattungsvorsorge-Kategorien wurden erfolgreich erstellt!')
        )
