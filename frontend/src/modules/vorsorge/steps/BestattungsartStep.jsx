import React from 'react';
import './WizardStep.css';

const BestattungsartStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleSelect = (bestattungsart) => {
    updateFormData({ bestattungsart });
  };

  const handleNotesChange = (e) => {
    updateFormData({ bestattungsart_notizen: e.target.value });
  };

  const isSelected = (bestattungsart) => {
    return formData.bestattungsart && formData.bestattungsart.id === bestattungsart.id;
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-cross"></i>
        </div>
        <h2>Wie möchten Sie bestattet werden?</h2>
        <p className="step-description">
          Wählen Sie die Art der Bestattung, die Ihren Wünschen entspricht.
        </p>
      </div>

      <div className="step-content">
        <div className="options-grid">
          {categories.bestattungsarten.map((art) => (
            <div 
              key={art.id}
              className={`option-card ${isSelected(art) ? 'selected' : ''}`}
              onClick={() => handleSelect(art)}
            >
              <div className="option-icon">
                <i className={art.icon}></i>
              </div>
              <div className="option-content">
                <h3>{art.name}</h3>
                {art.description && (
                  <p className="option-description">{art.description}</p>
                )}
              </div>
              <div className="option-check">
                {isSelected(art) && <i className="fas fa-check"></i>}
              </div>
            </div>
          ))}
        </div>

        {formData.bestattungsart && (
          <div className="notes-section">
            <label htmlFor="bestattungsart-notizen" className="notes-label">
              <i className="fas fa-sticky-note"></i>
              Zusätzliche Notizen zur Bestattungsart
            </label>
            <textarea
              id="bestattungsart-notizen"
              className="notes-textarea"
              value={formData.bestattungsart_notizen}
              onChange={handleNotesChange}
              placeholder="Haben Sie spezielle Wünsche oder Anmerkungen zur gewählten Bestattungsart?"
              rows={4}
            />
          </div>
        )}
      </div>

      <div className="step-actions">
        <button 
          className="btn btn-secondary"
          onClick={onCancel}
        >
          <i className="fas fa-times"></i>
          Abbrechen
        </button>
        
        <button 
          className="btn btn-primary"
          onClick={onNext}
          disabled={!formData.bestattungsart}
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default BestattungsartStep;
