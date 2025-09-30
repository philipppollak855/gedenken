# backend/api/models.py
# ERWEITERT: Zusätzliche Felder für die Personalisierung von Titeln im Header und auf der Auswahlseite.
# KORRIGIERT: Alle RGBA-Farbfelder wurden auf reine Hex-Code-Felder umgestellt.
# FINALE KORREKTUR: max_length für Farbfelder auf 30 erhöht, um Migrationsfehler zu beheben.

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError
from django.conf import settings

class MediaFolder(models.Model):
    name = models.CharField("Ordnername", max_length=100)
    parent = models.ForeignKey('self', on_delete=models.CASCADE, null=True, blank=True, related_name='children', verbose_name="Übergeordneter Ordner")
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    memorial_page = models.OneToOneField('MemorialPage', on_delete=models.SET_NULL, null=True, blank=True, related_name='media_folder', verbose_name="Zugehörige Gedenkseite")

    class Meta:
        verbose_name = "Medien-Ordner"
        verbose_name_plural = "Medien-Ordner"
        ordering = ['name']

    def __str__(self):
        if self.parent:
            return f"{self.parent} > {self.name}"
        return self.name

class MediaAsset(models.Model):
    class AssetType(models.TextChoices):
        IMAGE = 'image', 'Bild'
        DOCUMENT = 'document', 'Dokument'
        OTHER = 'other', 'Andere'

    title = models.CharField("Titel / Name", max_length=255)
    file_upload = models.FileField("Datei-Upload (Lokal)", upload_to='media_assets/%Y/%m/', blank=True, null=True)
    file_url = models.URLField("Datei-URL (Extern)", max_length=1024, blank=True, null=True)
    asset_type = models.CharField("Dateityp", max_length=10, choices=AssetType.choices, default=AssetType.IMAGE)
    uploaded_at = models.DateTimeField("Hochgeladen am", auto_now_add=True)
    folder = models.ForeignKey(MediaFolder, on_delete=models.SET_NULL, null=True, blank=True, related_name='assets', verbose_name="Ordner")

    @property
    def url(self):
        if self.file_url:
            return self.file_url
        if self.file_upload:
            try:
                backend_url = getattr(settings, 'BACKEND_URL', '').rstrip('/')
                if not backend_url:
                    backend_url = 'https://vorsorge-backend.onrender.com'
                file_url = self.file_upload.url
                return f"{backend_url}{file_url}"
            except Exception:
                # Fallback: return relative URL
                return self.file_upload.url
        return None

    def clean(self):
        if self.file_upload and self.file_url:
            raise ValidationError("Bitte geben Sie entweder einen Datei-Upload oder eine URL an, nicht beides.")
        if not self.file_upload and not self.file_url:
            raise ValidationError("Sie müssen entweder eine Datei hochladen oder eine URL angeben.")

    def __str__(self):
        return self.title

    class Meta:
        verbose_name = "Mediendatei"
        verbose_name_plural = "Mediathek"
        ordering = ['-uploaded_at']

class EventLocation(models.Model):
    name = models.CharField("Name des Ortes", max_length=255, help_text="z.B. 'Pfarrkirche St. Stephan'")
    address = models.CharField("Adresse (Straße, PLZ, Ort)", max_length=255)

    def __str__(self):
        return self.name

    class Meta:
        verbose_name = "Veranstaltungsort"
        verbose_name_plural = "Veranstaltungsorte (Stammdaten)"

