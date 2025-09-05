# backend/api/forms.py (NEUE DATEI)

from django import forms
from .models import MediaAsset, MemorialPage, MemorialEvent, EventLocation

class UserWizardForm(forms.Form):
    email = forms.EmailField(label="E-Mail-Adresse des Benutzers")
    first_name = forms.CharField(label="Vorname", max_length=100)
    last_name = forms.CharField(label="Nachname", max_length=100)

class PageDataWizardForm(forms.Form):
    first_name = forms.CharField(label="Vorname (Verstorbener)", max_length=100, required=False)
    last_name = forms.CharField(label="Nachname (Verstorbener)", max_length=100, required=False)
    date_of_birth = forms.DateField(label="Geburtsdatum", widget=forms.DateInput(attrs={'type': 'date'}))
    date_of_death = forms.DateField(label="Sterbedatum", widget=forms.DateInput(attrs={'type': 'date'}))
    cemetery = forms.CharField(label="Friedhof", max_length=255, required=False)

class PageImagesWizardForm(forms.ModelForm):
    class Meta:
        model = MemorialPage
        fields = ['main_photo', 'hero_background_image']
        labels = {
            'main_photo': 'Porträtfoto (Hero-Bereich)',
            'hero_background_image': 'Hintergrundbild (Hero-Bereich)',
        }
    
    # We use ModelChoiceField to get a dropdown of existing images
    main_photo = forms.ModelChoiceField(queryset=MediaAsset.objects.filter(asset_type='image'), required=False, label='Porträtfoto (Hero-Bereich)')
    hero_background_image = forms.ModelChoiceField(queryset=MediaAsset.objects.filter(asset_type='image'), required=False, label='Hintergrundbild (Hero-Bereich)')


class PageTextsWizardForm(forms.Form):
    obituary = forms.CharField(label="Nachruf", widget=forms.Textarea, required=False)

class PageEventWizardForm(forms.Form):
    title = forms.CharField(label="Titel des Termins", max_length=255, required=False)
    date = forms.DateTimeField(label="Datum & Uhrzeit", widget=forms.DateTimeInput(attrs={'type': 'datetime-local'}), required=False)
    location = forms.ModelChoiceField(queryset=EventLocation.objects.all(), label="Ort", required=False)
    status = forms.ChoiceField(label="Status der Gedenkseite", choices=MemorialPage.Status.choices, initial=MemorialPage.Status.INACTIVE)

