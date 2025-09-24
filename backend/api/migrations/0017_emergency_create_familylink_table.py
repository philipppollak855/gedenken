# EMERGENCY: Create FamilyLink table if it doesn't exist
# This migration ensures the FamilyLink table exists with all required fields

from django.db import migrations, models
import django.db.models.deletion
import django.utils.timezone


class Migration(migrations.Migration):

    dependencies = [
        ('api', '0016_force_familylink_migration'),
    ]

    operations = [
        # Create FamilyLink table if it doesn't exist
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                -- Check if table exists
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.tables 
                    WHERE table_name='api_familylink'
                ) THEN
                    -- Create the table
                    CREATE TABLE api_familylink (
                        id SERIAL PRIMARY KEY,
                        deceased_user_id INTEGER NOT NULL,
                        relative_user_id INTEGER NOT NULL,
                        relationship VARCHAR(100) NOT NULL,
                        role VARCHAR(25) DEFAULT 'family_member',
                        permission_level VARCHAR(20) DEFAULT 'view_only',
                        status VARCHAR(15) DEFAULT 'pending',
                        is_validated_by_admin BOOLEAN DEFAULT FALSE,
                        validated_by_id INTEGER NULL,
                        validated_at TIMESTAMP WITH TIME ZONE NULL,
                        access_count INTEGER DEFAULT 0,
                        last_accessed TIMESTAMP WITH TIME ZONE NULL,
                        last_ip_address INET NULL,
                        created_by_id INTEGER NULL,
                        notes TEXT NULL,
                        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
                        
                        -- Foreign key constraints
                        CONSTRAINT fk_familylink_deceased 
                            FOREIGN KEY (deceased_user_id) 
                            REFERENCES api_user(id) 
                            ON DELETE CASCADE,
                        CONSTRAINT fk_familylink_relative 
                            FOREIGN KEY (relative_user_id) 
                            REFERENCES api_user(id) 
                            ON DELETE CASCADE,
                        CONSTRAINT fk_familylink_validated_by 
                            FOREIGN KEY (validated_by_id) 
                            REFERENCES api_user(id) 
                            ON DELETE SET NULL,
                        CONSTRAINT fk_familylink_created_by 
                            FOREIGN KEY (created_by_id) 
                            REFERENCES api_user(id) 
                            ON DELETE SET NULL
                    );
                    
                    -- Create indexes
                    CREATE INDEX idx_familylink_deceased_status 
                        ON api_familylink (deceased_user_id, status);
                    CREATE INDEX idx_familylink_relative_status 
                        ON api_familylink (relative_user_id, status);
                    CREATE INDEX idx_familylink_permission_status 
                        ON api_familylink (permission_level, status);
                    CREATE INDEX idx_familylink_created_at 
                        ON api_familylink (created_at);
                    
                    -- Add unique constraint
                    ALTER TABLE api_familylink 
                        ADD CONSTRAINT unique_familylink_deceased_relative 
                        UNIQUE (deceased_user_id, relative_user_id);
                        
                END IF;
            END $$;
            """,
            reverse_sql="DROP TABLE IF EXISTS api_familylink CASCADE;"
        ),
        
        # Ensure all columns exist (in case table exists but is incomplete)
        migrations.RunSQL(
            """
            DO $$ 
            BEGIN
                -- Add id column if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='id'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN id SERIAL PRIMARY KEY;
                END IF;
                
                -- Add deceased_user_id if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='deceased_user_id'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN deceased_user_id INTEGER NOT NULL;
                END IF;
                
                -- Add relative_user_id if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='relative_user_id'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN relative_user_id INTEGER NOT NULL;
                END IF;
                
                -- Add relationship if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='relationship'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN relationship VARCHAR(100) NOT NULL;
                END IF;
                
                -- Add role if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='role'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN role VARCHAR(25) DEFAULT 'family_member';
                END IF;
                
                -- Add permission_level if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='permission_level'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN permission_level VARCHAR(20) DEFAULT 'view_only';
                END IF;
                
                -- Add status if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='status'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN status VARCHAR(15) DEFAULT 'pending';
                END IF;
                
                -- Add is_validated_by_admin if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='is_validated_by_admin'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN is_validated_by_admin BOOLEAN DEFAULT FALSE;
                END IF;
                
                -- Add created_at if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='created_at'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                END IF;
                
                -- Add updated_at if it doesn't exist
                IF NOT EXISTS (
                    SELECT 1 FROM information_schema.columns 
                    WHERE table_name='api_familylink' 
                    AND column_name='updated_at'
                ) THEN
                    ALTER TABLE api_familylink ADD COLUMN updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();
                END IF;
                
            END $$;
            """,
            reverse_sql="-- No reverse operation needed"
        ),
        
        # Create indexes if they don't exist
        migrations.RunSQL(
            """
            CREATE INDEX IF NOT EXISTS idx_familylink_deceased_status 
                ON api_familylink (deceased_user_id, status);
            CREATE INDEX IF NOT EXISTS idx_familylink_relative_status 
                ON api_familylink (relative_user_id, status);
            CREATE INDEX IF NOT EXISTS idx_familylink_permission_status 
                ON api_familylink (permission_level, status);
            CREATE INDEX IF NOT EXISTS idx_familylink_created_at 
                ON api_familylink (created_at);
            """,
            reverse_sql="-- Indexes will be dropped with table"
        ),
    ]
