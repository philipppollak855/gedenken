# backend/api/admin.py
# KORRIGIERT: Die attendee_count Methode prüft nun, ob das Objekt existiert, bevor die Zählung erfolgt.

import uuid
from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import slugify
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django import forms
from django.urls import path
from django.shortcuts import render
from django.db.models import Q
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem,
    ContractItem, Document, LastWishes, MemorialPage, Condolence,
    TimelineEvent, GalleryItem, MemorialCandle, ReleaseRequest, FamilyLink,
    SiteSettings, MemorialEvent, CondolenceTemplate, CandleImage,
    CandleMessageTemplate, MediaAsset, EventLocation, EventAttendance
)

# Ein benutzerdefinierter Widget für die Farbauswahl
class ColorPickerWidget(forms.TextInput):
    input_type = 'color'
    template_name = 'admin/widgets/color_picker.html'

# Ein benutzerdefiniertes Formular, um den Widget auf SiteSettings anzuwenden
class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = '__all__'
        widgets = {
            'listing_background_color': ColorPickerWidget(),
            'listing_card_color': ColorPickerWidget(),
            'listing_text_color': ColorPickerWidget(),
            'listing_arrow_color': ColorPickerWidget(),
            'search_background_color': ColorPickerWidget(),
            'search_text_color': ColorPickerWidget(),
            'expend_background_color': ColorPickerWidget(),
            'expend_card_color': ColorPickerWidget(),
            'expend_text_color': ColorPickerWidget(),
        }

# Ein benutzerdefiniertes Formular, um den Widget auf MemorialPage anzuwenden
class MemorialPageForm(forms.ModelForm):
    class Meta:
        model = MemorialPage
        fields = '__all__'
        widgets = {
            'farewell_background_color': ColorPickerWidget(),
        }

@admin.register(EventLocation)
class EventLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')
    search_fields = ('name', 'address')

@admin.register(MediaAsset)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'asset_type', 'thumbnail', 'uploaded_at')
    list_filter = ('asset_type',)
    search_fields = ('title',)
    
    @admin.display(description='Vorschau')
    def thumbnail(self, obj):
        if obj.asset_type == 'image' and obj.url:
            return format_html('<img src="{}" width="100" height="auto" />', obj.url)
        return "Keine Vorschau"

@admin.register(CandleImage)
class CandleImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)
    raw_id_fields = ('image',)

@admin.register(CandleMessageTemplate)
class CandleMessageTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'text')

@admin.register(CondolenceTemplate)
class CondolenceTemplateAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title', 'text')

@admin.register(SiteSettings)
class SiteSettingsAdmin(admin.ModelAdmin):
    form = SiteSettingsForm
    raw_id_fields = ('listing_background_image', 'search_background_image', 'expend_background_image')
    fieldsets = (
        ('Gedenkseiten-Startseite', {
            'fields': ('listing_title', 'listing_background_color', 'listing_background_image', 'listing_card_color', 'listing_text_color', 'listing_arrow_color'),
        }),
        ('Verstorbenen-Suche', {
            'fields': ('search_title', 'search_helper_text', 'search_background_color', 'search_background_image', 'search_text_color'),
        }),
        ('Expand-Bereich (Kondolenzen etc.)', {
            'fields': ('expend_background_color', 'expend_background_image', 'expend_card_color', 'expend_text_color'),
        }),
    )
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
        export_order = fields

class DigitalLegacyItemInline(admin.TabularInline):
    model = DigitalLegacyItem
    extra = 0

class FinancialItemInline(admin.TabularInline):
    model = FinancialItem
    extra = 0

class InsuranceItemInline(admin.TabularInline):
    model = InsuranceItem
    extra = 0

class ContractItemInline(admin.TabularInline):
    model = ContractItem
    extra = 0

class DocumentInline(admin.TabularInline):
    model = Document
    extra = 0

class LastWishesInline(admin.StackedInline):
    model = LastWishes

class FamilyLinkInline(admin.TabularInline):
    model = FamilyLink
    fk_name = 'deceased_user'
    extra = 1
    verbose_name = "Angehöriger"
    verbose_name_plural = "Angehörige"

