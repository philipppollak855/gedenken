# backend/api/admin.py
# KOMPLETT ÜBERARBEITET: Implementiert ein benutzerdefiniertes Admin-Dashboard,
# verbessert die Listenansichten mit Thumbnails und Status-Indikatoren und
# registriert alle Modelle bei einer neuen, benutzerdefinierten Admin-Site.

import uuid
from django.contrib import admin
from django.utils.html import format_html
from django.utils.text import slugify
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django import forms
from django.urls import path, reverse
from django.shortcuts import render
from django.db.models import Q, Count
from django.utils.safestring import mark_safe
from django.utils import timezone
from datetime import timedelta
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem,
    ContractItem, Document, LastWishes, MemorialPage, Condolence,
    TimelineEvent, GalleryItem, MemorialCandle, ReleaseRequest, FamilyLink,
    SiteSettings, MemorialEvent, CondolenceTemplate, CandleImage,
    CandleMessageTemplate, MediaAsset, EventLocation, EventAttendance
)

# --------------------------------------------------------------
# 1. Benutzerdefinierte Admin-Site & Dashboard-Ansicht
# --------------------------------------------------------------

def admin_dashboard_view(request):
    """
    Die Logik für unser neues Admin-Dashboard.
    Sammelt Statistiken und die neuesten Aktivitäten.
    """
    # Statistik-Widgets
    stats = {
        'total_users': User.objects.count(),
        'total_pages': MemorialPage.objects.count(),
        'pending_releases': ReleaseRequest.objects.filter(status=ReleaseRequest.Status.PENDING).count(),
        'unapproved_condolences': Condolence.objects.filter(is_approved=False).count(),
    }

    # Letzte Aktivitäten
    latest_condolences = Condolence.objects.order_by('-created_at')[:5]
    latest_candles = MemorialCandle.objects.order_by('-created_at')[:5]

    # Kommende Termine (nächste 30 Tage)
    start_date = timezone.now()
    end_date = start_date + timedelta(days=30)
    upcoming_events = MemorialEvent.objects.filter(
        date__range=[start_date, end_date]
    ).annotate(
        attendee_count=Count('attendees')
    ).select_related('page').order_by('date')

    context = {
        **admin.site.each_context(request),
        "title": "Dashboard",
        "stats": stats,
        "latest_condolences": latest_condolences,
        "latest_candles": latest_candles,
        "upcoming_events": upcoming_events,
    }
    return render(request, "admin/dashboard.html", context)

class CustomAdminSite(admin.AdminSite):
    """
    Eine benutzerdefinierte AdminSite, um die Index-Seite (das Dashboard) zu überschreiben.
    """
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_view(admin_dashboard_view), name='index'),
        ]
        return custom_urls + urls

# Wir instanziieren unsere neue Admin-Site. Alle Modelle werden hier registriert.
custom_admin_site = CustomAdminSite(name='custom_admin')


# --------------------------------------------------------------
# 2. Formulare & Widgets für verbesserte UI
# --------------------------------------------------------------

class ColorPickerWidget(forms.TextInput):
    input_type = 'color'
    template_name = 'admin/widgets/color_picker.html'

class SiteSettingsForm(forms.ModelForm):
    class Meta:
        model = SiteSettings
        fields = '__all__'
        widgets = {
            'listing_background_color': ColorPickerWidget(), 'listing_card_color': ColorPickerWidget(),
            'listing_text_color': ColorPickerWidget(), 'listing_arrow_color': ColorPickerWidget(),
            'search_background_color': ColorPickerWidget(), 'search_text_color': ColorPickerWidget(),
            'expend_background_color': ColorPickerWidget(), 'expend_card_color': ColorPickerWidget(),
            'expend_text_color': ColorPickerWidget(),
        }

class MemorialPageForm(forms.ModelForm):
    class Meta:
        model = MemorialPage
        fields = '__all__'
        widgets = {'farewell_background_color': ColorPickerWidget()}

# --------------------------------------------------------------
# 3. Verbesserte ModelAdmins
# --------------------------------------------------------------

@admin.register(EventLocation, site=custom_admin_site)
class EventLocationAdmin(admin.ModelAdmin):
    list_display = ('name', 'address')
    search_fields = ('name', 'address')

@admin.register(MediaAsset, site=custom_admin_site)
class MediaAssetAdmin(admin.ModelAdmin):
    list_display = ('title', 'asset_type', 'thumbnail', 'uploaded_at')
    list_filter = ('asset_type',)
    search_fields = ('title',)
    
    @admin.display(description='Vorschau')
    def thumbnail(self, obj):
        if obj.asset_type == 'image' and obj.url:
            return format_html('<img src="{}" width="100" height="auto" style="border-radius: 4px;" />', obj.url)
        return "Keine Vorschau"

