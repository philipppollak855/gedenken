// frontend/src/modules/release/ReleaseRequestPage.jsx
// This component provides a form for users to report a death and request access to a user's data.

import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './ReleaseRequestPage.css'; // Import the new CSS file

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
        
        if (e.target.death_certificate.files[0]) {
            formData.append('death_certificate', e.target.death_certificate.files[0]);
        }


        try {
            const response = await fetch(`${process.env.REACT_APP_API_URL}/api/release-requests/`, {
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
            setErrors({ "network": "Ein Netzwerkfehler ist aufgetreten. Bitte versuchen Sie es später erneut." });
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="release-request-container">
            <div className="release-form-wrapper">
                <div className="form-header">
                    <h1>Todesfall melden</h1>
                    <p>
                        Bitte füllen Sie dieses Formular aus, um uns über den Tod einer Person zu informieren.
                        Nach Prüfung der Unterlagen wird eine Gedenkseite erstellt und Sie erhalten als Hauptangehöriger die Zugangsdaten für die Verwaltung.
                    </p>
                </div>
                <form onSubmit={handleSubmit} className="release-form">
                    <fieldset>
                        <legend>Angaben zum Verstorbenen</legend>
                        <div className="form-grid">
                            <input type="text" name="deceased_first_name" placeholder="Vorname des Verstorbenen" required />
                            <input type="text" name="deceased_last_name" placeholder="Nachname des Verstorbenen" required />
                            <div>
                                <label htmlFor="deceased_date_of_birth">Geburtsdatum:</label>
                                <input type="date" name="deceased_date_of_birth" id="deceased_date_of_birth" required />
                            </div>
                            <div>
                                <label htmlFor="deceased_date_of_death">Sterbedatum:</label>
                                <input type="date" name="deceased_date_of_death" id="deceased_date_of_death" required />
                            </div>
                        </div>
                    </fieldset>

                    <fieldset>
                        <legend>Ihre Angaben als meldende Person</legend>
                        <div className="form-grid">
                            <input type="text" name="reporter_name" placeholder="Ihr vollständiger Name" required />
                            <input type="email" name="reporter_email" placeholder="Ihre E-Mail-Adresse (wird Ihr Login)" required />
                            <input type="password" name="reporter_password" placeholder="Legen Sie ein Passwort fest" required />
                            <input type="password" name="reporter_password2" placeholder="Passwort bestätigen" required />
                             {errors?.reporter_password && <p className="error-message">{errors.reporter_password}</p>}
                            <input type="text" name="reporter_relationship" placeholder="Ihre Beziehung zum Verstorbenen" required />
                            <div className="file-upload-field">
                                <label htmlFor="death_certificate">Sterbeurkunde hochladen (PDF, JPG, PNG)</label>
                                <input type="file" name="death_certificate" id="death_certificate" required />
                            </div>
                        </div>
                    </fieldset>

                    {errors && Object.entries(errors).map(([key, value]) => key !== 'reporter_password' && <p key={key} className="error-message">{Array.isArray(value) ? value.join(', ') : value}</p>)}

                    <button type="submit" disabled={isLoading} className="submit-button">
                        {isLoading ? 'Sende...' : 'Meldung absenden'}
                    </button>
                </form>
                 <p className="login-link">
                    Bereits einen Account? <Link to="/login">Hier einloggen</Link>
                </p>
            </div>
        </div>
    );
};

export default ReleaseRequestPage;
