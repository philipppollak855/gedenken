import React from 'react';
import './WizardStep.css';

const VereineStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleWünscheChange = (e) => {
    updateFormData({ vereins_wünsche: e.target.value });
  };

  const handleKategorieToggle = (kategorie) => {
    const currentKategorien = formData.vereins_kategorien || [];
    const isSelected = currentKategorien.some(k => k.id === kategorie.id);
    
    if (isSelected) {
      updateFormData({ 
        vereins_kategorien: currentKategorien.filter(k => k.id !== kategorie.id) 
      });
    } else {
      updateFormData({ 
        vereins_kategorien: [...currentKategorien, kategorie] 
      });
    }
  };

  const isKategorieSelected = (kategorie) => {
    return formData.vereins_kategorien && formData.vereins_kategorien.some(k => k.id === kategorie.id);
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-users"></i>
        </div>
        <h2>Vereine und Organisationen</h2>
        <p className="step-description">
          Welche Vereine oder Organisationen sollen bei Ihrer Verabschiedung beteiligt werden?
        </p>
      </div>

      <div className="step-content">
        <div className="form-section">
          <label htmlFor="vereins-wünsche" className="form-label">
            <i className="fas fa-users"></i>
            Ihre Vereinswünsche
          </label>
          <textarea
            id="vereins-wünsche"
            className="form-textarea"
            value={formData.vereins_wünsche}
            onChange={handleWünscheChange}
            placeholder="z.B. 'Feuerwehr soll Ehrenwache halten', 'Musikverein soll spielen', 'Sportverein soll Fahne tragen'..."
            rows={4}
          />
        </div>

        <div className="kategorien-section">
          <label className="form-label">
            <i className="fas fa-tags"></i>
            Vereinskategorien (optional)
          </label>
          <div className="kategorien-grid">
            {categories.vereinsKategorien.map((kategorie) => (
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
              <h4>Häufige Vereinsbeteiligungen</h4>
              <ul>
                <li><strong>Feuerwehr:</strong> Ehrenwache, Fahnenabordnung</li>
                <li><strong>Musikverein:</strong> Trauermusik, Marschmusik</li>
                <li><strong>Sportverein:</strong> Fahnenträger, Ehrenwache</li>
                <li><strong>Kirchenchor:</strong> Gesang bei der Trauerfeier</li>
                <li><strong>Veteranenverein:</strong> Ehrenwache für ehemalige Soldaten</li>
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

export default VereineStep;
