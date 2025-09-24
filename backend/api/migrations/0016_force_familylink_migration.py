# Force FamilyLink migration for Render deployment
# This migration ensures all FamilyLink fields exist in the database

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0015_familylink_consistency_update'),
    ]

    operations = [
        # Ensure status field exists
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='status'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN status VARCHAR(15) DEFAULT 'pending';
                END IF;
            END $$;
            """,
            reverse_sql="ALTER TABLE api_familylink DROP COLUMN IF EXISTS status;"
        ),
        
        # Ensure access_count field exists
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='access_count'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN access_count INTEGER DEFAULT 0;
                END IF;
            END $$;
            """,
            reverse_sql="ALTER TABLE api_familylink DROP COLUMN IF EXISTS access_count;"
        ),
        
        # Ensure last_accessed field exists
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='last_accessed'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN last_accessed TIMESTAMP WITH TIME ZONE NULL;
                END IF;
            END $$;
            """,
            reverse_sql="ALTER TABLE api_familylink DROP COLUMN IF EXISTS last_accessed;"
        ),
        
        # Ensure last_ip_address field exists
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='last_ip_address'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN last_ip_address INET NULL;
                END IF;
            END $$;
            """,
            reverse_sql="ALTER TABLE api_familylink DROP COLUMN IF EXISTS last_ip_address;"
        ),
        
        # Create indexes if they don't exist
        migrations.RunSQL(
            """
            CREATE INDEX IF NOT EXISTS idx_familylink_deceased_status 
            ON api_familylink (deceased_user_id, status);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_deceased_status;"
        ),
        
        migrations.RunSQL(
            """
            CREATE INDEX IF NOT EXISTS idx_familylink_relative_status 
            ON api_familylink (relative_user_id, status);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_relative_status;"
        ),
        
        migrations.RunSQL(
            """
            CREATE INDEX IF NOT EXISTS idx_familylink_permission_status 
            ON api_familylink (permission_level, status);
            """,
            reverse_sql="DROP INDEX IF EXISTS idx_familylink_permission_status;"
        ),
    ]
