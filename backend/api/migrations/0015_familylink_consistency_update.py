# Generated manually for FamilyLink consistency update

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0014_postgresql_fix_familylink_schema'),
    ]

    operations = [
        # Add new fields to FamilyLink model
        migrations.AddField(
            model_name='familylink',
            name='status',
            field=models.CharField(
                choices=[
                    ('pending', 'Ausstehend'),
                    ('active', 'Aktiv'),
                    ('suspended', 'Gesperrt'),
                    ('revoked', 'Widerrufen')
                ],
                default='pending',
                help_text='Aktueller Status der Verknüpfung',
                max_length=15,
                verbose_name='Status'
            ),
        ),
        migrations.AddField(
            model_name='familylink',
            name='last_accessed',
            field=models.DateTimeField(
                blank=True,
                help_text='Wann hat der Angehörige zuletzt zugegriffen?',
                null=True,
                verbose_name='Zuletzt zugegriffen'
            ),
        ),
        migrations.AddField(
            model_name='familylink',
            name='access_count',
            field=models.PositiveIntegerField(
                default=0,
                help_text='Anzahl der Zugriffe durch den Angehörigen',
                verbose_name='Zugriffe'
            ),
        ),
        migrations.AddField(
            model_name='familylink',
            name='last_ip_address',
            field=models.GenericIPAddressField(
                blank=True,
                help_text='IP-Adresse des letzten Zugriffs',
                null=True,
                verbose_name='Letzte IP-Adresse'
            ),
        ),
        
        # Update role choices
        migrations.AlterField(
            model_name='familylink',
            name='role',
            field=models.CharField(
                choices=[
                    ('family_member', 'Familienmitglied'),
                    ('main_contact', 'Hauptansprechpartner'),
                    ('executor', 'Testamentsvollstrecker'),
                    ('guardian', 'Vormund/Betreuer'),
                    ('friend', 'Freund/Bekannter'),
                    ('legal_representative', 'Rechtsvertreter')
                ],
                default='family_member',
                help_text='Rolle des Angehörigen in der Familie',
                max_length=25,
                verbose_name='Rolle'
            ),
        ),
        
        # Update permission level choices
        migrations.AlterField(
            model_name='familylink',
            name='permission_level',
            field=models.CharField(
                choices=[
                    ('view_only', 'Nur anzeigen'),
                    ('edit_memorial', 'Gedenkseite bearbeiten'),
                    ('manage_all', 'Vollzugriff (Vorsorge + Gedenkseite)'),
                    ('admin_level', 'Admin-Berechtigung')
                ],
                default='view_only',
                help_text='Was darf der Angehörige tun?',
                max_length=20,
                verbose_name='Berechtigungsstufe'
            ),
        ),
        
        # Add indexes for better performance
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_familylink_deceased_status ON api_familylink (deceased_user_id, status);",
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_deceased_status;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_familylink_relative_status ON api_familylink (relative_user_id, status);",
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_relative_status;"
        ),
        migrations.RunSQL(
            "CREATE INDEX IF NOT EXISTS idx_familylink_permission_status ON api_familylink (permission_level, status);",
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_permission_status;"
        ),
    ]
