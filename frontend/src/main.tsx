import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.scss';

// Log build version
declare const __BUILD_VERSION__: string;
declare const __BUILD_TIME__: string;
console.log(`%cOmnisGM v${__BUILD_VERSION__}`, 'color: #7c3aed; font-weight: bold; font-size: 14px;');
console.log(`Build: ${__BUILD_TIME__}`);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