class UserManager(BaseUserManager):
    def create_user(self, email=None, password=None, **extra_fields):
        # Für Verstorbene: E-Mail automatisch generieren falls nicht vorhanden
        if not email and extra_fields.get('role') == User.Role.VERSTORBENER:
            user_id = extra_fields.get('id', uuid.uuid4())
            email = f"{user_id}@verstorben.local"
            extra_fields['id'] = user_id
        
        # E-Mail normalisieren falls vorhanden
        if email:
            email = self.normalize_email(email)
        
        user = self.model(email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        extra_fields.setdefault('role', 'administrator')
        return self.create_user(email, password, **extra_fields)

class User(AbstractBaseUser, PermissionsMixin):
    class Meta:
        verbose_name = "Benutzer"
        verbose_name_plural = "Benutzer"
        
    class Role(models.TextChoices):
        VORSORGENDER = 'vorsorgender', 'Vorsorgender'
        ANGEHOERIGER = 'angehoeriger', 'Angehöriger'
        VERSTORBENER = 'verstorbener', 'Verstorbener'
        GAST = 'gast', 'Gast'
        ADMINISTRATOR = 'administrator', 'Administrator'

    id = models.UUIDField("ID", primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("E-Mail-Adresse", unique=True, blank=True, null=True)
    first_name = models.CharField("Vorname", max_length=100, blank=True)
    last_name = models.CharField("Nachname", max_length=100, blank=True)
    role = models.CharField("Rolle", max_length=20, choices=Role.choices, default=Role.VORSORGENDER)
    consent_admin_access = models.BooleanField("Zustimmung Admin-Zugriff", default=False)
    profile_completeness = models.IntegerField("Profil-Vollständigkeit", default=0)
    is_active = models.BooleanField("Aktiv", default=True)
    is_staff = models.BooleanField("Mitarbeiter", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Zuletzt geändert", auto_now=True)
    
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = []

    def clean(self):
        super().clean()
        # Für Verstorbene: E-Mail automatisch generieren falls nicht vorhanden
        if not self.email and self.role == self.Role.VERSTORBENER:
            if not self.id:  # Nur wenn noch keine ID vorhanden (neuer User)
                self.id = uuid.uuid4()
            self.email = f"{self.id}@verstorben.local"

    def save(self, *args, **kwargs):
        # E-Mail für Verstorbene setzen falls noch nicht gesetzt
        if not self.email and self.role == self.Role.VERSTORBENER:
            if not self.id:  # ID generieren falls noch nicht vorhanden
                self.id = uuid.uuid4()
            self.email = f"{self.id}@verstorben.local"
        super().save(*args, **kwargs)

    def get_full_name(self):
        """Gibt den vollständigen Namen des Benutzers zurück"""
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}".strip()
        elif self.first_name:
            return self.first_name.strip()
        elif self.last_name:
            return self.last_name.strip()
        elif self.email:
            return self.email
        else:
            return f"Benutzer {self.id}"

    def __str__(self):
        return self.get_full_name()

class MemorialPage(models.Model):
    class Meta:
        verbose_name = "Gedenkseite"
        verbose_name_plural = "Gedenkseiten"
    
    class Status(models.TextChoices):
        INACTIVE = 'inactive', 'Inaktiv'
        ACTIVE = 'active', 'Aktiv'
        ARCHIVED = 'archived', 'Archiviert'

    class BackgroundSize(models.TextChoices):
        COVER = 'cover', 'Gestreckt (füllend)'
        CONTAIN = 'contain', 'Eingepasst (komplett sichtbar)'

    class AcknowledgementType(models.TextChoices):
        NONE = 'none', 'Keine Danksagung'
        IMAGE = 'image', 'Bild'
        TEXT = 'text', 'Text'

    class BirthNameType(models.TextChoices):
        BIRTH_NAME = 'geb', 'Geburtsname'
        TITLE = 'title', 'Titel'
        
    class ModerationStatus(models.TextChoices):
        NOT_MODERATED = 'not_moderated', 'Nicht moderiert (sofort sichtbar)'
        ADMIN_MODERATED = 'admin_moderated', 'Von Admin moderiert'
        FAMILY_MODERATED = 'family_moderated', 'Von Familie moderiert'
    
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='memorial_page', verbose_name="Benutzer")
    
    slug = models.SlugField("URL-Alias", max_length=255, unique=True, blank=True, help_text="Wird automatisch aus dem Namen generiert, wenn leer gelassen.")
    status = models.CharField("Status", max_length=10, choices=Status.choices, default=Status.INACTIVE)
    first_name = models.CharField("Vorname", max_length=100, blank=True)
    last_name = models.CharField("Nachname", max_length=100, blank=True)
    birth_name_type = models.CharField("Art", max_length=5, choices=BirthNameType.choices, default=BirthNameType.BIRTH_NAME)
    birth_name_or_title = models.CharField("Geburtsname / Titel", max_length=100, blank=True)
    date_of_birth = models.DateField("Geburtsdatum", null=True, blank=True)
    date_of_death = models.DateField("Sterbedatum", null=True, blank=True)
    cemetery = models.CharField("Friedhof", max_length=255, blank=True)
    main_photo = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Portraitbild Hero-Bereich")
    hero_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Hero-Bereich")
    hero_background_size = models.CharField("Anpassung Hintergrundbild Hero", max_length=10, choices=BackgroundSize.choices, default=BackgroundSize.COVER)
    
    obituary = models.TextField("Nachruf", blank=True)
    donation_text = models.TextField("Angezeigter Spendenaufruf", blank=True)
    donation_link = models.URLField("Spenden-Link", max_length=255, blank=True)
    donation_bank_details = models.TextField("Spenden-Bankverbindung", blank=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Zuletzt geändert", auto_now=True)
    farewell_background_color = models.CharField("Hintergrundfarbe Abschied", max_length=7, blank=True, help_text="Hex-Code, z.B. #f4f1ee")
    farewell_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Abschied")
    farewell_background_size = models.CharField("Anpassung Hintergrundbild Abschied", max_length=10, choices=BackgroundSize.choices, default=BackgroundSize.COVER)
    farewell_text_inverted = models.BooleanField("Textfarbe im Abschiedsbereich umkehren (für helle Hintergründe)", default=False)
    obituary_card_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Partezettel Bild")
    
    show_memorial_picture = models.BooleanField("Gedenkbild anzeigen", default=True)
    memorial_picture = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Gedenkbild Vorderseite")
    memorial_picture_back = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Gedenkbild Rückseite")
    
    acknowledgement_type = models.CharField("Art der Danksagung", max_length=5, choices=AcknowledgementType.choices, default=AcknowledgementType.NONE)
    acknowledgement_text = models.TextField("Danksagung (Text)", blank=True)
    acknowledgement_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Danksagung Bild")
    
    condolence_moderation = models.CharField(
        "Kondolenz-Moderation",
        max_length=20,
        choices=ModerationStatus.choices,
        default=ModerationStatus.NOT_MODERATED
    )

    def save(self, *args, **kwargs):
        if not self.slug:
            base_slug = slugify(f"{self.first_name}-{self.last_name}")
            slug = base_slug
            counter = 1
            while MemorialPage.objects.filter(slug=slug).exclude(pk=self.pk).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug

        super().save(*args, **kwargs)

        folder_name = f"{self.first_name} {self.last_name}".strip()
        if folder_name:
            try:
                parent_folder, _ = MediaFolder.objects.get_or_create(
                    name="Gedenkseiten",
                    parent=None
                )
                folder, created = MediaFolder.objects.get_or_create(
                    memorial_page=self,
                    defaults={'name': folder_name, 'parent': parent_folder}
                )
                
                if not created and folder.parent != parent_folder:
                    folder.parent = parent_folder
                    folder.save()

                image_fields_to_check = [
                    'main_photo', 'hero_background_image', 'farewell_background_image',
                    'obituary_card_image', 'memorial_picture', 'memorial_picture_back',
                    'acknowledgement_image'
                ]
                for field_name in image_fields_to_check:
                    image_asset = getattr(self, field_name, None)
                    if image_asset and not image_asset.folder:
                        image_asset.folder = folder
                        image_asset.save()
            except Exception as e:
                print(f"Could not create or assign media folder for {self}: {e}")

        try:
            user = self.user
            if user.role != User.Role.VERSTORBENER and self.status == self.Status.ACTIVE:
                user.role = User.Role.VERSTORBENER
                user.save()
        except User.DoesNotExist:
            pass

    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        if self.user:
            return f"{self.user.first_name} {self.user.last_name}"
        return "Unbenannte Gedenkseite"

class SiteSettings(models.Model):
    class FontChoices(models.TextChoices):
        ROBOTO = "'Roboto', sans-serif", "Roboto"
        OPEN_SANS = "'Open Sans', sans-serif", "Open Sans"
        LATO = "'Lato', sans-serif", "Lato"
        MONTSERRAT = "'Montserrat', sans-serif", "Montserrat"
        SOURCE_SANS = "'Source Sans Pro', sans-serif", "Source Sans Pro"

    class Meta:
        verbose_name = "Globale Design-Einstellungen"
        verbose_name_plural = "Globale Design-Einstellungen"
        
    # --- Header / Navigation ---
    header_logo_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Logo-Bild (ersetzt Text)")
    header_logo_height = models.CharField("Logo-Höhe", max_length=10, blank=True, default="40px", help_text="CSS-Wert, z.B. 40px")
    header_site_title_text = models.CharField("Seiten-Titel (Text)", max_length=100, blank=True, default="Gedenken & Vorsorge")
    header_site_title_color = models.CharField("Farbe Seiten-Titel", max_length=7, blank=True, default="#3a3a3a")
    header_site_title_size = models.CharField("Schriftgröße Seiten-Titel", max_length=10, blank=True, default="1.5rem")
    header_button_text_size = models.CharField("Schriftgröße Buttons", max_length=10, blank=True, default="1rem")

    # --- Portal Auswahlseite (Allgemein) ---
    portal_choice_title = models.CharField("Titel (Auswahlseite)", max_length=100, blank=True, default="Mein Bereich")
    portal_choice_title_color = models.CharField("Farbe Titel", max_length=7, blank=True, default="#3a3a3a")
    portal_choice_subtitle = models.TextField("Untertitel (Auswahlseite)", blank=True, default="Bitte wählen Sie den Bereich aus, den Sie verwalten möchten.")
    portal_choice_subtitle_color = models.CharField("Farbe Untertitel", max_length=7, blank=True, default="#6b7280")
    portal_choice_background_color = models.CharField("Hintergrundfarbe (Auswahlseite)", max_length=7, blank=True, default="#f4f1ee")
    portal_choice_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild (Auswahlseite)")
    
    # --- Gedenken-Säule ---
    gedenken_card_sidetext = models.CharField("Seitentext (Gedenken-Säule)", max_length=50, blank=True, default="Gedenken")
    gedenken_card_sidetext_color = models.CharField("Farbe Seitentext", max_length=30, blank=True, default="#FFFFFF")
    gedenken_card_sidetext_size = models.CharField("Schriftgröße Seitentext", max_length=10, blank=True, default="3.2rem")
    gedenken_card_background_color = models.CharField("Hintergrundfarbe (Gedenken-Säule)", max_length=7, blank=True, default="#8c8073")
    gedenken_card_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild (Gedenken-Säule)")
    gedenken_card_title = models.CharField("Titel (Gedenken-Beschreibung)", max_length=100, blank=True, default="Gedenken")
    gedenken_card_title_color = models.CharField("Farbe Titel", max_length=7, blank=True, default="#FFFFFF")
    gedenken_card_title_size = models.CharField("Schriftgröße Titel", max_length=10, blank=True, default="2.5rem")
    gedenken_card_details_text = models.TextField("Detaillierte Beschreibung (Gedenken)", blank=True, default="<ul><li><strong>Gedenkseiten verwalten:</strong> Erstellen und pflegen Sie eine persönliche Seite.</li><li><strong>Angehörige einladen:</strong> Vergeben Sie Berechtigungen.</li><li><strong>Meine Beiträge:</strong> Sehen Sie all Ihre Kondolenzen und Gedenkkerzen.</li></ul>")
    gedenken_card_details_text_color = models.CharField("Farbe Beschreibungstext", max_length=7, blank=True, default="#FFFFFF")
    gedenken_card_details_text_size = models.CharField("Schriftgröße Beschreibungstext", max_length=10, blank=True, default="0.95rem")
    gedenken_card_content_background = models.CharField("Hintergrundfarbe Beschreibung", max_length=30, blank=True, default="#3a3a3a")
    gedenken_card_slide_transparency = models.CharField("Slide-in Transparenz", max_length=10, blank=True, default="0.9", help_text="Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)")

    # --- Vorsorge-Säule ---
    vorsorge_card_sidetext = models.CharField("Seitentext (Vorsorge-Säule)", max_length=50, blank=True, default="Vorsorge")
    vorsorge_card_sidetext_color = models.CharField("Farbe Seitentext", max_length=30, blank=True, default="#FFFFFF")
    vorsorge_card_sidetext_size = models.CharField("Schriftgröße Seitentext", max_length=10, blank=True, default="3.2rem")
    vorsorge_card_background_color = models.CharField("Hintergrundfarbe (Vorsorge-Säule)", max_length=7, blank=True, default="#6d6d6d")
    vorsorge_card_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild (Vorsorge-Säule)")
    vorsorge_card_title = models.CharField("Titel (Vorsorge-Beschreibung)", max_length=100, blank=True, default="Vorsorge")
    vorsorge_card_title_color = models.CharField("Farbe Titel", max_length=7, blank=True, default="#FFFFFF")
    vorsorge_card_title_size = models.CharField("Schriftgröße Titel", max_length=10, blank=True, default="2.5rem")
    vorsorge_card_details_text = models.TextField("Detaillierte Beschreibung (Vorsorge)", blank=True, default="<ul><li><strong>Meine Vorsorge:</strong> Regeln Sie alles Wichtige von Verträgen bis zum digitalen Nachlass.</li><li><strong>Eigene Gedenkseite:</strong> Gestalten Sie zu Lebzeiten Ihre persönliche Gedenkseite.</li><li><strong>Wichtige Medien:</strong> Verwalten Sie sicher alle Dokumente und Bilder.</li></ul>")
    vorsorge_card_details_text_color = models.CharField("Farbe Beschreibungstext", max_length=7, blank=True, default="#FFFFFF")
    vorsorge_card_details_text_size = models.CharField("Schriftgröße Beschreibungstext", max_length=10, blank=True, default="0.95rem")
    vorsorge_card_content_background = models.CharField("Hintergrundfarbe Beschreibung", max_length=30, blank=True, default="#3a3a3a")
    vorsorge_card_slide_transparency = models.CharField("Slide-in Transparenz", max_length=10, blank=True, default="0.9", help_text="Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)")

    # --- Unterlagen-Säule ---
    unterlagen_card_sidetext = models.CharField("Seitentext (Unterlagen-Säule)", max_length=50, blank=True, default="Unterlagen")
    unterlagen_card_sidetext_color = models.CharField("Farbe Seitentext", max_length=30, blank=True, default="#FFFFFF")
    unterlagen_card_sidetext_size = models.CharField("Schriftgröße Seitentext", max_length=10, blank=True, default="3.2rem")
    unterlagen_card_background_color = models.CharField("Hintergrundfarbe (Unterlagen-Säule)", max_length=7, blank=True, default="#5a6c7d")
    unterlagen_card_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild (Unterlagen-Säule)")
    unterlagen_card_title = models.CharField("Titel (Unterlagen-Beschreibung)", max_length=100, blank=True, default="Unterlagen")
    unterlagen_card_title_color = models.CharField("Farbe Titel", max_length=7, blank=True, default="#FFFFFF")
    unterlagen_card_title_size = models.CharField("Schriftgröße Titel", max_length=10, blank=True, default="2.5rem")
    unterlagen_card_details_text = models.TextField("Detaillierte Beschreibung (Unterlagen)", blank=True, default="<ul><li><strong>Freigaben:</strong> Verwalten Sie alle wichtigen Dokumente und Berechtigungen.</li><li><strong>Dokumente:</strong> Organisieren Sie Ihre wichtigen Unterlagen sicher.</li><li><strong>Trauerdruck:</strong> Gestalten Sie persönliche Erinnerungsstücke.</li></ul>")
    unterlagen_card_details_text_color = models.CharField("Farbe Beschreibungstext", max_length=7, blank=True, default="#FFFFFF")
    unterlagen_card_details_text_size = models.CharField("Schriftgröße Beschreibungstext", max_length=10, blank=True, default="0.95rem")
    unterlagen_card_content_background = models.CharField("Hintergrundfarbe Beschreibung", max_length=30, blank=True, default="#3a3a3a")
    unterlagen_card_slide_transparency = models.CharField("Slide-in Transparenz", max_length=10, blank=True, default="0.9", help_text="Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)")

    # Gedenkseiten-Listing
    listing_title = models.CharField("Titel über den Gedenkkarten", max_length=100, blank=True, default="Wir gedenken")
    listing_background_color = models.CharField("Hintergrundfarbe Startseite", max_length=7, blank=True, help_text="Hex-Code, z.B. #f4f1ee")
    listing_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Startseite")
    listing_card_color = models.CharField("Karten-Hintergrundfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #ffffff")
    listing_text_color = models.CharField("Titel-Textfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")
    listing_card_text_color = models.CharField("Karten-Textfarbe", max_length=7, blank=True, default="#3a3a3a", help_text="Hex-Code, z.B. #3a3a3a")
    listing_arrow_color = models.CharField("Pfeilfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #8c8073", default="#8c8073")
    
    # Suche
    search_title = models.CharField("Titel im Suchbereich", max_length=100, blank=True, default="Verstorbenen Suche")
    search_helper_text = models.TextField("Hilfstext im Suchbereich", blank=True, default="Bitte geben Sie einen oder mehrere Suchbegriffe in die obenstehenden Felder ein, um nach einem Verstorbenen zu suchen.")
    search_background_color = models.CharField("Hintergrundfarbe Suche", max_length=7, blank=True, help_text="Hex-Code, z.B. #e5e0da")
    search_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Suche")
    search_text_color = models.CharField("Textfarbe Suche", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")
    search_filter_button_color = models.CharField("Filter-Button Hintergrund", max_length=7, blank=True, default="#e5e0da")
    search_filter_button_icon_color = models.CharField("Filter-Button Icon", max_length=7, blank=True, default="#3a3a3a")
    search_filter_menu_color = models.CharField("Filter-Menü Hintergrund", max_length=7, blank=True, default="#FFFFFF")
    search_filter_menu_text_color = models.CharField("Filter-Menü Text", max_length=7, blank=True, default="#3a3a3a")
    search_filter_active_color = models.CharField("Filter-Menü Aktiv Hintergrund", max_length=7, blank=True, default="#8c8073")
    search_filter_active_text_color = models.CharField("Filter-Menü Aktiv Text", max_length=7, blank=True, default="#FFFFFF")


    # Expand-Bereich
    expend_background_color = models.CharField("Hintergrundfarbe Expand-Bereich", max_length=7, blank=True, help_text="Hex-Code, z.B. #f4f1ee")
    expend_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Expand-Bereich")
    expend_card_color = models.CharField("Karten-Hintergrundfarbe Expand", max_length=7, blank=True, help_text="Hex-Code, z.B. #ffffff")
    expend_text_color = models.CharField("Textfarbe Expand-Bereich", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")

    # Globale Schriften
    font_family = models.CharField("Schriftart", max_length=100, choices=FontChoices.choices, default=FontChoices.ROBOTO)
    font_size_base = models.CharField("Grundschriftgröße", max_length=10, blank=True, default="14px", help_text="CSS-Wert, z.B. 14px oder 0.9rem")

    # Login-Seite
    login_title = models.CharField("Titel Login-Seite", max_length=100, blank=True, default="Willkommen zurück")
    login_subtitle = models.TextField("Untertitel Login-Seite", blank=True, default="Melden Sie sich an, um auf Ihr persönliches Vorsorge-Dashboard zuzugreifen und Gedenkseiten zu verwalten.")
    login_background_color = models.CharField("Hintergrundfarbe Login", max_length=7, blank=True, help_text="Hex-Code")
    login_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Login")
    login_card_background_color = models.CharField("Hintergrundfarbe Login-Karte", max_length=7, blank=True, default="#FFFFFF")
    login_text_color = models.CharField("Textfarbe Login-Karte", max_length=7, blank=True, default="#3a3a3a")
    login_button_color = models.CharField("Button-Farbe Login", max_length=7, blank=True, default="#8c8073")
    login_button_text_color = models.CharField("Button-Textfarbe Login", max_length=7, blank=True, default="#FFFFFF")

    # Registrierungsseite
    register_title = models.CharField("Titel Registrierungsseite", max_length=100, blank=True, default="Konto erstellen")
    register_subtitle = models.TextField("Untertitel Registrierungsseite", blank=True, default="Erstellen Sie Ihr Konto, um mit der Vorsorge zu beginnen oder einem geliebten Menschen zu gedenken.")
    register_background_color = models.CharField("Hintergrundfarbe Registrierung", max_length=7, blank=True, help_text="Hex-Code")
    register_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Registrierung")
    register_info_panel_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Bild im Info-Panel (Registrierung)")
    register_info_panel_image_size = models.CharField("Anpassung Info-Panel Bild", max_length=10, choices=MemorialPage.BackgroundSize.choices, default=MemorialPage.BackgroundSize.COVER)
    register_card_background_color = models.CharField("Hintergrundfarbe Registrierungs-Karte", max_length=7, blank=True, default="#FFFFFF")
    register_text_color = models.CharField("Textfarbe Registrierungs-Karte", max_length=7, blank=True, default="#3a3a3a")
    register_button_color = models.CharField("Button-Farbe Registrierung", max_length=7, blank=True, default="#8c8073")
    register_button_text_color = models.CharField("Button-Textfarbe Registrierung", max_length=7, blank=True, default="#FFFFFF")

    # Passwort zurücksetzen
    password_reset_title = models.CharField("Titel (Passwort anfordern)", max_length=100, blank=True, default="Passwort vergessen?")
    password_reset_subtitle = models.TextField("Untertitel (Passwort anfordern)", blank=True, default="Geben Sie Ihre E-Mail-Adresse ein. Wir senden Ihnen einen Link, um Ihr Passwort zurückzusetzen.")
    password_reset_background_color = models.CharField("Hintergrundfarbe", max_length=7, blank=True, help_text="Hex-Code")
    password_reset_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild")
    password_reset_card_background_color = models.CharField("Karten-Hintergrundfarbe", max_length=7, blank=True, default="#FFFFFF")
    password_reset_text_color = models.CharField("Textfarbe", max_length=7, blank=True, default="#3a3a3a")
    password_reset_button_color = models.CharField("Button-Farbe", max_length=7, blank=True, default="#8c8073")
    password_reset_button_text_color = models.CharField("Button-Textfarbe", max_length=7, blank=True, default="#FFFFFF")
    
    password_reset_confirm_title = models.CharField("Titel (Neues Passwort)", max_length=100, blank=True, default="Neues Passwort festlegen")
    password_reset_confirm_subtitle = models.TextField("Untertitel (Neues Passwort)", blank=True, default="Bitte geben Sie Ihr neues Passwort ein und bestätigen Sie es.")

    # Mein Bereich
    mein_bereich_background_color = models.CharField("Hintergrundfarbe (Seite)", max_length=7, blank=True, default="#f4f1ee")
    mein_bereich_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild (Seite)")
    mein_bereich_container_background_color = models.CharField("Hintergrundfarbe (Container)", max_length=7, blank=True, default="#FFFFFF")
    mein_bereich_sidebar_background_color = models.CharField("Sidebar Hintergrund", max_length=7, blank=True, default="#f8f9fa")
    mein_bereich_sidebar_text_color = models.CharField("Sidebar Text", max_length=7, blank=True, default="#3a3a3a")
    mein_bereich_sidebar_active_background_color = models.CharField("Sidebar Aktiv Hintergrund", max_length=7, blank=True, default="#8c8073")
    mein_bereich_sidebar_active_text_color = models.CharField("Sidebar Aktiv Text", max_length=7, blank=True, default="#FFFFFF")
    mein_bereich_dashboard_title = models.CharField("Dashboard Titel", max_length=100, blank=True, default="Willkommen in Ihrem Bereich")
    mein_bereich_dashboard_subtitle = models.TextField("Dashboard Untertitel", blank=True, default="Hier haben Sie den Überblick und Zugriff auf alle Ihre persönlichen Daten, Vorsorge-Dokumente und Gedenkseiten.")


    def __str__(self):
        return "Globale Design-Einstellungen"

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SiteSettings, self).save(*args, **kwargs)

class Condolence(models.Model):
    class Meta:
        verbose_name = "Kondolenz"
        verbose_name_plural = "Kondolenzen"
    condolence_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='condolences', verbose_name="Gedenkseite")
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='condolences')
    guest_name = models.CharField("Name des Gastes", max_length=255)
    message = models.TextField("Nachricht")
    is_approved = models.BooleanField("Genehmigt", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    def __str__(self):
        return f"Kondolenz von {self.guest_name}"

class CondolenceTemplate(models.Model):
    class Meta:
        verbose_name = "Kondolenz-Vorlage"
        verbose_name_plural = "Kondolenz-Vorlagen"
        ordering = ['title']

    title = models.CharField("Titel (für Dropdown)", max_length=100, unique=True)
    text = models.TextField("Vorlagen-Text")

    def __str__(self):
        return self.title

class DigitalLegacyItem(models.Model):
    class Meta:
        verbose_name = "Digitaler Nachlass Eintrag"
        verbose_name_plural = "Digitale Nachlass Einträge"
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='legacy_items', verbose_name="Benutzer")
    category = models.CharField("Kategorie", max_length=100)
    provider = models.CharField("Anbieter", max_length=255)
    username_email = models.CharField("Benutzername/E-Mail", max_length=255, blank=True)
    password_hint = models.TextField("Passworthinweis", blank=True)
    instruction = models.TextField("Anweisung")
    notes = models.TextField("Notizen", blank=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Zuletzt geändert", auto_now=True)

class FinancialItem(models.Model):
    class Meta:
        verbose_name = "Finanz-Eintrag"
        verbose_name_plural = "Finanz-Einträge"
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='financial_items', verbose_name="Benutzer")
    product_type = models.CharField("Produktart", max_length=100)
    institute = models.CharField("Institut", max_length=255)
    contract_number = models.CharField("Vertragsnummer/IBAN", max_length=255)
    notes = models.TextField("Notizen", blank=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)

class InsuranceItem(models.Model):
    class Meta:
        verbose_name = "Versicherungs-Eintrag"
        verbose_name_plural = "Versicherungs-Einträge"
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='insurance_items', verbose_name="Benutzer")
    insurance_type = models.CharField("Versicherungsart", max_length=100)
    company = models.CharField("Gesellschaft", max_length=255)
    policy_number = models.CharField("Policennummer", max_length=255)
    notes = models.TextField("Notizen", blank=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)

