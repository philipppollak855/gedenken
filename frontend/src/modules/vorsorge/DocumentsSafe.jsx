// frontend/src/modules/vorsorge/DocumentsSafe.jsx
// KORRIGIERT: Behebt das Download-Problem, indem der Fetch-Aufruf manuell mit der korrekten URL und dem Auth-Header erstellt wird.

import React, { useState, useEffect, useCallback, useContext } from 'react'; // useContext importieren
import useApi from '../../hooks/useApi';
import AuthContext from '../../context/AuthContext'; // AuthContext importieren

const DocumentsSafe = () => {
    const [documents, setDocuments] = useState([]);
    const [isLoading, setIsLoading] = useState(true);
    const api = useApi();
    const { authTokens } = useContext(AuthContext); // AuthTokens für den manuellen Download holen

    const fetchDocuments = useCallback(async () => {
        try {
            const response = await api('/documents/');
            if (response.ok) {
                const data = await response.json();
                setDocuments(data);
            }
        } catch (error) {
            console.error("Fehler beim Laden der Dokumente:", error);
        } finally {
            setIsLoading(false);
        }
    }, [api]);

    useEffect(() => {
        fetchDocuments();
    }, [fetchDocuments]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        const formData = new FormData();
        formData.append('title', e.target.title.value);
        formData.append('document_type', e.target.document_type.value);
        formData.append('file', e.target.file.files[0]);
        formData.append('storage_location_hint', e.target.storage_location_hint.value);
        formData.append('visible_in_vorsorgefall', e.target.visible_in_vorsorgefall.checked);

        const response = await api('/documents/', {
            method: 'POST',
            headers: {}, 
            body: formData,
        });

        if (response.ok) {
            fetchDocuments();
            e.target.reset();
        } else {
            const data = await response.json();
            alert("Fehler beim Hochladen der Datei: " + JSON.stringify(data));
        }
    };

    const handleDownload = async (fileUrl) => {
        try {
            // KORRIGIERT: Manueller Fetch-Aufruf direkt zur Media-URL, ohne den /api-Präfix.
            // Wir fügen den Authorization-Header manuell hinzu, um auf die geschützte Datei zuzugreifen.
            const response = await fetch(fileUrl, {
                headers: {
                    'Authorization': `Bearer ${authTokens.access}`
                }
            });

            if (!response.ok) throw new Error('Download fehlgeschlagen');

            const blob = await response.blob();
            const downloadUrl = window.URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = downloadUrl;
            const fileName = fileUrl.split('/').pop();
            link.setAttribute('download', fileName);
            document.body.appendChild(link);
            link.click();
            link.parentNode.removeChild(link);
            window.URL.revokeObjectURL(downloadUrl);

        } catch (error) {
            console.error("Fehler beim Herunterladen der Datei:", error);
            alert("Datei konnte nicht heruntergeladen werden.");
        }
    };

    if (isLoading) {
        return <p>Lade Dokumente...</p>;
    }

    return (
        <section>
            <h2>Wichtige Dokumente (Digitaler Safe)</h2>
            <form onSubmit={handleSubmit} style={{ marginBottom: '2rem', border: '1px solid #ccc', padding: '1rem', borderRadius: '8px' }}>
                <h3>Neues Dokument hochladen</h3>
                <input type="text" name="title" placeholder="Titel / Bezeichnung" required />
                <input type="text" name="document_type" placeholder="Dokumententyp (z.B. Testament)" required />
                <textarea name="storage_location_hint" placeholder="Hinweis zum Lagerort des Originals" />
                <div>
                    <input type="checkbox" name="visible_in_vorsorgefall" id="vorsorgefall_check" />
                    <label htmlFor="vorsorgefall_check"> Im Vorsorgefall (z.B. Koma) für Bevollmächtigte sichtbar machen</label>
                </div>
                <input type="file" name="file" required />
                <button type="submit">Hochladen</button>
            </form>
            <div>
                <h3>Ihre Dokumente</h3>
                {documents.length > 0 ? documents.map(doc => (
                    <div key={doc.doc_id} style={{ borderBottom: '1px solid #eee', padding: '1rem 0' }}>
                        <strong>{doc.title}</strong> ({doc.document_type})
                        <p>
                            <button onClick={() => handleDownload(doc.file)}>
                                Dokument herunterladen
                            </button>
                        </p>
                    </div>
                )) : <p>Keine Dokumente hochgeladen.</p>}
            </div>
        </section>
    );
};

export default DocumentsSafe;
