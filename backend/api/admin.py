# backend/api/admin.py
# ERWEITERT: Das Fieldset für die Portal-Auswahlseite wurde um die neuen Farbfelder
# für Titel und Untertitel ergänzt.

import uuid
import json
from datetime import timedelta
from django.contrib import admin, messages
from django.utils.html import format_html
from django.utils.text import slugify
from django.utils.timezone import now
from django.template.response import TemplateResponse
from unfold.admin import ModelAdmin
from import_export.admin import ImportExportModelAdmin
from import_export import resources
from django.urls import path, reverse
from django.shortcuts import render
from django.db.models import Q, Count, ForeignKey
from django.utils.safestring import mark_safe
from .models import (
    User, DigitalLegacyItem, FinancialItem, InsuranceItem,
    ContractItem, Document, LastWishes, MemorialPage, Condolence,
    TimelineEvent, GalleryItem, MemorialCandle, ReleaseRequest, FamilyLink,
    SiteSettings, MemorialEvent, CondolenceTemplate, CandleImage,
    CandleMessageTemplate, MediaAsset, MediaFolder, EventLocation, EventAttendance
)

@admin.register(MediaFolder)
class MediaFolderAdmin(ModelAdmin):
    list_display = ('name', 'parent')
    search_fields = ('name',)
    list_filter = ('parent',)
    autocomplete_fields = ('parent',)

