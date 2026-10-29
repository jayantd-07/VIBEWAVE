import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import './index.css';

// Register offline Service Worker for PWA support
if ('serviceWorker' in navigator && process.env.NODE_ENV === 'production') {
  window.addEventListener('load', () => {
    navigator.serviceWorker
      .register('/sw.js')
      .then((reg) => console.log('Vibewave SW registered:', reg.scope))
      .catch((err) => console.warn('Vibewave SW registration failed:', err));
  });
}

createRoot(document.getElementById('root')!).render(<App />);
