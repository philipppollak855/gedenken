# Generated manually to add slide transparency fields
from django.db import migrations, models


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0002_sitesettings_unterlagen_fields_safe'),
    ]

    operations = [
        migrations.AddField(
            model_name='sitesettings',
            name='gedenken_card_slide_transparency',
            field=models.CharField(default='0.9', help_text='Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)', max_length=10, verbose_name='Slide-in Transparenz'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='vorsorge_card_slide_transparency',
            field=models.CharField(default='0.9', help_text='Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)', max_length=10, verbose_name='Slide-in Transparenz'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_slide_transparency',
            field=models.CharField(default='0.9', help_text='Wert zwischen 0.0 (transparent) und 1.0 (undurchsichtig)', max_length=10, verbose_name='Slide-in Transparenz'),
        ),
    ]