@admin.register(MediaAsset)
class MediaAssetAdmin(ModelAdmin):
    list_display = ('title', 'asset_type', 'folder', 'thumbnail', 'image_usage', 'uploaded_at')
    list_filter = ('asset_type', 'folder')
    search_fields = ('title', 'folder__name')
    autocomplete_fields = ('folder',)
    change_list_template = "admin/api/mediaasset/explorer_changelist.html"
    
    @admin.display(description='Vorschau')
    def thumbnail(self, obj):
        if obj.asset_type == 'image' and obj.url:
            return format_html('<img src="{}" width="100" height="auto" />', obj.url)
        return "Keine Vorschau"

    @admin.display(description='Verwendung')
    def image_usage(self, obj):
        usages = []
        
        memorial_page_field_map = {
            'main_photo': "Portrait", 'hero_background_image': "Hintergrund Hero",
            'farewell_background_image': "Hintergrund Abschied", 'obituary_card_image': "Partezettel",
            'memorial_picture': "Gedenkbild (Vorderseite)", 'memorial_picture_back': "Gedenkbild Rückseite",
            'acknowledgement_image': "Danksagung",
        }
        for field_name, label in memorial_page_field_map.items():
            pages = MemorialPage.objects.filter(**{field_name: obj})
            if pages.exists():
                page_links = [f'<a href="{reverse("admin:api_memorialpage_change", args=[p.pk])}">{str(p)}</a>' for p in pages]
                usages.append(f"{label}: {', '.join(page_links)}")

        site_settings_field_map = {
            'header_logo_image': "Header Logo",
            'listing_background_image': "Hintergrund Gedenkseiten-Listing", 
            'search_background_image': "Hintergrund Suche",
            'expend_background_image': "Hintergrund Expand-Bereich", 
            'login_background_image': "Hintergrund Login",
            'register_background_image': "Hintergrund Registrierung", 
            'register_info_panel_image': "Info-Panel Registrierung",
            'password_reset_background_image': "Hintergrund Passwort-Reset", 
            'mein_bereich_background_image': "Hintergrund Mein Bereich",
            'portal_choice_background_image': "Hintergrund Portal-Auswahl", 
            'gedenken_card_image': "Hintergrundbild Gedenken-Säule",
            'vorsorge_card_image': "Hintergrundbild Vorsorge-Säule",
        }
        try:
            settings_instance = SiteSettings.objects.get(pk=1)
            for field_name, label in site_settings_field_map.items():
                if hasattr(settings_instance, field_name) and getattr(settings_instance, field_name) == obj:
                    url = reverse('admin:api_sitesettings_change', args=[1])
                    usages.append(f'{label}: <a href="{url}">Globale Einstellungen</a>')
        except SiteSettings.DoesNotExist:
            pass

        gallery_pages = GalleryItem.objects.filter(image=obj).select_related('page')
        if gallery_pages.exists():
            page_links = list(set([f'<a href="{reverse("admin:api_memorialpage_change", args=[g.page.pk])}">{str(g.page)}</a>' for g in gallery_pages]))
            usages.append(f"Galerie: {', '.join(page_links)}")

        if CandleImage.objects.filter(image=obj).exists():
             usages.append("Kerzenbild (Stammdaten)")

        return mark_safe("<br>".join(usages)) if usages else "Nicht direkt verwendet"


    def save_model(self, request, obj, form, change):
        if not change:
            folder_id = request.GET.get('folder_id')
            if folder_id:
                try:
                    obj.folder = MediaFolder.objects.get(pk=folder_id)
                except (ValueError, MediaFolder.DoesNotExist):
                    pass
        super().save_model(request, obj, form, change)

    def changelist_view(self, request, extra_context=None):
        if '_popup' in request.GET:
            self.change_list_template = "admin/change_list.html"
            return super().changelist_view(request, extra_context)

        self.change_list_template = "admin/api/mediaasset/explorer_changelist.html"
        extra_context = extra_context or {}

        def get_folder_tree(parent=None):
            folders = MediaFolder.objects.filter(parent=parent).order_by('name')
            tree = []
            for folder in folders:
                tree.append({
                    'folder': folder,
                    'children': get_folder_tree(folder)
                })
            return tree

        extra_context['folder_tree'] = get_folder_tree()
        
        try:
            current_folder_id = int(request.GET.get('folder_id', ''))
            extra_context['current_folder'] = MediaFolder.objects.get(pk=current_folder_id)
        except (ValueError, TypeError, MediaFolder.DoesNotExist):
            extra_context['current_folder'] = None

        return super().changelist_view(request, extra_context)

    def get_queryset(self, request):
        queryset = super().get_queryset(request)
        if '_popup' in request.GET:
            return queryset
        try:
            current_folder_id = int(request.GET.get('folder_id', ''))
            return queryset.filter(folder_id=current_folder_id)
        except (ValueError, TypeError):
            return queryset.filter(folder__isnull=True)

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
class SiteSettingsAdmin(ModelAdmin):
    raw_id_fields = (
        'header_logo_image',
        'listing_background_image', 
        'search_background_image', 
        'expend_background_image', 
        'login_background_image',
        'register_background_image',
        'register_info_panel_image',
        'password_reset_background_image',
        'mein_bereich_background_image',
        'portal_choice_background_image', 
        'gedenken_card_image', 
        'vorsorge_card_image',
    )
    fieldsets = (
        ('Header / Navigation', {
            'classes': ('collapse',),
            'fields': (
                'header_logo_image', 
                'header_logo_height',
                'header_site_title_text',
                ('header_site_title_color', 'header_site_title_size'),
                'header_button_text_size',
            )
        }),
        ('Portal Auswahlseite', {
            'fields': (
                ('portal_choice_title', 'portal_choice_title_color'),
                ('portal_choice_subtitle', 'portal_choice_subtitle_color'),
                'portal_choice_background_color', 
                'portal_choice_background_image',
            )
        }),
        ('Design Gedenken-Säule', {
            'classes': ('collapse',),
            'fields': (
                'gedenken_card_sidetext',
                ('gedenken_card_sidetext_color', 'gedenken_card_sidetext_size'),
                ('gedenken_card_background_color', 'gedenken_card_image'),
                'gedenken_card_title',
                ('gedenken_card_title_color', 'gedenken_card_title_size'),
                'gedenken_card_details_text',
                ('gedenken_card_details_text_color', 'gedenken_card_details_text_size'),
                'gedenken_card_content_background',
            )
        }),
        ('Design Vorsorge-Säule', {
            'classes': ('collapse',),
            'fields': (
                'vorsorge_card_sidetext',
                ('vorsorge_card_sidetext_color', 'vorsorge_card_sidetext_size'),
                ('vorsorge_card_background_color', 'vorsorge_card_image'),
                'vorsorge_card_title',
                ('vorsorge_card_title_color', 'vorsorge_card_title_size'),
                'vorsorge_card_details_text',
                ('vorsorge_card_details_text_color', 'vorsorge_card_details_text_size'),
                'vorsorge_card_content_background',
            )
        }),
        ('Gedenkseiten-Listing (Startseite)', {
            'classes': ('collapse',),
            'fields': ('listing_title', 'listing_background_color', 'listing_background_image', 'listing_card_color', 'listing_text_color', 'listing_card_text_color', 'listing_arrow_color')
        }),
        ('Suche (Startseite)', {
            'classes': ('collapse',),
            'fields': ('search_title', 'search_helper_text', 'search_background_color', 'search_background_image', 'search_text_color',
                       'search_filter_button_color', 'search_filter_button_icon_color', 'search_filter_menu_color', 
                       'search_filter_menu_text_color', 'search_filter_active_color', 'search_filter_active_text_color')
        }),
        ('Expand-Bereich (Kondolenzen etc.)', {
            'classes': ('collapse',),
            'fields': ('expend_background_color', 'expend_background_image', 'expend_card_color', 'expend_text_color')
        }),
        ('Globale Schriften', {
            'classes': ('collapse',),
            'fields': ('font_family', 'font_size_base')
        }),
        ('Login-Seite', {
            'classes': ('collapse',),
            'fields': ('login_title', 'login_subtitle', 'login_background_color', 'login_background_image', 'login_card_background_color', 'login_text_color', 'login_button_color', 'login_button_text_color')
        }),
        ('Registrierungsseite', {
            'classes': ('collapse',),
            'fields': ('register_title', 'register_subtitle', 'register_background_color', 'register_background_image', 'register_info_panel_image', 'register_info_panel_image_size', 'register_card_background_color', 'register_text_color', 'register_button_color', 'register_button_text_color')
        }),
        ('Passwort zurücksetzen', {
            'classes': ('collapse',),
            'fields': (
                'password_reset_title', 'password_reset_subtitle',
                'password_reset_background_color', 'password_reset_background_image',
                'password_reset_card_background_color', 'password_reset_text_color',
                'password_reset_button_color', 'password_reset_button_text_color',
                'password_reset_confirm_title', 'password_reset_confirm_subtitle'
            )
        }),
        ('Mein Bereich', {
            'classes': ('collapse',),
            'fields': (
                'mein_bereich_background_color', 'mein_bereich_background_image', 'mein_bereich_container_background_color',
                'mein_bereich_sidebar_background_color', 'mein_bereich_sidebar_text_color', 
                'mein_bereich_sidebar_active_background_color', 'mein_bereich_sidebar_active_text_color',
                'mein_bereich_dashboard_title', 'mein_bereich_dashboard_subtitle'
            )
        }),
    )
    
    def get_urls(self):
        urls = super().get_urls()
        custom_urls = [
            path('', self.admin_site.admin_view(self.change_view), {'object_id': '1'}, name='api_sitesettings_changelist'),
        ]
        return [url for url in custom_urls if url.name != 'api_sitesettings_add' and url.name != 'api_sitesettings_delete'] + urls

