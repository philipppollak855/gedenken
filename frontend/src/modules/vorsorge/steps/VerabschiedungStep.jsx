import React from 'react';
import './WizardStep.css';

const VerabschiedungStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleSelect = (verabschiedungsart) => {
    updateFormData({ verabschiedungsart });
  };

  const handleNotesChange = (e) => {
    updateFormData({ verabschiedungsart_notizen: e.target.value });
  };

  const isSelected = (verabschiedungsart) => {
    return formData.verabschiedungsart && formData.verabschiedungsart.id === verabschiedungsart.id;
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-church"></i>
        </div>
        <h2>Wie soll die Verabschiedung gestaltet werden?</h2>
        <p className="step-description">
          Wählen Sie die Art der Trauerfeier, die Ihren Wünschen entspricht.
        </p>
      </div>

      <div className="step-content">
        <div className="options-grid">
          {categories.verabschiedungsarten.map((art) => (
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
                {art.is_religious && (
                  <span className="religious-badge">
                    <i className="fas fa-cross"></i>
                    Religiös
                  </span>
                )}
              </div>
              <div className="option-check">
                {isSelected(art) && <i className="fas fa-check"></i>}
              </div>
            </div>
          ))}
        </div>

        {formData.verabschiedungsart && (
          <div className="notes-section">
            <label htmlFor="verabschiedungsart-notizen" className="notes-label">
              <i className="fas fa-sticky-note"></i>
              Zusätzliche Notizen zur Verabschiedung
            </label>
            <textarea
              id="verabschiedungsart-notizen"
              className="notes-textarea"
              value={formData.verabschiedungsart_notizen}
              onChange={handleNotesChange}
              placeholder="Haben Sie spezielle Wünsche für die Trauerfeier? Z.B. bestimmte Rituale, Texte oder Abläufe?"
              rows={4}
            />
          </div>
        )}
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
          disabled={!formData.verabschiedungsart}
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default VerabschiedungStep;
