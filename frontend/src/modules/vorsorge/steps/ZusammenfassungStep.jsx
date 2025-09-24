import React from 'react';
import './WizardStep.css';

const ZusammenfassungStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel, onSave }) => {
  const getCompletionPercentage = () => {
    const fields = [
      formData.bestattungsart,
      formData.verabschiedungsart,
      formData.musik_wünsche,
      formData.spezielle_wünsche,
      formData.grabart,
      formData.friedhof
    ];
    const completed = fields.filter(field => field).length;
    return Math.round((completed / fields.length) * 100);
  };

  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getCompletionText = (percentage) => {
    if (percentage >= 80) return 'Fast abgeschlossen';
    if (percentage >= 50) return 'Gut vorbereitet';
    return 'Grundlagen gelegt';
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-check"></i>
        </div>
        <h2>Zusammenfassung</h2>
        <p className="step-description">
          Überprüfen Sie Ihre Angaben und speichern Sie Ihre Bestattungsvorsorge.
        </p>
      </div>

      <div className="step-content">
        {/* Fortschritt */}
        <div className="summary-section">
          <div className="summary-header">
            <h3>Fortschritt</h3>
            <span className={`progress-badge ${getCompletionColor(getCompletionPercentage())}`}>
              {getCompletionPercentage()}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${getCompletionPercentage()}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {getCompletionText(getCompletionPercentage())}
          </p>
        </div>

        {/* Bestattungsart */}
        {formData.bestattungsart && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-cross"></i>
              </div>
              <h3>Bestattungsart</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Art:</span>
                <span className="summary-value">{formData.bestattungsart.name}</span>
              </div>
              {formData.bestattungsart_notizen && (
                <div className="summary-item">
                  <span className="summary-label">Notizen:</span>
                  <span className="summary-value">{formData.bestattungsart_notizen}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verabschiedung */}
        {formData.verabschiedungsart && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-church"></i>
              </div>
              <h3>Verabschiedung</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Art:</span>
                <span className="summary-value">{formData.verabschiedungsart.name}</span>
              </div>
              {formData.verabschiedungsart_notizen && (
                <div className="summary-item">
                  <span className="summary-label">Notizen:</span>
                  <span className="summary-value">{formData.verabschiedungsart_notizen}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Musik */}
        {formData.musik_wünsche && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-music"></i>
              </div>
              <h3>Musik</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Wünsche:</span>
                <span className="summary-value">{formData.musik_wünsche}</span>
              </div>
              {formData.musik_kategorien && formData.musik_kategorien.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Kategorien:</span>
                  <div className="tags">
                    {formData.musik_kategorien.map((kategorie, index) => (
                      <span key={index} className="tag">{kategorie.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vereine */}
        {formData.vereins_wünsche && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Vereine</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Wünsche:</span>
                <span className="summary-value">{formData.vereins_wünsche}</span>
              </div>
              {formData.vereins_kategorien && formData.vereins_kategorien.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Kategorien:</span>
                  <div className="tags">
                    {formData.vereins_kategorien.map((kategorie, index) => (
                      <span key={index} className="tag">{kategorie.name}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spezielle Wünsche */}
        {formData.spezielle_wünsche && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Spezielle Wünsche</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-value">{formData.spezielle_wünsche}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grab */}
        {formData.grabart && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-tombstone"></i>
              </div>
              <h3>Grab</h3>
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Grabart:</span>
                <span className="summary-value">{formData.grabart.name}</span>
              </div>
              {formData.friedhof && (
                <div className="summary-item">
                  <span className="summary-label">Friedhof:</span>
                  <span className="summary-value">{formData.friedhof}</span>
                </div>
              )}
              {formData.grabnummer && (
                <div className="summary-item">
                  <span className="summary-label">Grabnummer:</span>
                  <span className="summary-value">{formData.grabnummer}</span>
                </div>
              )}
              {formData.grab_wünsche && (
                <div className="summary-item">
                  <span className="summary-label">Wünsche:</span>
                  <span className="summary-value">{formData.grab_wünsche}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dokumente */}
        {formData.dokumente && formData.dokumente.length > 0 && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-file"></i>
              </div>
              <h3>Dokumente</h3>
            </div>
            <div className="summary-content">
              <div className="documents-list">
                {formData.dokumente.map((dokument) => (
                  <div key={dokument.id} className="document-item">
                    <div className="document-info">
                      <span className="document-title">{dokument.titel}</span>
                      <span className="document-category">{dokument.kategorie.name}</span>
                    </div>
                    <div className="document-status">
                      <span className="status-badge success">
                        <i className="fas fa-check"></i>
                        Hochgeladen
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Digitaler Nachlass */}
        {formData.digitaler_nachlass && formData.digitaler_nachlass.length > 0 && (
          <div className="summary-section">
            <div className="summary-header">
              <div className="summary-icon">
                <i className="fas fa-laptop"></i>
              </div>
              <h3>Digitaler Nachlass</h3>
            </div>
            <div className="summary-content">
              <div className="nachlass-list">
                {formData.digitaler_nachlass.map((nachlass) => (
                  <div key={nachlass.id} className="nachlass-item">
                    <div className="nachlass-info">
                      <span className="nachlass-platform">{nachlass.plattform}</span>
                      <span className="nachlass-category">{nachlass.kategorie.name}</span>
                      {nachlass.is_important && (
                        <span className="status-badge important">
                          <i className="fas fa-exclamation"></i>
                          Wichtig
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Speichern-Hinweis */}
        <div className="save-notice">
          <div className="notice-icon">
            <i className="fas fa-info-circle"></i>
          </div>
          <div className="notice-content">
            <h4>Ihre Vorsorge wird gespeichert</h4>
            <p>
              Alle Ihre Angaben werden sicher gespeichert und können jederzeit bearbeitet werden. 
              Ihre Angehörigen können auf diese Informationen zugreifen, wenn Sie es wünschen.
            </p>
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
          className="btn btn-success"
          onClick={onSave}
        >
          <i className="fas fa-save"></i>
          Vorsorge speichern
        </button>
      </div>
    </div>
  );
};

export default ZusammenfassungStep;