@admin.register(User)
class UserAdmin(ImportExportModelAdmin):
    resource_classes = [UserResource]
    list_display = ('get_full_name', 'email', 'role', 'created_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    list_filter = ('role', 'is_staff')
    search_fields = ('email', 'first_name', 'last_name')
    fieldsets = (
        ('Persönliche Daten', {'fields': ('first_name', 'last_name', 'email')}),
        ('Berechtigungen & Status', {'fields': ('role', 'is_active', 'is_staff', 'is_superuser', 'consent_admin_access')}),
        ('Wichtige Daten', {'fields': ('id', 'created_at', 'updated_at')}),
    )
    inlines = [
        FamilyLinkInline, LastWishesInline, DocumentInline, DigitalLegacyItemInline,
        FinancialItemInline, InsuranceItemInline, ContractItemInline,
    ]
    actions = ['clone_user']

    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('global_search/', self.admin_site.admin_view(self.global_search_view), name='global_search')
        ]
        return custom_urls + urls

    def global_search_view(self, request):
        query = request.GET.get('q', '')
        results = {}
        if query:
            results['users'] = User.objects.filter(
                Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(email__icontains=query)
            )
            results['memorial_pages'] = MemorialPage.objects.filter(
                Q(first_name__icontains=query) | Q(last_name__icontains=query) | Q(user__email__icontains=query)
            )
            results['relatives'] = FamilyLink.objects.filter(
                Q(relative_user__first_name__icontains=query) | Q(relative_user__last_name__icontains=query)
            ).select_related('deceased_user', 'relative_user')
        context = dict(
            self.admin_site.each_context(request),
            query=query,
            results=results,
            title="Globale Suche"
        )
        return render(request, "admin/global_search_results.html", context)

    @admin.display(description='Name')
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

    @admin.action(description='Ausgewählte Benutzer für Tests klonen')
    def clone_user(self, request, queryset):
        for user in queryset:
            old_pk = user.pk
            user.pk = None; user.id = None
            user.email = f"clone-{uuid.uuid4().hex[:8]}-{user.email}"
            user.is_staff = False; user.is_superuser = False
            user.save()
            related_models = [DigitalLegacyItem, FinancialItem, InsuranceItem, ContractItem, Document, LastWishes]
            for model in related_models:
                for item in model.objects.filter(user_id=old_pk):
                    item.pk = None; item.user = user; item.save()
        self.message_user(request, f"{queryset.count()} Benutzer erfolgreich geklont.")

class CondolenceInline(admin.TabularInline):
    model = Condolence
    extra = 0
    readonly_fields = ('guest_name', 'message', 'created_at', 'author')
    fields = ('guest_name', 'message', 'is_approved', 'created_at', 'author')

class TimelineEventInline(admin.TabularInline):
    model = TimelineEvent
    extra = 0

class GalleryItemInline(admin.TabularInline):
    model = GalleryItem
    extra = 0
    raw_id_fields = ('image',)

class MemorialCandleInline(admin.TabularInline):
    model = MemorialCandle
    extra = 0
    readonly_fields = ('guest_name', 'message', 'is_private', 'created_at', 'author')
    fields = ('guest_name', 'message', 'is_private', 'created_at', 'author', 'candle_image')
    raw_id_fields = ('candle_image',)

class EventAttendanceInline(admin.TabularInline):
    model = EventAttendance
    extra = 0
    readonly_fields = ('guest_name', 'user', 'created_at')
    can_delete = True

class MemorialEventInline(admin.TabularInline):
    model = MemorialEvent
    extra = 1
    raw_id_fields = ('location',)
    inlines = [EventAttendanceInline]
    readonly_fields = ('attendee_count',)
    
    fieldsets = (
        (None, {
            'fields': (('is_public', 'title'), 'date', 'attendee_count')
        }),
        ('Ort', {
            'classes': ('collapse',),
            'fields': ('show_location', 'location')
        }),
        ('Zusätzliche Informationen', {
            'classes': ('collapse',),
            'fields': (
                ('show_dresscode', 'dresscode'),
                ('show_condolence_note', 'condolence_note'),
                ('show_donation_info', 'donation_for'),
                'description'
            )
        }),
    )

    @admin.display(description='Zusagen')
    def attendee_count(self, obj):
        # KORREKTUR: Prüfen, ob das Objekt bereits eine PK hat, bevor die DB abgefragt wird.
        if obj.pk:
            return obj.attendees.count()
        return 0

