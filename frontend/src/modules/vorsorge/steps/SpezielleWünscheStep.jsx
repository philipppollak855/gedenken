import React from 'react';
import './WizardStep.css';

const SpezielleWünscheStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleSpezielleWünscheChange = (e) => {
    updateFormData({ spezielle_wünsche: e.target.value });
  };

  const handleBlumenschmuckChange = (e) => {
    updateFormData({ blumenschmuck: e.target.value });
  };

  const handleKleidungChange = (e) => {
    updateFormData({ kleidung: e.target.value });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-star"></i>
        </div>
        <h2>Spezielle Wünsche</h2>
        <p className="step-description">
          Haben Sie besondere Wünsche für Ihre Verabschiedung? Hier können Sie alles festhalten.
        </p>
      </div>

      <div className="step-content">
        <div className="form-section">
          <label htmlFor="spezielle-wünsche" className="form-label">
            <i className="fas fa-star"></i>
            Spezielle Wünsche und Anmerkungen
          </label>
          <textarea
            id="spezielle-wünsche"
            className="form-textarea"
            value={formData.spezielle_wünsche}
            onChange={handleSpezielleWünscheChange}
            placeholder="z.B. 'Keine Trauerkleidung erwünscht', 'Bunte Blumen statt weiße', 'Bestimmte Rituale oder Zeremonien'..."
            rows={4}
          />
        </div>

        <div className="form-section">
          <label htmlFor="blumenschmuck" className="form-label">
            <i className="fas fa-seedling"></i>
            Blumenschmuck
          </label>
          <textarea
            id="blumenschmuck"
            className="form-textarea"
            value={formData.blumenschmuck}
            onChange={handleBlumenschmuckChange}
            placeholder="z.B. 'Lieblingsblumen: Rosen und Lilien', 'Bunte Blumen statt weiße', 'Keine künstlichen Blumen'..."
            rows={3}
          />
        </div>

        <div className="form-section">
          <label htmlFor="kleidung" className="form-label">
            <i className="fas fa-tshirt"></i>
            Kleidung
          </label>
          <textarea
            id="kleidung"
            className="form-textarea"
            value={formData.kleidung}
            onChange={handleKleidungChange}
            placeholder="z.B. 'Lieblingsanzug', 'Uniform', 'Bestimmte Farben', 'Keine Trauerkleidung'..."
            rows={3}
          />
        </div>

        <div className="help-section">
          <div className="help-card">
            <i className="fas fa-lightbulb"></i>
            <div className="help-content">
              <h4>Häufige spezielle Wünsche</h4>
              <div className="help-grid">
                <div className="help-item">
                  <strong>Blumenschmuck:</strong>
                  <ul>
                    <li>Lieblingsblumen und -farben</li>
                    <li>Keine künstlichen Blumen</li>
                    <li>Bestimmte Gestecke oder Kränze</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>Kleidung:</strong>
                  <ul>
                    <li>Lieblingsanzug oder -kleid</li>
                    <li>Uniform (Feuerwehr, Militär, etc.)</li>
                    <li>Bestimmte Farben oder Stile</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>Rituale:</strong>
                  <ul>
                    <li>Bestimmte Zeremonien</li>
                    <li>Religiöse oder weltliche Rituale</li>
                    <li>Persönliche Traditionen</li>
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
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default SpezielleWünscheStep;