class ContractItem(models.Model):
    class Meta:
        verbose_name = "Vertrags-Eintrag"
        verbose_name_plural = "Vertrags-Einträge"
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='contract_items', verbose_name="Benutzer")
    contract_type = models.CharField("Vertragsart", max_length=100)
    provider = models.CharField("Anbieter", max_length=255)
    contract_number = models.CharField("Vertragsnummer", max_length=255, blank=True)
    notice_period = models.CharField("Kündigungsfrist", max_length=255, blank=True)
    notes = models.TextField("Notizen", blank=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)

class Document(models.Model):
    class Meta:
        verbose_name = "Dokument"
        verbose_name_plural = "Dokumente"
    doc_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='documents', verbose_name="Benutzer")
    title = models.CharField("Titel", max_length=255)
    document_type = models.CharField("Dokumententyp", max_length=100)
    file = models.FileField("Datei", upload_to='documents/%Y/%m/%d/')
    storage_location_hint = models.TextField("Lagerort-Hinweis", blank=True)
    visible_in_vorsorgefall = models.BooleanField("Im Vorsorgefall sichtbar", default=False)
    uploaded_at = models.DateTimeField("Hochgeladen am", auto_now_add=True)

class LastWishes(models.Model):
    class Meta:
        verbose_name = "Letzter Wunsch"
        verbose_name_plural = "Letzte Wünsche"
    user = models.OneToOneField(User, on_delete=models.CASCADE, primary_key=True, related_name='last_wishes', verbose_name="Benutzer")
    burial_type = models.CharField("Bestattungsart", max_length=100, blank=True)
    burial_location = models.CharField("Bestattungsort", max_length=255, blank=True)
    ceremony_type = models.CharField("Zeremonie-Art", max_length=100, blank=True)
    ceremony_details = models.TextField("Details zur Zeremonie", blank=True)
    music_wishes = models.JSONField("Musikwünsche", default=list, blank=True)
    speaker_wishes = models.TextField("Rednerwünsche", blank=True)
    flower_wishes = models.TextField("Blumenwünsche", blank=True)
    updated_at = models.DateTimeField("Zuletzt geändert", auto_now=True)
    def __str__(self):
        return f"Letzte Wünsche von {self.user.email}"

