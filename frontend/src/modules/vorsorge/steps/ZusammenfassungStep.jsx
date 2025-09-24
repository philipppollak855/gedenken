import React, { useState } from 'react';
import './WizardStep.css';

const ZusammenfassungStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel, onComplete }) => {
  const [isCompleting, setIsCompleting] = useState(false);

  const handleComplete = async () => {
    setIsCompleting(true);
    try {
      await onComplete(formData);
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
    } finally {
      setIsCompleting(false);
    }
  };

  const getBestattungsartName = () => {
    const art = categories.bestattungsarten.find(a => a.id === formData.bestattungsart);
    return art ? art.name : 'Nicht ausgewählt';
  };

  const getVerabschiedungsartName = () => {
    const art = categories.verabschiedungsarten.find(a => a.id === formData.verabschiedungsart);
    return art ? art.name : 'Nicht ausgewählt';
  };

  const getGrabartName = () => {
    const art = categories.grabarten.find(a => a.id === formData.grabart);
    return art ? art.name : 'Nicht ausgewählt';
  };

  const getMusikKategorienNames = () => {
    const selectedKategorien = categories.musikKategorien.filter(k => 
      formData.musik_kategorien?.some(selected => selected.id === k.id)
    );
    return selectedKategorien.map(k => k.name).join(', ') || 'Keine ausgewählt';
  };

  const getVereinsKategorienNames = () => {
    const selectedKategorien = categories.vereinsKategorien.filter(k => 
      formData.vereins_kategorien?.some(selected => selected.id === k.id)
    );
    return selectedKategorien.map(k => k.name).join(', ') || 'Keine ausgewählt';
  };

  const getDokumentKategorienNames = () => {
    const selectedKategorien = categories.dokumentKategorien.filter(k => 
      formData.dokument_kategorien?.some(selected => selected.id === k.id)
    );
    return selectedKategorien.map(k => k.name).join(', ') || 'Keine ausgewählt';
  };

  const getDigitalerNachlassKategorienNames = () => {
    const selectedKategorien = categories.digitalerNachlassKategorien.filter(k => 
      formData.digitaler_nachlass_kategorien?.some(selected => selected.id === k.id)
    );
    return selectedKategorien.map(k => k.name).join(', ') || 'Keine ausgewählt';
  };

  const calculateCompletionPercentage = () => {
    let completed = 0;
    let total = 0;

    // Bestattungsart
    total++;
    if (formData.bestattungsart) completed++;

    // Verabschiedungsart
    total++;
    if (formData.verabschiedungsart) completed++;

    // Grabart
    total++;
    if (formData.grabart) completed++;

    // Musik
    total++;
    if (formData.musik_wünsche || formData.musik_stücke?.length > 0) completed++;

    // Vereine
    total++;
    if (formData.vereins_wünsche) completed++;

    // Spezielle Wünsche
    total++;
    if (formData.spezielle_wünsche) completed++;

    // Grab
    total++;
    if (formData.friedhof) completed++;

    // Dokumente
    total++;
    if (formData.dokumente?.length > 0) completed++;

    // Digitaler Nachlass
    total++;
    if (formData.digitaler_nachlass?.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = calculateCompletionPercentage();

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-check-circle"></i>
        </div>
        <h2>✅ Zusammenfassung Ihrer Vorsorge</h2>
        <p className="step-description">
          Überprüfen Sie alle Ihre Angaben und schließen Sie Ihre Bestattungsvorsorge ab.
        </p>
      </div>

      <div className="step-content">
        <div className="completion-status">
          <div className="completion-circle">
            <div className="completion-percentage">{completionPercentage}%</div>
            <div className="completion-label">Vollständig</div>
          </div>
          <div className="completion-text">
            <h3>Ihre Vorsorge ist {completionPercentage}% vollständig</h3>
            <p>
              {completionPercentage >= 80 
                ? "Ausgezeichnet! Ihre Vorsorge ist sehr umfassend." 
                : completionPercentage >= 60 
                ? "Gut! Sie können noch weitere Details ergänzen." 
                : "Sie können noch weitere Bereiche ausfüllen."}
            </p>
          </div>
        </div>

        <div className="summary-sections">
          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-cross"></i>
              Bestattungsart
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Gewählte Art:</span>
                <span className="summary-value">{getBestattungsartName()}</span>
              </div>
              {formData.bestattungsart_notizen && (
                <div className="summary-item">
                  <span className="summary-label">Besondere Wünsche:</span>
                  <span className="summary-value">{formData.bestattungsart_notizen}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-church"></i>
              Verabschiedung
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Art der Feier:</span>
                <span className="summary-value">{getVerabschiedungsartName()}</span>
              </div>
              {formData.sarg_urne_wünsche && (
                <div className="summary-item">
                  <span className="summary-label">Sarg/Urne:</span>
                  <span className="summary-value">{formData.sarg_urne_wünsche}</span>
                </div>
              )}
              {formData.kleidung && (
                <div className="summary-item">
                  <span className="summary-label">Kleidung:</span>
                  <span className="summary-value">{formData.kleidung}</span>
                </div>
              )}
              {formData.blumenschmuck && (
                <div className="summary-item">
                  <span className="summary-label">Blumenschmuck:</span>
                  <span className="summary-value">{formData.blumenschmuck}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-music"></i>
              Musik
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Kategorien:</span>
                <span className="summary-value">{getMusikKategorienNames()}</span>
              </div>
              {formData.musik_wünsche && (
                <div className="summary-item">
                  <span className="summary-label">Musikwünsche:</span>
                  <span className="summary-value">{formData.musik_wünsche}</span>
                </div>
              )}
              {formData.musik_stücke?.length > 0 && (
                <div className="summary-item">
                  <span className="summary-label">Musikstücke:</span>
                  <span className="summary-value">{formData.musik_stücke.length} Lieder ausgewählt</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-users"></i>
              Vereine
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Kategorien:</span>
                <span className="summary-value">{getVereinsKategorienNames()}</span>
              </div>
              {formData.vereins_wünsche && (
                <div className="summary-item">
                  <span className="summary-label">Vereinswünsche:</span>
                  <span className="summary-value">{formData.vereins_wünsche}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-star"></i>
              Spezielle Wünsche
            </div>
            <div className="summary-content">
              {formData.spezielle_wünsche && (
                <div className="summary-item">
                  <span className="summary-label">Wünsche:</span>
                  <span className="summary-value">{formData.spezielle_wünsche}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-monument"></i>
              Grab
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Grabart:</span>
                <span className="summary-value">{getGrabartName()}</span>
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
                  <span className="summary-label">Grabwünsche:</span>
                  <span className="summary-value">{formData.grab_wünsche}</span>
                </div>
              )}
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-file-alt"></i>
              Dokumente
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Anzahl Dokumente:</span>
                <span className="summary-value">{formData.dokumente?.length || 0} Dokumente</span>
              </div>
            </div>
          </div>

          <div className="summary-section">
            <div className="summary-title">
              <i className="fas fa-laptop"></i>
              Digitaler Nachlass
            </div>
            <div className="summary-content">
              <div className="summary-item">
                <span className="summary-label">Anzahl Konten:</span>
                <span className="summary-value">{formData.digitaler_nachlass?.length || 0} Konten</span>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Nächste Schritte
          </div>
          <div className="next-steps">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Vorsorge speichern</h4>
                <p>Ihre Angaben werden sicher gespeichert und können jederzeit bearbeitet werden.</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Vertrauenspersonen informieren</h4>
                <p>Teilen Sie den Standort Ihrer Vorsorge mit vertrauten Personen.</p>
              </div>
            </div>
            
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Regelmäßig aktualisieren</h4>
                <p>Überprüfen und aktualisieren Sie Ihre Vorsorge regelmäßig.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Vertraulichkeit:</strong> Ihre Vorsorge wird vertraulich behandelt und nur bei Bedarf eingesehen.</li>
                <li><strong>Aktualität:</strong> Überprüfen Sie regelmäßig Ihre Angaben und passen Sie sie bei Bedarf an.</li>
                <li><strong>Zugang:</strong> Stellen Sie sicher, dass vertraute Personen Zugang zu Ihrer Vorsorge haben.</li>
                <li><strong>Rechtliche Gültigkeit:</strong> Diese Vorsorge ist rechtlich nicht bindend, aber eine wichtige Orientierung.</li>
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
          onClick={handleComplete}
          disabled={isCompleting}
        >
          {isCompleting ? (
            <>
              <i className="fas fa-spinner fa-spin"></i>
              Speichern...
            </>
          ) : (
            <>
              <i className="fas fa-check"></i>
              Vorsorge abschließen
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default ZusammenfassungStep;