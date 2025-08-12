<pre>```python
# backend/api/models.py
# ERWEITERT: Neues Feld für die Invertierung der Textfarbe hinzugefügt.

import uuid
from django.db import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager, PermissionsMixin
from django.utils.text import slugify
from django.utils import timezone
from django.core.exceptions import ValidationError

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

    @property
    def url(self):
        if self.file_upload:
            return self.file_upload.url
        return self.file_url

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

class SiteSettings(models.Model):
    class Meta:
        verbose_name = "Globale Design-Einstellungen"
        verbose_name_plural = "Globale Design-Einstellungen"

    listing_title = models.CharField("Titel über den Gedenkkarten", max_length=100, blank=True, default="Wir trauern um")
    listing_background_color = models.CharField("Hintergrundfarbe Startseite", max_length=7, blank=True, help_text="Hex-Code, z.B. #f4f1ee")
    listing_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Startseite")
    listing_card_color = models.CharField("Karten-Hintergrundfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #ffffff")
    listing_text_color = models.CharField("Textfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")
    listing_arrow_color = models.CharField("Pfeilfarbe", max_length=7, blank=True, help_text="Hex-Code, z.B. #8c8073", default="#8c8073")
    
    search_title = models.CharField("Titel im Suchbereich", max_length=100, blank=True, default="Verstorbenen Suche")
    search_helper_text = models.TextField("Hilfstext im Suchbereich", blank=True, default="Bitte geben Sie einen oder mehrere Suchbegriffe in die obenstehenden Felder ein, um nach einem Verstorbenen zu suchen.")
    search_background_color = models.CharField("Hintergrundfarbe Suche", max_length=7, blank=True, help_text="Hex-Code, z.B. #e5e0da")
    search_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Suche")
    search_text_color = models.CharField("Textfarbe Suche", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")

    expend_background_color = models.CharField("Hintergrundfarbe Expand-Bereich", max_length=7, blank=True, help_text="Hex-Code, z.B. #f4f1ee")
    expend_background_image = models.ForeignKey(MediaAsset, on_delete=models.SET_NULL, null=True, blank=True, related_name='+', verbose_name="Hintergrundbild Expand-Bereich")
    expend_card_color = models.CharField("Karten-Hintergrundfarbe Expand", max_length=7, blank=True, help_text="Hex-Code, z.B. #ffffff")
    expend_text_color = models.CharField("Textfarbe Expand-Bereich", max_length=7, blank=True, help_text="Hex-Code, z.B. #3a3a3a")

    def __str__(self):
        return "Globale Design-Einstellungen"

    def save(self, *args, **kwargs):
        self.pk = 1
        super(SiteSettings, self).save(*args, **kwargs)

class UserManager(BaseUserManager):
    def create_user(self, email, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
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
        GAST = 'gast', 'Gast'
        ADMINISTRATOR = 'administrator', 'Administrator'
    id = models.UUIDField("ID", primary_key=True, default=uuid.uuid4, editable=False)
    email = models.EmailField("E-Mail-Adresse", unique=True)
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
    def __str__(self):
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.email

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
            while MemorialPage.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            self.slug = slug
        super().save(*args, **kwargs)

    def __str__(self):
        if self.first_name and self.last_name:
            return f"Gedenkseite für {self.first_name} {self.last_name}"
        return f"Gedenkseite für {self.user.first_name} {self.user.last_name}"

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

class FamilyLink(models.Model):
    class Meta:
        verbose_name = "Angehörigen-Verknüpfung"
        verbose_name_plural = "Angehörigen-Verknüpfungen"
        unique_together = ('deceased_user', 'relative_user')
    link_id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    deceased_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='family_links_as_deceased', verbose_name="Verstorbener")
    relative_user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='family_links_as_relative', verbose_name="Angehöriger")
    is_main_contact = models.BooleanField("Hauptansprechpartner", default=False)
    def __str__(self):
        return f"{self.relative_user} ist Angehöriger von {self.deceased_user}"

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
```</pre>
