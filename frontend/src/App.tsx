import { useEffect } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { TopNav } from '@/components/TopNav';
import { Sidebar } from '@/components/Sidebar';
import {
  DashboardPage,
  UploadPage,
  ReportsPage,
  SettingsPage,
  InsightsPage,
  AnomaliesPage,
  CategoriesPage,
} from '@/pages';
import './App.css';

function App() {
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);

  // Inject animations
  useEffect(() => {
    const style = document.createElement('style');
    style.textContent = `
      @keyframes spin { to { transform: rotate(360deg); } }
      .fade-up {
        opacity: 0;
        transform: translateY(20px);
        animation: fadeUp 800ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes fadeUp {
        to { opacity: 1; transform: translateY(0); }
      }
      .table-row {
        opacity: 0;
        transform: translateX(-10px);
        animation: tableRowIn 500ms cubic-bezier(0.16, 1, 0.3, 1) forwards;
      }
      @keyframes tableRowIn {
        to { opacity: 1; transform: translateX(0); }
      }
    `;
    document.head.appendChild(style);
    return () => { document.head.removeChild(style); };
  }, []);

  return (
    <div style={{ background: 'var(--canvas)', minHeight: '100vh', color: 'var(--text-primary)' }}>
      <TopNav />
      <Sidebar />

      <main style={{ marginLeft: '256px', marginTop: '48px', padding: '32px', minHeight: 'calc(100vh - 48px)' }}>
        <Routes>
          <Route path="/" element={<DashboardPage />} />
          <Route path="/upload" element={<UploadPage />} />
          <Route path="/reports" element={<ReportsPage />} />
          <Route path="/settings" element={<SettingsPage />} />
          <Route path="/insights" element={<InsightsPage />} />
          <Route path="/anomalies" element={<AnomaliesPage />} />
          <Route path="/categories" element={<CategoriesPage />} />
        </Routes>
      </main>
    </div>
  );
}

export default App;
