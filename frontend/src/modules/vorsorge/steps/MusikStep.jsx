import React from 'react';
import './WizardStep.css';

const MusikStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleWünscheChange = (e) => {
    updateFormData({ musik_wünsche: e.target.value });
  };

  const handleKategorieToggle = (kategorie) => {
    const currentKategorien = formData.musik_kategorien || [];
    const isSelected = currentKategorien.some(k => k.id === kategorie.id);
    
    if (isSelected) {
      updateFormData({ 
        musik_kategorien: currentKategorien.filter(k => k.id !== kategorie.id) 
      });
    } else {
      updateFormData({ 
        musik_kategorien: [...currentKategorien, kategorie] 
      });
    }
  };

  const isKategorieSelected = (kategorie) => {
    return formData.musik_kategorien && formData.musik_kategorien.some(k => k.id === kategorie.id);
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-music"></i>
        </div>
        <h2>Musikwünsche für die Trauerfeier</h2>
        <p className="step-description">
          Welche Musik soll bei Ihrer Verabschiedung gespielt werden?
        </p>
      </div>

      <div className="step-content">
        <div className="form-section">
          <label htmlFor="musik-wünsche" className="form-label">
            <i className="fas fa-music"></i>
            Ihre Musikwünsche
          </label>
          <textarea
            id="musik-wünsche"
            className="form-textarea"
            value={formData.musik_wünsche}
            onChange={handleWünscheChange}
            placeholder="z.B. 'Ave Maria' von Schubert, 'Time to Say Goodbye' von Andrea Bocelli, oder Ihre Lieblingslieder..."
            rows={4}
          />
        </div>

        <div className="kategorien-section">
          <label className="form-label">
            <i className="fas fa-tags"></i>
            Musik-Kategorien (optional)
          </label>
          <div className="kategorien-grid">
            {categories.musikKategorien.map((kategorie) => (
              <div 
                key={kategorie.id}
                className={`kategorie-card ${isKategorieSelected(kategorie) ? 'selected' : ''}`}
                onClick={() => handleKategorieToggle(kategorie)}
              >
                <div className="kategorie-icon">
                  <i className={kategorie.icon}></i>
                </div>
                <div className="kategorie-content">
                  <h4>{kategorie.name}</h4>
                  {kategorie.description && (
                    <p className="kategorie-description">{kategorie.description}</p>
                  )}
                </div>
                <div className="kategorie-check">
                  {isKategorieSelected(kategorie) && <i className="fas fa-check"></i>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="help-section">
          <div className="help-card">
            <i className="fas fa-lightbulb"></i>
            <div className="help-content">
              <h4>Tipp</h4>
              <p>
                Überlegen Sie sich 3-5 Lieder, die Ihnen besonders wichtig sind. 
                Diese können bei der Trauerfeier gespielt werden.
              </p>
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

export default MusikStep;
