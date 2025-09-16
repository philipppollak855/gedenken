import React, { useState, useEffect } from 'react';
import { useApi } from '../../hooks/useApi';
import './TrauerdruckEntwurfErstellen.css';

const TrauerdruckEntwurfErstellen = () => {
    const { get, post } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    
    // Form States
    const [formData, setFormData] = useState({
        title: '',
        description: '',
        trauerdruck_type: '',
        memorial_page: '',
        assigned_to: [],
        priority: 'normal',
        deadline: '',
        design_file: null,
        preview_file: null
    });
    
    // Options
    const [trauerdruckTypes, setTrauerdruckTypes] = useState([]);
    const [memorialPages, setMemorialPages] = useState([]);
    const [users, setUsers] = useState([]);
    const [uploadProgress, setUploadProgress] = useState(0);

    useEffect(() => {
        loadOptions();
    }, []);

    const loadOptions = async () => {
        try {
            const [typesResponse, pagesResponse, usersResponse] = await Promise.all([
                get('/api/trauerdruck-types/'),
                get('/api/memorial-pages/'),
                get('/api/users/')
            ]);
            
            setTrauerdruckTypes(typesResponse.data);
            setMemorialPages(pagesResponse.data);
            setUsers(usersResponse.data);
        } catch (err) {
            setError('Fehler beim Laden der Optionen');
            console.error('Error loading options:', err);
        }
    };

    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileChange = (e) => {
        const { name, files } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: files[0] || null
        }));
    };

    const handleMultiSelectChange = (e) => {
        const { name, options } = e.target;
        const selectedValues = Array.from(options)
            .filter(option => option.selected)
            .map(option => option.value);
        
        setFormData(prev => ({
            ...prev,
            [name]: selectedValues
        }));
    };

    const uploadFile = async (file, type) => {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('type', type);
        
        const response = await post('/api/media-assets/', formData, {
            headers: {
                'Content-Type': 'multipart/form-data',
            },
            onUploadProgress: (progressEvent) => {
                const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
                setUploadProgress(percentCompleted);
            }
        });
        
        return response.data.id;
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!formData.design_file) {
            setError('Bitte wählen Sie eine Design-Datei aus');
            return;
        }

        try {
            setLoading(true);
            setError(null);
            setSuccess(false);

            // Upload files
            const designFileId = await uploadFile(formData.design_file, 'design');
            let previewFileId = null;
            
            if (formData.preview_file) {
                previewFileId = await uploadFile(formData.preview_file, 'preview');
            }

            // Create entwurf
            const entwurfData = {
                title: formData.title,
                description: formData.description,
                trauerdruck_type: formData.trauerdruck_type,
                memorial_page: formData.memorial_page,
                assigned_to: formData.assigned_to,
                priority: formData.priority,
                deadline: formData.deadline || null,
                design_file: designFileId,
                preview_file: previewFileId,
                status: 'pending_approval'
            };

            await post('/api/trauerdruck-entwuerfe/', entwurfData);
            
            setSuccess(true);
            setFormData({
                title: '',
                description: '',
                trauerdruck_type: '',
                memorial_page: '',
                assigned_to: [],
                priority: 'normal',
                deadline: '',
                design_file: null,
                preview_file: null
            });
            
            // Reset file inputs
            document.getElementById('design_file').value = '';
            document.getElementById('preview_file').value = '';
            
        } catch (err) {
            setError('Fehler beim Erstellen des Entwurfs');
            console.error('Error creating entwurf:', err);
        } finally {
            setLoading(false);
            setUploadProgress(0);
        }
    };

    return (
        <div className="entwurf-erstellen-container">
            <div className="entwurf-header">
                <h1>Neuen Trauerdruck-Entwurf erstellen</h1>
                <p>Erstellen Sie einen neuen Entwurf und senden Sie ihn zur Freigabe an die Angehörigen.</p>
            </div>

            {success && (
                <div className="success-message">
                    <h3>✅ Entwurf erfolgreich erstellt!</h3>
                    <p>Der Entwurf wurde zur Freigabe gesendet und die Angehörigen wurden benachrichtigt.</p>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <h3>❌ Fehler</h3>
                    <p>{error}</p>
                </div>
            )}

            <form onSubmit={handleSubmit} className="entwurf-form">
                <div className="form-section">
                    <h2>Grunddaten</h2>
                    
                    <div className="form-group">
                        <label htmlFor="title">Titel *</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleInputChange}
                            required
                            placeholder="z.B. Trauerkarte für Max Mustermann"
                        />
                    </div>

                    <div className="form-group">
                        <label htmlFor="description">Beschreibung</label>
                        <textarea
                            id="description"
                            name="description"
                            value={formData.description}
                            onChange={handleInputChange}
                            rows={4}
                            placeholder="Beschreibung des Entwurfs, besondere Wünsche, etc."
                        />
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="trauerdruck_type">Trauerdruckart *</label>
                            <select
                                id="trauerdruck_type"
                                name="trauerdruck_type"
                                value={formData.trauerdruck_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Bitte wählen...</option>
                                {trauerdruckTypes.map(type => (
                                    <option key={type.id} value={type.id}>
                                        {type.name}
                                    </option>
                                ))}
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="memorial_page">Verstorbener *</label>
                            <select
                                id="memorial_page"
                                name="memorial_page"
                                value={formData.memorial_page}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Bitte wählen...</option>
                                {memorialPages.map(page => (
                                    <option key={page.id} value={page.id}>
                                        {page.deceased_name}
                                    </option>
                                ))}
                            </select>
                        </div>
                    </div>
                </div>

                <div className="form-section">
                    <h2>Dateien</h2>
                    
                    <div className="form-group">
                        <label htmlFor="design_file">Design-Datei *</label>
                        <input
                            type="file"
                            id="design_file"
                            name="design_file"
                            onChange={handleFileChange}
                            accept=".pdf,.jpg,.jpeg,.png,.ai,.psd"
                            required
                        />
                        <small>Unterstützte Formate: PDF, JPG, PNG, AI, PSD</small>
                    </div>

                    <div className="form-group">
                        <label htmlFor="preview_file">Vorschau-Datei (optional)</label>
                        <input
                            type="file"
                            id="preview_file"
                            name="preview_file"
                            onChange={handleFileChange}
                            accept=".jpg,.jpeg,.png"
                        />
                        <small>Kleinere Vorschau-Datei für schnelle Anzeige</small>
                    </div>

                    {uploadProgress > 0 && (
                        <div className="upload-progress">
                            <div className="progress-bar">
                                <div 
                                    className="progress-fill" 
                                    style={{ width: `${uploadProgress}%` }}
                                ></div>
                            </div>
                            <span>{uploadProgress}% hochgeladen</span>
                        </div>
                    )}
                </div>

                <div className="form-section">
                    <h2>Zuweisung & Priorität</h2>
                    
                    <div className="form-group">
                        <label htmlFor="assigned_to">Zugewiesen an</label>
                        <select
                            id="assigned_to"
                            name="assigned_to"
                            value={formData.assigned_to}
                            onChange={handleMultiSelectChange}
                            multiple
                            size={4}
                        >
                            {users.map(user => (
                                <option key={user.id} value={user.id}>
                                    {user.first_name} {user.last_name} ({user.email})
                                </option>
                            ))}
                        </select>
                        <small>Halten Sie Strg gedrückt, um mehrere Personen auszuwählen</small>
                    </div>

                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="priority">Priorität</label>
                            <select
                                id="priority"
                                name="priority"
                                value={formData.priority}
                                onChange={handleInputChange}
                            >
                                <option value="low">Niedrig</option>
                                <option value="normal">Normal</option>
                                <option value="high">Hoch</option>
                                <option value="urgent">Dringend</option>
                            </select>
                        </div>

                        <div className="form-group">
                            <label htmlFor="deadline">Deadline (optional)</label>
                            <input
                                type="datetime-local"
                                id="deadline"
                                name="deadline"
                                value={formData.deadline}
                                onChange={handleInputChange}
                            />
                        </div>
                    </div>
                </div>

                <div className="form-actions">
                    <button 
                        type="submit" 
                        className="btn-primary"
                        disabled={loading}
                    >
                        {loading ? 'Erstelle Entwurf...' : 'Entwurf erstellen und zur Freigabe senden'}
                    </button>
                    <button 
                        type="button" 
                        className="btn-secondary"
                        onClick={() => window.history.back()}
                    >
                        Abbrechen
                    </button>
                </div>
            </form>
        </div>
    );
};

export default TrauerdruckEntwurfErstellen;
