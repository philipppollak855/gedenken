# backend/api/management/commands/seed_data.py
# ERWEITERT: Erstellt 50 einzigartige, extrem detailreiche Persönlichkeiten mit massiv erweiterten, einzigartigen Datenpools.

import random
from datetime import timedelta
from django.core.management.base import BaseCommand
from django.utils import timezone
from faker import Faker
from api.models import User, MemorialPage, Condolence, MemorialEvent, MediaAsset, CandleImage, TimelineEvent, GalleryItem, MemorialCandle, EventLocation

class Command(BaseCommand):
    help = 'Seeds the database with 50 rich and varied example users and memorial pages.'

    def handle(self, *args, **kwargs):
        self.stdout.write(self.style.SUCCESS('Starting database seeding with 50 enhanced personas...'))
        
        if not User.objects.filter(email='philipp.pollak855@gmail.com').exists():
            User.objects.create_superuser('philipp.pollak855@gmail.com', '24061998')
            self.stdout.write(self.style.SUCCESS('Superuser "philipp.pollak855@gmail.com" created with password "24061998".'))

        fake = Faker('de_AT')

        # === MASSIV ERWEITERTE DATENPOOLS ===
        personas = [
            {'type': 'Gärtner', 'gender': 'male', 'hobby': 'seinen geliebten Garten hegte und pflegte'},
            {'type': 'Großmutter', 'gender': 'female', 'hobby': 'mit Hingabe für ihre Familie da war'},
            {'type': 'Musiker', 'gender': 'male', 'hobby': 'mit seiner Gitarre die Herzen der Menschen berührte'},
            {'type': 'Reisende', 'gender': 'female', 'hobby': 'die Welt mit Neugier entdeckte'},
            {'type': 'Leser', 'gender': 'male', 'hobby': 'in der Welt der Bücher zuhause war'},
            {'type': 'Köchin', 'gender': 'female', 'hobby': 'Freunde mit ihren Kreationen verwöhnte'},
            {'type': 'Vereinsmeier', 'gender': 'male', 'hobby': 'im örtlichen Fußballverein seine Heimat fand'},
            {'type': 'Ärztin', 'gender': 'female', 'hobby': 'sich aufopferungsvoll um ihre Patienten kümmerte'},
            {'type': 'Tischler', 'gender': 'male', 'hobby': 'aus Holz wahre Kunstwerke schuf'},
            {'type': 'Tänzerin', 'gender': 'female', 'hobby': 'ihr Leben lang dem Tanz verbunden war'},
            {'type': 'Lehrer', 'gender': 'male', 'hobby': 'Generationen von Schülern prägte'},
            {'type': 'Künstlerin', 'gender': 'female', 'hobby': 'die Welt durch Gemälde bunter machte'},
            {'type': 'Bergsteiger', 'gender': 'male', 'hobby': 'auf den höchsten Gipfeln sein Glück fand'},
            {'type': 'Schneiderin', 'gender': 'female', 'hobby': 'mit Nadel und Faden Träume webte'},
            {'type': 'Angler', 'gender': 'male', 'hobby': 'in der Stille am Seeufer seine Mitte fand'},
            {'type': 'Tierfreundin', 'gender': 'female', 'hobby': 'jedem Tier in Not ein Zuhause gab'},
            {'type': 'Fotograf', 'gender': 'male', 'hobby': 'die Momente des Lebens in Bildern festhielt'},
            {'type': 'Chorsängerin', 'gender': 'female', 'hobby': 'im Kirchenchor für Gänsehautmomente sorgte'},
            {'type': 'Winzer', 'gender': 'male', 'hobby': 'mit Leidenschaft seinen eigenen Wein kelterte'},
            {'type': 'Historikerin', 'gender': 'female', 'hobby': 'die Geschichten der Vergangenheit lebendig werden ließ'},
            {'type': 'Imker', 'gender': 'male', 'hobby': 'sich liebevoll um seine Bienen kümmerte'},
            {'type': 'Bibliothekarin', 'gender': 'female', 'hobby': 'die Ordnung und den Duft von Büchern liebte'},
            {'type': 'Schachspieler', 'gender': 'male', 'hobby': 'in strategischen Zügen dachte'},
            {'type': 'Yogalehrerin', 'gender': 'female', 'hobby': 'innere Ruhe und Ausgeglichenheit ausstrahlte'},
            {'type': 'Pilot', 'gender': 'male', 'hobby': 'den Wolken näher war als dem Boden'},
            {'type': 'Konditorin', 'gender': 'female', 'hobby': 'die süßesten Versuchungen kreierte'},
            {'type': 'Feuerwehrmann', 'gender': 'male', 'hobby': 'mutig für die Sicherheit anderer einstand'},
            {'type': 'Floristin', 'gender': 'female', 'hobby': 'mit Blumen Geschichten erzählte'},
            {'type': 'Astronom', 'gender': 'male', 'hobby': 'nachts die Sterne beobachtete'},
            {'type': 'Apothekerin', 'gender': 'female', 'hobby': 'stets den richtigen Rat wusste'},
            {'type': 'Bauer', 'gender': 'male', 'hobby': 'im Einklang mit der Natur lebte'},
            {'type': 'Journalistin', 'gender': 'female', 'hobby': 'neugierig den Dingen auf den Grund ging'},
            {'type': 'Uhrmacher', 'gender': 'male', 'hobby': 'die Zeit zum Stillstand bringen konnte'},
            {'type': 'Architektin', 'gender': 'female', 'hobby': 'Räume mit Leben und Licht füllte'},
            {'type': 'Segler', 'gender': 'male', 'hobby': 'sich vom Wind über die Meere tragen ließ'},
            {'type': 'Richterin', 'gender': 'female', 'hobby': 'stets für Gerechtigkeit eintrat'},
            {'type': 'Bäcker', 'gender': 'male', 'hobby': 'jeden Morgen den Duft von frischem Brot verbreitete'},
            {'type': 'Übersetzerin', 'gender': 'female', 'hobby': 'Brücken zwischen den Kulturen baute'},
            {'type': 'Jäger', 'gender': 'male', 'hobby': 'den Wald und seine Bewohner respektierte'},
            {'type': 'Physikerin', 'gender': 'female', 'hobby': 'die Geheimnisse des Universums entschlüsselte'},
            {'type': 'Taxifahrer', 'gender': 'male', 'hobby': 'immer eine gute Geschichte zu erzählen wusste'},
            {'type': 'Krankenschwester', 'gender': 'female', 'hobby': 'mitfühlend und unermüdlich für andere da war'},
            {'type': 'Mechaniker', 'gender': 'male', 'hobby': 'jedes noch so alte Auto wieder zum Laufen brachte'},
            {'type': 'Goldschmiedin', 'gender': 'female', 'hobby': 'filigranen Schmuck von zeitloser Schönheit schuf'},
            {'type': 'Philosoph', 'gender': 'male', 'hobby': 'über die großen Fragen des Lebens nachdachte'},
            {'type': 'Mathematikerin', 'gender': 'female', 'hobby': 'in der Eleganz der Zahlen ihre Erfüllung fand'},
            {'type': 'Förster', 'gender': 'male', 'hobby': 'den Wald wie seine Westentasche kannte'},
            {'type': 'Stewardess', 'gender': 'female', 'hobby': 'mit einem Lächeln die Welt bereiste'},
            {'type': 'Elektriker', 'gender': 'male', 'hobby': 'in jedem Chaos den richtigen Draht fand'},
            {'type': 'Dichterin', 'gender': 'female', 'hobby': 'ihre Gefühle in wunderschöne Worte fasste'},
        ] * 5

        image_pools = {
            'portrait_male': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1' for p_id in [91227, 614810, 2379004, 1212984, 532220, 842980, 837358, 1040880, 1680140, 2218786, 1516680, 3778603, 3777973, 937481, 1082962, 1222271, 1462980, 3764119, 3785079, 3760366, 810449, 1300402, 2180883, 2589653, 3184611, 428040, 697509, 1043474, 1181676, 1559486, 2102416, 2623912, 3769021, 3775576, 3781341, 3932343, 53787, 846741, 948925, 1049298, 1121796, 1310785, 1674664, 2955302, 3078421, 3762803, 3772523, 3789764, 3918418, 415829, 3760362, 3760361, 3760359, 3760358, 3760357, 3760356, 3760355, 3760354, 3760353, 3760352]],
            'portrait_female': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=500&h=600&dpr=1' for p_id in [774909, 1065084, 733872, 1130626, 1239291, 943084, 1036623, 1181519, 1587009, 2726111, 762020, 1082959, 1181686, 1310775, 1382731, 1844036, 2169434, 2218783, 2804282, 3762813, 3769021, 3772523, 3781341, 3789764, 38554, 415829, 712521, 774095, 873212, 903661, 1024399, 1181424, 1239286, 1468379, 1542085, 1858175, 2093348, 2613260, 2776582, 3764578, 3771089, 3775576, 3781341, 3816259, 3828945, 3863793, 3918418, 4009626, 4100117, 415829]],
            'background_nature': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' for p_id in [36717, 1528640, 417074, 257360, 1323550, 1461974, 1144176, 3408744, 1287145, 167699, 459225, 302743, 273901, 33109, 462118, 533923, 572897, 678725, 709552, 747964] * 5],
            'background_calm': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' for p_id in [1287145, 3408744, 2387873, 1001682, 1739842, 994605, 2694037, 2832034, 3225524, 3292604, 235615, 358572, 460437, 1072179, 1118873, 1533720, 1632913, 2098085, 2129796, 2247179] * 5],
            'background_travel': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1' for p_id in [2104152, 3889852, 386009, 1450360, 2356045, 338504, 1658967, 2161447, 2440061, 258117, 1271619, 1485894, 1531660, 1631677, 208701, 2325446, 238622, 2869373, 3277935, 347141] * 5],
            'obituary_cards': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=560&dpr=1' for p_id in [132474, 776632, 933255, 1020016, 1102915, 1655166, 2695393, 3244513, 370799, 459225, 957024, 1054289, 1118869, 1366919, 1420702, 1525041, 1640243, 1784578, 2049422, 21014] * 5],
            'acknowledgement_images': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1' for p_id in [450059, 163064, 262508, 316466, 355948, 414579, 461049, 534164, 669615, 70741, 1595391, 1666021, 2045600, 2128249, 2255441, 260689, 296559, 3184418, 3184431, 3184465] * 5],
            'memorial_pictures': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=350&h=262&dpr=1' for p_id in [1105325, 167698, 372098, 459301, 531321, 54124, 701439, 754082, 842811, 948873, 104827, 1122409, 1254140, 1545743, 1576958, 1638462, 170811, 2127037, 236915, 247314] * 5],
            'gallery_images': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=400&h=400&dpr=1' for p_id in [2693212, 3225517, 1535162, 1671325, 2086622, 2249290, 2422461, 2897883, 3028941, 3294250, 356056, 3586966, 374710, 380769, 38544, 405031, 4344860, 450062, 546819, 577585] * 5],
            'candle_images': [f'https://images.pexels.com/photos/{p_id}/pexels-photo-{p_id}.jpeg?auto=compress&cs=tinysrgb&w=200&h=300&dpr=1' for p_id in [247297, 933099, 1126413, 1589338, 1879061, 2155553, 3045439, 3577348, 3682999, 3775602, 3933241, 4040590, 5011494, 5802273, 6253696, 1037995, 1103829, 1126413, 1470405, 1543762] * 2],
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

        event_locations = []
        for _ in range(20):
            location, _ = EventLocation.objects.get_or_create(
                name=f"Pfarrkirche {fake.city()}",
                defaults={'address': fake.street_address()}
            )
            event_locations.append(location)
        for _ in range(20):
            location, _ = EventLocation.objects.get_or_create(
                name=f"{fake.street_name()} Friedhof",
                defaults={'address': fake.street_address()}
            )
            event_locations.append(location)

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
                    'memorial_picture_back': MediaAsset.objects.filter(file_url=random.choice(image_pools['memorial_pictures'])).first(),
                    'acknowledgement_image': MediaAsset.objects.filter(file_url=random.choice(image_pools['acknowledgement_images'])).first(),
                    'acknowledgement_type': 'image',
                    'donation_text': f"Anstelle von Blumen bitten wir um eine Spende für '{fake.company()}'." if random.random() > 0.5 else "",
                }
            )
            
            self.stdout.write(f'({i+1}/50) Processed page for {first_name} {last_name} ({persona["type"]})')

            Condolence.objects.filter(page=page).delete()
            for _ in range(random.randint(15, 40)):
                message = f"{random.choice(condolence_starters)} {random.choice(condolence_middles)} {random.choice(condolence_enders)}"
                Condolence.objects.create(page=page, guest_name=f"{fake.first_name()} {fake.last_name()}", message=message, is_approved=True)

            MemorialEvent.objects.filter(page=page).delete()
            for _ in range(random.randint(2, 4)):
                MemorialEvent.objects.create(
                    page=page,
                    is_public=True,
                    title=random.choice(["Trauerfeier", "Beisetzung", "Rosenkranz", "Gedenkgottesdienst"]),
                    date=date_of_death + timedelta(days=random.randint(5, 20), hours=random.randint(9, 18)),
                    show_location=True,
                    location=random.choice(event_locations),
                    show_dresscode=random.choice([True, False]),
                    dresscode="Um dunkle Kleidung wird gebeten.",
                    show_condolence_note=True,
                    condolence_note="Von Beileidsbezeugungen am Grab bitten wir Abstand zu nehmen.",
                    show_donation_info=random.choice([True, False]),
                    donation_for=f"die örtliche Krebshilfe",
                    description="Anschließend findet ein Leichenschmaus im Gasthaus zur Post statt."
                )
            
            TimelineEvent.objects.filter(page=page).delete()
            for _ in range(random.randint(3, 5)):
                TimelineEvent.objects.create(
                    page=page,
                    date=date_of_birth + timedelta(days=random.randint(6000, 20000)),
                    title=fake.catch_phrase(),
                    description=fake.paragraph(nb_sentences=2)
                )

            GalleryItem.objects.filter(page=page).delete()
            for _ in range(random.randint(6, 12)):
                GalleryItem.objects.create(page=page, image=MediaAsset.objects.filter(file_url=random.choice(image_pools['gallery_images'])).first(), caption=fake.sentence(nb_words=4))

            MemorialCandle.objects.filter(page=page).delete()
            if candle_images_in_db:
                for _ in range(random.randint(30, 60)):
                    MemorialCandle.objects.create(
                        page=page,
                        guest_name=f"{fake.first_name()} {fake.last_name()}",
                        message=fake.sentence(nb_words=random.randint(3, 8)),
                        candle_image=random.choice(candle_images_in_db)
                    )

        self.stdout.write(self.style.SUCCESS('Successfully seeded the database with 50 rich personas.'))
