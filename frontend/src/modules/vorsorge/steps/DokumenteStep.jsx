import React, { useState } from 'react';
import './WizardStep.css';

const DokumenteStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [uploading, setUploading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState([]);

  const handleFileUpload = async (kategorie, file) => {
    setUploading(true);
    try {
      // Hier würde der tatsächliche Upload stattfinden
      // Für jetzt simulieren wir den Upload
      const newDocument = {
        id: Date.now(),
        kategorie: kategorie,
        titel: file.name,
        datei: file,
        is_uploaded: true
      };
      
      setUploadedFiles(prev => [...prev, newDocument]);
      updateFormData({ 
        dokumente: [...(formData.dokumente || []), newDocument] 
      });
    } catch (error) {
      console.error('Upload-Fehler:', error);
      alert('Fehler beim Hochladen der Datei');
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (kategorie, event) => {
    const file = event.target.files[0];
    if (file) {
      handleFileUpload(kategorie, file);
    }
  };

  const removeDocument = (documentId) => {
    setUploadedFiles(prev => prev.filter(doc => doc.id !== documentId));
    updateFormData({ 
      dokumente: formData.dokumente.filter(doc => doc.id !== documentId) 
    });
  };

  const getRequiredDocuments = () => {
    return categories.dokumentKategorien.filter(kat => kat.is_required);
  };

  const getOptionalDocuments = () => {
    return categories.dokumentKategorien.filter(kat => !kat.is_required);
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-file"></i>
        </div>
        <h2>Dokumente hochladen</h2>
        <p className="step-description">
          Laden Sie wichtige Dokumente für Ihre Bestattungsvorsorge hoch.
        </p>
      </div>

      <div className="step-content">
        {/* Erforderliche Dokumente */}
        {getRequiredDocuments().length > 0 && (
          <div className="form-section">
            <label className="form-label">
              <i className="fas fa-exclamation-triangle"></i>
              Erforderliche Dokumente
            </label>
            <div className="documents-grid">
              {getRequiredDocuments().map((kategorie) => (
                <div key={kategorie.id} className="document-card required">
                  <div className="document-header">
                    <div className="document-icon">
                      <i className={kategorie.icon}></i>
                    </div>
                    <div className="document-info">
                      <h4>{kategorie.name}</h4>
                      {kategorie.description && (
                        <p className="document-description">{kategorie.description}</p>
                      )}
                    </div>
                    <span className="required-badge">Erforderlich</span>
                  </div>
                  <div className="document-upload">
                    <input
                      type="file"
                      id={`file-${kategorie.id}`}
                      className="file-input"
                      onChange={(e) => handleFileChange(kategorie, e)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label htmlFor={`file-${kategorie.id}`} className="upload-button">
                      <i className="fas fa-upload"></i>
                      Datei auswählen
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Optionale Dokumente */}
        {getOptionalDocuments().length > 0 && (
          <div className="form-section">
            <label className="form-label">
              <i className="fas fa-plus-circle"></i>
              Optionale Dokumente
            </label>
            <div className="documents-grid">
              {getOptionalDocuments().map((kategorie) => (
                <div key={kategorie.id} className="document-card optional">
                  <div className="document-header">
                    <div className="document-icon">
                      <i className={kategorie.icon}></i>
                    </div>
                    <div className="document-info">
                      <h4>{kategorie.name}</h4>
                      {kategorie.description && (
                        <p className="document-description">{kategorie.description}</p>
                      )}
                    </div>
                  </div>
                  <div className="document-upload">
                    <input
                      type="file"
                      id={`file-${kategorie.id}`}
                      className="file-input"
                      onChange={(e) => handleFileChange(kategorie, e)}
                      accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                    />
                    <label htmlFor={`file-${kategorie.id}`} className="upload-button">
                      <i className="fas fa-upload"></i>
                      Datei auswählen
                    </label>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Hochgeladene Dokumente */}
        {uploadedFiles.length > 0 && (
          <div className="form-section">
            <label className="form-label">
              <i className="fas fa-check-circle"></i>
              Hochgeladene Dokumente
            </label>
            <div className="uploaded-documents">
              {uploadedFiles.map((doc) => (
                <div key={doc.id} className="uploaded-document">
                  <div className="document-info">
                    <i className="fas fa-file"></i>
                    <span className="document-name">{doc.titel}</span>
                    <span className="document-category">{doc.kategorie.name}</span>
                  </div>
                  <div className="document-actions">
                    <span className="status-badge success">
                      <i className="fas fa-check"></i>
                      Hochgeladen
                    </span>
                    <button 
                      className="remove-button"
                      onClick={() => removeDocument(doc.id)}
                    >
                      <i className="fas fa-trash"></i>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="help-section">
          <div className="help-card">
            <i className="fas fa-lightbulb"></i>
            <div className="help-content">
              <h4>Häufige Dokumente für die Bestattungsvorsorge</h4>
              <div className="help-grid">
                <div className="help-item">
                  <strong>Personaldokumente:</strong>
                  <ul>
                    <li>Personalausweis oder Reisepass</li>
                    <li>Geburtsurkunde</li>
                    <li>Heiratsurkunde</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>Bestattungsdokumente:</strong>
                  <ul>
                    <li>Bestattungsvertrag</li>
                    <li>Grabvertrag</li>
                    <li>Sterbeurkunde (nach Eintritt)</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>Versicherungsdokumente:</strong>
                  <ul>
                    <li>Sterbegeldversicherung</li>
                    <li>Lebensversicherung</li>
                    <li>Bestattungsversicherung</li>
                  </ul>
                </div>
              </div>
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
          disabled={uploading}
        >
          {uploading ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Lade hoch...
            </>
          ) : (
            <>
              Weiter
              <i className="fas fa-arrow-right"></i>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default DokumenteStep;
