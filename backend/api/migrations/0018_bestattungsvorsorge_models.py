# Generated manually for Bestattungsvorsorge models

from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0017_emergency_create_familylink_table'),
    ]

    operations = [
        # Bestattungsart
        migrations.CreateModel(
            name='Bestattungsart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-cross', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Bestattungsart',
                'verbose_name_plural': 'Bestattungsarten',
                'ordering': ['order', 'name'],
            },
        ),
        
        # Verabschiedungsart
        migrations.CreateModel(
            name='Verabschiedungsart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_religious', models.BooleanField(default=False, verbose_name='Religiös')),
                ('religion', models.CharField(blank=True, max_length=50, verbose_name='Religion')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-church', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Verabschiedungsart',
                'verbose_name_plural': 'Verabschiedungsarten',
                'ordering': ['order', 'name'],
            },
        ),
        
        # MusikKategorie
        migrations.CreateModel(
            name='MusikKategorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-music', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Musik-Kategorie',
                'verbose_name_plural': 'Musik-Kategorien',
                'ordering': ['order', 'name'],
            },
        ),
        
        # VereinsKategorie
        migrations.CreateModel(
            name='VereinsKategorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-users', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Vereinskategorie',
                'verbose_name_plural': 'Vereinskategorien',
                'ordering': ['order', 'name'],
            },
        ),
        
        # Grabart
        migrations.CreateModel(
            name='Grabart',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-tombstone', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Grabart',
                'verbose_name_plural': 'Grabarten',
                'ordering': ['order', 'name'],
            },
        ),
        
        # DokumentKategorie
        migrations.CreateModel(
            name='DokumentKategorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_required', models.BooleanField(default=False, verbose_name='Erforderlich')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-file', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Dokumentkategorie',
                'verbose_name_plural': 'Dokumentkategorien',
                'ordering': ['order', 'name'],
            },
        ),
        
        # DigitalerNachlassKategorie
        migrations.CreateModel(
            name='DigitalerNachlassKategorie',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('icon', models.CharField(default='fas fa-laptop', max_length=50, verbose_name='Icon (FontAwesome)')),
                ('order', models.PositiveIntegerField(default=0, verbose_name='Reihenfolge')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
            ],
            options={
                'verbose_name': 'Digitaler Nachlass Kategorie',
                'verbose_name_plural': 'Digitaler Nachlass Kategorien',
                'ordering': ['order', 'name'],
            },
        ),
        
        # Bestattungsvorsorge
        migrations.CreateModel(
            name='Bestattungsvorsorge',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('bestattungsart_notizen', models.TextField(blank=True, verbose_name='Notizen zur Bestattungsart')),
                ('verabschiedungsart_notizen', models.TextField(blank=True, verbose_name='Notizen zur Verabschiedung')),
                ('musik_wünsche', models.TextField(blank=True, verbose_name='Musikwünsche')),
                ('vereins_wünsche', models.TextField(blank=True, verbose_name='Vereinswünsche')),
                ('spezielle_wünsche', models.TextField(blank=True, verbose_name='Spezielle Wünsche')),
                ('blumenschmuck', models.TextField(blank=True, verbose_name='Blumenschmuck')),
                ('kleidung', models.TextField(blank=True, verbose_name='Kleidung')),
                ('friedhof', models.CharField(blank=True, max_length=200, verbose_name='Friedhof')),
                ('grabnummer', models.CharField(blank=True, max_length=50, verbose_name='Grabnummer')),
                ('grab_wünsche', models.TextField(blank=True, verbose_name='Grabwünsche')),
                ('is_completed', models.BooleanField(default=False, verbose_name='Abgeschlossen')),
                ('completion_percentage', models.PositiveIntegerField(default=0, verbose_name='Fortschritt (%)')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
                ('bestattungsart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.bestattungsart')),
                ('grabart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.grabart')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='bestattungsvorsorgen', to='api.user')),
                ('verabschiedungsart', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, to='api.verabschiedungsart')),
            ],
            options={
                'verbose_name': 'Bestattungsvorsorge',
                'verbose_name_plural': 'Bestattungsvorsorgen',
                'ordering': ['-created_at'],
            },
        ),
        
        # BestattungsvorsorgeDokument
        migrations.CreateModel(
            name='BestattungsvorsorgeDokument',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('titel', models.CharField(max_length=200, verbose_name='Titel')),
                ('datei', models.FileField(upload_to='vorsorge_dokumente/%Y/%m/', verbose_name='Datei')),
                ('beschreibung', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_uploaded', models.BooleanField(default=False, verbose_name='Hochgeladen')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('kategorie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.dokumentkategorie')),
                ('vorsorge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='dokumente', to='api.bestattungsvorsorge')),
            ],
            options={
                'verbose_name': 'Vorsorge-Dokument',
                'verbose_name_plural': 'Vorsorge-Dokumente',
                'ordering': ['kategorie__order', 'titel'],
            },
        ),
        
        # DigitalerNachlass
        migrations.CreateModel(
            name='DigitalerNachlass',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('plattform', models.CharField(max_length=100, verbose_name='Plattform/Service')),
                ('benutzername', models.CharField(blank=True, max_length=100, verbose_name='Benutzername')),
                ('email', models.EmailField(blank=True, verbose_name='E-Mail')),
                ('notizen', models.TextField(blank=True, verbose_name='Notizen')),
                ('is_important', models.BooleanField(default=False, verbose_name='Wichtig')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('kategorie', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.digitalernachlasskategorie')),
                ('vorsorge', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='digitaler_nachlass', to='api.bestattungsvorsorge')),
            ],
            options={
                'verbose_name': 'Digitaler Nachlass',
                'verbose_name_plural': 'Digitaler Nachlass',
                'ordering': ['kategorie__order', 'plattform'],
            },
        ),
        
        # Many-to-Many Beziehungen
        migrations.AddField(
            model_name='bestattungsvorsorge',
            name='musik_kategorien',
            field=models.ManyToManyField(blank=True, to='api.musikkategorie'),
        ),
        migrations.AddField(
            model_name='bestattungsvorsorge',
            name='vereins_kategorien',
            field=models.ManyToManyField(blank=True, to='api.vereinskategorie'),
        ),
    ]
