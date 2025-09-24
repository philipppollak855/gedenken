import React, { useState } from 'react';
import './WizardStep.css';

const VerabschiedungStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [selectedArt, setSelectedArt] = useState(formData.verabschiedungsart || null);
  const [sargUrne, setSargUrne] = useState(formData.sarg_urne_wünsche || '');
  const [kleidung, setKleidung] = useState(formData.kleidung || '');
  const [blumenschmuck, setBlumenschmuck] = useState(formData.blumenschmuck || '');
  const [redner, setRedner] = useState(formData.redner || '');
  const [besondereWünsche, setBesondereWünsche] = useState(formData.verabschiedungsart_notizen || '');

  const handleArtSelect = (art) => {
    setSelectedArt(art);
    updateFormData({ verabschiedungsart: art.id });
  };

  const handleSargUrneChange = (e) => {
    setSargUrne(e.target.value);
    updateFormData({ sarg_urne_wünsche: e.target.value });
  };

  const handleKleidungChange = (e) => {
    setKleidung(e.target.value);
    updateFormData({ kleidung: e.target.value });
  };

  const handleBlumenschmuckChange = (e) => {
    setBlumenschmuck(e.target.value);
    updateFormData({ blumenschmuck: e.target.value });
  };

  const handleRednerChange = (e) => {
    setRedner(e.target.value);
    updateFormData({ redner: e.target.value });
  };

  const handleBesondereWünscheChange = (e) => {
    setBesondereWünsche(e.target.value);
    updateFormData({ verabschiedungsart_notizen: e.target.value });
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-church"></i>
        </div>
        <h2>⛪ Verabschiedungsfeier gestalten</h2>
        <p className="step-description">
          Die Verabschiedungsfeier ist der zentrale Moment des Abschieds. 
          Gestalten Sie eine würdige und persönliche Zeremonie nach Ihren Wünschen.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Persönliche Verabschiedung</div>
            <div className="info-text">
              Die Verabschiedungsfeier kann religiös oder weltlich gestaltet werden. 
              Wählen Sie den Rahmen, der Ihnen und Ihrer Familie am besten entspricht.
            </div>
          </div>
        </div>

        <div className="form-section">
          <label className="form-label">
            <i className="fas fa-list"></i>
            Art der Verabschiedungsfeier
          </label>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Wählen Sie zwischen religiöser oder weltlicher Verabschiedung:
          </p>
          
          <div className="radio-group">
            {categories.verabschiedungsarten.map((art) => (
              <label key={art.id} className="radio-option">
                <input
                  type="radio"
                  name="verabschiedungsart"
                  value={art.id}
                  checked={selectedArt?.id === art.id}
                  onChange={() => handleArtSelect(art)}
                  className="radio-input"
                />
                <div className="radio-card">
                  <div className="radio-icon">
                    {art.is_religious ? <i className="fas fa-church"></i> : <i className="fas fa-heart"></i>}
                  </div>
                  <div className="radio-title">{art.name}</div>
                  <div className="radio-description">{art.description}</div>
                  
                  <div className="art-details">
                    {art.is_religious ? (
                      <div className="detail-info">
                        <h4>Religiöse Verabschiedung</h4>
                        <ul>
                          <li><strong>Religion:</strong> {art.religion || 'Christlich'}</li>
                          <li><strong>Ort:</strong> Kirche, Kapelle oder Trauerhalle</li>
                          <li><strong>Rituale:</strong> Gebete, Segen, religiöse Lieder</li>
                          <li><strong>Dauer:</strong> 30-60 Minuten</li>
                        </ul>
                      </div>
                    ) : (
                      <div className="detail-info">
                        <h4>Weltliche Verabschiedung</h4>
                        <ul>
                          <li><strong>Ort:</strong> Trauerhalle, zu Hause, im Freien</li>
                          <li><strong>Gestaltung:</strong> Persönliche Worte, Musik, Gedichte</li>
                          <li><strong>Rituale:</strong> Kerzen anzünden, Blumen niederlegen</li>
                          <li><strong>Dauer:</strong> 20-90 Minuten</li>
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
          <>
            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">⚰️</span>
                Sarg oder Urne
              </div>
              <div className="form-group">
                <label className="form-label">Wünsche für Sarg oder Urne</label>
                <textarea
                  value={sargUrne}
                  onChange={handleSargUrneChange}
                  placeholder="z.B. Bestimmtes Holz, Farbe, Größe, Inschrift, besondere Gestaltung..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">👔</span>
                Kleidung und Erscheinungsbild
              </div>
              <div className="form-group">
                <label className="form-label">Gewünschte Kleidung</label>
                <textarea
                  value={kleidung}
                  onChange={handleKleidungChange}
                  placeholder="z.B. Bestimmtes Outfit, Lieblingskleidung, Anzug, Kleid, besondere Accessoires..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">🌸</span>
                Blumenschmuck
              </div>
              <div className="form-group">
                <label className="form-label">Blumenschmuck-Wünsche</label>
                <textarea
                  value={blumenschmuck}
                  onChange={handleBlumenschmuckChange}
                  placeholder="z.B. Bestimmte Blumen, Farben, Arrangements, Kränze, Gestecke..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">🎤</span>
                Redner und Trauerrede
              </div>
              <div className="form-group">
                <label className="form-label">Wünsche für Redner</label>
                <textarea
                  value={redner}
                  onChange={handleRednerChange}
                  placeholder="z.B. Bestimmte Person, Pfarrer, Trauerredner, Familienmitglied, besondere Wünsche für die Rede..."
                  className="form-textarea"
                  rows={3}
                />
              </div>
            </div>

            <div className="form-section">
              <div className="section-title">
                <span className="section-icon">💭</span>
                Besondere Wünsche
              </div>
              <div className="form-group">
                <label className="form-label">Weitere besondere Wünsche</label>
                <textarea
                  value={besondereWünsche}
                  onChange={handleBesondereWünscheChange}
                  placeholder="z.B. Besondere Rituale, Musik, Lesungen, persönliche Gegenstände, besondere Gestaltung des Raumes..."
                  className="form-textarea"
                  rows={4}
                />
              </div>
            </div>
          </>
        )}

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Checkliste Verabschiedungsfeier
          </div>
          <div className="checklist-grid">
            <div className="checklist-item">
              <h4>Vorbereitung</h4>
              <ul>
                <li>✓ Ort der Verabschiedung festlegen</li>
                <li>✓ Datum und Uhrzeit planen</li>
                <li>✓ Redner/Trauerredner beauftragen</li>
                <li>✓ Musik und Lieder auswählen</li>
                <li>✓ Blumenschmuck bestellen</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Durchführung</h4>
              <ul>
                <li>✓ Sarg/Urne würdig aufstellen</li>
                <li>✓ Blumenschmuck arrangieren</li>
                <li>✓ Musik und Technik vorbereiten</li>
                <li>✓ Sitzplätze für Trauergäste</li>
                <li>✓ Kerzen und Beleuchtung</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Nach der Feier</h4>
              <ul>
                <li>✓ Blumenschmuck mitnehmen</li>
                <li>✓ Kondolenzbuch auslegen</li>
                <li>✓ Trauerkaffee organisieren</li>
                <li>✓ Danksagungen vorbereiten</li>
                <li>✓ Erinnerungsstücke sammeln</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Rechtliche Aspekte:</strong> Die Verabschiedungsfeier muss innerhalb von 8 Tagen nach dem Tod stattfinden.</li>
                <li><strong>Kosten:</strong> Trauerhalle, Redner, Blumenschmuck und Musik verursachen zusätzliche Kosten.</li>
                <li><strong>Kapazität:</strong> Prüfen Sie die maximale Teilnehmerzahl des gewählten Ortes.</li>
                <li><strong>Technik:</strong> Besprechen Sie technische Anforderungen (Mikrofon, Musik, Beleuchtung) frühzeitig.</li>
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

export default VerabschiedungStep;