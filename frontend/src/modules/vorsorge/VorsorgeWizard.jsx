import React, { useState, useEffect, useCallback } from 'react';
import { useApi } from '../../hooks/useApi';
import BestattungsartStep from './steps/BestattungsartStep';
import VerabschiedungStep from './steps/VerabschiedungStep';
import MusikStep from './steps/MusikStep';
import VereineStep from './steps/VereineStep';
import SpezielleWünscheStep from './steps/SpezielleWünscheStep';
import GrabStep from './steps/GrabStep';
import DokumenteStep from './steps/DokumenteStep';
import DigitalerNachlassStep from './steps/DigitalerNachlassStep';
import ZusammenfassungStep from './steps/ZusammenfassungStep';
import './VorsorgeWizard.css';

const VorsorgeWizard = ({ onComplete, onCancel }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    bestattungsart: null,
    bestattungsart_notizen: '',
    verabschiedungsart: null,
    verabschiedungsart_notizen: '',
    musik_wünsche: '',
    musik_kategorien: [],
    vereins_wünsche: '',
    vereins_kategorien: [],
    spezielle_wünsche: '',
    blumenschmuck: '',
    kleidung: '',
    grabart: null,
    friedhof: '',
    grabnummer: '',
    grab_wünsche: '',
    dokumente: [],
    digitaler_nachlass: []
  });
  const [loading, setLoading] = useState(false);
  const [categories, setCategories] = useState({
    bestattungsarten: [],
    verabschiedungsarten: [],
    musikKategorien: [],
    vereinsKategorien: [],
    grabarten: [],
    dokumentKategorien: [],
    digitalerNachlassKategorien: []
  });

  const { get, post } = useApi();

  const loadCategories = useCallback(async () => {
    try {
      setLoading(true);
      const [
        bestattungsarten,
        verabschiedungsarten,
        musikKategorien,
        vereinsKategorien,
        grabarten,
        dokumentKategorien,
        digitalerNachlassKategorien
      ] = await Promise.all([
        get('/api/bestattungsarten/'),
        get('/api/verabschiedungsarten/'),
        get('/api/musik-kategorien/'),
        get('/api/vereins-kategorien/'),
        get('/api/grabarten/'),
        get('/api/dokument-kategorien/'),
        get('/api/digitaler-nachlass-kategorien/')
      ]);

      setCategories({
        bestattungsarten: bestattungsarten.data || [],
        verabschiedungsarten: verabschiedungsarten.data || [],
        musikKategorien: musikKategorien.data || [],
        vereinsKategorien: vereinsKategorien.data || [],
        grabarten: grabarten.data || [],
        dokumentKategorien: dokumentKategorien.data || [],
        digitalerNachlassKategorien: digitalerNachlassKategorien.data || []
      });
    } catch (error) {
      console.error('Fehler beim Laden der Kategorien:', error);
    } finally {
      setLoading(false);
    }
  }, [get]);

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

  const steps = [
    { id: 'bestattungsart', title: 'Bestattungsart', icon: 'fas fa-cross' },
    { id: 'verabschiedung', title: 'Verabschiedung', icon: 'fas fa-church' },
    { id: 'musik', title: 'Musik', icon: 'fas fa-music' },
    { id: 'vereine', title: 'Vereine', icon: 'fas fa-users' },
    { id: 'spezielle-wünsche', title: 'Spezielle Wünsche', icon: 'fas fa-star' },
    { id: 'grab', title: 'Grab', icon: 'fas fa-tombstone' },
    { id: 'dokumente', title: 'Dokumente', icon: 'fas fa-file' },
    { id: 'digitaler-nachlass', title: 'Digitaler Nachlass', icon: 'fas fa-laptop' },
    { id: 'zusammenfassung', title: 'Zusammenfassung', icon: 'fas fa-check' }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSave = async () => {
    try {
      setLoading(true);
      
      // Erstelle oder aktualisiere Vorsorge
      const response = await post('/api/bestattungsvorsorge/create_vorsorge/', formData);
      
      if (response.data) {
        onComplete(response.data);
      }
    } catch (error) {
      console.error('Fehler beim Speichern:', error);
      alert('Fehler beim Speichern der Vorsorge. Bitte versuchen Sie es erneut.');
    } finally {
      setLoading(false);
    }
  };

  const updateFormData = (updates) => {
    setFormData(prev => ({ ...prev, ...updates }));
  };

  const renderStep = () => {
    const stepProps = {
      formData,
      updateFormData,
      categories,
      onNext: handleNext,
      onPrevious: handlePrevious,
      onSave: handleSave,
      onCancel
    };

    switch (currentStep) {
      case 0:
        return <BestattungsartStep {...stepProps} />;
      case 1:
        return <VerabschiedungStep {...stepProps} />;
      case 2:
        return <MusikStep {...stepProps} />;
      case 3:
        return <VereineStep {...stepProps} />;
      case 4:
        return <SpezielleWünscheStep {...stepProps} />;
      case 5:
        return <GrabStep {...stepProps} />;
      case 6:
        return <DokumenteStep {...stepProps} />;
      case 7:
        return <DigitalerNachlassStep {...stepProps} />;
      case 8:
        return <ZusammenfassungStep {...stepProps} />;
      default:
        return null;
    }
  };

  if (loading && currentStep === 0) {
    return (
      <div className="vorsorge-wizard">
        <div className="loading-spinner">
          <div className="spinner"></div>
          <p>Lade Kategorien...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="vorsorge-wizard">
      <div className="wizard-header">
        <div className="wizard-progress">
          <div className="progress-bar">
            <div 
              className="progress-fill"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            ></div>
          </div>
          <div className="progress-text">
            Schritt {currentStep + 1} von {steps.length}
          </div>
        </div>
        
        <div className="wizard-steps">
          {steps.map((step, index) => (
            <div 
              key={step.id}
              className={`wizard-step ${index === currentStep ? 'active' : ''} ${index < currentStep ? 'completed' : ''}`}
            >
              <div className="step-icon">
                <i className={step.icon}></i>
              </div>
              <div className="step-title">{step.title}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="wizard-content">
        {renderStep()}
      </div>
    </div>
  );
};

export default VorsorgeWizard;
