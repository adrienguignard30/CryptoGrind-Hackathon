// src/index.tsx
import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './global.css';
import './i18n'; // Importer la configuration i18next

const root = ReactDOM.createRoot(document.getElementById('root') as HTMLElement);
root.render(<App />);