import React from 'react';
import './VorsorgeOverview.css';

const VorsorgeOverview = ({ vorsorge, onEdit, onRefresh }) => {
  const getCompletionPercentage = () => {
    if (!vorsorge) return 0;
    
    let completed = 0;
    let total = 0;

    // Bestattungsart
    total++;
    if (vorsorge.bestattungsart) completed++;

    // Verabschiedungsart
    total++;
    if (vorsorge.verabschiedungsart) completed++;

    // Musik
    total++;
    if (vorsorge.musik_wünsche || vorsorge.musik_stücke?.length > 0) completed++;

    // Vereine
    total++;
    if (vorsorge.vereins_wünsche) completed++;

    // Spezielle Wünsche
    total++;
    if (vorsorge.spezielle_wünsche) completed++;

    // Grab
    total++;
    if (vorsorge.friedhof) completed++;

    // Dokumente
    total++;
    if (vorsorge.dokumente?.length > 0) completed++;

    // Digitaler Nachlass
    total++;
    if (vorsorge.digitaler_nachlass?.length > 0) completed++;

    return Math.round((completed / total) * 100);
  };

  const completionPercentage = getCompletionPercentage();

  return (
    <div className="vorsorge-overview">
      <div className="overview-header">
        <div className="overview-title">
          <h1>Ihre Bestattungsvorsorge</h1>
          <p>Übersicht und Verwaltung Ihrer Vorsorgeplanung</p>
        </div>
        
        <div className="overview-actions">
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

      <div className="completion-status">
        <div className="completion-circle">
          <div className="completion-percentage">{completionPercentage}%</div>
          <div className="completion-label">Vollständig</div>
        </div>
        <div className="completion-text">
          <h3>Ihre Vorsorge ist {completionPercentage}% vollständig</h3>
          <p>
            {completionPercentage >= 80 
              ? "Ausgezeichnet! Ihre Vorsorge ist sehr umfassend." 
              : completionPercentage >= 60 
              ? "Gut! Sie können noch weitere Details ergänzen." 
              : "Sie können noch weitere Bereiche ausfüllen."}
          </p>
        </div>
      </div>

      <div className="overview-sections">
        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-cross"></i>
            </div>
            <div className="section-title">
              <h3>Bestattungsart</h3>
              <p>Art der Bestattung</p>
            </div>
            <div className="section-status">
              {vorsorge.bestattungsart ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Ausgewählt
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.bestattungsart && (
            <div className="section-content">
              <p><strong>Gewählte Art:</strong> {vorsorge.bestattungsart}</p>
              {vorsorge.bestattungsart_notizen && (
                <p><strong>Notizen:</strong> {vorsorge.bestattungsart_notizen}</p>
              )}
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-church"></i>
            </div>
            <div className="section-title">
              <h3>Verabschiedung</h3>
              <p>Art der Trauerfeier</p>
            </div>
            <div className="section-status">
              {vorsorge.verabschiedungsart ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Geplant
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.verabschiedungsart && (
            <div className="section-content">
              <p><strong>Art der Feier:</strong> {vorsorge.verabschiedungsart}</p>
              {vorsorge.sarg_urne_wünsche && (
                <p><strong>Sarg/Urne:</strong> {vorsorge.sarg_urne_wünsche}</p>
              )}
              {vorsorge.kleidung && (
                <p><strong>Kleidung:</strong> {vorsorge.kleidung}</p>
              )}
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-music"></i>
            </div>
            <div className="section-title">
              <h3>Musik</h3>
              <p>Musikwünsche und Lieder</p>
            </div>
            <div className="section-status">
              {vorsorge.musik_wünsche || vorsorge.musik_stücke?.length > 0 ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Ausgewählt
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.musik_wünsche && (
            <div className="section-content">
              <p><strong>Musikwünsche:</strong> {vorsorge.musik_wünsche}</p>
            </div>
          )}
          {vorsorge.musik_stücke?.length > 0 && (
            <div className="section-content">
              <p><strong>Musikstücke:</strong> {vorsorge.musik_stücke.length} Lieder ausgewählt</p>
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-users"></i>
            </div>
            <div className="section-title">
              <h3>Vereine</h3>
              <p>Vereinsmitgliedschaften</p>
            </div>
            <div className="section-status">
              {vorsorge.vereins_wünsche ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Dokumentiert
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.vereins_wünsche && (
            <div className="section-content">
              <p><strong>Vereinswünsche:</strong> {vorsorge.vereins_wünsche}</p>
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-star"></i>
            </div>
            <div className="section-title">
              <h3>Spezielle Wünsche</h3>
              <p>Besondere Anliegen</p>
            </div>
            <div className="section-status">
              {vorsorge.spezielle_wünsche ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Dokumentiert
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.spezielle_wünsche && (
            <div className="section-content">
              <p><strong>Wünsche:</strong> {vorsorge.spezielle_wünsche}</p>
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-monument"></i>
            </div>
            <div className="section-title">
              <h3>Grab</h3>
              <p>Ruhestätte und Friedhof</p>
            </div>
            <div className="section-status">
              {vorsorge.friedhof ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  Geplant
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.friedhof && (
            <div className="section-content">
              <p><strong>Friedhof:</strong> {vorsorge.friedhof}</p>
              {vorsorge.grabnummer && (
                <p><strong>Grabnummer:</strong> {vorsorge.grabnummer}</p>
              )}
              {vorsorge.grab_wünsche && (
                <p><strong>Grabwünsche:</strong> {vorsorge.grab_wünsche}</p>
              )}
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-file-alt"></i>
            </div>
            <div className="section-title">
              <h3>Dokumente</h3>
              <p>Wichtige Unterlagen</p>
            </div>
            <div className="section-status">
              {vorsorge.dokumente?.length > 0 ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  {vorsorge.dokumente.length} Dokumente
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.dokumente?.length > 0 && (
            <div className="section-content">
              <p><strong>Anzahl Dokumente:</strong> {vorsorge.dokumente.length}</p>
            </div>
          )}
        </div>

        <div className="overview-section">
          <div className="section-header">
            <div className="section-icon">
              <i className="fas fa-laptop"></i>
            </div>
            <div className="section-title">
              <h3>Digitaler Nachlass</h3>
              <p>Online-Konten und Daten</p>
            </div>
            <div className="section-status">
              {vorsorge.digitaler_nachlass?.length > 0 ? (
                <span className="status-completed">
                  <i className="fas fa-check-circle"></i>
                  {vorsorge.digitaler_nachlass.length} Konten
                </span>
              ) : (
                <span className="status-pending">
                  <i className="fas fa-clock"></i>
                  Ausstehend
                </span>
              )}
            </div>
          </div>
          {vorsorge.digitaler_nachlass?.length > 0 && (
            <div className="section-content">
              <p><strong>Anzahl Konten:</strong> {vorsorge.digitaler_nachlass.length}</p>
            </div>
          )}
        </div>
      </div>

      <div className="overview-footer">
        <div className="footer-info">
          <p>
            <i className="fas fa-info-circle"></i>
            Ihre Vorsorge wird sicher gespeichert und kann jederzeit bearbeitet werden.
          </p>
        </div>
        <div className="footer-actions">
          <button className="btn btn-outline" onClick={onEdit}>
            <i className="fas fa-edit"></i>
            Vorsorge bearbeiten
          </button>
        </div>
      </div>
    </div>
  );
};

export default VorsorgeOverview;