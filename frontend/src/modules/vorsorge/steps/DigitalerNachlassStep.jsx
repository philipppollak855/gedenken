import React, { useState } from 'react';
import './WizardStep.css';

const DigitalerNachlassStep = ({ formData, updateFormData, categories, onNext, onPrevious, onCancel }) => {
  const [nachlassItems, setNachlassItems] = useState(formData.digitaler_nachlass || []);
  const [selectedKategorie, setSelectedKategorie] = useState('');

  const addNachlassItem = () => {
    const newItem = {
      id: Date.now(),
      kategorie: '',
      plattform: '',
      benutzername: '',
      email: '',
      passwort: '',
      notizen: '',
      is_important: false
    };
    const updated = [...nachlassItems, newItem];
    setNachlassItems(updated);
    updateFormData({ digitaler_nachlass: updated });
  };

  const removeNachlassItem = (id) => {
    const updated = nachlassItems.filter(item => item.id !== id);
    setNachlassItems(updated);
    updateFormData({ digitaler_nachlass: updated });
  };

  const updateNachlassItem = (id, field, value) => {
    const updated = nachlassItems.map(item => 
      item.id === id ? { ...item, [field]: value } : item
    );
    setNachlassItems(updated);
    updateFormData({ digitaler_nachlass: updated });
  };

  const getKategorieItems = (kategorieId) => {
    return nachlassItems.filter(item => item.kategorie === kategorieId);
  };

  return (
    <div className="wizard-step-content">
      <div className="step-header">
        <div className="step-icon">
          <i className="fas fa-laptop"></i>
        </div>
        <h2>💻 Digitaler Nachlass</h2>
        <p className="step-description">
          In der digitalen Welt hinterlassen wir viele Spuren. 
          Organisieren Sie Ihre digitalen Konten und geben Sie Anweisungen für deren Behandlung.
        </p>
      </div>

      <div className="step-content">
        <div className="info-box">
          <div className="info-content">
            <div className="info-title">Digitaler Nachlass verwalten</div>
            <div className="info-text">
              Digitale Konten, Social Media, E-Mails und Online-Services müssen nach dem Tod 
              verwaltet werden. Dokumentieren Sie alle wichtigen Zugänge und Wünsche.
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📱</span>
            Digitale Konten nach Kategorien
          </div>
          <p style={{ color: '#6c757d', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
            Organisieren Sie Ihre digitalen Konten nach Kategorien:
          </p>
          
          <div className="kategorien-tabs">
            {categories.digitalerNachlassKategorien.map((kategorie) => (
              <button
                key={kategorie.id}
                className={`kategorie-tab ${selectedKategorie === kategorie.id ? 'active' : ''}`}
                onClick={() => setSelectedKategorie(kategorie.id)}
              >
                <i className="fas fa-laptop"></i>
                {kategorie.name}
              </button>
            ))}
          </div>
        </div>

        {selectedKategorie && (
          <div className="form-section">
            <div className="section-title">
              <span className="section-icon">📝</span>
              {categories.digitalerNachlassKategorien.find(k => k.id === selectedKategorie)?.name} - Konten verwalten
            </div>
            
            {getKategorieItems(selectedKategorie).map((item, index) => (
              <div key={item.id} className="nachlass-item">
                <div className="nachlass-header">
                  <div className="nachlass-number">{index + 1}</div>
                  <div className="nachlass-important">
                    <label className="checkbox-option">
                      <input
                        type="checkbox"
                        checked={item.is_important}
                        onChange={(e) => updateNachlassItem(item.id, 'is_important', e.target.checked)}
                        className="checkbox-input"
                      />
                      <span className="checkbox-text">Wichtig</span>
                    </label>
                  </div>
                  <button
                    type="button"
                    onClick={() => removeNachlassItem(item.id)}
                    className="remove-nachlass-btn"
                    title="Konto entfernen"
                  >
                    ×
                  </button>
                </div>
                
                <div className="nachlass-fields">
                  <div className="form-group">
                    <label className="form-label required">Plattform/Service</label>
                    <input
                      type="text"
                      value={item.plattform}
                      onChange={(e) => updateNachlassItem(item.id, 'plattform', e.target.value)}
                      placeholder="z.B. Facebook, Gmail, Amazon, PayPal..."
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label required">Benutzername/E-Mail</label>
                    <input
                      type="text"
                      value={item.benutzername}
                      onChange={(e) => updateNachlassItem(item.id, 'benutzername', e.target.value)}
                      placeholder="z.B. benutzername@email.com oder @benutzername"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Passwort (verschlüsselt)</label>
                    <input
                      type="password"
                      value={item.passwort}
                      onChange={(e) => updateNachlassItem(item.id, 'passwort', e.target.value)}
                      placeholder="Passwort (wird verschlüsselt gespeichert)"
                      className="form-input"
                    />
                  </div>
                  
                  <div className="form-group">
                    <label className="form-label">Besondere Notizen</label>
                    <textarea
                      value={item.notizen}
                      onChange={(e) => updateNachlassItem(item.id, 'notizen', e.target.value)}
                      placeholder="z.B. Was soll mit dem Konto passieren? Löschen? Weiterführen? Besondere Wünsche..."
                      className="form-textarea"
                      rows={3}
                    />
                  </div>
                </div>
              </div>
            ))}
            
            <button
              type="button"
              onClick={addNachlassItem}
              className="add-nachlass-btn"
            >
              <span>+</span> Weitere Konten hinzufügen
            </button>
          </div>
        )}

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">🔐</span>
            Passwort-Management
          </div>
          <div className="password-tips">
            <div className="tip-item">
              <i className="fas fa-key"></i>
              <div>
                <h4>Passwort-Manager</h4>
                <p>Verwenden Sie einen Passwort-Manager für sichere Speicherung</p>
              </div>
            </div>
            
            <div className="tip-item">
              <i className="fas fa-shield-alt"></i>
              <div>
                <h4>Zwei-Faktor-Authentifizierung</h4>
                <p>Aktivieren Sie 2FA wo immer möglich</p>
              </div>
            </div>
            
            <div className="tip-item">
              <i className="fas fa-users"></i>
              <div>
                <h4>Vertrauenspersonen</h4>
                <p>Teilen Sie wichtige Zugänge mit vertrauten Personen</p>
              </div>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">📋</span>
            Checkliste Digitaler Nachlass
          </div>
          <div className="checklist-grid">
            <div className="checklist-item">
              <h4>Social Media</h4>
              <ul>
                <li>✓ Facebook</li>
                <li>✓ Instagram</li>
                <li>✓ Twitter</li>
                <li>✓ LinkedIn</li>
                <li>✓ TikTok</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>E-Mail & Kommunikation</h4>
              <ul>
                <li>✓ Gmail</li>
                <li>✓ Outlook</li>
                <li>✓ WhatsApp</li>
                <li>✓ Telegram</li>
                <li>✓ Signal</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Finanzen & Shopping</h4>
              <ul>
                <li>✓ Online-Banking</li>
                <li>✓ PayPal</li>
                <li>✓ Amazon</li>
                <li>✓ eBay</li>
                <li>✓ Kreditkarten</li>
              </ul>
            </div>
            
            <div className="checklist-item">
              <h4>Cloud & Speicher</h4>
              <ul>
                <li>✓ Google Drive</li>
                <li>✓ Dropbox</li>
                <li>✓ iCloud</li>
                <li>✓ OneDrive</li>
                <li>✓ Fotos & Videos</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="form-section">
          <div className="section-title">
            <span className="section-icon">⚖️</span>
            Rechtliche Aspekte
          </div>
          <div className="legal-info">
            <div className="legal-item">
              <h4>Erben und digitale Konten</h4>
              <p>Erben haben grundsätzlich Anspruch auf Zugang zu digitalen Konten, aber nicht auf Passwörter.</p>
            </div>
            
            <div className="legal-item">
              <h4>Datenschutz</h4>
              <p>Personenbezogene Daten unterliegen dem Datenschutz und müssen entsprechend behandelt werden.</p>
            </div>
            
            <div className="legal-item">
              <h4>Urheberrecht</h4>
              <p>Digitale Inhalte können urheberrechtlich geschützt sein und dürfen nicht einfach weitergegeben werden.</p>
            </div>
          </div>
        </div>

        <div className="warning-box">
          <div className="warning-content">
            <div className="warning-title">Wichtige Hinweise</div>
            <div className="warning-text">
              <ul>
                <li><strong>Sicherheit:</strong> Speichern Sie Passwörter niemals unverschlüsselt.</li>
                <li><strong>Zugang:</strong> Stellen Sie sicher, dass vertraute Personen Zugang zu wichtigen Konten haben.</li>
                <li><strong>Löschung:</strong> Manche Konten können nach dem Tod gelöscht werden, andere müssen weitergeführt werden.</li>
                <li><strong>Backup:</strong> Erstellen Sie regelmäßig Backups Ihrer wichtigen digitalen Daten.</li>
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

export default DigitalerNachlassStep;