@admin.register(FamilyLink)
class FamilyLinkAdmin(ModelAdmin):
    list_display = ('deceased_user', 'relative_user', 'relationship', 'is_main_contact')
    search_fields = ('deceased_user__first_name', 'relative_user__first_name')
    autocomplete_fields = ('deceased_user', 'relative_user')

class FamilyLinkInline(admin.TabularInline):
    model = FamilyLink
    fk_name = 'deceased_user'
    extra = 1
    verbose_name = "Angehöriger"
    verbose_name_plural = "Angehörige"
    autocomplete_fields = ('relative_user',)
    fieldsets = (
        (None, {
            'fields': ('relative_user', 'relationship', 'is_main_contact')
        }),
        ('Berechtigungen (optional)', {
            'classes': ('collapse',), 
            'fields': (
                'can_edit_memorial_page', 'can_view_precaution_data', 'can_edit_precaution_data',
                'power_of_attorney', 'is_validated_by_admin'
            ),
        }),
    )

@admin.register(User)
class UserAdmin(ImportExportModelAdmin, ModelAdmin):
    resource_classes = [resources.ModelResource]
    list_display = ('get_full_name', 'email', 'role', 'created_at')
    search_fields = ('first_name', 'last_name', 'email')
    inlines = [FamilyLinkInline]
    
    readonly_fields = (
        'id', 'created_at', 'updated_at',
        'manage_last_wishes', 'manage_documents', 'manage_contracts',
        'manage_insurances', 'manage_financials', 'manage_digital_legacy',
        'display_own_memorial_page', 'display_managed_memorial_pages'
    )
    fieldsets = (
        (None, {'fields': ('email', 'first_name', 'last_name', 'role')}),
        ('Gedenkseiten-Verwaltung', {
            'fields': ('display_own_memorial_page', 'display_managed_memorial_pages'),
        }),
        ('Vorsorge-Verwaltung (Pop-ups)', {
            'fields': (
                'manage_last_wishes', 'manage_documents', 'manage_contracts',
                'manage_insurances', 'manage_financials', 'manage_digital_legacy'
            ),
        }),
        ('Berechtigungen & Status', {'fields': ('is_active', 'is_staff', 'is_superuser')}),
        ('Wichtige Daten', {'fields': ('id', 'created_at', 'updated_at')}),
    )
    @admin.display(description='Name')
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"
    @admin.display(description='Letzte Wünsche')
    def manage_last_wishes(self, obj):
        url = reverse('admin:api_lastwishes_change', args=(obj.pk,))
        return format_html(f'<a href="{url}" class="button manage-button" data-modal-title="Letzte Wünsche für {obj}">Verwalten</a>')
    @admin.display(description='Dokumente')
    def manage_documents(self, obj):
        count = obj.documents.count()
        url = reverse('admin:api_document_changelist') + f'?user__pk__exact={obj.pk}'
        return format_html(f'{count} Dokumente <a href="{url}" class="button manage-button" data-modal-title="Dokumente für {obj}">Verwalten</a>')
    @admin.display(description='Verträge')
    def manage_contracts(self, obj):
        count = obj.contract_items.count()
        url = reverse('admin:api_contractitem_changelist') + f'?user__pk__exact={obj.pk}'
        return format_html(f'{count} Verträge <a href="{url}" class="button manage-button" data-modal-title="Verträge für {obj}">Verwalten</a>')
    @admin.display(description='Versicherungen')
    def manage_insurances(self, obj):
        count = obj.insurance_items.count()
        url = reverse('admin:api_insuranceitem_changelist') + f'?user__pk__exact={obj.pk}'
        return format_html(f'{count} Versicherungen <a href="{url}" class="button manage-button" data-modal-title="Versicherungen für {obj}">Verwalten</a>')
    @admin.display(description='Finanzen')
    def manage_financials(self, obj):
        count = obj.financial_items.count()
        url = reverse('admin:api_financialitem_changelist') + f'?user__pk__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Finanzen für {obj}">Verwalten</a>')
    @admin.display(description='Digitaler Nachlass')
    def manage_digital_legacy(self, obj):
        count = obj.legacy_items.count()
        url = reverse('admin:api_digitallegacyitem_changelist') + f'?user__pk__exact={obj.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Digitaler Nachlass für {obj}">Verwalten</a>')
    @admin.display(description='Eigene Gedenkseite')
    def display_own_memorial_page(self, obj):
        try:
            page = obj.memorial_page
            url = reverse('admin:api_memorialpage_change', args=[page.pk])
            return format_html('<a href="{url}" data-modal-title="Gedenkseite für {obj} bearbeiten">{obj}</a>', url=url, obj=obj)
        except MemorialPage.DoesNotExist:
            return "Keine eigene Gedenkseite vorhanden."
    @admin.display(description='Verwaltete Gedenkseiten (als Angehöriger)')
    def display_managed_memorial_pages(self, obj):
        links = FamilyLink.objects.filter(relative_user=obj)
        if not links.exists():
            return "Verwaltet keine Gedenkseiten für andere."
        
        html_links = []
        for link in links:
            deceased_user_url = reverse('admin:api_user_change', args=[link.deceased_user.pk])
            deceased_user_link = f'<a href="{deceased_user_url}" data-modal-title="Benutzer {link.deceased_user.get_full_name()} ansehen">{link.deceased_user.get_full_name()}</a>'
            page_info = '(Keine Gedenkseite erstellt)'
            try:
                page = link.deceased_user.memorial_page
                page_url = reverse('admin:api_memorialpage_change', args=[page.pk])
                page_link = f'<a href="{page_url}" data-modal-title="Gedenkseite für {link.deceased_user.get_full_name()} bearbeiten">Gedenkseite verwalten</a>'
                page_info = f' &rarr; {page_link}'
            except MemorialPage.DoesNotExist:
                pass
            html_links.append(f'<li>Für {deceased_user_link}{page_info}</li>')
        return format_html('<ul>' + ''.join(html_links) + '</ul>')

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

