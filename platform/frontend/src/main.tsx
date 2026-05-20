import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import './styles/globals.css';
import './lib/i18n'; // side-effect bootstrap — i18next ready before App renders

// CabinConnect entry point.
// Bolt 1 wires: design tokens (via globals.css), i18n (via ./lib/i18n).
// Bolt 2 will add: auth context, real API client, router.

const container = document.getElementById('root');
if (!container) {
  throw new Error('Root container not found — index.html template missing #root.');
}

createRoot(container).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
