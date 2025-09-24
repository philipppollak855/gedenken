import React from 'react';
import './WizardStep.css';

const GrabStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const handleGrabartSelect = (grabart) => {
    updateFormData({ grabart });
  };

  const handleFriedhofChange = (e) => {
    updateFormData({ friedhof: e.target.value });
  };

  const handleGrabnummerChange = (e) => {
    updateFormData({ grabnummer: e.target.value });
  };

  const handleGrabWünscheChange = (e) => {
    updateFormData({ grab_wünsche: e.target.value });
  };

  const isGrabartSelected = (grabart) => {
    return formData.grabart && formData.grabart.id === grabart.id;
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-tombstone"></i>
        </div>
        <h2>Grab und Friedhof</h2>
        <p className="step-description">
          Wo und wie möchten Sie bestattet werden? Legen Sie Ihre Wünsche für das Grab fest.
        </p>
      </div>

      <div className="step-content">
        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-tombstone"></i>
            Grabart wählen
          </label>
          <div className="options-grid">
            {categories.grabarten.map((grabart) => (
              <div 
                key={grabart.id}
                className={`option-card ${isGrabartSelected(grabart) ? 'selected' : ''}`}
                onClick={() => handleGrabartSelect(grabart)}
              >
                <div className="option-icon">
                  <i className={grabart.icon}></i>
                </div>
                <div className="option-content">
                  <h3>{grabart.name}</h3>
                  {grabart.description && (
                    <p className="option-description">{grabart.description}</p>
                  )}
                </div>
                <div className="option-check">
                  {isGrabartSelected(grabart) && <i className="fas fa-check"></i>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="form-section">
          <label htmlFor="friedhof" className="form-label">
            <i className="fas fa-map-marker-alt"></i>
            Friedhof
          </label>
          <input
            type="text"
            id="friedhof"
            className="form-input"
            value={formData.friedhof}
            onChange={handleFriedhofChange}
            placeholder="z.B. 'Städtischer Friedhof München', 'Waldfriedhof', 'Heimatfriedhof'..."
          />
        </div>

        <div className="form-section">
          <label htmlFor="grabnummer" className="form-label">
            <i className="fas fa-hashtag"></i>
            Grabnummer (falls bekannt)
          </label>
          <input
            type="text"
            id="grabnummer"
            className="form-input"
            value={formData.grabnummer}
            onChange={handleGrabnummerChange}
            placeholder="z.B. 'A-123', 'Feld 5, Reihe 3, Grab 12'..."
          />
        </div>

        <div className="form-section">
          <label htmlFor="grab-wünsche" className="form-label">
            <i className="fas fa-heart"></i>
            Grabwünsche und -gestaltung
          </label>
          <textarea
            id="grab-wünsche"
            className="form-textarea"
            value={formData.grab_wünsche}
            onChange={handleGrabWünscheChange}
            placeholder="z.B. 'Einfacher Grabstein mit Namen', 'Bestimmte Pflanzen', 'Gemeinsames Grab mit Partner', 'Anonyme Bestattung'..."
            rows={4}
          />
        </div>

        <div className="help-section">
          <div className="help-card">
            <i className="fas fa-lightbulb"></i>
            <div className="help-content">
              <h4>Grabarten im Überblick</h4>
              <div className="help-grid">
                <div className="help-item">
                  <strong>Einzelgrab:</strong>
                  <p>Für eine Person, meist 20-25 Jahre Nutzungsrecht</p>
                </div>
                <div className="help-item">
                  <strong>Doppelgrab:</strong>
                  <p>Für zwei Personen (Ehepartner), längere Nutzungszeit</p>
                </div>
                <div className="help-item">
                  <strong>Familiengrab:</strong>
                  <p>Für mehrere Familienmitglieder, oft über Generationen</p>
                </div>
                <div className="help-item">
                  <strong>Urnengrab:</strong>
                  <p>Kleineres Grab für Urnenbestattung</p>
                </div>
                <div className="help-item">
                  <strong>Anonymes Grab:</strong>
                  <p>Ohne Grabstein, oft günstiger</p>
                </div>
                <div className="help-item">
                  <strong>Wahlgrab:</strong>
                  <p>Freie Wahl der Grabgestaltung</p>
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

export default GrabStep;