class MemorialEventInline(admin.TabularInline):
    model = MemorialEvent
    extra = 1
    raw_id_fields = ('location',)
    
@admin.register(MemorialPage)
class MemorialPageAdmin(ModelAdmin):
    search_fields = ('first_name', 'last_name', 'user__email', 'slug')
    list_display = ('__str__', 'get_user_id', 'status', 'condolence_moderation')
    actions = ['clone_memorial_page']
    
    autocomplete_fields = ['user']
    raw_id_fields = ('main_photo', 'hero_background_image', 'farewell_background_image', 'obituary_card_image', 'memorial_picture', 'memorial_picture_back', 'acknowledgement_image')
    
    readonly_fields = ('manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events', 'display_family_links')

    def get_readonly_fields(self, request, obj=None): 
        if obj: 
            return self.readonly_fields + ('user',)
        return self.readonly_fields
    @admin.display(description='Chronik-Einträge')
    def manage_timeline(self, obj):
        count = obj.timeline_events.count()
        url = reverse('admin:api_timelineevent_changelist') + f'?page__pk__exact={obj.user.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Chronik für {obj}">Verwalten</a>')
    @admin.display(description='Galerie-Bilder')
    def manage_gallery(self, obj):
        count = obj.gallery_items.count()
        url = reverse('admin:api_galleryitem_changelist') + f'?page__pk__exact={obj.user.pk}'
        return format_html(f'{count} Bilder <a href="{url}" class="button manage-button" data-modal-title="Galerie für {obj}">Verwalten</a>')
    @admin.display(description='Kondolenzen')
    def manage_condolences(self, obj):
        count = obj.condolences.count()
        url = reverse('admin:api_condolence_changelist') + f'?page__pk__exact={obj.user.pk}'
        return format_html(f'{count} Einträge <a href="{url}" class="button manage-button" data-modal-title="Kondolenzen für {obj}">Verwalten</a>')
    @admin.display(description='Gedenkkerzen')
    def manage_candles(self, obj):
        count = obj.candles.count()
        url = reverse('admin:api_memorialcandle_changelist') + f'?page__pk__exact={obj.user.pk}'
        return format_html(f'{count} Kerzen <a href="{url}" class="button manage-button" data-modal-title="Gedenkkerzen für {obj}">Verwalten</a>')
    @admin.display(description='Termine')
    def manage_events(self, obj):
        count = obj.events.count()
        url = reverse('admin:api_memorialevent_changelist') + f'?page__pk__exact={obj.user.pk}'
        return format_html(f'{count} Termine <a href="{url}" class="button manage-button" data-modal-title="Termine für {obj}">Verwalten</a>')
    @admin.display(description='Inhalte verwalten')
    def manage_content_links(self, obj):
        links = f"""
            <a href="{reverse('admin:api_timelineevent_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Chronik für {obj}">Chronik</a>
            <a href="{reverse('admin:api_galleryitem_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Galerie für {obj}">Galerie</a>
            <a href="{reverse('admin:api_condolence_changelist')}?page__pk__exact={obj.pk}" class="button manage-button-list" data-modal-title="Kondolenzen für {obj}">Kondolenzen</a>
        """
        return format_html(links)
    
    @admin.display(description='Angehörige & Berechtigungen')
    def display_family_links(self, obj):
        user = obj.user
        links = FamilyLink.objects.filter(deceased_user=user)
        html_list = "<ul>"
        if not links.exists():
            html_list += "<li>Keine Angehörigen verknüpft.</li>"
        else:
            for link in links:
                relative = link.relative_user
                url = reverse('admin:api_user_change', args=(relative.pk,))
                main_contact_str = " (Hauptansprechpartner)" if link.is_main_contact else ""
                relationship_str = f" - {link.relationship}" if link.relationship else ""
                html_list += f'<li><a href="{url}" data-modal-title="Benutzer {relative.get_full_name()} ansehen">{relative.get_full_name()}</a> ({relative.email}){relationship_str}{main_contact_str}</li>'
        html_list += "</ul>"
        manage_url = reverse('admin:api_user_change', args=(user.pk,)) + '#familylink_set-group'
        html_button = f'<div style="margin-top: 1rem;"><a href="{manage_url}" class="button manage-button" data-modal-title="Angehörige für {user.get_full_name()} verwalten">Angehörige verwalten</a></div>'
        
        return format_html(html_list + html_button)

    fieldsets = (
        (None, {'fields': ('user', 'status')}),
        ('Angehörige & Berechtigungen', {
            'fields': ('display_family_links',),
        }),
        ('Personenbezogene Daten & URL', {'fields': ('first_name', 'last_name', 'birth_name_type', 'birth_name_or_title', 'slug', 'date_of_birth', 'date_of_death', 'cemetery', 'obituary')}),
        ('Inhaltsverwaltung (Pop-ups)', {
            'fields': ('manage_timeline', 'manage_gallery', 'manage_condolences', 'manage_candles', 'manage_events'),
        }),
        ('Design: Hero-Bereich', { 'classes': ('collapse',), 'fields': ('main_photo', 'hero_background_image', 'hero_background_size'), }),
        ('Design: Abschied nehmen', { 'classes': ('collapse',), 'fields': ('farewell_background_color', 'farewell_background_image', 'farewell_background_size', 
                'farewell_text_inverted',
                'obituary_card_image', 
                'show_memorial_picture', 'memorial_picture', 'memorial_picture_back',
                'acknowledgement_type', 'acknowledgement_text', 'acknowledgement_image'), }),
        ('Spendenaufruf (optional)', { 'classes': ('collapse',), 'fields': ('donation_text', 'donation_link', 'donation_bank_details'), }),
    )

    @admin.display(description='Benutzer ID')
    def get_user_id(self, obj):
        return obj.user.id
        
    @admin.action(description='Ausgewählte Gedenkseiten klonen')
    def clone_memorial_page(self, request, queryset):
        pass

