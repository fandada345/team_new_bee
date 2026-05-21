import { createRoot } from 'react-dom/client';
import { HashRouter } from 'react-router-dom';
import { AnalysisProvider } from '@/hooks/useAnalysis';
import './index.css';
import App from './App.tsx';

createRoot(document.getElementById('root')!).render(
  <HashRouter>
    <AnalysisProvider>
      <App />
    </AnalysisProvider>
  </HashRouter>
);
