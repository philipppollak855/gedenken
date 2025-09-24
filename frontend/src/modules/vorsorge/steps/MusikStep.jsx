import React, { useState } from 'react';
import './WizardStep.css';

const MusikStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [musikStücke, setMusikStücke] = useState(formData.musik_stücke || []);

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

  const addMusikStück = () => {
    const newStück = {
      id: Date.now(),
      interpret: '',
      titel: '',
      wann_gespielt: '',
      notizen: ''
    };
    const updated = [...musikStücke, newStück];
    setMusikStücke(updated);
    updateFormData({ musik_stücke: updated });
  };

  const removeMusikStück = (id) => {
    const updated = musikStücke.filter(stück => stück.id !== id);
    setMusikStücke(updated);
    updateFormData({ musik_stücke: updated });
  };

  const updateMusikStück = (id, field, value) => {
    const updated = musikStücke.map(stück => 
      stück.id === id ? { ...stück, [field]: value } : stück
    );
    setMusikStücke(updated);
    updateFormData({ musik_stücke: updated });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-music"></i>
        </div>
        <h2>🎵 Musik & Klang für die Trauerfeier</h2>
        <p className="step-description">
          Musik kann Trost spenden und Erinnerungen wachrufen. Wählen Sie Lieder und Musikstücke, 
          die Ihnen wichtig sind und die bei Ihrer Trauerfeier gespielt werden sollen.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Musik als Trostspender</div>
            <div className="info-text">
              Musik hat eine besondere Kraft in traurigen Momenten. Sie können bis zu 10 Lieder 
              auswählen und genau festlegen, wann sie gespielt werden sollen (z.B. beim Einzug, 
              während der Trauerrede, beim Auszug).
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-tags"></i>
            Musik-Kategorien (optional)
          </label>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Wählen Sie die Art der Musik, die Ihnen gefällt:
          </p>
          <div className="kategorien-grid">
            {categories.musikKategorien.map((kategorie) => (
              <div 
                key={kategorie.id}
                className={`kategorie-card ${isKategorieSelected(kategorie) ? 'selected' : ''}`}
                onClick={() => handleKategorieToggle(kategorie)}
              >
                <div className="kategorie-icon">
                  <i className="fas fa-music"></i>
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

        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-list"></i>
            Ihre Musikwünsche (bis zu 10 Lieder)
          </label>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Fügen Sie bis zu 10 Lieder hinzu, die bei Ihrer Trauerfeier gespielt werden sollen:
          </p>
          
          {musikStücke.map((stück, index) => (
            <div key={stück.id} className="music-item">
              <div className="music-item-header">
                <div className="music-item-number">{index + 1}</div>
                <button
                  type="button"
                  onClick={() => removeMusikStück(stück.id)}
                  className="remove-music-btn"
                  title="Lied entfernen"
                >
                  ×
                </button>
              </div>
              
              <div className="music-fields">
                <div className="form-group">
                  <label className="form-label required">Interpret/Künstler</label>
                  <input
                    type="text"
                    value={stück.interpret}
                    onChange={(e) => updateMusikStück(stück.id, 'interpret', e.target.value)}
                    placeholder="z.B. Frank Sinatra, Andrea Bocelli, U2..."
                    className="form-input"
                  />
                </div>
                
                <div className="form-group">
                  <label className="form-label required">Titel des Liedes</label>
                  <input
                    type="text"
                    value={stück.titel}
                    onChange={(e) => updateMusikStück(stück.id, 'titel', e.target.value)}
                    placeholder="z.B. My Way, Time to Say Goodbye, With or Without You..."
                    className="form-input"
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label className="form-label">Wann soll es gespielt werden?</label>
                <select
                  value={stück.wann_gespielt}
                  onChange={(e) => updateMusikStück(stück.id, 'wann_gespielt', e.target.value)}
                  className="form-select"
                >
                  <option value="">Bitte wählen...</option>
                  <option value="beim_einzug">Beim Einzug</option>
                  <option value="während_der_rede">Während der Trauerrede</option>
                  <option value="beim_auszug">Beim Auszug</option>
                  <option value="nach_der_feier">Nach der Feier</option>
                  <option value="bei_der_kerze">Beim Kerzenanzünden</option>
                  <option value="sonstiges">Sonstiges</option>
                </select>
              </div>
              
              <div className="form-group">
                <label className="form-label">Besondere Wünsche oder Notizen</label>
                <textarea
                  value={stück.notizen}
                  onChange={(e) => updateMusikStück(stück.id, 'notizen', e.target.value)}
                  placeholder="z.B. Besondere Version, Live-Musik gewünscht, bestimmte Strophe betonen..."
                  className="form-textarea"
                  rows={2}
                />
              </div>
            </div>
          ))}
          
          {musikStücke.length < 10 && (
            <button
              type="button"
              onClick={addMusikStück}
              className="add-music-btn"
            >
              <span>+</span> Weitere Musik hinzufügen
            </button>
          )}
          
          {musikStücke.length >= 10 && (
            <div className="info-box">
              <div className="info-content">
                <div className="info-title">Maximum erreicht</div>
                <div className="info-text">
                  Sie haben das Maximum von 10 Musikstücken erreicht. Sie können jederzeit 
                  Lieder entfernen und neue hinzufügen.
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="form-section">
          <label htmlFor="musik-wünsche" className="form-label">
            <i className="fas fa-comment"></i>
            Allgemeine Musikwünsche
          </label>
          <textarea
            id="musik-wünsche"
            className="form-textarea"
            value={formData.musik_wünsche}
            onChange={handleWünscheChange}
            placeholder="z.B. Keine traurige Musik, nur klassische Musik, bestimmte Instrumente bevorzugt, Live-Musik gewünscht..."
            rows={4}
          />
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtiger Hinweis</div>
            <div className="warning-text">
              Bitte beachten Sie, dass nicht alle Musikwünsche umsetzbar sein können. 
              Manche Lieder sind urheberrechtlich geschützt oder technisch nicht verfügbar. 
              Besprechen Sie Ihre Wünsche frühzeitig mit dem Bestatter.
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