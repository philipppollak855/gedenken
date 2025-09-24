import React, { useState } from 'react';
import './WizardStep.css';

const BestattungsartStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [selectedArt, setSelectedArt] = useState(formData.bestattungsart || null);
  const [customWünsche, setCustomWünsche] = useState(formData.bestattungsart_notizen || '');

  const handleArtSelect = (art) => {
    setSelectedArt(art);
    updateFormData({ bestattungsart: art.id });
  };

  const handleWünscheChange = (e) => {
    setCustomWünsche(e.target.value);
    updateFormData({ bestattungsart_notizen: e.target.value });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-cross"></i>
        </div>
        <h2>⚱️ Bestattungsart wählen</h2>
        <p className="step-description">
          Die Wahl der Bestattungsart ist eine sehr persönliche Entscheidung. 
          Hier erfahren Sie alles über die verschiedenen Möglichkeiten und deren Besonderheiten.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Wichtige Entscheidung</div>
            <div className="info-text">
              Die Bestattungsart beeinflusst alle weiteren Schritte Ihrer Vorsorge. 
              Überlegen Sie sich, was Ihnen wichtig ist: Tradition, Umweltbewusstsein, 
              Kosten oder besondere Wünsche für den Abschied.
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-list"></i>
            Wählen Sie Ihre bevorzugte Bestattungsart
          </label>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Klicken Sie auf eine Option für detaillierte Informationen:
          </p>
          
          <div className="radio-group">
            {categories.bestattungsarten.map((art) => (
              <label key={art.id} className="radio-option">
                <input
                  type="radio"
                  name="bestattungsart"
                  value={art.id}
                  checked={selectedArt?.id === art.id}
                  onChange={() => handleArtSelect(art)}
                  className="radio-input"
                />
                <div className="radio-card">
                  <div className="radio-icon">
                    {art.id === 1 && <i className="fas fa-cross"></i>}
                    {art.id === 2 && <i className="fas fa-fire"></i>}
                    {art.id === 3 && <i className="fas fa-water"></i>}
                  </div>
                  <div className="radio-title">{art.name}</div>
                  <div className="radio-description">{art.description}</div>
                  
                  {/* Detaillierte Informationen */}
                  <div className="art-details">
                    {art.id === 1 && (
                      <div className="detail-info">
                        <h4>Erdbestattung - Traditionell und würdevoll</h4>
                        <ul>
                          <li><strong>Dauer:</strong> 15-20 Jahre Ruhezeit</li>
                          <li><strong>Kosten:</strong> 3.000 - 8.000 €</li>
                          <li><strong>Besonderheiten:</strong> Sarg erforderlich, Grabpflege nötig</li>
                          <li><strong>Vorteile:</strong> Traditionell, persönliches Grab, Besuchsmöglichkeit</li>
                        </ul>
                      </div>
                    )}
                    
                    {art.id === 2 && (
                      <div className="detail-info">
                        <h4>Feuerbestattung - Modern und flexibel</h4>
                        <ul>
                          <li><strong>Dauer:</strong> Urne kann überall beigesetzt werden</li>
                          <li><strong>Kosten:</strong> 2.000 - 5.000 €</li>
                          <li><strong>Besonderheiten:</strong> Einäscherung, Urne, vielfältige Beisetzungsmöglichkeiten</li>
                          <li><strong>Vorteile:</strong> Günstiger, umweltfreundlicher, flexible Gestaltung</li>
                        </ul>
                      </div>
                    )}
                    
                    {art.id === 3 && (
                      <div className="detail-info">
                        <h4>Seebestattung - Freiheit und Naturverbundenheit</h4>
                        <ul>
                          <li><strong>Dauer:</strong> Ewige Ruhe im Meer</li>
                          <li><strong>Kosten:</strong> 2.500 - 4.000 €</li>
                          <li><strong>Besonderheiten:</strong> Spezielle Urne, Seefahrt, Seekarte</li>
                          <li><strong>Vorteile:</strong> Besonders umweltfreundlich, keine Grabpflege</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedArt && (
          <div className="form-section">
            <label className="form-label">
              <i className="fas fa-comment"></i>
              Besondere Wünsche zur Bestattungsart
            </label>
            <textarea
              value={customWünsche}
              onChange={handleWünscheChange}
              placeholder="z.B. Besondere Sargwünsche, spezielle Urne, bestimmte Kleidung, religiöse Rituale..."
              className="form-textarea"
              rows={4}
            />
          </div>
        )}

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">💰</span>
            Kostenübersicht
          </div>
          <div className="costs-grid">
            <div className="cost-item">
              <h4>Erdbestattung</h4>
              <div className="cost-range">3.000 - 8.000 €</div>
              <ul>
                <li>Sarg: 1.000 - 3.000 €</li>
                <li>Grabstelle: 500 - 2.000 €</li>
                <li>Grabstein: 1.000 - 3.000 €</li>
                <li>Grabpflege: 200 - 500 €/Jahr</li>
              </ul>
            </div>
            
            <div className="cost-item">
              <h4>Feuerbestattung</h4>
              <div className="cost-range">2.000 - 5.000 €</div>
              <ul>
                <li>Einäscherung: 800 - 1.500 €</li>
                <li>Urne: 200 - 1.000 €</li>
                <li>Urnengrab: 300 - 1.000 €</li>
                <li>Alternative Beisetzung: 500 - 2.000 €</li>
              </ul>
            </div>
            
            <div className="cost-item">
              <h4>Seebestattung</h4>
              <div className="cost-range">2.500 - 4.000 €</div>
              <ul>
                <li>Einäscherung: 800 - 1.500 €</li>
                <li>Seebestattungsurne: 300 - 800 €</li>
                <li>Seefahrt: 1.000 - 1.500 €</li>
                <li>Seekarte: 200 - 500 €</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Rechtliche Aspekte:</strong> In Deutschland besteht Bestattungspflicht. Die Bestattung muss innerhalb von 8 Tagen erfolgen.</li>
                <li><strong>Umweltaspekte:</strong> Feuerbestattung und Seebestattung sind umweltfreundlicher als Erdbestattung.</li>
                <li><strong>Religiöse Aspekte:</strong> Manche Religionen haben spezielle Vorschriften für Bestattungen.</li>
                <li><strong>Kosten:</strong> Die genannten Preise sind Richtwerte und können regional stark variieren.</li>
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
          disabled={!selectedArt}
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default BestattungsartStep;