// frontend/src/index.js
// Dies ist der Haupteinstiegspunkt für den JavaScript-Code.

import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Importiert grundlegende Stile
import App from './App';

// Sucht das 'root'-div in der index.html und rendert unsere <App /> Komponente hinein.
const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
