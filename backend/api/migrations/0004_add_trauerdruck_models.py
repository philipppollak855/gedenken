# Generated manually to add Trauerdruck models
from django.db import migrations, models
import django.db.models.deletion


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0003_add_slide_transparency_fields'),
    ]

    operations = [
        migrations.CreateModel(
            name='TrauerdruckType',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=100, unique=True, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Typ',
                'verbose_name_plural': 'Trauerdruck-Typen',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='TrauerdruckEntwurf',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('title', models.CharField(max_length=200, verbose_name='Titel')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('status', models.CharField(choices=[('draft', 'Entwurf'), ('pending_approval', 'Wartet auf Freigabe'), ('approved', 'Freigegeben'), ('revision_requested', 'Revision angefordert'), ('rejected', 'Abgelehnt'), ('completed', 'Abgeschlossen')], default='draft', max_length=20, verbose_name='Status')),
                ('version', models.PositiveIntegerField(default=1, verbose_name='Version')),
                ('is_latest_version', models.BooleanField(default=True, verbose_name='Neueste Version')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('updated_at', models.DateTimeField(auto_now=True, verbose_name='Aktualisiert am')),
                ('deadline', models.DateTimeField(blank=True, null=True, verbose_name='Deadline')),
                ('priority', models.CharField(choices=[('low', 'Niedrig'), ('normal', 'Normal'), ('high', 'Hoch'), ('urgent', 'Dringend')], default='normal', max_length=10, verbose_name='Priorität')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='created_trauerdruck_entwuerfe', to='api.user', verbose_name='Erstellt von')),
                ('design_file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trauerdruck_designs', to='api.mediaasset', verbose_name='Design-Datei')),
                ('memorial_page', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trauerdruck_entwuerfe', to='api.memorialpage', verbose_name='Gedenkseite')),
                ('preview_file', models.ForeignKey(blank=True, null=True, on_delete=django.db.models.deletion.SET_NULL, related_name='trauerdruck_previews', to='api.mediaasset', verbose_name='Vorschau-Datei')),
                ('trauerdruck_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.trauerdrucktype', verbose_name='Trauerdruck-Typ')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Entwurf',
                'verbose_name_plural': 'Trauerdruck-Entwürfe',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrauerdruckTemplate',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('name', models.CharField(max_length=200, verbose_name='Name')),
                ('description', models.TextField(blank=True, verbose_name='Beschreibung')),
                ('is_active', models.BooleanField(default=True, verbose_name='Aktiv')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('created_by', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user', verbose_name='Erstellt von')),
                ('template_file', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trauerdruck_templates', to='api.mediaasset', verbose_name='Template-Datei')),
                ('trauerdruck_type', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.trauerdrucktype', verbose_name='Trauerdruck-Typ')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Template',
                'verbose_name_plural': 'Trauerdruck-Templates',
                'ordering': ['name'],
            },
        ),
        migrations.CreateModel(
            name='TrauerdruckKommentar',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('content', models.TextField(verbose_name='Kommentar')),
                ('is_internal', models.BooleanField(default=False, help_text='Nur für Bestatter sichtbar', verbose_name='Interner Kommentar')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('author', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user', verbose_name='Autor')),
                ('entwurf', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='kommentare', to='api.trauerdruckentwurf', verbose_name='Entwurf')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Kommentar',
                'verbose_name_plural': 'Trauerdruck-Kommentare',
                'ordering': ['created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrauerdruckFreigabe',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('decision', models.CharField(choices=[('pending', 'Ausstehend'), ('approved', 'Freigegeben'), ('revision_requested', 'Revision angefordert'), ('rejected', 'Abgelehnt')], default='pending', max_length=20, verbose_name='Entscheidung')),
                ('comment', models.TextField(blank=True, verbose_name='Kommentar')),
                ('revision_notes', models.TextField(blank=True, help_text='Was soll geändert werden?', verbose_name='Revisionshinweise')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Entschieden am')),
                ('entwurf', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='freigaben', to='api.trauerdruckentwurf', verbose_name='Entwurf')),
                ('reviewer', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, to='api.user', verbose_name='Prüfer')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Freigabe',
                'verbose_name_plural': 'Trauerdruck-Freigaben',
                'ordering': ['-created_at'],
            },
        ),
        migrations.CreateModel(
            name='TrauerdruckBenachrichtigung',
            fields=[
                ('id', models.BigAutoField(auto_created=True, primary_key=True, serialize=False, verbose_name='ID')),
                ('notification_type', models.CharField(choices=[('new_draft', 'Neuer Entwurf'), ('approval_requested', 'Freigabe angefordert'), ('approved', 'Freigegeben'), ('revision_requested', 'Revision angefordert'), ('rejected', 'Abgelehnt'), ('deadline_reminder', 'Deadline-Erinnerung'), ('comment_added', 'Neuer Kommentar')], max_length=20, verbose_name='Typ')),
                ('title', models.CharField(max_length=200, verbose_name='Titel')),
                ('message', models.TextField(verbose_name='Nachricht')),
                ('is_read', models.BooleanField(default=False, verbose_name='Gelesen')),
                ('created_at', models.DateTimeField(auto_now_add=True, verbose_name='Erstellt am')),
                ('entwurf', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='benachrichtigungen', to='api.trauerdruckentwurf', verbose_name='Entwurf')),
                ('user', models.ForeignKey(on_delete=django.db.models.deletion.CASCADE, related_name='trauerdruck_benachrichtigungen', to='api.user', verbose_name='Benutzer')),
            ],
            options={
                'verbose_name': 'Trauerdruck-Benachrichtigung',
                'verbose_name_plural': 'Trauerdruck-Benachrichtigungen',
                'ordering': ['-created_at'],
            },
        ),
        migrations.AddField(
            model_name='trauerdruckentwurf',
            name='assigned_to',
            field=models.ManyToManyField(blank=True, related_name='assigned_trauerdruck_entwuerfe', to='api.user', verbose_name='Zugewiesen an'),
        ),
        migrations.AlterUniqueTogether(
            name='trauerdruckfreigabe',
            unique_together={('entwurf', 'reviewer')},
        ),
    ]
