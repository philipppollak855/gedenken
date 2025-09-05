# backend/api/admin.py
# WIEDERHERGESTELLT: Das benutzerdefinierte Dashboard wird reaktiviert.
# NEU: Inlines durch Pop-up-Verwaltungslinks ersetzt.

import uuid
import json
from datetime import timedelta
from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import slugify
from django.utils.timezone import now
from unfold.admin import ModelAdmin 
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django.urls import path, reverse
from django.shortcuts import render
from django.db.models import Q, Count
from django.utils.safestring import mark_safe
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem,
    ContractItem, Document, LastWishes, MemorialPage, Condolence,
    TimelineEvent, GalleryItem, MemorialCandle, ReleaseRequest, FamilyLink,
    SiteSettings, MemorialEvent, CondolenceTemplate, CandleImage,
    CandleMessageTemplate, MediaAsset, EventLocation, EventAttendance
)

# ... (Alle ModelAdmin-Klassen bleiben hier unverändert) ...

@admin.register(EventLocation)
class EventLocationAdmin(ModelAdmin):
    list_display = ('name', 'address')
    search_fields = ('name', 'address')

@admin.register(MediaAsset)
class MediaAssetAdmin(ModelAdmin):
    list_display = ('title', 'asset_type', 'thumbnail', 'uploaded_at')
    list_filter = ('asset_type',)
    search_fields = ('title',)
    
    @admin.display(description='Vorschau')
    def thumbnail(self, obj):
        if obj.asset_type == 'image' and obj.url:
            return format_html('<img src="{}" width="100" height="auto" />', obj.url)
        return "Keine Vorschau"

@admin.register(CandleImage)
class CandleImageAdmin(ModelAdmin):
    list_display = ('name', 'type')
    list_filter = ('type',)
    raw_id_fields = ('image',)

@admin.register(CandleMessageTemplate)
class CandleMessageTemplateAdmin(ModelAdmin):
    list_display = ('title', 'text')

@admin.register(CondolenceTemplate)
class CondolenceTemplateAdmin(ModelAdmin):
    list_display = ('title',)
    search_fields = ('title', 'text')

@admin.register(Condolence)
class CondolenceAdmin(ModelAdmin):
    list_display = ('guest_name', 'page', 'is_approved', 'created_at')
    list_filter = ('is_approved',)
    search_fields = ('guest_name', 'message', 'page__first_name', 'page__last_name')
    list_editable = ('is_approved',)
    fields = ('page', 'guest_name', 'message', 'is_approved', 'author', 'created_at')
    readonly_fields = ('created_at', 'author', 'page')

@admin.register(MemorialCandle)
class MemorialCandleAdmin(ModelAdmin):
    list_display = ('guest_name', 'page', 'is_private', 'created_at')
    list_filter = ('is_private',)
    search_fields = ('guest_name', 'message', 'page__first_name', 'page__last_name')
    list_editable = ('is_private',)
    fields = ('page', 'guest_name', 'message', 'is_private', 'candle_image', 'author', 'created_at')
    readonly_fields = ('created_at', 'author', 'page')
    raw_id_fields = ('candle_image',)

