# Generated manually to handle existing columns safely
from django.db import migrations


def add_unterlagen_columns_if_not_exist(apps, schema_editor):
    """
    Add Unterlagen columns only if they don't exist using raw SQL
    """
    with schema_editor.connection.cursor() as cursor:
        # Check if any of the columns already exist
        # Use different queries for different database backends
        db_engine = schema_editor.connection.vendor
        
        if db_engine == 'postgresql':
            cursor.execute("""
                SELECT column_name 
                FROM information_schema.columns 
                WHERE table_name='api_sitesettings' 
                AND column_name='unterlagen_card_background_color'
            """)
        elif db_engine == 'sqlite':
            cursor.execute("""
                SELECT name FROM pragma_table_info('api_sitesettings') 
                WHERE name='unterlagen_card_background_color'
            """)
        else:
            # For other databases, assume columns don't exist
            cursor.execute("SELECT 1 WHERE 0=1")
        
        if cursor.fetchone():
            # Columns already exist, skip this migration
            print("Unterlagen columns already exist, skipping migration")
            return
        
        # Add all columns using raw SQL
        if db_engine == 'postgresql':
            columns_to_add = [
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_background_color VARCHAR(7) DEFAULT '#5a6c7d'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_content_background VARCHAR(30) DEFAULT '#3a3a3a'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text TEXT DEFAULT '<ul><li><strong>Freigaben:</strong> Verwalten Sie alle wichtigen Dokumente und Berechtigungen.</li><li><strong>Dokumente:</strong> Organisieren Sie Ihre wichtigen Unterlagen sicher.</li><li><strong>Trauerdruck:</strong> Gestalten Sie persönliche Erinnerungsstücke.</li></ul>'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text_color VARCHAR(7) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text_size VARCHAR(10) DEFAULT '0.95rem'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_image_id INTEGER",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext VARCHAR(50) DEFAULT 'Unterlagen'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext_color VARCHAR(30) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext_size VARCHAR(10) DEFAULT '3.2rem'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title VARCHAR(100) DEFAULT 'Unterlagen'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title_color VARCHAR(7) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title_size VARCHAR(10) DEFAULT '2.5rem'",
            ]
        else:  # SQLite
            columns_to_add = [
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_background_color VARCHAR(7) DEFAULT '#5a6c7d'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_content_background VARCHAR(30) DEFAULT '#3a3a3a'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text TEXT DEFAULT '<ul><li><strong>Freigaben:</strong> Verwalten Sie alle wichtigen Dokumente und Berechtigungen.</li><li><strong>Dokumente:</strong> Organisieren Sie Ihre wichtigen Unterlagen sicher.</li><li><strong>Trauerdruck:</strong> Gestalten Sie persönliche Erinnerungsstücke.</li></ul>'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text_color VARCHAR(7) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_details_text_size VARCHAR(10) DEFAULT '0.95rem'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_image_id INTEGER",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext VARCHAR(50) DEFAULT 'Unterlagen'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext_color VARCHAR(30) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_sidetext_size VARCHAR(10) DEFAULT '3.2rem'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title VARCHAR(100) DEFAULT 'Unterlagen'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title_color VARCHAR(7) DEFAULT '#FFFFFF'",
                "ALTER TABLE api_sitesettings ADD COLUMN unterlagen_card_title_size VARCHAR(10) DEFAULT '2.5rem'",
            ]
        
        for sql in columns_to_add:
            try:
                cursor.execute(sql)
                print(f"Executed: {sql}")
            except Exception as e:
                print(f"Error executing {sql}: {e}")
                # Continue with other columns even if one fails


def reverse_add_unterlagen_columns(apps, schema_editor):
    """
    Reverse operation - remove columns if they exist
    """
    pass


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0001_initial'),
    ]

    operations = [
        migrations.RunPython(
            add_unterlagen_columns_if_not_exist,
            reverse_add_unterlagen_columns,
        ),
    ]