class TimelineEvent(models.Model):
    class Meta:
        verbose_name = "Chronik-Ereignis"
        verbose_name_plural = "Chronik-Ereignisse"
        ordering = ['date']
    event_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='timeline_events')
    date = models.DateField("Datum des Ereignisses")
    title = models.CharField("Titel", max_length=255)
    description = models.TextField("Beschreibung", blank=True)
    image_url = models.URLField("Bild-URL", blank=True, null=True)

class GalleryItem(models.Model):
    class Meta:
        verbose_name = "Galerie-Eintrag"
        verbose_name_plural = "Galerie-Einträge"
        ordering = ['-created_at']
    item_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='gallery_items')
    image = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, verbose_name="Bild", null=True, blank=True)
    caption = models.CharField("Bildunterschrift", max_length=255, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

class CandleImage(models.Model):
    class CandleType(models.TextChoices):
        STANDARD = 'standard', 'Standardkerze'
        BIRTHDAY = 'birthday', 'Geburtstagskerze'
        ANNIVERSARY = 'anniversary', 'Jahrestagskerze'

    name = models.CharField("Name der Kerze", max_length=100)
    image = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name='+', verbose_name="Kerzen-Bilddatei", null=True, blank=True)
    type = models.CharField("Typ", max_length=20, choices=CandleType.choices, default=CandleType.STANDARD)

    def __str__(self):
        return f"{self.name} ({self.get_type_display()})"

    class Meta:
        verbose_name = "Kerzenbild"
        verbose_name_plural = "Kerzenbilder (Sammlung)"

