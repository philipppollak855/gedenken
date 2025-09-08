// frontend/src/modules/HomePage.jsx
// KORRIGIERT: Stellt sicher, dass die Startseite immer auf /gedenken umleitet.

import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const HomePage = () => {
    const navigate = useNavigate();

    useEffect(() => {
        // Leitet alle Besucher der Startseite (/) auf die Gedenkseiten-Übersicht um.
        navigate('/gedenken', { replace: true });
    }, [navigate]);

    return null; // Diese Komponente rendert nichts, sie leitet nur weiter.
};

export default HomePage;

