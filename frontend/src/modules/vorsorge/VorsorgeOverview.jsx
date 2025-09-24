import React from 'react';
import './VorsorgeOverview.css';

const VorsorgeOverview = ({ vorsorge, onEdit, onRefresh }) => {
  const getCompletionColor = (percentage) => {
    if (percentage >= 80) return 'success';
    if (percentage >= 50) return 'warning';
    return 'danger';
  };

  const getCompletionText = (percentage) => {
    if (percentage >= 80) return 'Fast abgeschlossen';
    if (percentage >= 50) return 'In Bearbeitung';
    return 'Anfang';
  };

  return (
    <div className="vorsorge-overview">
      <div className="overview-header">
        <div className="header-content">
          <h1>Meine Bestattungsvorsorge</h1>
          <p className="header-subtitle">
            Übersicht Ihrer geplanten Bestattung
          </p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary" onClick={onRefresh}>
            <i className="fas fa-sync-alt"></i>
            Aktualisieren
          </button>
          <button className="btn btn-primary" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Bearbeiten
          </button>
        </div>
      </div>

      <div className="overview-content">
        {/* Fortschritt */}
        <div className="progress-section">
          <div className="progress-header">
            <h2>Fortschritt</h2>
            <span className={`progress-badge ${getCompletionColor(vorsorge.completion_percentage)}`}>
              {vorsorge.completion_percentage}%
            </span>
          </div>
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${vorsorge.completion_percentage}%` }}
            ></div>
          </div>
          <p className="progress-text">
            {getCompletionText(vorsorge.completion_percentage)}
          </p>
        </div>

        {/* Bestattungsart */}
        {vorsorge.bestattungsart && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-cross"></i>
              </div>
              <h3>Bestattungsart</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-label">Art:</span>
                <span className="info-value">{vorsorge.bestattungsart_name}</span>
              </div>
              {vorsorge.bestattungsart_notizen && (
                <div className="info-item">
                  <span className="info-label">Notizen:</span>
                  <span className="info-value">{vorsorge.bestattungsart_notizen}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Verabschiedung */}
        {vorsorge.verabschiedungsart && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-church"></i>
              </div>
              <h3>Verabschiedung</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-label">Art:</span>
                <span className="info-value">{vorsorge.verabschiedungsart_name}</span>
              </div>
              {vorsorge.verabschiedungsart_notizen && (
                <div className="info-item">
                  <span className="info-label">Notizen:</span>
                  <span className="info-value">{vorsorge.verabschiedungsart_notizen}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Musik */}
        {vorsorge.musik_wünsche && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-music"></i>
              </div>
              <h3>Musik</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-label">Wünsche:</span>
                <span className="info-value">{vorsorge.musik_wünsche}</span>
              </div>
              {vorsorge.musik_kategorien_names && vorsorge.musik_kategorien_names.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Kategorien:</span>
                  <div className="tags">
                    {vorsorge.musik_kategorien_names.map((kategorie, index) => (
                      <span key={index} className="tag">{kategorie}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Vereine */}
        {vorsorge.vereins_wünsche && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-users"></i>
              </div>
              <h3>Vereine</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-label">Wünsche:</span>
                <span className="info-value">{vorsorge.vereins_wünsche}</span>
              </div>
              {vorsorge.vereins_kategorien_names && vorsorge.vereins_kategorien_names.length > 0 && (
                <div className="info-item">
                  <span className="info-label">Kategorien:</span>
                  <div className="tags">
                    {vorsorge.vereins_kategorien_names.map((kategorie, index) => (
                      <span key={index} className="tag">{kategorie}</span>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Spezielle Wünsche */}
        {vorsorge.spezielle_wünsche && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-star"></i>
              </div>
              <h3>Spezielle Wünsche</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-value">{vorsorge.spezielle_wünsche}</span>
              </div>
            </div>
          </div>
        )}

        {/* Grab */}
        {vorsorge.grabart && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-tombstone"></i>
              </div>
              <h3>Grab</h3>
            </div>
            <div className="section-content">
              <div className="info-item">
                <span className="info-label">Grabart:</span>
                <span className="info-value">{vorsorge.grabart_name}</span>
              </div>
              {vorsorge.friedhof && (
                <div className="info-item">
                  <span className="info-label">Friedhof:</span>
                  <span className="info-value">{vorsorge.friedhof}</span>
                </div>
              )}
              {vorsorge.grabnummer && (
                <div className="info-item">
                  <span className="info-label">Grabnummer:</span>
                  <span className="info-value">{vorsorge.grabnummer}</span>
                </div>
              )}
              {vorsorge.grab_wünsche && (
                <div className="info-item">
                  <span className="info-label">Wünsche:</span>
                  <span className="info-value">{vorsorge.grab_wünsche}</span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Dokumente */}
        {vorsorge.dokumente && vorsorge.dokumente.length > 0 && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-file"></i>
              </div>
              <h3>Dokumente</h3>
            </div>
            <div className="section-content">
              <div className="documents-list">
                {vorsorge.dokumente.map((dokument) => (
                  <div key={dokument.id} className="document-item">
                    <div className="document-info">
                      <span className="document-title">{dokument.titel}</span>
                      <span className="document-category">{dokument.kategorie_name}</span>
                    </div>
                    <div className="document-status">
                      {dokument.is_uploaded ? (
                        <span className="status-badge success">
                          <i className="fas fa-check"></i>
                          Hochgeladen
                        </span>
                      ) : (
                        <span className="status-badge warning">
                          <i className="fas fa-clock"></i>
                          Ausstehend
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Digitaler Nachlass */}
        {vorsorge.digitaler_nachlass && vorsorge.digitaler_nachlass.length > 0 && (
          <div className="overview-section">
            <div className="section-header">
              <div className="section-icon">
                <i className="fas fa-laptop"></i>
              </div>
              <h3>Digitaler Nachlass</h3>
            </div>
            <div className="section-content">
              <div className="digital-nachlass-list">
                {vorsorge.digitaler_nachlass.map((nachlass) => (
                  <div key={nachlass.id} className="nachlass-item">
                    <div className="nachlass-info">
                      <span className="nachlass-platform">{nachlass.plattform}</span>
                      <span className="nachlass-category">{nachlass.kategorie_name}</span>
                      {nachlass.benutzername && (
                        <span className="nachlass-username">{nachlass.benutzername}</span>
                      )}
                    </div>
                    <div className="nachlass-status">
                      {nachlass.is_important && (
                        <span className="status-badge important">
                          <i className="fas fa-exclamation"></i>
                          Wichtig
                        </span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default VorsorgeOverview;