class CandleMessageTemplate(models.Model):
    title = models.CharField("Titel (für Dropdown)", max_length=100, unique=True)
    text = models.CharField("Vorlagen-Text", max_length=100)

    def __str__(self):
        return self.title
        
    class Meta:
        verbose_name = "Gedenkkerzen-Vorlage"
        verbose_name_plural = "Gedenkkerzen-Vorlagen"

class MemorialCandle(models.Model):
    class Meta:
        verbose_name = "Gedenkkerze"
        verbose_name_plural = "Gedenkkerzen"
        ordering = ['-created_at']
    candle_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='candles')
    author = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='candles')
    guest_name = models.CharField("Name des Gastes", max_length=255, blank=True)
    message = models.CharField("Kurze Nachricht", max_length=100, blank=True)
    is_private = models.BooleanField("Nur für Familie", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    candle_image = models.ForeignKey(CandleImage, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Ausgewähltes Kerzenbild")

class ReleaseRequest(models.Model):
    class Meta:
        verbose_name = "Freigabe-Anfrage"
        verbose_name_plural = "Freigabe-Anfragen"
    class Status(models.TextChoices):
        PENDING = 'pending', 'Ausstehend'
        APPROVED = 'approved', 'Genehmigt'
        REJECTED = 'rejected', 'Abgelehnt'
    request_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deceased_first_name = models.CharField("Vorname (Verstorbener)", max_length=100, null=True, blank=True)
    deceased_last_name = models.CharField("Nachname (Verstorbener)", max_length=100, null=True, blank=True)
    deceased_date_of_birth = models.DateField("Geburtsdatum (Verstorbener)", null=True, blank=True)
    deceased_date_of_death = models.DateField("Sterbedatum (Verstorbener)", null=True, blank=True)
    reporter_name = models.CharField("Name des Meldenden", max_length=255, null=True, blank=True)
    reporter_email = models.EmailField("E-Mail des Meldenden", null=True, blank=True)
    reporter_password = models.CharField("Passwort (gehasht)", max_length=128, null=True, blank=True)
    reporter_relationship = models.CharField("Beziehung zum Verstorbenen", max_length=100, null=True, blank=True)
    death_certificate = models.FileField("Sterbeurkunde", upload_to='certificates/%Y/%m/%d/', null=True, blank=True)
    status = models.CharField("Status", max_length=10, choices=Status.choices, default=Status.PENDING)
    resolved_user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Zugeordneter Vorsorge-Account")
    created_at = models.DateTimeField("Eingegangen am", auto_now_add=True)

# ============================================================================
# BESTATTUNGSVORSORGE MODELLE
# ============================================================================

class Bestattungsart(models.Model):
    """Bestattungsarten für die Vorsorge"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-cross")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Bestattungsart"
        verbose_name_plural = "Bestattungsarten"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class Verabschiedungsart(models.Model):
    """Verabschiedungsarten für die Trauerfeier"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_religious = models.BooleanField("Religiös", default=False)
    religion = models.CharField("Religion", max_length=50, blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-church")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Verabschiedungsart"
        verbose_name_plural = "Verabschiedungsarten"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class MusikKategorie(models.Model):
    """Musik-Kategorien für die Trauerfeier"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-music")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Musik-Kategorie"
        verbose_name_plural = "Musik-Kategorien"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class VereinsKategorie(models.Model):
    """Vereinskategorien für die Trauerfeier"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-users")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Vereinskategorie"
        verbose_name_plural = "Vereinskategorien"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class Grabart(models.Model):
    """Grabarten für die Bestattung"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-tombstone")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Grabart"
        verbose_name_plural = "Grabarten"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class DokumentKategorie(models.Model):
    """Dokumentkategorien für die Vorsorge"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_required = models.BooleanField("Erforderlich", default=False)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-file")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Dokumentkategorie"
        verbose_name_plural = "Dokumentkategorien"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class DigitalerNachlassKategorie(models.Model):
    """Kategorien für den digitalen Nachlass"""
    name = models.CharField("Name", max_length=100)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    icon = models.CharField("Icon (FontAwesome)", max_length=50, default="fas fa-laptop")
    order = models.PositiveIntegerField("Reihenfolge", default=0)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Digitaler Nachlass Kategorie"
        verbose_name_plural = "Digitaler Nachlass Kategorien"
        ordering = ['order', 'name']
    
    def __str__(self):
        return self.name

class Bestattungsvorsorge(models.Model):
    """Hauptmodell für die Bestattungsvorsorge"""
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='bestattungsvorsorgen')
    
    # Bestattungsart
    bestattungsart = models.ForeignKey(Bestattungsart, on_delete=models.SET_NULL, null=True, blank=True)
    bestattungsart_notizen = models.TextField("Notizen zur Bestattungsart", blank=True)
    
    # Verabschiedung
    verabschiedungsart = models.ForeignKey(Verabschiedungsart, on_delete=models.SET_NULL, null=True, blank=True)
    verabschiedungsart_notizen = models.TextField("Notizen zur Verabschiedung", blank=True)
    
    # Musik
    musik_wünsche = models.TextField("Musikwünsche", blank=True)
    musik_kategorien = models.ManyToManyField(MusikKategorie, blank=True)
    
    # Vereine
    vereins_wünsche = models.TextField("Vereinswünsche", blank=True)
    vereins_kategorien = models.ManyToManyField(VereinsKategorie, blank=True)
    
    # Spezielle Wünsche
    spezielle_wünsche = models.TextField("Spezielle Wünsche", blank=True)
    blumenschmuck = models.TextField("Blumenschmuck", blank=True)
    kleidung = models.TextField("Kleidung", blank=True)
    
    # Grab
    grabart = models.ForeignKey(Grabart, on_delete=models.SET_NULL, null=True, blank=True)
    friedhof = models.CharField("Friedhof", max_length=200, blank=True)
    grabnummer = models.CharField("Grabnummer", max_length=50, blank=True)
    grab_wünsche = models.TextField("Grabwünsche", blank=True)
    
    # Status
    is_completed = models.BooleanField("Abgeschlossen", default=False)
    completion_percentage = models.PositiveIntegerField("Fortschritt (%)", default=0)
    
    # Metadaten
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Bestattungsvorsorge"
        verbose_name_plural = "Bestattungsvorsorgen"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"Bestattungsvorsorge von {self.user.get_full_name()}"
    
    def calculate_completion_percentage(self):
        """Berechnet den Fortschritt der Vorsorge"""
        fields = [
            self.bestattungsart,
            self.verabschiedungsart,
            self.musik_wünsche,
            self.spezielle_wünsche,
            self.grabart,
            self.friedhof
        ]
        completed = sum(1 for field in fields if field)
        return int((completed / len(fields)) * 100)

