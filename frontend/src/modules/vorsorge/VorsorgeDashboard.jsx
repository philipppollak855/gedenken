import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import VorsorgeWizard from './VorsorgeWizard';
import VorsorgeOverview from './VorsorgeOverview';
import './VorsorgeDashboard.css';

const VorsorgeDashboard = () => {
  const [hasVorsorge, setHasVorsorge] = useState(false);
  const [vorsorge, setVorsorge] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showWizard, setShowWizard] = useState(false);
  
  const { get } = useApi();

  const loadVorsorge = useCallback(async () => {
    try {
      setLoading(true);
      try {
        const response = await get('/api/bestattungsvorsorge/my_vorsorge/');
        if (response?.data) {
          setVorsorge(response.data);
          setHasVorsorge(true);
        } else {
          setHasVorsorge(false);
        }
      } catch (apiError) {
        console.log('API nicht verfügbar oder keine Vorsorge vorhanden:', apiError);
        setHasVorsorge(false);
        // Fallback: Zeige Info-Screen wenn API nicht verfügbar
        setShowWizard(false);
      }
    } catch (error) {
      console.log('Fehler beim Laden der Vorsorge:', error);
      setHasVorsorge(false);
      setShowWizard(false);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadVorsorge();
  }, [loadVorsorge]);

  const handleStartVorsorge = () => {
    setShowWizard(true);
  };

  const handleWizardComplete = (vorsorgeData) => {
    setVorsorge(vorsorgeData);
    setHasVorsorge(true);
    setShowWizard(false);
  };

  const handleWizardCancel = () => {
    setShowWizard(false);
  };

  if (loading) {
    return (
      <div className="vorsorge-dashboard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Lade Vorsorge-Daten...</p>
        </div>
      </div>
    );
  }

  if (showWizard) {
    return (
      <VorsorgeWizard 
        onComplete={handleWizardComplete}
        onCancel={handleWizardCancel}
      />
    );
  }

  if (!hasVorsorge) {
    return (
      <div className="vorsorge-dashboard">
        <div className="vorsorge-infoscreen">
          <div className="infoscreen-header">
            <div className="infoscreen-icon">
              <i className="fas fa-heart"></i>
            </div>
            <h1>Bestattungsvorsorge</h1>
            <p className="infoscreen-subtitle">
              Planen Sie Ihre Bestattung im Voraus und entlasten Sie Ihre Angehörigen
            </p>
          </div>
          
          <div className="infoscreen-features">
            <div className="feature-grid">
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-cross"></i>
                </div>
                <h3>Bestattungsart wählen</h3>
                <p>Erdbestattung, Feuerbestattung, Seebestattung und mehr</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-church"></i>
                </div>
                <h3>Verabschiedung planen</h3>
                <p>Weltlich, religiös oder nach Ihren Wünschen</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-music"></i>
                </div>
                <h3>Musik & Redner</h3>
                <p>Ihre Lieblingsmusik und gewünschte Ansprachen</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-tombstone"></i>
                </div>
                <h3>Grab & Friedhof</h3>
                <p>Grabart, Friedhof und Grabgestaltung festlegen</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-file"></i>
                </div>
                <h3>Dokumente organisieren</h3>
                <p>Alle wichtigen Unterlagen sicher verwahren</p>
              </div>
              
              <div className="feature-card">
                <div className="feature-icon">
                  <i className="fas fa-laptop"></i>
                </div>
                <h3>Digitaler Nachlass</h3>
                <p>Online-Accounts und digitale Daten regeln</p>
              </div>
            </div>
          </div>
          
          <div className="infoscreen-benefits">
            <h2>Warum Bestattungsvorsorge?</h2>
            <div className="benefits-list">
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Entlasten Sie Ihre Angehörigen in einer schweren Zeit</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Ihre Wünsche werden respektiert und umgesetzt</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Kostenkontrolle durch frühzeitige Planung</span>
              </div>
              <div className="benefit-item">
                <i className="fas fa-check-circle"></i>
                <span>Rechtssicherheit für alle Beteiligten</span>
              </div>
            </div>
          </div>
          
          <div className="infoscreen-actions">
            <button 
              className="btn btn-primary btn-large"
              onClick={handleStartVorsorge}
            >
              <i className="fas fa-play"></i>
              Vorsorge starten
            </button>
            <p className="infoscreen-note">
              Die Vorsorge kann jederzeit bearbeitet und angepasst werden
            </p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <VorsorgeOverview 
      vorsorge={vorsorge}
      onEdit={() => setShowWizard(true)}
      onRefresh={loadVorsorge}
    />
  );
};

export default VorsorgeDashboard;