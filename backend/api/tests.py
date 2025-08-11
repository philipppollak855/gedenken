from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from .models import User

class UserRegistrationTests(APITestCase):
    """
    Test-Suite für die Benutzerregistrierung.
    """

    def test_create_user(self):
        """
        Stellt sicher, dass wir einen neuen Benutzer mit gültigen Daten erstellen können.
        """
        url = reverse('auth_register')
        data = {
            'email': 'testuser@example.com',
            'password': 'some-strong-password',
            'password2': 'some-strong-password',
            'consent_admin_access': True
        }
        response = self.client.post(url, data, format='json')
        
        # Überprüfen, ob der HTTP-Statuscode 201 CREATED ist
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        
        # Überprüfen, ob der Benutzer in der Datenbank erstellt wurde
        self.assertEqual(User.objects.count(), 1)
        self.assertEqual(User.objects.get().email, 'testuser@example.com')

    def test_create_user_with_mismatched_passwords(self):
        """
        Stellt sicher, dass die Registrierung fehlschlägt, wenn die Passwörter nicht übereinstimmen.
        """
        url = reverse('auth_register')
        data = {
            'email': 'testuser2@example.com',
            'password': 'password123',
            'password2': 'password456',
            'consent_admin_access': True
        }
        response = self.client.post(url, data, format='json')
        
        # Überprüfen, ob der HTTP-Statuscode 400 BAD REQUEST ist
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        
        # Überprüfen, ob kein Benutzer in der Datenbank erstellt wurde
        self.assertEqual(User.objects.count(), 0)
