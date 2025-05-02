
import { createRoot } from 'react-dom/client'
import App from './App.tsx'
import './index.css'

// Pour garantir que l'application se charge correctement
const container = document.getElementById("root");
if (!container) {
  console.error("L'élément racine n'a pas été trouvé");
} else {
  const root = createRoot(container);
  root.render(<App />);
}
