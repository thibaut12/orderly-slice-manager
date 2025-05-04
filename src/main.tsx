
import React from 'react'
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Récupération de l'élément racine et rendu de l'application
const container = document.getElementById("root");
if (!container) {
  console.error("L'élément racine n'a pas été trouvé");
} else {
  const root = createRoot(container);
  root.render(
    <React.StrictMode>
      <App />
    </React.StrictMode>
  );
}