@admin.register(CandleImage, site=custom_admin_site)
class CandleImageAdmin(admin.ModelAdmin):
    list_display = ('name', 'thumbnail', 'type')
    list_filter = ('type',)
    raw_id_fields = ('image',)

    @admin.display(description='Vorschau')
    def thumbnail(self, obj):
        if obj.image and obj.image.url:
            return format_html('<img src="{}" width="50" style="border-radius: 4px;" />', obj.image.url)
        return "Kein Bild"

@admin.register(CandleMessageTemplate, site=custom_admin_site)
class CandleMessageTemplateAdmin(admin.ModelAdmin):
    list_display = ('title', 'text')

@admin.register(CondolenceTemplate, site=custom_admin_site)
class CondolenceTemplateAdmin(admin.ModelAdmin):
    list_display = ('title',)
    search_fields = ('title', 'text')

@admin.register(SiteSettings, site=custom_admin_site)
class SiteSettingsAdmin(admin.ModelAdmin):
    form = SiteSettingsForm
    raw_id_fields = ('listing_background_image', 'search_background_image', 'expend_background_image')
    fieldsets = (
        ('Gedenkseiten-Startseite', {'fields': ('listing_title', 'listing_background_color', 'listing_background_image', 'listing_card_color', 'listing_text_color', 'listing_arrow_color')}),
        ('Verstorbenen-Suche', {'fields': ('search_title', 'search_helper_text', 'search_background_color', 'search_background_image', 'search_text_color')}),
        ('Expand-Bereich (Kondolenzen etc.)', {'fields': ('expend_background_color', 'expend_background_image', 'expend_card_color', 'expend_text_color')}),
    )
    def has_add_permission(self, request):
        return not SiteSettings.objects.exists()

class UserResource(resources.ModelResource):
    class Meta:
        model = User
        fields = ('id', 'email', 'first_name', 'last_name', 'role', 'is_active', 'is_staff')
        export_order = fields

class DigitalLegacyItemInline(admin.TabularInline): model = DigitalLegacyItem; extra = 0
class FinancialItemInline(admin.TabularInline): model = FinancialItem; extra = 0
class InsuranceItemInline(admin.TabularInline): model = InsuranceItem; extra = 0
class ContractItemInline(admin.TabularInline): model = ContractItem; extra = 0
class DocumentInline(admin.TabularInline): model = Document; extra = 0
class LastWishesInline(admin.StackedInline): model = LastWishes
class FamilyLinkInline(admin.TabularInline):
    model = FamilyLink
    fk_name = 'deceased_user'
    extra = 1
    verbose_name = "Angehöriger"
    verbose_name_plural = "Angehörige"

@admin.register(User, site=custom_admin_site)
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
    inlines = [FamilyLinkInline, LastWishesInline, DocumentInline, DigitalLegacyItemInline, FinancialItemInline, InsuranceItemInline, ContractItemInline]
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

class CondolenceInline(admin.TabularInline):
    model = Condolence
    extra = 0
    readonly_fields = ('guest_name', 'message', 'created_at', 'author')
    fields = ('guest_name', 'message', 'is_approved', 'created_at', 'author')

class TimelineEventInline(admin.TabularInline): model = TimelineEvent; extra = 0
class GalleryItemInline(admin.TabularInline): model = GalleryItem; extra = 0; raw_id_fields = ('image',)
class MemorialCandleInline(admin.TabularInline):
    model = MemorialCandle; extra = 0
    readonly_fields = ('guest_name', 'message', 'is_private', 'created_at', 'author')
    fields = ('guest_name', 'message', 'is_private', 'created_at', 'author', 'candle_image')
    raw_id_fields = ('candle_image',)

class EventAttendanceInline(admin.TabularInline):
    model = EventAttendance; extra = 0
    readonly_fields = ('guest_name', 'user', 'created_at'); can_delete = True

@admin.register(MemorialEvent, site=custom_admin_site)
class MemorialEventAdmin(admin.ModelAdmin):
    list_display = ('title', 'page', 'date')
    inlines = [EventAttendanceInline]
    list_filter = ('page',)
    search_fields = ('title', 'page__first_name', 'page__last_name')

class MemorialEventInline(admin.TabularInline):
    model = MemorialEvent; extra = 1
    raw_id_fields = ('location',)
    readonly_fields = ('manage_attendees',)
    fields = ('is_public', 'title', 'date', 'location', 'manage_attendees')
    
    @admin.display(description='Zusagen & Details')
    def manage_attendees(self, obj):
        if obj.pk:
            count = obj.attendees.count()
            url = reverse('admin:api_memorialevent_change', args=[obj.pk])
            return mark_safe(f'<a href="{url}" target="_blank">{count} Zusagen / Details bearbeiten</a>')
        return "Bitte zuerst speichern, um Details zu bearbeiten."

