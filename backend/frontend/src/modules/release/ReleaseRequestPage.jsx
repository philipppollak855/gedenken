// frontend/src/modules/release/ReleaseRequestPage.jsx
// Komplett überarbeitetes Formular gemäß den neuen Anforderungen.

import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const ReleaseRequestPage = () => {
    const [errors, setErrors] = useState({});
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setErrors({});

        if (e.target.reporter_password.value !== e.target.reporter_password2.value) {
            setErrors({ reporter_password: "Die Passwörter stimmen nicht überein." });
            setIsLoading(false);
            return;
        }

        const formData = new FormData();
        formData.append('deceased_first_name', e.target.deceased_first_name.value);
        formData.append('deceased_last_name', e.target.deceased_last_name.value);
        formData.append('deceased_date_of_birth', e.target.deceased_date_of_birth.value);
        formData.append('deceased_date_of_death', e.target.deceased_date_of_death.value);
        
        formData.append('reporter_name', e.target.reporter_name.value);
        formData.append('reporter_email', e.target.reporter_email.value);
        formData.append('reporter_password', e.target.reporter_password.value);
        formData.append('reporter_password2', e.target.reporter_password2.value);
        formData.append('reporter_relationship', e.target.reporter_relationship.value);
        formData.append('death_certificate', e.target.death_certificate.files[0]);

        try {
            const response = await fetch('http://localhost:8000/api/release-requests/', {
                method: 'POST',
                body: formData,
            });

            if (response.ok) {
                alert("Vielen Dank für Ihre Meldung. Wir werden sie prüfen und uns bei Ihnen melden.");
                navigate('/');
            } else {
                const data = await response.json();
                setErrors(data);
            }
        } catch (err) {
            setErrors({ "netzwerk": "Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div>
            <h1>Todesfall melden</h1>
            <p>
                Bitte füllen Sie dieses Formular aus, um uns über den Tod einer Person zu informieren.
                Nach Prüfung der Unterlagen wird eine Gedenkseite erstellt und Sie erhalten als Hauptangehöriger die Zugangsdaten für die Verwaltung.
            </p>
            <form onSubmit={handleSubmit}>
                <h3>Angaben zum Verstorbenen</h3>
                <input type="text" name="deceased_first_name" placeholder="Vorname des Verstorbenen" required />
                <input type="text" name="deceased_last_name" placeholder="Nachname des Verstorbenen" required />
                <label htmlFor="deceased_date_of_birth">Geburtsdatum:</label>
                <input type="date" name="deceased_date_of_birth" id="deceased_date_of_birth" required />
                <label htmlFor="deceased_date_of_death">Sterbedatum:</label>
                <input type="date" name="deceased_date_of_death" id="deceased_date_of_death" required />

                <h3 style={{marginTop: '2rem'}}>Ihre Angaben als meldende Person</h3>
                <input type="text" name="reporter_name" placeholder="Ihr vollständiger Name" required />
                <input type="email" name="reporter_email" placeholder="Ihre E-Mail-Adresse (wird Ihr Login)" required />
                <input type="password" name="reporter_password" placeholder="Legen Sie ein Passwort für Ihren Zugang fest" required />
                <input type="password" name="reporter_password2" placeholder="Passwort bestätigen" required />
                {errors?.reporter_password && <p style={{ color: 'red' }}>{errors.reporter_password}</p>}
                <input type="text" name="reporter_relationship" placeholder="Ihre Beziehung zum Verstorbenen" required />
                
                <div style={{marginTop: '1rem'}}>
                    <label htmlFor="death_certificate">Sterbeurkunde hochladen (PDF, JPG, PNG)</label>
                    <input type="file" name="death_certificate" id="death_certificate" required />
                </div>

                {errors && Object.entries(errors).map(([key, value]) => key !== 'reporter_password' && <p key={key} style={{ color: 'red' }}>{value}</p>)}

                <button type="submit" disabled={isLoading} style={{marginTop: '2rem'}}>
                    {isLoading ? 'Sende...' : 'Meldung absenden'}
                </button>
            </form>
        </div>
    );
};

export default ReleaseRequestPage;
