import React, { useState } from 'react';
import './WizardStep.css';

const GrabStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [selectedGrabart, setSelectedGrabart] = useState(formData.grabart || null);
  const [friedhof, setFriedhof] = useState(formData.friedhof || '');
  const [grabnummer, setGrabnummer] = useState(formData.grabnummer || '');
  const [nutzungsrechte, setNutzungsrechte] = useState(formData.nutzungsrechte || '');
  const [grabWünsche, setGrabWünsche] = useState(formData.grab_wünsche || '');
  const [grabstein, setGrabstein] = useState(formData.grabstein || '');
  const [bepflanzung, setBepflanzung] = useState(formData.bepflanzung || '');

  const handleGrabartSelect = (grabart) => {
    setSelectedGrabart(grabart);
    updateFormData({ grabart: grabart.id });
  };

  const handleFriedhofChange = (e) => {
    setFriedhof(e.target.value);
    updateFormData({ friedhof: e.target.value });
  };

  const handleGrabnummerChange = (e) => {
    setGrabnummer(e.target.value);
    updateFormData({ grabnummer: e.target.value });
  };

  const handleNutzungsrechteChange = (e) => {
    setNutzungsrechte(e.target.value);
    updateFormData({ nutzungsrechte: e.target.value });
  };

  const handleGrabWünscheChange = (e) => {
    setGrabWünsche(e.target.value);
    updateFormData({ grab_wünsche: e.target.value });
  };

  const handleGrabsteinChange = (e) => {
    setGrabstein(e.target.value);
    updateFormData({ grabstein: e.target.value });
  };

  const handleBepflanzungChange = (e) => {
    setBepflanzung(e.target.value);
    updateFormData({ bepflanzung: e.target.value });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-monument"></i>
        </div>
        <h2>🪦 Grab und Ruhestätte</h2>
        <p className="step-description">
          Das Grab ist der Ort der ewigen Ruhe und ein wichtiger Platz für die Trauer. 
          Gestalten Sie Ihre Ruhestätte nach Ihren Wünschen und Bedürfnissen.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Ewige Ruhe gestalten</div>
            <div className="info-text">
              Das Grab ist nicht nur ein Ort der Ruhe, sondern auch ein Platz für die Trauer 
              und das Gedenken. Wählen Sie sorgfältig die Art der Ruhestätte und deren Gestaltung.
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-list"></i>
            Art der Ruhestätte
          </label>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Wählen Sie die Art der Ruhestätte, die Ihren Wünschen entspricht:
          </p>
          
          <div className="radio-group">
            {categories.grabarten.map((grabart) => (
              <label key={grabart.id} className="radio-option">
                <input
                  type="radio"
                  name="grabart"
                  value={grabart.id}
                  checked={selectedGrabart?.id === grabart.id}
                  onChange={() => handleGrabartSelect(grabart)}
                  className="radio-input"
                />
                <div className="radio-card">
                  <div className="radio-icon">
                    {grabart.id === 1 && <i className="fas fa-user"></i>}
                    {grabart.id === 2 && <i className="fas fa-users"></i>}
                    {grabart.id === 3 && <i className="fas fa-leaf"></i>}
                    {grabart.id === 4 && <i className="fas fa-urn"></i>}
                  </div>
                  <div className="radio-title">{grabart.name}</div>
                  <div className="radio-description">{grabart.description}</div>
                  
                  <div className="art-details">
                    {grabart.id === 1 && (
                      <div className="detail-info">
                        <h4>Einzelgrab - Persönliche Ruhestätte</h4>
                        <ul>
                          <li><strong>Größe:</strong> 2,0 x 1,0 Meter</li>
                          <li><strong>Nutzungszeit:</strong> 15-25 Jahre</li>
                          <li><strong>Kosten:</strong> 1.000 - 3.000 €</li>
                          <li><strong>Vorteile:</strong> Persönlich, individuell gestaltbar</li>
                        </ul>
                      </div>
                    )}
                    
                    {grabart.id === 2 && (
                      <div className="detail-info">
                        <h4>Familiengrab - Gemeinsame Ruhestätte</h4>
                        <ul>
                          <li><strong>Größe:</strong> 2,0 x 1,2 Meter</li>
                          <li><strong>Nutzungszeit:</strong> 20-30 Jahre</li>
                          <li><strong>Kosten:</strong> 2.000 - 5.000 €</li>
                          <li><strong>Vorteile:</strong> Mehrere Personen, kostengünstiger</li>
                        </ul>
                      </div>
                    )}
                    
                    {grabart.id === 3 && (
                      <div className="detail-info">
                        <h4>Rasengrab - Natürlich und pflegeleicht</h4>
                        <ul>
                          <li><strong>Größe:</strong> 1,2 x 0,6 Meter</li>
                          <li><strong>Nutzungszeit:</strong> 15-20 Jahre</li>
                          <li><strong>Kosten:</strong> 500 - 1.500 €</li>
                          <li><strong>Vorteile:</strong> Günstig, pflegeleicht, natürlich</li>
                        </ul>
                      </div>
                    )}
                    
                    {grabart.id === 4 && (
                      <div className="detail-info">
                        <h4>Urnengrab - Kompakt und modern</h4>
                        <ul>
                          <li><strong>Größe:</strong> 0,8 x 0,6 Meter</li>
                          <li><strong>Nutzungszeit:</strong> 15-20 Jahre</li>
                          <li><strong>Kosten:</strong> 800 - 2.000 €</li>
                          <li><strong>Vorteile:</strong> Kompakt, modern, günstig</li>
                        </ul>
                      </div>
                    )}
                  </div>
                </div>
              </label>
            ))}
          </div>
        </div>

        {selectedGrabart && (
          <>
            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">🏛️</span>
                Friedhof und Lage
              </div>
              <div className="form-group">
                <label className="form-label required">Gewünschter Friedhof</label>
                <input
                  type="text"
                  value={friedhof}
                  onChange={handleFriedhofChange}
                  placeholder="z.B. Hauptfriedhof, Waldfriedhof, Friedhof der Gemeinde..."
                  className="form-input"
                />
              </div>
              
              <div className="form-group">
                <label className="form-label">Bereits vorhandene Grabnummer</label>
                <input
                  type="text"
                  value={grabnummer}
                  onChange={handleGrabnummerChange}
                  placeholder="z.B. Abteilung 12, Grab 345, Reihe 5..."
                  className="form-input"
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">📄</span>
                Nutzungsrechte und Dokumente
              </div>
              <div className="form-group">
                <label className="form-label">Nutzungsrechte und Dokumente</label>
                <textarea
                  value={nutzungsrechte}
                  onChange={handleNutzungsrechteChange}
                  placeholder="z.B. Nutzungsrechte für 20 Jahre, bereits vorhandene Dokumente, besondere Vereinbarungen..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">🪨</span>
                Grabstein und Gestaltung
              </div>
              <div className="form-group">
                <label className="form-label">Wünsche für Grabstein</label>
                <textarea
                  value={grabstein}
                  onChange={handleGrabsteinChange}
                  placeholder="z.B. Material (Granit, Marmor), Farbe, Größe, Inschrift, besondere Gestaltung..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">🌱</span>
                Bepflanzung und Pflege
              </div>
              <div className="form-group">
                <label className="form-label">Bepflanzungswünsche</label>
                <textarea
                  value={bepflanzung}
                  onChange={handleBepflanzungChange}
                  placeholder="z.B. Bestimmte Blumen, Sträucher, Bäume, pflegeleichte Pflanzen, bestimmte Farben..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">💭</span>
                Weitere Grabwünsche
              </div>
              <div className="form-group">
                <label className="form-label">Besondere Wünsche für das Grab</label>
                <textarea
                  value={grabWünsche}
                  onChange={handleGrabWünscheChange}
                  placeholder="z.B. Besondere Gestaltung, Sitzgelegenheit, Beleuchtung, besondere Rituale..."
                  className="form-textarea"
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">💰</span>
            Kostenübersicht Grabstätte
          </div>
          <div className="costs-grid">
            <div className="cost-item">
              <h4>Einzelgrab</h4>
              <div className="cost-range">1.000 - 3.000 €</div>
              <ul>
                <li>Grabstelle: 500 - 1.500 €</li>
                <li>Grabstein: 800 - 2.000 €</li>
                <li>Grabpflege: 200 - 500 €/Jahr</li>
                <li>Bepflanzung: 100 - 300 €</li>
              </ul>
            </div>
            
            <div className="cost-item">
              <h4>Familiengrab</h4>
              <div className="cost-range">2.000 - 5.000 €</div>
              <ul>
                <li>Grabstelle: 1.000 - 2.500 €</li>
                <li>Grabstein: 1.500 - 3.000 €</li>
                <li>Grabpflege: 300 - 700 €/Jahr</li>
                <li>Bepflanzung: 200 - 500 €</li>
              </ul>
            </div>
            
            <div className="cost-item">
              <h4>Rasengrab</h4>
              <div className="cost-range">500 - 1.500 €</div>
              <ul>
                <li>Grabstelle: 300 - 800 €</li>
                <li>Grabstein: 200 - 700 €</li>
                <li>Grabpflege: 100 - 300 €/Jahr</li>
                <li>Bepflanzung: 50 - 150 €</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Checkliste Grabstätte
          </div>
          <div className="checklist-grid">
            <div className="checklist-item">
              <h4>Vorbereitung</h4>
              <ul>
                <li>✓ Friedhof auswählen</li>
                <li>✓ Grabart festlegen</li>
                <li>✓ Lage des Grabes wählen</li>
                <li>✓ Nutzungsrechte klären</li>
                <li>✓ Kosten kalkulieren</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Gestaltung</h4>
              <ul>
                <li>✓ Grabstein auswählen</li>
                <li>✓ Inschrift festlegen</li>
                <li>✓ Bepflanzung planen</li>
                <li>✓ Besondere Wünsche</li>
                <li>✓ Pflege organisieren</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Dokumentation</h4>
              <ul>
                <li>✓ Nutzungsrechte dokumentieren</li>
                <li>✓ Kostenübersicht erstellen</li>
                <li>✓ Pflegevertrag abschließen</li>
                <li>✓ Kontakte sammeln</li>
                <li>✓ Wünsche dokumentieren</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Nutzungsrechte:</strong> Grabstätten werden für 15-30 Jahre vergeben, danach kann verlängert werden.</li>
                <li><strong>Pflege:</strong> Grabstätten müssen gepflegt werden, sonst kann die Nutzung beendet werden.</li>
                <li><strong>Kosten:</strong> Die genannten Preise sind Richtwerte und können regional stark variieren.</li>
                <li><strong>Verfügbarkeit:</strong> Nicht alle Grabstätten sind jederzeit verfügbar, frühzeitige Planung empfohlen.</li>
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
          disabled={!selectedGrabart}
        >
          Weiter
          <i className="fas fa-arrow-right"></i>
        </button>
      </div>
    </div>
  );
};

export default GrabStep;