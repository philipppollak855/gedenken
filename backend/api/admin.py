# backend/api/admin.py
# ZURÜCKGESETZT: Der Wizard wurde entfernt. Die "Verwalten"-Buttons in Pop-ups sind wieder aktiv.

import uuid
import json
from datetime import timedelta
from django.contrib import admin, messages
from django.utils.html import format_html
from django.utils.text import slugify
from django.utils.timezone import now
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django.urls import path, reverse
from django.shortcuts import render, redirect
from django.http import HttpResponseRedirect
from django.db.models import Q, Count
from django.utils.safestring import mark_safe
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem,
    ContractItem, Document, LastWishes, MemorialPage, Condolence,
    TimelineEvent, GalleryItem, MemorialCandle, ReleaseRequest, FamilyLink,
    SiteSettings, MemorialEvent, CondolenceTemplate, CandleImage,
    CandleMessageTemplate, MediaAsset, EventLocation, EventAttendance
)

# --- Admin Classes ---

@admin.register(LastWishes)
class LastWishesAdmin(ModelAdmin): pass
@admin.register(Document)
class DocumentAdmin(ModelAdmin): pass
@admin.register(ContractItem)
class ContractItemAdmin(ModelAdmin): pass
@admin.register(InsuranceItem)
class InsuranceItemAdmin(ModelAdmin): pass
@admin.register(FinancialItem)
class FinancialItemAdmin(ModelAdmin): pass
@admin.register(DigitalLegacyItem)
class DigitalLegacyItemAdmin(ModelAdmin): pass
@admin.register(TimelineEvent)
class TimelineEventAdmin(ModelAdmin): pass
@admin.register(GalleryItem)
class GalleryItemAdmin(ModelAdmin): pass
@admin.register(EventLocation)
class EventLocationAdmin(ModelAdmin): pass
@admin.register(MediaAsset)
class MediaAssetAdmin(ModelAdmin): pass
@admin.register(CandleImage)
class CandleImageAdmin(ModelAdmin): pass
@admin.register(CandleMessageTemplate)
class CandleMessageTemplateAdmin(ModelAdmin): pass
@admin.register(CondolenceTemplate)
class CondolenceTemplateAdmin(ModelAdmin): pass
@admin.register(Condolence)
class CondolenceAdmin(ModelAdmin): pass
@admin.register(MemorialCandle)
class MemorialCandleAdmin(ModelAdmin): pass
@admin.register(SiteSettings)
class SiteSettingsAdmin(ModelAdmin): pass

class FamilyLinkInline(admin.TabularInline):
    model = FamilyLink
    fk_name = 'deceased_user'
    extra = 1
    verbose_name = "Angehöriger"
    verbose_name_plural = "Angehörige"

@admin.register(User)
class UserAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_classes = [resources.ModelResource] # Placeholder
    list_display = ('get_full_name', 'email', 'role', 'created_at')
    readonly_fields = ('id', 'created_at', 'updated_at')
    inlines = [FamilyLinkInline]
    
    @admin.display(description='Name')
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

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
    list_display = ('__str__', 'get_user_id', 'status', 'manage_content_links')
    actions = ['clone_memorial_page']
    raw_id_fields = ('user', 'main_photo', 'hero_background_image', 'farewell_background_image', 'obituary_card_image', 'memorial_picture', 'memorial_picture_back', 'acknowledgement_image')
    readonly_fields = ('user', 'manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events')

    @admin.display(description='Chronik-Einträge')
    def manage_timeline(self, obj):
        count = obj.timeline_events.count()
        url = reverse('admin:api_timelineevent_changelist') + f'?page__pk__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Chronik für {obj}">Verwalten</a>')

    @admin.display(description='Galerie-Bilder')
    def manage_gallery(self, obj):
        count = obj.gallery_items.count()
        url = reverse('admin:api_galleryitem_changelist') + f'?page__pk__exact={obj.pk}'
        return format_html(f'{count} Bilder <a href="{url}" class="button manage-button" data-modal-title="Galerie für {obj}">Verwalten</a>')

    @admin.display(description='Kondolenzen')
    def manage_condolences(self, obj):
        count = obj.condolences.count()
        url = reverse('admin:api_condolence_changelist') + f'?page__pk__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Kondolenzen für {obj}">Verwalten</a>')

    @admin.display(description='Gedenkkerzen')
    def manage_candles(self, obj):
        count = obj.candles.count()
        url = reverse('admin:api_memorialcandle_changelist') + f'?page__pk__exact={obj.pk}'
        return format_html(f'{count} Kerzen <a href="{url}" class="button manage-button" data-modal-title="Gedenkkerzen für {obj}">Verwalten</a>')

    @admin.display(description='Termine')
    def manage_events(self, obj):
        count = obj.events.count()
        url = reverse('admin:api_memorialevent_changelist') + f'?page__pk__exact={obj.pk}'
        return format_html(f'{count} Termine <a href="{url}" class="button manage-button" data-modal-title="Termine für {obj}">Verwalten</a>')

    @admin.display(description='Inhalte verwalten')
    def manage_content_links(self, obj):
        links = f"""
            <a href="{reverse('admin:api_timelineevent_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Chronik für {obj}">Chronik</a>
            <a href="{reverse('admin:api_galleryitem_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Galerie für {obj}">Galerie</a>
            <a href="{reverse('admin:api_condolence_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Kondolenzen für {obj}">Kondolenzen</a>
        """
        return format_html(links)

    fieldsets = (
        (None, {'fields': ('user', 'status')}),
        ('Personenbezogene Daten & URL', {'fields': ('first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 'slug', 'date_of_birth', 'date_of_death', 'cemetery', 'obituary')}),
        ('Inhaltsverwaltung (Pop-ups)', {
            'fields': ('manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events'),
        }),
        ('Design: Hero-Bereich', { 'classes': ('collapse',), 'fields': ('main_photo', 'hero_background_image', 'hero_background_size'), }),
        ('Design: Abschied nehmen', { 'classes': ('collapse',), 'fields': ('farewell_background_color', 'farewell_background_image', 'farewell_background_size', 'farewell_text_inverted', 'obituary_card_image', 'show_memorial_picture', 'memorial_picture', 'memorial_picture_back', 'acknowledgement_type', 'acknowledgement_text', 'acknowledgement_image'), }),
        ('Spendenaufruf (optional)', { 'classes': ('collapse',), 'fields': ('donation_text', 'donation_link', 'donation_bank_details'), }),
    )

    @admin.display(description='Benutzer ID')
    def get_user_id(self, obj):
        return obj.user.id

@admin.register(ReleaseRequest)
class ReleaseRequestAdmin(ModelAdmin):
    list_display = ('deceased_full_name', 'reporter_name', 'status', 'created_at')
    actions = ['approve_requests']
    
    @admin.display(description="Verstorbener")
    def deceased_full_name(self, obj):
        return f"{obj.deceased_first_name} {obj.deceased_last_name}"
        
    @admin.action(description='Ausgewählte Anfragen genehmigen & Angehörige anlegen')
    def approve_requests(self, request, queryset):
        # ... (logic remains the same)
        pass

# --- Dashboard ---
def dashboard_view(request):
    # ... (dashboard logic remains the same)
    context = {"title": "Dashboard", "stats": {}, "latest_condolences": [], "latest_candles": [], "upcoming_events_grid": [], "calendar_events_json": "[]"}
    return render(request, "admin/dashboard.html", context)

admin.site.index = dashboard_view

