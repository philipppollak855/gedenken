import React, { useState } from 'react';
import './WizardStep.css';

const DigitalerNachlassStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [newNachlass, setNewNachlass] = useState({
    kategorie: '',
    plattform: '',
    benutzername: '',
    email: '',
    notizen: '',
    is_important: false
  });

  const handleAddNachlass = () => {
    if (newNachlass.kategorie && newNachlass.plattform) {
      const nachlass = {
        id: Date.now(),
        ...newNachlass,
        kategorie: categories.digitalerNachlassKategorien.find(k => k.id === parseInt(newNachlass.kategorie))
      };
      
      updateFormData({ 
        digitaler_nachlass: [...(formData.digitaler_nachlass || []), nachlass] 
      });
      
      setNewNachlass({
        kategorie: '',
        plattform: '',
        benutzername: '',
        email: '',
        notizen: '',
        is_important: false
      });
    }
  };

  const handleRemoveNachlass = (nachlassId) => {
    updateFormData({ 
      digitaler_nachlass: formData.digitaler_nachlass.filter(n => n.id !== nachlassId) 
    });
  };

  const handleInputChange = (field, value) => {
    setNewNachlass(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-laptop"></i>
        </div>
        <h2>Digitaler Nachlass</h2>
        <p className="step-description">
          Regeln Sie Ihre digitalen Accounts und Online-Aktivitäten für den Fall Ihres Todes.
        </p>
      </div>

      <div className="step-content">
        {/* Neuen Nachlass hinzufügen */}
        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-plus"></i>
            Neuen Account hinzufügen
          </label>
          <div className="nachlass-form">
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="kategorie">Kategorie</label>
                <select
                  id="kategorie"
                  value={newNachlass.kategorie}
                  onChange={(e) => handleInputChange('kategorie', e.target.value)}
                  className="form-select"
                >
                  <option value="">Kategorie wählen</option>
                  {categories.digitalerNachlassKategorien.map((kategorie) => (
                    <option key={kategorie.id} value={kategorie.id}>
                      {kategorie.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label htmlFor="plattform">Plattform/Service</label>
                <input
                  type="text"
                  id="plattform"
                  value={newNachlass.plattform}
                  onChange={(e) => handleInputChange('plattform', e.target.value)}
                  className="form-input"
                  placeholder="z.B. Facebook, Gmail, Amazon..."
                />
              </div>
            </div>
            
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="benutzername">Benutzername</label>
                <input
                  type="text"
                  id="benutzername"
                  value={newNachlass.benutzername}
                  onChange={(e) => handleInputChange('benutzername', e.target.value)}
                  className="form-input"
                  placeholder="Benutzername oder E-Mail"
                />
              </div>
              <div className="form-group">
                <label htmlFor="email">E-Mail</label>
                <input
                  type="email"
                  id="email"
                  value={newNachlass.email}
                  onChange={(e) => handleInputChange('email', e.target.value)}
                  className="form-input"
                  placeholder="E-Mail-Adresse"
                />
              </div>
            </div>
            
            <div className="form-group">
              <label htmlFor="notizen">Notizen</label>
              <textarea
                id="notizen"
                value={newNachlass.notizen}
                onChange={(e) => handleInputChange('notizen', e.target.value)}
                className="form-textarea"
                placeholder="Zusätzliche Informationen, Passwörter (verschlüsselt), wichtige Daten..."
                rows={3}
              />
            </div>
            
            <div className="form-group checkbox-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={newNachlass.is_important}
                  onChange={(e) => handleInputChange('is_important', e.target.checked)}
                  className="form-checkbox"
                />
                <span className="checkbox-text">Wichtiger Account (z.B. Banking, E-Mail)</span>
              </label>
            </div>
            
            <button 
              className="btn btn-primary"
              onClick={handleAddNachlass}
              disabled={!newNachlass.kategorie || !newNachlass.plattform}
            >
              <i className="fas fa-plus"></i>
              Account hinzufügen
            </button>
          </div>
        </div>

        {/* Bereits hinzugefügte Accounts */}
        {formData.digitaler_nachlass && formData.digitaler_nachlass.length > 0 && (
          <div className="form-section">
            <label className="form-label">
              <i className="fas fa-list"></i>
              Ihre digitalen Accounts
            </label>
            <div className="nachlass-list">
              {formData.digitaler_nachlass.map((nachlass) => (
                <div key={nachlass.id} className="nachlass-item">
                  <div className="nachlass-info">
                    <div className="nachlass-header">
                      <h4>{nachlass.plattform}</h4>
                      <span className="nachlass-category">{nachlass.kategorie.name}</span>
                      {nachlass.is_important && (
                        <span className="important-badge">
                          <i className="fas fa-exclamation"></i>
                          Wichtig
                        </span>
                      )}
                    </div>
                    {nachlass.benutzername && (
                      <p className="nachlass-username">
                        <i className="fas fa-user"></i>
                        {nachlass.benutzername}
                      </p>
                    )}
                    {nachlass.email && (
                      <p className="nachlass-email">
                        <i className="fas fa-envelope"></i>
                        {nachlass.email}
                      </p>
                    )}
                    {nachlass.notizen && (
                      <p className="nachlass-notizen">
                        <i className="fas fa-sticky-note"></i>
                        {nachlass.notizen}
                      </p>
                    )}
                  </div>
                  <div className="nachlass-actions">
                    <button 
                      className="remove-button"
                      onClick={() => handleRemoveNachlass(nachlass.id)}
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
              <h4>Häufige digitale Accounts</h4>
              <div className="help-grid">
                <div className="help-item">
                  <strong>Soziale Medien:</strong>
                  <ul>
                    <li>Facebook, Instagram, Twitter</li>
                    <li>LinkedIn, XING</li>
                    <li>TikTok, YouTube</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>E-Mail & Cloud:</strong>
                  <ul>
                    <li>Gmail, Outlook, Yahoo</li>
                    <li>Google Drive, Dropbox</li>
                    <li>iCloud, OneDrive</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>Banking & Finanzen:</strong>
                  <ul>
                    <li>Online-Banking</li>
                    <li>PayPal, Klarna</li>
                    <li>Kryptowährungen</li>
                  </ul>
                </div>
                <div className="help-item">
                  <strong>E-Commerce:</strong>
                  <ul>
                    <li>Amazon, eBay</li>
                    <li>Online-Shops</li>
                    <li>Abonnements</li>
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

export default DigitalerNachlassStep;
