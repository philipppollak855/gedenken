import React, { useState } from 'react';
import './WizardStep.css';

const DokumenteStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [dokumente, setDokumente] = useState(formData.dokumente || []);
  const [uploadedFiles, setUploadedFiles] = useState({});

  const addDokument = () => {
    const newDokument = {
      id: Date.now(),
      kategorie: '',
      titel: '',
      beschreibung: '',
      is_uploaded: false,
      datei: null
    };
    const updated = [...dokumente, newDokument];
    setDokumente(updated);
    updateFormData({ dokumente: updated });
  };

  const removeDokument = (id) => {
    const updated = dokumente.filter(dok => dok.id !== id);
    setDokumente(updated);
    updateFormData({ dokumente: updated });
  };

  const updateDokument = (id, field, value) => {
    const updated = dokumente.map(dok => 
      dok.id === id ? { ...dok, [field]: value } : dok
    );
    setDokumente(updated);
    updateFormData({ dokumente: updated });
  };

  const handleFileUpload = (dokumentId, file) => {
    setUploadedFiles(prev => ({
      ...prev,
      [dokumentId]: file
    }));
    updateDokument(dokumentId, 'is_uploaded', true);
    updateDokument(dokumentId, 'datei', file.name);
  };

  const getRequiredDokumente = () => {
    return categories.dokumentKategorien.filter(kat => kat.is_required);
  };

  const getOptionalDokumente = () => {
    return categories.dokumentKategorien.filter(kat => !kat.is_required);
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-file-alt"></i>
        </div>
        <h2>📄 Wichtige Dokumente</h2>
        <p className="step-description">
          Dokumente sind essentiell für eine reibungslose Abwicklung. 
          Laden Sie alle wichtigen Unterlagen hoch und organisieren Sie sie systematisch.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Dokumente sicher verwahren</div>
            <div className="info-text">
              Alle wichtigen Dokumente sollten an einem sicheren Ort aufbewahrt werden. 
              Laden Sie Kopien hoch und teilen Sie den Standort mit vertrauten Personen.
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Erforderliche Dokumente
          </div>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Diese Dokumente sind für die Bestattung zwingend erforderlich:
          </p>
          
          <div className="required-docs-grid">
            {getRequiredDokumente().map((kategorie) => (
              <div key={kategorie.id} className="required-doc-card">
                <div className="doc-icon">
                  <i className="fas fa-file-medical"></i>
                </div>
                <div className="doc-content">
                  <h4>{kategorie.name}</h4>
                  <p>{kategorie.description}</p>
                  <div className="doc-status">
                    <span className="status-required">Erforderlich</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📁</span>
            Optionale Dokumente
          </div>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Diese Dokumente können hilfreich sein, sind aber nicht zwingend erforderlich:
          </p>
          
          <div className="optional-docs-grid">
            {getOptionalDokumente().map((kategorie) => (
              <div key={kategorie.id} className="optional-doc-card">
                <div className="doc-icon">
                  <i className="fas fa-file"></i>
                </div>
                <div className="doc-content">
                  <h4>{kategorie.name}</h4>
                  <p>{kategorie.description}</p>
                  <div className="doc-status">
                    <span className="status-optional">Optional</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📤</span>
            Dokumente hochladen
          </div>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Laden Sie Ihre Dokumente hoch und organisieren Sie sie:
          </p>
          
          {dokumente.map((dokument, index) => (
            <div key={dokument.id} className="dokument-item">
              <div className="dokument-header">
                <div className="dokument-number">{index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeDokument(dokument.id)}
                  className="remove-dokument-btn"
                  title="Dokument entfernen"
                >
                  ×
                </button>
              </div>
              
              <div className="dokument-fields">
                <div className="form-group">
                  <label className="form-label required">Dokument-Kategorie</label>
                  <select
                    value={dokument.kategorie}
                    onChange={(e) => updateDokument(dokument.id, 'kategorie', e.target.value)}
                    className="form-select"
                  >
                    <option value="">Bitte wählen...</option>
                    {categories.dokumentKategorien.map(kat => (
                      <option key={kat.id} value={kat.id}>
                        {kat.name} {kat.is_required ? '(Erforderlich)' : '(Optional)'}
                      </option>
                    ))}
                  </select>
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Titel des Dokuments</label>
                  <input
                    type="text"
                    value={dokument.titel}
                    onChange={(e) => updateDokument(dokument.id, 'titel', e.target.value)}
                    placeholder="z.B. Geburtsurkunde, Reisepass, Versicherungspolice..."
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Beschreibung</label>
                <textarea
                  value={dokument.beschreibung}
                  onChange={(e) => updateDokument(dokument.id, 'beschreibung', e.target.value)}
                  placeholder="z.B. Ausgestellt am..., Gültig bis..., Besondere Hinweise..."
                  className="form-textarea"
                  rows={2}
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Datei hochladen</label>
                <div className="file-upload-area">
                  <input
                    type="file"
                    id={`file-${dokument.id}`}
                    onChange={(e) => handleFileUpload(dokument.id, e.target.files[0])}
                    className="file-input"
                    accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  />
                  <label htmlFor={`file-${dokument.id}`} className="file-upload-label">
                    <i className="fas fa-cloud-upload-alt"></i>
                    {uploadedFiles[dokument.id] ? uploadedFiles[dokument.id].name : 'Datei auswählen'}
                  </label>
                  {uploadedFiles[dokument.id] && (
                    <div className="file-info">
                      <i className="fas fa-check-circle"></i>
                      <span>Datei hochgeladen</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
          
          {dokumente.length < 20 && (
            <button
              type="button"
              onClick={addDokument}
              className="add-dokument-btn"
            >
              <span>+</span> Weitere Dokumente hinzufügen
            </button>
          )}
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">🔒</span>
            Dokumentensicherheit
          </div>
          <div className="security-tips">
            <div className="tip-item">
              <i className="fas fa-shield-alt"></i>
              <div>
                <h4>Sichere Aufbewahrung</h4>
                <p>Bewahren Sie Originale an einem sicheren Ort auf (Tresor, Bankschließfach)</p>
              </div>
            </div>
            
            <div className="tip-item">
              <i className="fas fa-copy"></i>
              <div>
                <h4>Kopien erstellen</h4>
                <p>Erstellen Sie Kopien aller wichtigen Dokumente</p>
              </div>
            </div>
            
            <div className="tip-item">
              <i className="fas fa-users"></i>
              <div>
                <h4>Vertrauenspersonen informieren</h4>
                <p>Teilen Sie den Standort der Dokumente mit vertrauten Personen</p>
              </div>
            </div>
            
            <div className="tip-item">
              <i className="fas fa-calendar-alt"></i>
              <div>
                <h4>Gültigkeit prüfen</h4>
                <p>Überprüfen Sie regelmäßig die Gültigkeit Ihrer Dokumente</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Checkliste Dokumente
          </div>
          <div className="checklist-grid">
            <div className="checklist-item">
              <h4>Persönliche Dokumente</h4>
              <ul>
                <li>✓ Geburtsurkunde</li>
                <li>✓ Reisepass/Personalausweis</li>
                <li>✓ Heiratsurkunde</li>
                <li>✓ Scheidungsurkunde</li>
                <li>✓ Sterbeurkunde (falls vorhanden)</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Versicherungen</h4>
              <ul>
                <li>✓ Krankenversicherung</li>
                <li>✓ Lebensversicherung</li>
                <li>✓ Unfallversicherung</li>
                <li>✓ Haftpflichtversicherung</li>
                <li>✓ Bestattungsversicherung</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Finanzielle Dokumente</h4>
              <ul>
                <li>✓ Bankunterlagen</li>
                <li>✓ Sparbücher</li>
                <li>✓ Wertpapiere</li>
                <li>✓ Rentenbescheide</li>
                <li>✓ Steuerunterlagen</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Originale:</strong> Bewahren Sie Originale sicher auf, Kopien reichen für die Vorsorge.</li>
                <li><strong>Gültigkeit:</strong> Überprüfen Sie regelmäßig die Gültigkeit Ihrer Dokumente.</li>
                <li><strong>Zugang:</strong> Stellen Sie sicher, dass vertraute Personen Zugang zu den Dokumenten haben.</li>
                <li><strong>Backup:</strong> Erstellen Sie digitale Kopien als Backup.</li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-secondary"
          onClick={onPrevious}
        >
          <i className="fas fa-arrow-left"></i>
          Zurück
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={onNext}
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default DokumenteStep;