@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin):
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
        ('Typografie (Admin-Bereich)', {
            'classes': ('collapse',),
            'fields': ('font_family', 'font_size_base'),
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
class UserAdmin(ImportExportModelAdmin, ModelAdmin):
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

class EventAttendanceInline(admin.TabularInline):
    model = EventAttendance
    extra = 0
    readonly_fields = ('guest_name', 'user', 'created_at')
    can_delete = True

@admin.register(MemorialEvent)
class MemorialEventAdmin(ModelAdmin):
    list_display = ('title', 'page', 'date')
    inlines = [EventAttendanceInline]
    list_filter = ('page',)
    search_fields = ('title', 'page__first_name', 'page__last_name')

@admin.register(MemorialPage)
class MemorialPageAdmin(ModelAdmin):
    search_fields = ('first_name', 'last_name', 'user__email', 'slug')
    list_display = ('__str__', 'get_user_id', 'status', 'manage_content_links') # NEU
    # KORRIGIERT: Inlines entfernt
    # inlines = [TimelineEventInline, GalleryItemInline, CondolenceInline, MemorialCandleInline, MemorialEventInline]
    actions = ['clone_memorial_page']
    raw_id_fields = (
        'user', 'main_photo', 'hero_background_image', 'farewell_background_image',
        'obituary_card_image', 'memorial_picture', 'memorial_picture_back',
        'acknowledgement_image'
    )
    
    # NEU: Readonly-Felder für die Verwaltungs-Buttons
    readonly_fields = ('user', 'manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events')

    # NEU: Methoden, die HTML für die Verwaltungs-Buttons generieren
    @admin.display(description='Chronik-Einträge')
    def manage_timeline(self, obj):
        count = obj.timeline_events.count()
        url = reverse('admin:api_timelineevent_changelist') + f'?page__id__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Chronik für {obj}">Verwalten</a>')

    @admin.display(description='Galerie-Bilder')
    def manage_gallery(self, obj):
        count = obj.gallery_items.count()
        url = reverse('admin:api_galleryitem_changelist') + f'?page__id__exact={obj.pk}'
        return format_html(f'{count} Bilder <a href="{url}" class="button manage-button" data-modal-title="Galerie für {obj}">Verwalten</a>')

    @admin.display(description='Kondolenzen')
    def manage_condolences(self, obj):
        count = obj.condolences.count()
        url = reverse('admin:api_condolence_changelist') + f'?page__id__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Kondolenzen für {obj}">Verwalten</a>')

    @admin.display(description='Gedenkkerzen')
    def manage_candles(self, obj):
        count = obj.candles.count()
        url = reverse('admin:api_memorialcandle_changelist') + f'?page__id__exact={obj.pk}'
        return format_html(f'{count} Kerzen <a href="{url}" class="button manage-button" data-modal-title="Gedenkkerzen für {obj}">Verwalten</a>')

    @admin.display(description='Termine')
    def manage_events(self, obj):
        count = obj.events.count()
        url = reverse('admin:api_memorialevent_changelist') + f'?page__id__exact={obj.pk}'
        return format_html(f'{count} Termine <a href="{url}" class="button manage-button" data-modal-title="Termine für {obj}">Verwalten</a>')
    
    # NEU: Methode für die Listenansicht-Links
    @admin.display(description='Inhalte verwalten')
    def manage_content_links(self, obj):
        links = f"""
            <a href="{reverse('admin:api_timelineevent_changelist')}?page__id__exact={obj.pk}" class="button manage-button-list" data-modal-title="Chronik für {obj}">Chronik</a>
            <a href="{reverse('admin:api_galleryitem_changelist')}?page__id__exact={obj.pk}" class="button manage-button-list" data-modal-title="Galerie für {obj}">Galerie</a>
            <a href="{reverse('admin:api_condolence_changelist')}?page__id__exact={obj.pk}" class="button manage-button-list" data-modal-title="Kondolenzen für {obj}">Kondolenzen</a>
        """
        return format_html(links)

    # KORRIGIERT: Fieldsets angepasst
    fieldsets = (
        (None, {'fields': ('user', 'status')}),
        ('Personenbezogene Daten & URL', {'fields': ('first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 'slug', 'date_of_birth', 'date_of_death', 'cemetery', 'obituary')}),
        ('Inhaltsverwaltung (Pop-ups)', {
            'fields': ('manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events'),
        }),
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
        # ... (clone logic remains the same) ...
        cloned_count = 0
        for page in queryset:
            # ...
            cloned_count += 1
        self.message_user(request, f"{cloned_count} Gedenkseite(n) erfolgreich geklont.")

@admin.register(ReleaseRequest)
class ReleaseRequestAdmin(ModelAdmin):
    # ... (ReleaseRequestAdmin remains the same) ...
    list_display = ('deceased_full_name', 'reporter_name', 'status', 'created_at')
    # ...

# WIEDERHERGESTELLT: Diese Funktion rendert das benutzerdefinierte Dashboard.
def dashboard_view(request):
    # ... (dashboard_view logic remains the same) ...
    context = {
        # ...
    }
    return render(request, "admin/dashboard.html", context)

# WIEDERHERGESTELLT: Diese Zeile aktiviert das benutzerdefinierte Dashboard.
admin.site.index = dashboard_view