class BestattungsvorsorgeDokument(models.Model):
    """Dokumente für die Bestattungsvorsorge"""
    vorsorge = models.ForeignKey(Bestattungsvorsorge, on_delete=models.CASCADE, related_name='dokumente')
    kategorie = models.ForeignKey(DokumentKategorie, on_delete=models.CASCADE)
    titel = models.CharField("Titel", max_length=200)
    datei = models.FileField("Datei", upload_to='vorsorge_dokumente/%Y/%m/')
    beschreibung = models.TextField("Beschreibung", blank=True)
    is_uploaded = models.BooleanField("Hochgeladen", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Vorsorge-Dokument"
        verbose_name_plural = "Vorsorge-Dokumente"
        ordering = ['kategorie__order', 'titel']
    
    def __str__(self):
        return f"{self.titel} ({self.kategorie.name})"

class DigitalerNachlass(models.Model):
    """Digitaler Nachlass für die Vorsorge"""
    vorsorge = models.ForeignKey(Bestattungsvorsorge, on_delete=models.CASCADE, related_name='digitaler_nachlass')
    kategorie = models.ForeignKey(DigitalerNachlassKategorie, on_delete=models.CASCADE)
    plattform = models.CharField("Plattform/Service", max_length=100)
    benutzername = models.CharField("Benutzername", max_length=100, blank=True)
    email = models.EmailField("E-Mail", blank=True)
    notizen = models.TextField("Notizen", blank=True)
    is_important = models.BooleanField("Wichtig", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Digitaler Nachlass"
        verbose_name_plural = "Digitaler Nachlass"
        ordering = ['kategorie__order', 'plattform']
    
    def __str__(self):
        return f"{self.plattform} ({self.kategorie.name})"

# ============================================================================
# FAMILYLINK MODELLE (BESTEHEND)
# ============================================================================

class FamilyLink(models.Model):
    """
    Konsistentes FamilyLink-Model für Angehörigen-Verknüpfungen
    Vollständig überarbeitet für maximale Konsistenz und Funktionalität
    """
    
    class FamilyRole(models.TextChoices):
        FAMILY_MEMBER = 'family_member', 'Familienmitglied'
        MAIN_CONTACT = 'main_contact', 'Hauptansprechpartner'
        EXECUTOR = 'executor', 'Testamentsvollstrecker'
        GUARDIAN = 'guardian', 'Vormund/Betreuer'
        FRIEND = 'friend', 'Freund/Bekannter'
        LEGAL_REPRESENTATIVE = 'legal_representative', 'Rechtsvertreter'
    
    class PermissionLevel(models.TextChoices):
        VIEW_ONLY = 'view_only', 'Nur anzeigen'
        EDIT_MEMORIAL = 'edit_memorial', 'Gedenkseite bearbeiten'
        MANAGE_ALL = 'manage_all', 'Vollzugriff (Vorsorge + Gedenkseite)'
        ADMIN_LEVEL = 'admin_level', 'Admin-Berechtigung'
    
    class Status(models.TextChoices):
        PENDING = 'pending', 'Ausstehend'
        ACTIVE = 'active', 'Aktiv'
        SUSPENDED = 'suspended', 'Gesperrt'
        REVOKED = 'revoked', 'Widerrufen'
    
    class Meta:
        verbose_name = "Angehörigen-Verknüpfung"
        verbose_name_plural = "Angehörigen-Verknüpfungen"
        unique_together = ('deceased_user', 'relative_user')
        ordering = ['-created_at']
        indexes = [
            models.Index(fields=['deceased_user', 'status']),
            models.Index(fields=['relative_user', 'status']),
            models.Index(fields=['permission_level', 'status']),
        ]
        
    # Grundlegende Verknüpfung
    deceased_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='family_links_as_deceased', 
        verbose_name="Verstorbener",
        limit_choices_to={'role': User.Role.VERSTORBENER},
        help_text="Der verstorbene Benutzer"
    )
    relative_user = models.ForeignKey(
        User, 
        on_delete=models.CASCADE, 
        related_name='family_links_as_relative', 
        verbose_name="Angehöriger",
        limit_choices_to={'role__in': [User.Role.VORSORGENDER, User.Role.ANGEHOERIGER]},
        help_text="Der Angehörige mit Zugriffsrechten"
    )
    
    # Rollen und Berechtigungen
    role = models.CharField(
        "Rolle", 
        max_length=25, 
        choices=FamilyRole.choices, 
        default=FamilyRole.FAMILY_MEMBER,
        help_text="Rolle des Angehörigen in der Familie"
    )
    permission_level = models.CharField(
        "Berechtigungsstufe", 
        max_length=20, 
        choices=PermissionLevel.choices, 
        default=PermissionLevel.VIEW_ONLY,
        help_text="Was darf der Angehörige tun?"
    )
    
    # Verwandtschaftsbezeichnung
    relationship = models.CharField(
        "Verwandtschaftsbezeichnung", 
        max_length=100, 
        blank=True, 
        help_text="z.B. Sohn, Ehefrau, Guter Freund, Anwalt"
    )
    
    # Status und Validierung
    status = models.CharField(
        "Status", 
        max_length=15, 
        choices=Status.choices, 
        default=Status.PENDING,
        help_text="Aktueller Status der Verknüpfung"
    )
    is_validated_by_admin = models.BooleanField(
        "Vom Admin validiert", 
        default=False,
        help_text="Admin hat die Verknüpfung bestätigt"
    )
    validated_at = models.DateTimeField(
        "Validiert am", 
        null=True, 
        blank=True
    )
    validated_by = models.ForeignKey(
        User, 
        null=True, 
        blank=True, 
        related_name='validated_family_links',
        verbose_name="Validiert von",
        on_delete=models.SET_NULL,
        limit_choices_to={'is_staff': True}
    )
    
    # Zeitstempel
    created_at = models.DateTimeField("Erstellt am", default=timezone.now)
    updated_at = models.DateTimeField("Zuletzt geändert", auto_now=True)
    last_accessed = models.DateTimeField(
        "Zuletzt zugegriffen", 
        null=True, 
        blank=True,
        help_text="Wann hat der Angehörige zuletzt zugegriffen?"
    )
    
    # Metadaten
    created_by = models.ForeignKey(
        User, 
        related_name='created_family_links', 
        verbose_name="Erstellt von",
        help_text="Wer hat die Verknüpfung erstellt",
        on_delete=models.SET_NULL,
        null=True,
        limit_choices_to={'is_staff': True}
    )
    notes = models.TextField(
        "Interne Notizen", 
        blank=True, 
        help_text="Interne Notizen für Admins"
    )
    
    # Zusätzliche Sicherheitsfelder
    access_count = models.PositiveIntegerField(
        "Zugriffe", 
        default=0,
        help_text="Anzahl der Zugriffe durch den Angehörigen"
    )
    last_ip_address = models.GenericIPAddressField(
        "Letzte IP-Adresse", 
        null=True, 
        blank=True,
        help_text="IP-Adresse des letzten Zugriffs"
    )

    def __str__(self):
        return f"{self.relative_user.get_full_name()} → {self.deceased_user.get_full_name()} ({self.get_role_display()})"
    
    def clean(self):
        """Validierung der FamilyLink-Daten"""
        super().clean()
        
        # Verhindert Selbstverknüpfung
        if self.deceased_user == self.relative_user:
            raise ValidationError("Ein Benutzer kann nicht mit sich selbst verknüpft werden.")
        
        # Verhindert doppelte Verknüpfungen
        if self.pk is None:  # Nur bei neuen Objekten prüfen
            if FamilyLink.objects.filter(
                deceased_user=self.deceased_user, 
                relative_user=self.relative_user
            ).exists():
                raise ValidationError("Diese Verknüpfung existiert bereits.")
        
        # Validierung der Rollen-Kombinationen
        if self.role == self.FamilyRole.MAIN_CONTACT and self.permission_level == self.PermissionLevel.VIEW_ONLY:
            raise ValidationError("Hauptansprechpartner müssen mindestens Gedenkseite-Bearbeitung haben.")
    
    def save(self, *args, **kwargs):
        # Automatische Status-Updates
        if self.is_validated_by_admin and self.status == self.Status.PENDING:
            self.status = self.Status.ACTIVE
            if not self.validated_at:
                self.validated_at = timezone.now()
        
        self.clean()
        super().save(*args, **kwargs)
    
    def can_access_memorial(self):
        """Prüft ob der Angehörige auf die Gedenkseite zugreifen kann"""
        return (self.status == self.Status.ACTIVE and 
                self.permission_level in [self.PermissionLevel.EDIT_MEMORIAL, 
                                        self.PermissionLevel.MANAGE_ALL,
                                        self.PermissionLevel.ADMIN_LEVEL])
    
    def can_access_precaution_data(self):
        """Prüft ob der Angehörige auf Vorsorgedaten zugreifen kann"""
        return (self.status == self.Status.ACTIVE and 
                self.permission_level in [self.PermissionLevel.MANAGE_ALL,
                                        self.PermissionLevel.ADMIN_LEVEL])
    
    def record_access(self, ip_address=None):
        """Zeichnet einen Zugriff auf"""
        self.access_count += 1
        self.last_accessed = timezone.now()
        if ip_address:
            self.last_ip_address = ip_address
        self.save(update_fields=['access_count', 'last_accessed', 'last_ip_address'])
    
    @property
    def can_edit_memorial_page(self):
        """Kompatibilität: Gedenkseite bearbeiten basierend auf permission_level"""
        return self.permission_level in [
            self.PermissionLevel.EDIT_MEMORIAL, 
            self.PermissionLevel.MANAGE_ALL,
            self.PermissionLevel.ADMIN_LEVEL
        ]
    
    @property
    def can_view_precaution_data(self):
        """Kompatibilität: Vorsorge einsehen basierend auf permission_level"""
        return self.permission_level in [
            self.PermissionLevel.MANAGE_ALL,
            self.PermissionLevel.ADMIN_LEVEL
        ]
    
    @property
    def can_edit_precaution_data(self):
        """Kompatibilität: Vorsorge bearbeiten basierend auf permission_level"""
        return self.permission_level in [
            self.PermissionLevel.MANAGE_ALL,
            self.PermissionLevel.ADMIN_LEVEL
        ]
    
    @property
    def is_main_contact(self):
        """Kompatibilität: Hauptansprechpartner basierend auf role"""
        return self.role == self.FamilyRole.MAIN_CONTACT

class MemorialEvent(models.Model):
    class Meta:
        verbose_name = "Termin"
        verbose_name_plural = "Termine"
        ordering = ['date']

    page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='events', verbose_name="Zugehörige Gedenkseite")
    
    is_public = models.BooleanField("Termin öffentlich anzeigen", default=True, help_text="Wenn deaktiviert, ist der gesamte Termin nicht sichtbar.")
    title = models.CharField("Titel des Termins", max_length=255, help_text="z.B. 'Trauerfeier', 'Beisetzung', 'Rosenkranz'")
    date = models.DateTimeField("Datum und Uhrzeit")
    
    show_location = models.BooleanField("Ort anzeigen", default=True)
    location = models.ForeignKey(EventLocation, on_delete=models.SET_NULL, null=True, blank=True, verbose_name="Veranstaltungsort")
    
    show_dresscode = models.BooleanField("Dresscode anzeigen", default=False)
    dresscode = models.CharField("Dresscode", max_length=255, blank=True, help_text="z.B. 'Dunkle Kleidung erbeten', 'In Gedenken an seine Lebensfreude bitten wir um helle Kleidung'")

    show_condolence_note = models.BooleanField("Kondolenz-Hinweis anzeigen", default=True)
    condolence_note = models.CharField("Hinweis zu Kondolenzbezeugungen", max_length=255, blank=True, default="Von Beileidsbezeugungen am Grab bitten wir Abstand zu nehmen.", help_text="z.B. 'Von Beileidsbezeugungen am Grab bitten wir Abstand zu nehmen.'")

    show_donation_info = models.BooleanField("Spendeninformationen anzeigen", default=False)
    donation_for = models.CharField("Spende zugunsten von", max_length=255, blank=True, help_text="z.B. 'Krebshilfe Österreich', 'Tierheim St. Pölten'")
    
    description = models.TextField("Weitere Details", blank=True, help_text="Platz für zusätzliche Informationen, z.B. zum anschließenden Leichenschmaus.")

    def __str__(self):
        return f"{self.title} für {self.page.first_name} {self.page.last_name}"

