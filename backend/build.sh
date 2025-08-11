    #!/usr/bin/env bash
    # exit on error
    set -o errexit
    
    pip install -r requirements.txt
    
    python manage.py collectstatic --no-input
    python manage.py migrate
    
    # Erstellt den Superuser direkt, falls er nicht existiert.
    # Dies ist robuster als ein separater Management-Befehl.
    cat <<EOF | python manage.py shell
    import os
    from api.models import User
    
    email = os.environ.get('DJANGO_SUPERUSER_EMAIL')
    password = os.environ.get('DJANGO_SUPERUSER_PASSWORD')
    
    if email and password and not User.objects.filter(email=email).exists():
        User.objects.create_superuser(email=email, password=password)
        print('Superuser created.')
    else:
        print('Superuser already exists or environment variables not set.')
    EOF
    