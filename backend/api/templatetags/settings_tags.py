# api/templatetags/settings_tags.py
from django import template
from api.models import SiteSettings

register = template.Library()

@register.simple_tag
def get_site_settings():
    # Holt die Einstellungen oder erstellt sie, falls sie nicht existieren
    settings, _ = SiteSettings.objects.get_or_create(pk=1)
    return settings