@admin.register(ReleaseRequest)
class ReleaseRequestAdmin(ModelAdmin):
    list_display = ('deceased_full_name', 'reporter_name', 'status', 'created_at')
    actions = ['approve_requests']
    
    @admin.display(description="Verstorbener")
    def deceased_full_name(self, obj):
        return f"{obj.deceased_first_name} {obj.deceased_last_name}"
        
    @admin.action(description='Ausgewählte Anfragen genehmigen & Angehörige anlegen')
    def approve_requests(self, request, queryset):
        pass

def admin_dashboard_view(request):
    """
    Die Logik für unser neues Admin-Dashboard.
    Sammelt Statistiken und die neuesten Aktivitäten.
    """
    stats = {
        'total_users': User.objects.count(),
        'total_pages': MemorialPage.objects.count(),
        'pending_releases': ReleaseRequest.objects.filter(status=ReleaseRequest.Status.PENDING).count(),
        'unapproved_condolences': Condolence.objects.filter(is_approved=False).count(),
    }
    
    today = now()
    upcoming_events_grid = MemorialEvent.objects.filter(date__gte=today).order_by('date')[:5]
    latest_condolences = Condolence.objects.order_by('-created_at')[:10]
    latest_candles = MemorialCandle.objects.order_by('-created_at')[:10]
    
    all_events = MemorialEvent.objects.all()
    calendar_events = [
        {
            "title": f"{event.title} für {event.page.first_name} {event.page.last_name}",
            "start": event.date.isoformat(),
            "date": event.date.strftime('%Y-%m-%d'),
            "time": event.date.strftime('%H:%M'),
            "url": reverse('admin:api_memorialevent_change', args=[event.pk])
        } for event in all_events
    ]

    context = {
        **admin.site.each_context(request),
        "title": "Dashboard",
        "stats": stats,
        "upcoming_events_grid": upcoming_events_grid,
        "latest_condolences": latest_condolences,
        "latest_candles": latest_candles,
        "calendar_events_json": json.dumps(calendar_events),
    }
    return render(request, "admin/dashboard.html", context)

admin.site.index = admin_dashboard_view