class EventAttendance(models.Model):
    class Meta:
        verbose_name = "Teilnahme"
        verbose_name_plural = "Teilnahmen"
        ordering = ['-created_at']
    
    event = models.ForeignKey(MemorialEvent, on_delete=models.CASCADE, related_name='attendees')
    guest_name = models.CharField("Name des Gastes", max_length=255)
    user = models.ForeignKey(User, on_delete=models.SET_NULL, null=True, blank=True, related_name='event_attendances')
    created_at = models.DateTimeField("Zusage am", auto_now_add=True)

    def __str__(self):
        return f"{self.guest_name} nimmt an {self.event.title} teil"


# ===== TRAUERDRUCK-FREIGABEPROZESS =====

class TrauerdruckType(models.Model):
    """Typen von Trauerdruck (Parte, Gedenkbild, etc.)"""
    name = models.CharField("Name", max_length=100, unique=True)
    description = models.TextField("Beschreibung", blank=True)
    is_active = models.BooleanField("Aktiv", default=True)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Typ"
        verbose_name_plural = "Trauerdruck-Typen"
        ordering = ['name']
    
    def __str__(self):
        return self.name


class TrauerdruckEntwurf(models.Model):
    """Entwurf für Trauerdruck"""
    STATUS_CHOICES = [
        ('draft', 'Entwurf'),
        ('pending_approval', 'Wartet auf Freigabe'),
        ('approved', 'Freigegeben'),
        ('revision_requested', 'Revision angefordert'),
        ('rejected', 'Abgelehnt'),
        ('completed', 'Abgeschlossen'),
    ]

    # Grunddaten
    title = models.CharField("Titel", max_length=200)
    description = models.TextField("Beschreibung", blank=True)
    trauerdruck_type = models.ForeignKey(TrauerdruckType, on_delete=models.CASCADE, verbose_name="Trauerdruck-Typ")
    memorial_page = models.ForeignKey(MemorialPage, on_delete=models.CASCADE, related_name='trauerdruck_entwuerfe', verbose_name="Gedenkseite")

    # Status und Workflow
    status = models.CharField("Status", max_length=20, choices=STATUS_CHOICES, default='draft')
    version = models.PositiveIntegerField("Version", default=1)
    is_latest_version = models.BooleanField("Neueste Version", default=True)

    # Personen
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, related_name='created_trauerdruck_entwuerfe', verbose_name="Erstellt von")
    assigned_to = models.ManyToManyField(User, related_name='assigned_trauerdruck_entwuerfe', blank=True, verbose_name="Zugewiesen an")

    # Zeitstempel
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    deadline = models.DateTimeField("Deadline", null=True, blank=True)

    # Zusätzliche Felder
    priority = models.CharField("Priorität", max_length=10, choices=[
        ('low', 'Niedrig'),
        ('normal', 'Normal'),
        ('high', 'Hoch'),
        ('urgent', 'Dringend'),
    ], default='normal')

    class Meta:
        verbose_name = "Trauerdruck-Entwurf"
        verbose_name_plural = "Trauerdruck-Entwürfe"
        ordering = ['-created_at']

    def __str__(self):
        return f"{self.title} - {self.memorial_page.deceased_name} (v{self.version})"


