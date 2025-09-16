import React, { useState, useEffect } from 'react';
import useApi from '../../hooks/useApi';
import { Link } from 'react-router-dom';
import './TrauerdruckEntwurfErstellen.css';

const TrauerdruckEntwurfErstellen = () => {
    const { get, post } = useApi();
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);
    const [currentStep, setCurrentStep] = useState(1);
    
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
    const [searchTerm, setSearchTerm] = useState('');

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

    const filteredMemorialPages = memorialPages.filter(page => 
        page.deceased_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const nextStep = () => {
        if (currentStep < 3) {
            setCurrentStep(currentStep + 1);
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const canProceedToNext = () => {
        switch (currentStep) {
            case 1:
                return formData.title && formData.trauerdruck_type && formData.memorial_page;
            case 2:
                return formData.design_file;
            case 3:
                return true;
            default:
                return false;
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

            {/* Progress Steps */}
            <div className="progress-steps">
                <div className={`step ${currentStep >= 1 ? 'active' : ''} ${currentStep > 1 ? 'completed' : ''}`}>
                    <div className="step-number">1</div>
                    <div className="step-label">Grunddaten</div>
                </div>
                <div className={`step ${currentStep >= 2 ? 'active' : ''} ${currentStep > 2 ? 'completed' : ''}`}>
                    <div className="step-number">2</div>
                    <div className="step-label">Design-Dateien</div>
                </div>
                <div className={`step ${currentStep >= 3 ? 'active' : ''}`}>
                    <div className="step-number">3</div>
                    <div className="step-label">Freigabe senden</div>
                </div>
            </div>

            {success && (
                <div className="success-message">
                    <h3>✅ Entwurf erfolgreich erstellt!</h3>
                    <p>Der Entwurf wurde zur Freigabe gesendet und die Angehörigen wurden benachrichtigt.</p>
                    <div className="success-actions">
                        <Link to="/mein-bereich/trauerdruck/dashboard" className="btn-primary">
                            Zurück zum Dashboard
                        </Link>
                        <button 
                            className="btn-secondary"
                            onClick={() => {
                                setSuccess(false);
                                setCurrentStep(1);
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
                            }}
                        >
                            Neuen Entwurf erstellen
                        </button>
                    </div>
                </div>
            )}

            {error && (
                <div className="error-message">
                    <h3>❌ Fehler</h3>
                    <p>{error}</p>
                </div>
            )}

            {!success && (
                <form onSubmit={handleSubmit} className="entwurf-form">
                    {/* Step 1: Grunddaten */}
                    {currentStep === 1 && (
                        <div className="form-step">
                            <h2>Grunddaten des Entwurfs</h2>
                            
                            <div className="form-group">
                                <label htmlFor="title">Titel des Entwurfs *</label>
                                <input
                                    type="text"
                                    id="title"
                                    name="title"
                                    value={formData.title}
                                    onChange={handleInputChange}
                                    required
                                    placeholder="z.B. Trauerkarte für Max Mustermann"
                                    className="form-input"
                                />
                            </div>

                            <div className="form-group">
                                <label htmlFor="description">Beschreibung</label>
                                <textarea
                                    id="description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    rows={3}
                                    placeholder="Beschreibung des Entwurfs, besondere Wünsche, etc."
                                    className="form-textarea"
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
                                        className="form-select"
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
                                    <div className="searchable-select">
                                        <input
                                            type="text"
                                            placeholder="Verstorbenen suchen..."
                                            value={searchTerm}
                                            onChange={(e) => setSearchTerm(e.target.value)}
                                            className="form-input"
                                        />
                                        <select
                                            id="memorial_page"
                                            name="memorial_page"
                                            value={formData.memorial_page}
                                            onChange={handleInputChange}
                                            required
                                            className="form-select"
                                        >
                                            <option value="">Bitte wählen...</option>
                                            {filteredMemorialPages.map(page => (
                                                <option key={page.id} value={page.id}>
                                                    {page.deceased_name}
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Step 2: Design-Dateien */}
                    {currentStep === 2 && (
                        <div className="form-step">
                            <h2>Design-Dateien hochladen</h2>
                            
                            <div className="file-upload-section">
                                <div className="form-group">
                                    <label htmlFor="design_file">Design-Datei *</label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="design_file"
                                            name="design_file"
                                            onChange={handleFileChange}
                                            accept=".pdf,.jpg,.jpeg,.png,.ai,.psd"
                                            required
                                            className="file-input"
                                        />
                                        <div className="file-upload-content">
                                            <div className="upload-icon">📁</div>
                                            <p>Klicken Sie hier oder ziehen Sie eine Datei hierher</p>
                                            <small>Unterstützte Formate: PDF, JPG, PNG, AI, PSD</small>
                                        </div>
                                    </div>
                                    {formData.design_file && (
                                        <div className="file-selected">
                                            ✅ {formData.design_file.name}
                                        </div>
                                    )}
                                </div>

                                <div className="form-group">
                                    <label htmlFor="preview_file">Vorschau-Datei (optional)</label>
                                    <div className="file-upload-area">
                                        <input
                                            type="file"
                                            id="preview_file"
                                            name="preview_file"
                                            onChange={handleFileChange}
                                            accept=".jpg,.jpeg,.png"
                                            className="file-input"
                                        />
                                        <div className="file-upload-content">
                                            <div className="upload-icon">🖼️</div>
                                            <p>Vorschau-Datei (optional)</p>
                                            <small>Kleinere Vorschau-Datei für schnelle Anzeige</small>
                                        </div>
                                    </div>
                                    {formData.preview_file && (
                                        <div className="file-selected">
                                            ✅ {formData.preview_file.name}
                                        </div>
                                    )}
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
                        </div>
                    )}

                    {/* Step 3: Freigabe senden */}
                    {currentStep === 3 && (
                        <div className="form-step">
                            <h2>Freigabe an Angehörige senden</h2>
                            
                            <div className="form-group">
                                <label htmlFor="assigned_to">Angehörige auswählen</label>
                                <div className="user-selection">
                                    {users.map(user => (
                                        <label key={user.id} className="user-option">
                                            <input
                                                type="checkbox"
                                                value={user.id}
                                                checked={formData.assigned_to.includes(user.id)}
                                                onChange={(e) => {
                                                    const value = user.id;
                                                    if (e.target.checked) {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            assigned_to: [...prev.assigned_to, value]
                                                        }));
                                                    } else {
                                                        setFormData(prev => ({
                                                            ...prev,
                                                            assigned_to: prev.assigned_to.filter(id => id !== value)
                                                        }));
                                                    }
                                                }}
                                            />
                                            <div className="user-info">
                                                <strong>{user.first_name} {user.last_name}</strong>
                                                <span>{user.email}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            <div className="form-row">
                                <div className="form-group">
                                    <label htmlFor="priority">Priorität</label>
                                    <select
                                        id="priority"
                                        name="priority"
                                        value={formData.priority}
                                        onChange={handleInputChange}
                                        className="form-select"
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
                                        className="form-input"
                                    />
                                </div>
                            </div>

                            <div className="summary-section">
                                <h3>Zusammenfassung</h3>
                                <div className="summary-item">
                                    <strong>Titel:</strong> {formData.title}
                                </div>
                                <div className="summary-item">
                                    <strong>Trauerdruckart:</strong> {trauerdruckTypes.find(t => t.id === formData.trauerdruck_type)?.name}
                                </div>
                                <div className="summary-item">
                                    <strong>Verstorbener:</strong> {memorialPages.find(p => p.id === formData.memorial_page)?.deceased_name}
                                </div>
                                <div className="summary-item">
                                    <strong>Angehörige:</strong> {formData.assigned_to.length} ausgewählt
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Navigation */}
                    <div className="form-navigation">
                        {currentStep > 1 && (
                            <button 
                                type="button" 
                                className="btn-secondary"
                                onClick={prevStep}
                            >
                                ← Zurück
                            </button>
                        )}
                        
                        {currentStep < 3 ? (
                            <button 
                                type="button" 
                                className="btn-primary"
                                onClick={nextStep}
                                disabled={!canProceedToNext()}
                            >
                                Weiter →
                            </button>
                        ) : (
                            <button 
                                type="submit" 
                                className="btn-primary"
                                disabled={loading}
                            >
                                {loading ? 'Erstelle Entwurf...' : 'Entwurf erstellen und zur Freigabe senden'}
                            </button>
                        )}
                    </div>
                </form>
            )}
        </div>
    );
};

export default TrauerdruckEntwurfErstellen;