@admin.register(MemorialPage)
class MemorialPageAdmin(admin.ModelAdmin):
    form = MemorialPageForm
    search_fields = ('first_name', 'last_name', 'user__email', 'slug')
    list_display = ('__str__', 'get_user_id', 'status', 'condolence_moderation')
    readonly_fields = ('user',)
    list_filter = ('status', 'condolence_moderation')
    inlines = [TimelineEventInline, GalleryItemInline, CondolenceInline, MemorialCandleInline, MemorialEventInline]
    actions = ['clone_memorial_page']
    raw_id_fields = (
        'user', 'main_photo', 'hero_background_image', 'farewell_background_image',
        'obituary_card_image', 'memorial_picture', 'memorial_picture_back',
        'acknowledgement_image'
    )
    
    fieldsets = (
        (None, {'fields': ('user', 'status')}),
        ('Interaktion & Moderation', {'fields': ('condolence_moderation',)}),
        ('Personenbezogene Daten & URL', {'fields': ('first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 'slug', 'date_of_birth', 'date_of_death', 'cemetery', 'obituary')}),
        ('Design: Hero-Bereich', {
            'classes': ('collapse',),
            'fields': ('main_photo', 'hero_background_image', 'hero_background_size'),
        }),
        ('Design: Abschied nehmen', {
            'classes': ('collapse',),
            'fields': (
                'farewell_background_color', 'farewell_background_image', 'farewell_background_size', 
                'farewell_text_inverted',
                'obituary_card_image', 
                'show_memorial_picture', 'memorial_picture', 'memorial_picture_back',
                'acknowledgement_type', 'acknowledgement_text', 'acknowledgement_image'
            ),
        }),
        ('Spendenaufruf (optional)', {
            'classes': ('collapse',),
            'fields': ('donation_text', 'donation_link', 'donation_bank_details'),
        }),
    )

    @admin.display(description='Benutzer ID')
    def get_user_id(self, obj):
        return obj.user.id

    @admin.action(description='Ausgewählte Gedenkseiten klonen')
    def clone_memorial_page(self, request, queryset):
        cloned_count = 0
        for page in queryset:
            old_user = page.user
            old_user.pk = None
            old_user.id = None
            new_email = f"clone-{uuid.uuid4().hex[:8]}-{old_user.email}"
            if len(new_email) > 254:
                new_email = new_email[-254:]
            old_user.email = new_email
            old_user.save()
            new_user = old_user

            related_items_to_clone = {
                'events': list(page.events.all()),
                'timeline_events': list(page.timeline_events.all()),
                'gallery_items': list(page.gallery_items.all()),
                'condolences': list(page.condolences.all()),
                'candles': list(page.candles.all()),
            }

            page.pk = None
            page.user = new_user
            page.first_name = f"{page.first_name} (Kopie)"
            
            base_slug = slugify(f"{page.first_name}-{page.last_name}")
            slug = base_slug
            counter = 1
            while MemorialPage.objects.filter(slug=slug).exists():
                slug = f"{base_slug}-{counter}"
                counter += 1
            page.slug = slug
            
            page.save()
            new_page = page

            for relation_name, related_queryset in related_items_to_clone.items():
                for item in related_queryset:
                    item.pk = None
                    setattr(item, 'page', new_page)
                    item.save()

            cloned_count += 1
        self.message_user(request, f"{cloned_count} Gedenkseite(n) erfolgreich geklont.")

@admin.register(ReleaseRequest)
class ReleaseRequestAdmin(admin.ModelAdmin):
    list_display = ('deceased_full_name', 'reporter_name', 'status', 'created_at')
    list_filter = ('status',)
    fields = ('status', 'resolved_user', 'deceased_first_name', 'deceased_last_name', 'deceased_date_of_birth', 'deceased_date_of_death', 'reporter_name', 'reporter_email', 'reporter_relationship', 'death_certificate')
    readonly_fields = ('deceased_first_name', 'deceased_last_name', 'deceased_date_of_birth', 'deceased_date_of_death', 'reporter_name', 'reporter_email', 'reporter_relationship', 'death_certificate', 'created_at')
    actions = ['approve_requests']

    def deceased_full_name(self, obj):
        return f"{obj.deceased_first_name} {obj.deceased_last_name}"
    deceased_full_name.short_description = "Verstorbener"

    @admin.action(description='Ausgewählte Anfragen genehmigen & Angehörige anlegen')
    def approve_requests(self, request, queryset):
        approved_count = 0
        for req in queryset.filter(status=ReleaseRequest.Status.PENDING):
            if not req.resolved_user:
                self.message_user(request, f"Fehler bei Anfrage {req.request_id}: Bitte ordnen Sie zuerst einen Vorsorge-Account zu.", level='error')
                continue

            angehoeriger, created = User.objects.get_or_create(
                email=req.reporter_email,
                defaults={
                    'first_name': req.reporter_name,
                    'role': User.Role.ANGEHOERIGER,
                    'password': req.reporter_password
                }
            )
            if not created:
                angehoeriger.role = User.Role.ANGEHOERIGER
                angehoeriger.save()

            FamilyLink.objects.create(
                deceased_user=req.resolved_user,
                relative_user=angehoeriger,
                is_main_contact=True
            )

            page, _ = MemorialPage.objects.get_or_create(user=req.resolved_user)
            page.status = MemorialPage.Status.ACTIVE
            page.first_name = req.resolved_user.first_name
            page.last_name = req.resolved_user.last_name
            page.date_of_birth = req.deceased_date_of_birth
            page.date_of_death = req.deceased_date_of_death
            page.save()
            
            req.status = ReleaseRequest.Status.APPROVED
            req.save()
            approved_count += 1
        
        self.message_user(request, f"{approved_count} Anfragen erfolgreich genehmigt.")