class TrauerdruckDesign(models.Model):
    """Einzelne Design-Variante für einen Trauerdruck-Entwurf"""
    entwurf = models.ForeignKey(TrauerdruckEntwurf, on_delete=models.CASCADE, related_name='designs', verbose_name="Entwurf")
    title = models.CharField("Design-Titel", max_length=200, help_text="z.B. 'Variante A', 'Klassisch', 'Modern'")
    description = models.TextField("Beschreibung", blank=True, help_text="Beschreibung dieser Design-Variante")
    
    # Dateien
    design_file = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name='trauerdruck_design_files', verbose_name="Design-Datei")
    preview_file = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='trauerdruck_preview_files', verbose_name="Vorschau-Datei")
    
    # Status
    is_active = models.BooleanField("Aktiv", default=True, help_text="Ist diese Design-Variante zur Abstimmung verfügbar?")
    is_approved = models.BooleanField("Freigegeben", default=False, help_text="Wurde diese Variante von der Familie freigegeben?")
    
    # Reihenfolge
    order = models.PositiveIntegerField("Reihenfolge", default=0, help_text="Reihenfolge der Anzeige")
    
    # Zeitstempel
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    updated_at = models.DateTimeField("Aktualisiert am", auto_now=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Design"
        verbose_name_plural = "Trauerdruck-Designs"
        ordering = ['entwurf', 'order', 'created_at']
    
    def __str__(self):
        return f"{self.entwurf.title} - {self.title}"


class TrauerdruckKommentar(models.Model):
    """Kommentare zu Trauerdruck-Entwürfen"""
    entwurf = models.ForeignKey(TrauerdruckEntwurf, on_delete=models.CASCADE, related_name='kommentare', verbose_name="Entwurf")
    author = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Autor")
    content = models.TextField("Kommentar")
    is_internal = models.BooleanField("Interner Kommentar", default=False, help_text="Nur für Bestatter sichtbar")
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Kommentar"
        verbose_name_plural = "Trauerdruck-Kommentare"
        ordering = ['created_at']
    
    def __str__(self):
        return f"Kommentar von {self.author.first_name} zu {self.entwurf.title}"


class TrauerdruckFreigabe(models.Model):
    """Freigabe-Entscheidungen für Trauerdruck-Entwürfe"""
    DECISION_CHOICES = [
        ('pending', 'Ausstehend'),
        ('approved', 'Freigegeben'),
        ('revision_requested', 'Revision angefordert'),
        ('rejected', 'Abgelehnt'),
    ]
    
    entwurf = models.ForeignKey(TrauerdruckEntwurf, on_delete=models.CASCADE, related_name='freigaben', verbose_name="Entwurf")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Prüfer")
    decision = models.CharField("Entscheidung", max_length=20, choices=DECISION_CHOICES, default='pending')
    comment = models.TextField("Kommentar", blank=True)
    revision_notes = models.TextField("Revisionshinweise", blank=True, help_text="Was soll geändert werden?")
    created_at = models.DateTimeField("Entschieden am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Freigabe"
        verbose_name_plural = "Trauerdruck-Freigaben"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reviewer.first_name} - {self.get_decision_display()} für {self.entwurf.title}"


class TrauerdruckDesignFreigabe(models.Model):
    """Freigabe-Entscheidungen für einzelne Design-Varianten"""
    DECISION_CHOICES = [
        ('pending', 'Ausstehend'),
        ('approved', 'Freigegeben'),
        ('rejected', 'Abgelehnt'),
    ]
    
    design = models.ForeignKey(TrauerdruckDesign, on_delete=models.CASCADE, related_name='freigaben', verbose_name="Design")
    reviewer = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Prüfer")
    decision = models.CharField("Entscheidung", max_length=20, choices=DECISION_CHOICES, default='pending')
    comment = models.TextField("Kommentar", blank=True)
    created_at = models.DateTimeField("Entschieden am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Design-Freigabe"
        verbose_name_plural = "Trauerdruck-Design-Freigaben"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.reviewer.first_name} - {self.get_decision_display()} für {self.design.title}"


class TrauerdruckBenachrichtigung(models.Model):
    """Benachrichtigungen für Trauerdruck-Workflow"""
    NOTIFICATION_TYPES = [
        ('new_draft', 'Neuer Entwurf'),
        ('approval_requested', 'Freigabe angefordert'),
        ('approved', 'Freigegeben'),
        ('revision_requested', 'Revision angefordert'),
        ('rejected', 'Abgelehnt'),
        ('deadline_reminder', 'Deadline-Erinnerung'),
        ('comment_added', 'Neuer Kommentar'),
    ]
    
    user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='trauerdruck_benachrichtigungen', verbose_name="Benutzer")
    entwurf = models.ForeignKey(TrauerdruckEntwurf, on_delete=models.CASCADE, related_name='benachrichtigungen', verbose_name="Entwurf")
    notification_type = models.CharField("Typ", max_length=20, choices=NOTIFICATION_TYPES)
    title = models.CharField("Titel", max_length=200)
    message = models.TextField("Nachricht")
    is_read = models.BooleanField("Gelesen", default=False)
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Benachrichtigung"
        verbose_name_plural = "Trauerdruck-Benachrichtigungen"
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.title} - {self.user.first_name}"


class TrauerdruckTemplate(models.Model):
    """Vorlagen für häufige Trauerdruck-Entwürfe"""
    name = models.CharField("Name", max_length=200)
    description = models.TextField("Beschreibung", blank=True)
    trauerdruck_type = models.ForeignKey(TrauerdruckType, on_delete=models.CASCADE, verbose_name="Trauerdruck-Typ")
    template_file = models.ForeignKey(MediaAsset, on_delete=models.CASCADE, related_name='trauerdruck_templates', verbose_name="Template-Datei")
    is_active = models.BooleanField("Aktiv", default=True)
    created_by = models.ForeignKey(User, on_delete=models.CASCADE, verbose_name="Erstellt von")
    created_at = models.DateTimeField("Erstellt am", auto_now_add=True)
    
    class Meta:
        verbose_name = "Trauerdruck-Template"
        verbose_name_plural = "Trauerdruck-Templates"
        ordering = ['name']
    
    def __str__(self):
        return f"{self.name} ({self.trauerdruck_type.name})"

