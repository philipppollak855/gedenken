from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        # Unterlagen-Säule Felder
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_sidetext',
            field=models.CharField(blank=True, default='Unterlagen', max_length=50, verbose_name='Seitentext (Unterlagen-Säule)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_sidetext_color',
            field=models.CharField(blank=True, default='#FFFFFF', max_length=30, verbose_name='Farbe Seitentext'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_sidetext_size',
            field=models.CharField(blank=True, default='3.2rem', max_length=10, verbose_name='Schriftgröße Seitentext'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_background_color',
            field=models.CharField(blank=True, default='#4b5563', max_length=7, verbose_name='Hintergrundfarbe (Unterlagen-Säule)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_image',
            field=models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='+', to='api.mediaasset', verbose_name='Hintergrundbild (Unterlagen-Säule)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_title',
            field=models.CharField(blank=True, default='Unterlagen', max_length=100, verbose_name='Titel (Unterlagen-Beschreibung)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_title_color',
            field=models.CharField(blank=True, default='#FFFFFF', max_length=7, verbose_name='Farbe Titel'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_title_size',
            field=models.CharField(blank=True, default='2.5rem', max_length=10, verbose_name='Schriftgröße Titel'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_details_text',
            field=models.TextField(blank=True, default='<ul><li><strong>Dokumente verwalten:</strong> Laden Sie wichtige Unterlagen sicher hoch.</li><li><strong>Verträge finden:</strong> Behalten Sie den Überblick über alle Nachweise.</li><li><strong>Sicher und privat:</strong> Schutz Ihrer sensiblen Daten.</li></ul>', verbose_name='Detaillierte Beschreibung (Unterlagen)'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_details_text_color',
            field=models.CharField(blank=True, default='#FFFFFF', max_length=7, verbose_name='Farbe Beschreibungstext'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_details_text_size',
            field=models.CharField(blank=True, default='0.95rem', max_length=10, verbose_name='Schriftgröße Beschreibungstext'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_card_content_background',
            field=models.CharField(blank=True, default='#3a3a3a', max_length=30, verbose_name='Hintergrundfarbe Beschreibung'),
        ),

        # Unterlagen-Dashboard (Design)
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_dashboard_title',
            field=models.CharField(blank=True, default='Unterlagen', max_length=100, verbose_name='Titel Unterlagen-Dashboard'),
        ),
        migrations.AddField(
            model_name='sitesettings',
            name='unterlagen_dashboard_subtitle',
            field=models.TextField(blank=True, default='Verwalten Sie Freigaben, Dokumente und Trauerdrucke an einem Ort.', verbose_name='Untertitel Unterlagen-Dashboard'),
        ),
    ]


