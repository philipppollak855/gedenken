#!/usr/bin/env python
"""
Fallback script to collect static files if collectstatic fails
"""
import os
import sys
import django
from django.conf import settings
from django.core.management import execute_from_command_line

if __name__ == "__main__":
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'core.settings')
    django.setup()
    
    try:
        # Try to collect static files
        execute_from_command_line(['manage.py', 'collectstatic', '--noinput', '--clear'])
        print("Static files collected successfully!")
    except Exception as e:
        print(f"Error collecting static files: {e}")
        # Create staticfiles directory if it doesn't exist
        static_root = getattr(settings, 'STATIC_ROOT', None)
        if static_root and not os.path.exists(static_root):
            os.makedirs(static_root, exist_ok=True)
            print(f"Created staticfiles directory: {static_root}")
        
        # Try to copy UNFOLD static files manually
        try:
            import shutil
            import unfold
            unfold_path = os.path.dirname(unfold.__file__)
            unfold_static = os.path.join(unfold_path, 'static')
            if os.path.exists(unfold_static):
                dest_path = os.path.join(static_root, 'unfold')
                if os.path.exists(dest_path):
                    shutil.rmtree(dest_path)
                shutil.copytree(unfold_static, dest_path)
                print(f"Copied UNFOLD static files to {dest_path}")
            else:
                print(f"UNFOLD static directory not found at {unfold_static}")
        except Exception as e2:
            print(f"Error copying UNFOLD files: {e2}")
            # Try alternative approach - find UNFOLD in site-packages
            try:
                import site
                for site_dir in site.getsitepackages():
                    unfold_path = os.path.join(site_dir, 'unfold')
                    if os.path.exists(unfold_path):
                        unfold_static = os.path.join(unfold_path, 'static')
                        if os.path.exists(unfold_static):
                            dest_path = os.path.join(static_root, 'unfold')
                            if os.path.exists(dest_path):
                                shutil.rmtree(dest_path)
                            shutil.copytree(unfold_static, dest_path)
                            print(f"Copied UNFOLD static files from {unfold_static} to {dest_path}")
                            break
            except Exception as e3:
                print(f"Alternative UNFOLD copy also failed: {e3}")
