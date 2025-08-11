# backend/api/management/commands/seed_data.py
# ERWEITERT: Erstellt mehr Kerzen für Paginierung und füllt alle neuen, detaillierten Termin-Felder.

import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from api.models import User, MemorialPage, Condolence, MemorialEvent, MediaAsset, CandleImage, TimelineEvent, GalleryItem, MemorialCandle

class Command(BaseCommand):
    help = 'Seeds the database with 50 rich and varied example users and memorial pages.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding with 50 enhanced personas...'))
        
        if not User.objects.filter(email='philipp.pollak855@gmail.com').exists():
            User.objects.create_superuser('philipp.pollak855@gmail.com', '24061998')
            self.stdout.write(self.style.SUCCESS('Superuser "philipp.pollak855@gmail.com" created with password "24061998".'))

        fake = Faker('de_AT')

        personas = [
            {'type': 'Gärtner', 'gender': 'male', 'hobby': 'seinen geliebten Garten hegte und pflegte, in dem er Ruhe und Kraft fand'},
            {'type': 'Großmutter', 'gender': 'female', 'hobby': 'mit Hingabe für ihre Familie da war und die besten Kuchen der Welt backte'},
            {'type': 'Musiker', 'gender': 'male', 'hobby': 'mit seiner Gitarre und seiner Stimme die Herzen der Menschen berührte'},
            {'type': 'Reisende', 'gender': 'female', 'hobby': 'die entlegensten Winkel der Welt mit Neugier und Mut entdeckte'},
            {'type': 'Leser', 'gender': 'male', 'hobby': 'in der Welt der Bücher zuhause war und sein Wissen gerne teilte'},
            {'type': 'Köchin', 'gender': 'female', 'hobby': 'Familie und Freunde mit ihren kulinarischen Kreationen verwöhnte'},
            {'type': 'Vereinsmeier', 'gender': 'male', 'hobby': 'im örtlichen Fußballverein seine zweite Heimat fand'},
            {'type': 'Ärztin', 'gender': 'female', 'hobby': 'sich aufopferungsvoll um ihre Patienten kümmerte'},
            {'type': 'Tischler', 'gender': 'male', 'hobby': 'aus Holz wahre Kunstwerke schuf'},
            {'type': 'Tänzerin', 'gender': 'female', 'hobby': 'ihr Leben lang dem Tanz verbunden war'},
            {'type': 'Lehrer', 'gender': 'male', 'hobby': 'Generationen von Schülern mit Geduld und Weisheit prägte'},
            {'type': 'Künstlerin', 'gender': 'female', 'hobby': 'die Welt durch ihre farbenfrohen Gemälde ein bisschen bunter machte'},
            {'type': 'Bergsteiger', 'gender': 'male', 'hobby': 'auf den höchsten Gipfeln der Alpen sein Glück fand'},
            {'type': 'Schneiderin', 'gender': 'female', 'hobby': 'mit Nadel und Faden die schönsten Kleider zauberte'},
            {'type': 'Angler', 'gender': 'male', 'hobby': 'in der Stille am Seeufer seine Mitte fand'},
            {'type': 'Tierfreundin', 'gender': 'female', 'hobby': 'jedem Tier in Not ein liebevolles Zuhause gab'},
            {'type': 'Fotograf', 'gender': 'male', 'hobby': 'die flüchtigen Momente des Lebens in wunderschönen Bildern festhielt'},
            {'type': 'Chorsängerin', 'gender': 'female', 'hobby': 'mit ihrer klaren Stimme im Kirchenchor für Gänsehautmomente sorgte'},
            {'type': 'Winzer', 'gender': 'male', 'hobby': 'mit Leidenschaft und Hingabe seinen eigenen Wein kelterte'},
            {'type': 'Historikerin', 'gender': 'female', 'hobby': 'die Geschichten der Vergangenheit lebendig werden ließ'},
        ] * 5

        image_pools = {
            'portrait_male': [
                'https://images.pexels.com/photos/91227/pexels-photo-91227.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/614810/pexels-photo-614810.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/2379004/pexels-photo-2379004.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/1212984/pexels-photo-1212984.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/532220/pexels-photo-532220.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
            ],
            'portrait_female': [
                'https://images.pexels.com/photos/774909/pexels-photo-774909.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/1065084/pexels-photo-1065084.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/733872/pexels-photo-733872.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/1130626/pexels-photo-1130626.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
                'https://images.pexels.com/photos/1239291/pexels-photo-1239291.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1',
            ],
            'background_nature': [
                'https://images.pexels.com/photos/36717/amazing-animal-beautiful-beautifull.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/1528640/pexels-photo-1528640.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            ],
            'background_calm': [
                'https://images.pexels.com/photos/1287145/pexels-photo-1287145.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3408744/pexels-photo-3408744.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            ],
            'background_travel': [
                'https://images.pexels.com/photos/2104152/pexels-photo-2104152.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
                'https://images.pexels.com/photos/3889852/pexels-photo-3889852.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1',
            ],
            'obituary_cards': [
                'https://images.pexels.com/photos/132474/pexels-photo-132474.jpeg?auto=compress&cs=tinysrgb&w=400&h=560&dpr=1',
                'https://images.pexels.com/photos/776632/pexels-photo-776632.jpeg?auto=compress&cs=tinysrgb&w=400&h=560&dpr=1',
            ],
            'acknowledgement_images': [
                'https://images.pexels.com/photos/450059/pexels-photo-450059.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
                'https://images.pexels.com/photos/163064/play-stone-network-networked-163064.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
            ],
            'memorial_pictures': [
                'https://images.pexels.com/photos/1105325/pexels-photo-1105325.jpeg?auto=compress&cs=tinysrgb&w=350&h=262&dpr=1',
                'https://images.pexels.com/photos/167698/pexels-photo-167698.jpeg?auto=compress&cs=tinysrgb&w=350&h=262&dpr=1',
            ],
            'gallery_images': [
                'https://images.pexels.com/photos/2693212/pexels-photo-2693212.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
                'https://images.pexels.com/photos/3225517/pexels-photo-3225517.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
                'https://images.pexels.com/photos/1535162/pexels-photo-1535162.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
                'https://images.pexels.com/photos/1671325/pexels-photo-1671325.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1',
            ],
            'candle_images': [
                'https://images.pexels.com/photos/247297/pexels-photo-247297.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
                'https://images.pexels.com/photos/933099/pexels-photo-933099.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
                'https://images.pexels.com/photos/1126413/pexels-photo-1126413.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1',
            ]
        }
        
        obituary_openings = ["In Liebe und Dankbarkeit nehmen wir Abschied von", "Nach einem langen, erfüllten Leben entschlief sanft", "Unerwartet und viel zu früh müssen wir Abschied nehmen von", "In tiefer Trauer geben wir bekannt, dass"]
        obituary_closings = ["In unseren Herzen lebst du weiter.", "Wir werden dich unendlich vermissen.", "In stillem Gedenken.", "Die Trauerfamilie."]
        
        condolence_starters = ["In stiller Trauer.", "Mit aufrichtiger Anteilnahme.", "Unfassbar.", "In liebevoller Erinnerung.", "Was man tief im Herzen besitzt, kann man nicht verlieren."]
        condolence_middles = ["Die gemeinsamen Momente werden unvergessen bleiben.", "Dein Lachen wird uns fehlen.", "Möge die Erinnerung Trost spenden.", "Du hast so viele Spuren der Liebe hinterlassen."]
        condolence_enders = ["Ruhe in Frieden.", "Unsere Gedanken sind bei der Familie.", "In unseren Herzen lebst du weiter.", "Wir werden dich vermissen.", "Ein letzter stiller Gruß."]

        all_image_urls = {url for pool in image_pools.values() for url in pool}
        for url in all_image_urls:
            title = url.split('?')[0].split('/')[-1].replace('-', ' ').capitalize()
            MediaAsset.objects.get_or_create(title=title, defaults={'file_url': url, 'asset_type': 'image'})

        candle_images_in_db = []
        for url in image_pools['candle_images']:
            asset = MediaAsset.objects.filter(file_url=url).first()
            if asset:
                candle_image, _ = CandleImage.objects.get_or_create(name=f"Kerze {asset.title[:20]}", defaults={'image': asset, 'type': 'standard'})
                candle_images_in_db.append(candle_image)

        for i in range(50):
            persona = random.choice(personas)
            gender = persona['gender']
            
            first_name = fake.first_name_male() if gender == 'male' else fake.first_name_female()
            last_name = fake.last_name()
            email = f"{first_name.lower()}.{last_name.lower()}{i}@example.com"
            user, created = User.objects.get_or_create(email=email, defaults={'first_name': first_name, 'last_name': last_name})
            user.set_password('password123')
            user.save()

            date_of_death = fake.date_time_between(start_date="-3y", end_date="now", tzinfo=timezone.get_current_timezone())
            date_of_birth = date_of_death - timedelta(days=random.randint(20000, 36500))

            obituary = f"{random.choice(obituary_openings)} unserer/m lieben {first_name} {last_name}, der/die {persona['hobby']}. {random.choice(obituary_closings)}"

            background_pool = image_pools['background_nature'] if 'Gärtner' in persona['type'] else \
                              image_pools['background_travel'] if 'Reisende' in persona['type'] else \
                              image_pools['background_calm']

            page, page_created = MemorialPage.objects.update_or_create(
                user=user,
                defaults={
                    'status': 'active', 'first_name': first_name, 'last_name': last_name,
                    'date_of_birth': date_of_birth.date(), 'date_of_death': date_of_death.date(),
                    'main_photo': MediaAsset.objects.filter(file_url=random.choice(image_pools[f'portrait_{gender}'])).first(),
                    'hero_background_image': MediaAsset.objects.filter(file_url=random.choice(background_pool)).first(),
                    'farewell_background_image': MediaAsset.objects.filter(file_url=random.choice(image_pools['background_calm'])).first(),
                    'cemetery': fake.street_name() + " Friedhof", 'obituary': obituary,
                    'obituary_card_image': MediaAsset.objects.filter(file_url=random.choice(image_pools['obituary_cards'])).first(),
                    'memorial_picture': MediaAsset.objects.filter(file_url=random.choice(image_pools['memorial_pictures'])).first(),
                    'acknowledgement_image': MediaAsset.objects.filter(file_url=random.choice(image_pools['acknowledgement_images'])).first(),
                    'acknowledgement_type': 'image',
                }
            )
            
            self.stdout.write(f'({i+1}/50) Processed page for {first_name} {last_name} ({persona["type"]})')

            Condolence.objects.filter(page=page).delete()
            for _ in range(random.randint(10, 30)):
                message = f"{random.choice(condolence_starters)} {random.choice(condolence_middles)} {random.choice(condolence_enders)}"
                Condolence.objects.create(page=page, guest_name=f"{fake.first_name()} {fake.last_name()}", message=message, is_approved=True)

            MemorialEvent.objects.filter(page=page).delete()
            # Haupt-Trauerfeier
            MemorialEvent.objects.create(
                page=page,
                is_public=True,
                title="Trauerfeier",
                date=date_of_death + timedelta(days=7, hours=14),
                show_location=True,
                location_name=f"Pfarrkirche {fake.city()}",
                location_address=fake.street_address(),
                show_dresscode=random.choice([True, False]),
                dresscode="Um dunkle Kleidung wird gebeten.",
                show_condolence_note=True,
                condolence_note="Von Beileidsbezeugungen am Grab bitten wir Abstand zu nehmen.",
                show_donation_info=random.choice([True, False]),
                donation_for=f"die örtliche Krebshilfe",
                description="Anschließend findet ein Leichenschmaus im Gasthaus zur Post statt."
            )
            # Zusätzlicher Termin (z.B. Beisetzung)
            if random.random() > 0.5:
                 MemorialEvent.objects.create(
                    page=page,
                    is_public=True,
                    title="Beisetzung der Urne",
                    date=date_of_death + timedelta(days=14, hours=11),
                    show_location=True,
                    location_name=page.cemetery,
                    location_address=fake.street_address(),
                    description="Die Beisetzung findet im engsten Familienkreis statt."
                )

            
            TimelineEvent.objects.filter(page=page).delete()
            TimelineEvent.objects.create(page=page, date=date_of_birth + timedelta(days=random.randint(6000, 8000)), title="Einschulung", description=f"{first_name} kam in die Volksschule in {fake.city()}.")
            TimelineEvent.objects.create(page=page, date=date_of_birth + timedelta(days=random.randint(10000, 12000)), title="Erste große Reise", description=f"Die erste große Reise führte {first_name} nach {fake.country()}.")

            GalleryItem.objects.filter(page=page).delete()
            for _ in range(random.randint(4, 8)):
                GalleryItem.objects.create(page=page, image=MediaAsset.objects.filter(file_url=random.choice(image_pools['gallery_images'])).first(), caption=fake.sentence(nb_words=4))

            MemorialCandle.objects.filter(page=page).delete()
            if candle_images_in_db:
                for _ in range(random.randint(25, 50)): # Erhöhte Anzahl für Paginierung
                    MemorialCandle.objects.create(
                        page=page,
                        guest_name=f"{fake.first_name()} {fake.last_name()}",
                        message=fake.sentence(nb_words=random.randint(3, 8)),
                        candle_image=random.choice(candle_images_in_db)
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database with 50 rich personas.'))
