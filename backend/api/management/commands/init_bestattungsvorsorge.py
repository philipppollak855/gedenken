from django.core.management.base import BaseCommand
from api.models import (
    Bestattungsart, Verabschiedungsart, MusikKategorie, VereinsKategorie,
    Grabart, DokumentKategorie, DigitalerNachlassKategorie
)

class Command(BaseCommand):
    help = 'Initialisiert alle Kategorien für die Bestattungsvorsorge'

    def handle(self, *args, **options):
        self.stdout.write('Initialisiere Bestattungsvorsorge-Kategorien...')
        
        # Bestattungsarten
        bestattungsarten = [
            ('Erdbestattung', 'Traditionelle Bestattung im Sarg unter der Erde', 'fas fa-cross'),
            ('Feuerbestattung', 'Einäscherung und Beisetzung der Urne', 'fas fa-fire'),
            ('Seebestattung', 'Beisetzung der Urne im Meer', 'fas fa-water'),
            ('Baumbestattung', 'Beisetzung der Urne an einem Baum', 'fas fa-tree'),
            ('Anonyme Bestattung', 'Bestattung ohne Grabstein oder Kennzeichnung', 'fas fa-user-secret'),
            ('Diamantbestattung', 'Asche wird zu einem Diamanten verarbeitet', 'fas fa-gem')
        ]
        
        for i, (name, desc, icon) in enumerate(bestattungsarten, 1):
            obj, created = Bestattungsart.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Verabschiedungsarten
        verabschiedungsarten = [
            ('Weltliche Trauerfeier', 'Nicht-religiöse Verabschiedung', False, '', 'fas fa-handshake'),
            ('Katholische Trauerfeier', 'Katholische Messe und Segnung', True, 'Katholisch', 'fas fa-cross'),
            ('Evangelische Trauerfeier', 'Evangelischer Gottesdienst', True, 'Evangelisch', 'fas fa-church'),
            ('Jüdische Trauerfeier', 'Jüdische Bestattungsriten', True, 'Jüdisch', 'fas fa-star-of-david'),
            ('Islamische Trauerfeier', 'Islamische Bestattungsriten', True, 'Islamisch', 'fas fa-mosque'),
            ('Buddhistische Trauerfeier', 'Buddhistische Bestattungsriten', True, 'Buddhistisch', 'fas fa-om')
        ]
        
        for i, (name, desc, is_rel, religion, icon) in enumerate(verabschiedungsarten, 1):
            obj, created = Verabschiedungsart.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'is_religious': is_rel,
                    'religion': religion,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Musik-Kategorien
        musik_kategorien = [
            ('Klassische Musik', 'Klassische Trauermusik und Orgelmusik', 'fas fa-music'),
            ('Moderne Musik', 'Zeitgenössische Lieder und Popmusik', 'fas fa-headphones'),
            ('Religiöse Musik', 'Kirchenmusik und geistliche Lieder', 'fas fa-church'),
            ('Instrumentalmusik', 'Instrumentale Stücke ohne Gesang', 'fas fa-guitar'),
            ('Chormusik', 'Gesang und Chormusik', 'fas fa-users'),
            ('Volksmusik', 'Traditionelle und volkstümliche Musik', 'fas fa-accordion')
        ]
        
        for i, (name, desc, icon) in enumerate(musik_kategorien, 1):
            obj, created = MusikKategorie.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Vereins-Kategorien
        vereins_kategorien = [
            ('Feuerwehr', 'Freiwillige Feuerwehr und Berufsfeuerwehr', 'fas fa-fire-extinguisher'),
            ('Musikverein', 'Musikvereine und Blaskapellen', 'fas fa-music'),
            ('Sportverein', 'Sportvereine und Sportclubs', 'fas fa-futbol'),
            ('Kirchenchor', 'Kirchenchöre und Gesangsvereine', 'fas fa-users'),
            ('Veteranenverein', 'Veteranen- und Soldatenvereine', 'fas fa-medal'),
            ('Gesangsverein', 'Gesangsvereine und Chöre', 'fas fa-microphone'),
            ('Schützenverein', 'Schützenvereine und Schützenbruderschaften', 'fas fa-bullseye'),
            ('Karnevalsverein', 'Karnevals- und Fastnachtsvereine', 'fas fa-mask')
        ]
        
        for i, (name, desc, icon) in enumerate(vereins_kategorien, 1):
            obj, created = VereinsKategorie.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Grabarten
        grabarten = [
            ('Einzelgrab', 'Grab für eine Person, meist 20-25 Jahre Nutzungsrecht', 'fas fa-tombstone'),
            ('Doppelgrab', 'Grab für zwei Personen (Ehepartner), längere Nutzungszeit', 'fas fa-heart'),
            ('Familiengrab', 'Grab für mehrere Familienmitglieder, oft über Generationen', 'fas fa-users'),
            ('Urnengrab', 'Kleineres Grab für Urnenbestattung', 'fas fa-urn'),
            ('Anonymes Grab', 'Grab ohne Grabstein oder Kennzeichnung', 'fas fa-user-secret'),
            ('Wahlgrab', 'Grab mit freier Wahl der Grabgestaltung', 'fas fa-star'),
            ('Reihengrab', 'Grab in einer Reihe, einfache Gestaltung', 'fas fa-list'),
            ('Rasengrab', 'Grab mit Rasenfläche, einfache Pflege', 'fas fa-seedling')
        ]
        
        for i, (name, desc, icon) in enumerate(grabarten, 1):
            obj, created = Grabart.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Dokument-Kategorien
        dokument_kategorien = [
            ('Personalausweis', 'Gültiger Personalausweis oder Reisepass', True, 'fas fa-id-card'),
            ('Geburtsurkunde', 'Geburtsurkunde oder beglaubigte Kopie', True, 'fas fa-baby'),
            ('Heiratsurkunde', 'Heiratsurkunde oder beglaubigte Kopie', False, 'fas fa-ring'),
            ('Bestattungsvertrag', 'Vertrag mit Bestattungsunternehmen', True, 'fas fa-file-contract'),
            ('Grabvertrag', 'Vertrag für Grabnutzung', False, 'fas fa-tombstone'),
            ('Sterbegeldversicherung', 'Versicherungsunterlagen für Sterbegeld', False, 'fas fa-shield-alt'),
            ('Lebensversicherung', 'Lebensversicherungsunterlagen', False, 'fas fa-heart'),
            ('Testament', 'Testament oder letzter Wille', False, 'fas fa-scroll'),
            ('Vollmacht', 'Vollmacht für Bestattungsangelegenheiten', False, 'fas fa-signature'),
            ('Arztberichte', 'Wichtige medizinische Unterlagen', False, 'fas fa-stethoscope')
        ]
        
        for i, (name, desc, required, icon) in enumerate(dokument_kategorien, 1):
            obj, created = DokumentKategorie.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'is_required': required,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        # Digitaler Nachlass-Kategorien
        digitaler_nachlass_kategorien = [
            ('Soziale Medien', 'Facebook, Instagram, Twitter, LinkedIn, etc.', 'fas fa-share-alt'),
            ('E-Mail & Cloud', 'E-Mail-Accounts und Cloud-Speicher', 'fas fa-envelope'),
            ('Banking & Finanzen', 'Online-Banking, PayPal, Kryptowährungen', 'fas fa-credit-card'),
            ('E-Commerce', 'Amazon, eBay, Online-Shops, Abonnements', 'fas fa-shopping-cart'),
            ('Entertainment', 'Netflix, Spotify, Gaming-Accounts', 'fas fa-gamepad'),
            ('Berufliche Accounts', 'LinkedIn, XING, berufliche E-Mails', 'fas fa-briefcase'),
            ('Fotografie & Videos', 'Flickr, YouTube, Vimeo, Foto-Clouds', 'fas fa-camera'),
            ('Blogs & Websites', 'Eigene Websites, Blogs, Domains', 'fas fa-globe'),
            ('Dating & Partnersuche', 'Tinder, Parship, eHarmony, etc.', 'fas fa-heart'),
            ('Sonstige Accounts', 'Andere Online-Accounts und Services', 'fas fa-ellipsis-h')
        ]
        
        for i, (name, desc, icon) in enumerate(digitaler_nachlass_kategorien, 1):
            obj, created = DigitalerNachlassKategorie.objects.get_or_create(
                name=name,
                defaults={
                    'description': desc,
                    'icon': icon,
                    'order': i,
                    'is_active': True
                }
            )
            if created:
                self.stdout.write(f'✓ Erstellt: {name}')
            else:
                self.stdout.write(f'○ Existiert bereits: {name}')
        
        self.stdout.write(
            self.style.SUCCESS('✓ Alle Bestattungsvorsorge-Kategorien wurden erfolgreich initialisiert!')
        )