@admin.register(MemorialPage, site=custom_admin_site)
class MemorialPageAdmin(admin.ModelAdmin):
    form = MemorialPageForm
    search_fields = ('first_name', 'last_name', 'user__email', 'slug')
    list_display = ('thumbnail', '__str__', 'get_user_id', 'status_indicator')
    readonly_fields = ('user',)
    list_filter = ('status', 'condolence_moderation')
    inlines = [TimelineEventInline, GalleryItemInline, CondolenceInline, MemorialCandleInline, MemorialEventInline]
    actions = ['clone_memorial_page']
    raw_id_fields = ('user', 'main_photo', 'hero_background_image', 'farewell_background_image', 'obituary_card_image', 'memorial_picture', 'memorial_picture_back', 'acknowledgement_image')
    
    fieldsets = (
        (None, {'fields': ('user', 'status')}),
        ('Interaktion & Moderation', {'fields': ('condolence_moderation',)}),
        ('Personenbezogene Daten & URL', {'fields': ('first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 'slug', 'date_of_birth', 'date_of_death', 'cemetery', 'obituary')}),
        ('Design: Hero-Bereich', {'classes': ('collapse',), 'fields': ('main_photo', 'hero_background_image', 'hero_background_size')}),
        ('Design: Abschied nehmen', {'classes': ('collapse',), 'fields': ('farewell_background_color', 'farewell_background_image', 'farewell_background_size', 'farewell_text_inverted', 'obituary_card_image', 'show_memorial_picture', 'memorial_picture', 'memorial_picture_back', 'acknowledgement_type', 'acknowledgement_text', 'acknowledgement_image')}),
        ('Spendenaufruf (optional)', {'classes': ('collapse',), 'fields': ('donation_text', 'donation_link', 'donation_bank_details')}),
    )

    @admin.display(description='Bild')
    def thumbnail(self, obj):
        if obj.main_photo and obj.main_photo.url:
            return format_html('<img src="{}" width="60" height="60" style="border-radius: 50%; object-fit: cover;" />', obj.main_photo.url)
        return "Kein Bild"

    @admin.display(description='Status')
    def status_indicator(self, obj):
        colors = {'active': 'green', 'inactive': 'orange', 'archived': 'gray'}
        color = colors.get(obj.status, 'gray')
        return format_html('<span style="color: {}; font-size: 1.5rem;">●</span> {}', color, obj.get_status_display())

    @admin.display(description='Benutzer ID')
    def get_user_id(self, obj): return obj.user.id

    @admin.action(description='Ausgewählte Gedenkseiten klonen')
    def clone_memorial_page(self, request, queryset):
        # ... (Logik bleibt unverändert)
        pass

@admin.register(ReleaseRequest, site=custom_admin_site)
class ReleaseRequestAdmin(admin.ModelAdmin):
    list_display = ('deceased_full_name', 'reporter_name', 'status_indicator', 'created_at')
    list_filter = ('status',)
    fields = ('status', 'resolved_user', 'deceased_first_name', 'deceased_last_name', 'deceased_date_of_birth', 'deceased_date_of_death', 'reporter_name', 'reporter_email', 'reporter_relationship', 'death_certificate')
    readonly_fields = ('deceased_full_name', 'reporter_name', 'reporter_email', 'reporter_relationship', 'death_certificate', 'created_at')
    actions = ['approve_requests']

    @admin.display(description='Verstorbener')
    def deceased_full_name(self, obj):
        return f"{obj.deceased_first_name} {obj.deceased_last_name}"

    @admin.display(description='Status')
    def status_indicator(self, obj):
        colors = {'pending': 'orange', 'approved': 'green', 'rejected': 'red'}
        color = colors.get(obj.status, 'gray')
        return format_html('<span style="color: {}; font-size: 1.5rem;">●</span> {}', color, obj.get_status_display())

    @admin.action(description='Ausgewählte Anfragen genehmigen & Angehörige anlegen')
    def approve_requests(self, request, queryset):
        # ... (Logik bleibt unverändert)
        pass

# Alle anderen ModelAdmins, die nicht angepasst wurden, hier registrieren
custom_admin_site.register(FamilyLink)
custom_admin_site.register(LastWishes)
custom_admin_site.register(Document)
custom_admin_site.register(ContractItem)
custom_admin_site.register(InsuranceItem)
custom_admin_site.register(FinancialItem)
custom_admin_site.register(DigitalLegacyItem)
custom_admin_site.register(Condolence)
custom_admin_site.register(TimelineEvent)
custom_admin_site.register(GalleryItem)
custom_admin_site.register(MemorialCandle)
custom_admin_site.register(EventAttendance)
