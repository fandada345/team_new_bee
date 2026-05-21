import { useState, useCallback } from 'react';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, X, Clock } from 'lucide-react';
import { useAnalysis } from '@/hooks/useAnalysis';

interface FileHistory {
  id: string;
  name: string;
  size: string;
  date: string;
  status: 'success' | 'error' | 'processing';
  transactions: number;
}

const fileHistory: FileHistory[] = [
  { id: '1', name: 'transactions_may.csv', size: '24.5 KB', date: 'May 18, 2025', status: 'success', transactions: 142 },
  { id: '2', name: 'transactions_april.csv', size: '21.2 KB', date: 'Apr 30, 2025', status: 'success', transactions: 128 },
  { id: '3', name: 'transactions_march.csv', size: '19.8 KB', date: 'Mar 31, 2025', status: 'success', transactions: 135 },
  { id: '4', name: 'invalid_file.csv', size: '0.5 KB', date: 'Mar 15, 2025', status: 'error', transactions: 0 },
];

export function UploadPage() {
  const { state, analyzeFile, clearError, resetUpload } = useAnalysis();
  const [dragActive, setDragActive] = useState(false);

  const handleFileSelect = useCallback((file: File) => {
    resetUpload();
    void analyzeFile(file);
  }, [analyzeFile, resetUpload]);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);
      const files = e.dataTransfer.files;
      if (files.length > 0) handleFileSelect(files[0]);
    },
    [handleFileSelect]
  );

  return (
    <div>
      <div className="fade-up" style={{ marginBottom: '24px' }}>
        <h1 className="font-geist" style={{ fontSize: '32px', fontWeight: 600, letterSpacing: '-0.02em' }}>Upload Data</h1>
        <p className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)', marginTop: '4px' }}>Import your transaction CSV files for analysis</p>
      </div>

      {/* Upload Zone */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '32px', marginBottom: '24px', animationDelay: '60ms' }}>
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => document.getElementById('csv-input')?.click()}
          style={{
            border: `2px dashed ${dragActive ? 'var(--text-primary)' : state.status === 'error' ? 'var(--severity-high)' : 'var(--border-subtle)'}`,
            borderRadius: '12px',
            padding: '48px',
            textAlign: 'center',
            background: dragActive ? 'var(--surface-overlay)' : state.status === 'error' ? 'rgba(239, 68, 68, 0.03)' : 'var(--surface-secondary)',
            transition: 'all 0.2s',
            cursor: 'pointer',
          }}
        >
          {state.status === 'uploading' || state.status === 'analyzing' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '40px', height: '40px', border: '3px solid var(--border-subtle)', borderTopColor: 'var(--text-primary)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
              <span className="font-geist" style={{ fontSize: '14px', color: 'var(--text-secondary)' }}>{state.status === 'uploading' ? 'Uploading file...' : 'Analyzing your spending data...'}</span>
            </div>
          ) : state.status === 'success' ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '12px' }}>
              <CheckCircle size={40} style={{ color: 'var(--chart-emerald)' }} />
              <span className="font-geist" style={{ fontSize: '16px', fontWeight: 500, color: 'var(--text-primary)' }}>Analysis Complete</span>
              <span className="font-geist" style={{ fontSize: '13px', color: 'var(--text-secondary)' }}>{state.fileName} &middot; {state.fileSize}</span>
              <button onClick={(e) => { e.stopPropagation(); resetUpload(); }} className="font-geist" style={{ marginTop: '8px', padding: '8px 20px', fontSize: '13px', background: 'var(--surface-tertiary)', border: '1px solid var(--border-subtle)', borderRadius: '6px', color: 'var(--text-primary)', cursor: 'pointer' }}>Upload Another</button>
            </div>
          ) : (
            <>
              <Upload size={40} style={{ color: 'var(--text-tertiary)', margin: '0 auto 16px' }} />
              <p className="font-geist" style={{ fontSize: '16px', color: 'var(--text-secondary)', marginBottom: '4px', fontWeight: 500 }}>Drop your CSV file here</p>
              <p className="font-geist" style={{ fontSize: '13px', color: 'var(--text-tertiary)' }}>or click to browse files</p>
            </>
          )}
          <input id="csv-input" type="file" accept=".csv" onChange={(e) => { const f = e.target.files; if (f && f[0]) handleFileSelect(f[0]); }} style={{ display: 'none' }} />
        </div>

        {state.status === 'error' && (
          <div style={{ display: 'flex', alignItems: 'start', gap: '12px', marginTop: '16px', padding: '14px 16px', background: 'rgba(239, 68, 68, 0.06)', border: '1px solid rgba(239, 68, 68, 0.15)', borderRadius: '8px' }}>
            <AlertCircle size={18} style={{ color: 'var(--severity-high)', flexShrink: 0, marginTop: '2px' }} />
            <div>
              <p className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--severity-high)', marginBottom: '4px' }}>Upload Failed</p>
              <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)' }}>{state.errorMessage || 'Please check your file format and try again.'}</p>
            </div>
            <button onClick={clearError} style={{ marginLeft: 'auto', background: 'transparent', border: 'none', color: 'var(--text-tertiary)', cursor: 'pointer' }}><X size={16} /></button>
          </div>
        )}

        {/* CSV Requirements */}
        <div style={{ marginTop: '20px', padding: '16px', background: 'var(--surface-secondary)', borderRadius: '8px' }}>
          <p className="font-geist" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', marginBottom: '10px', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Required CSV Format</p>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginBottom: '12px' }}>
            {['date', 'category', 'amount'].map(f => (
              <span key={f} className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)', background: 'var(--surface-tertiary)', borderRadius: '4px', padding: '4px 10px', border: '1px solid var(--border-subtle)' }}>{f}</span>
            ))}
            <span className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', borderRadius: '4px', padding: '4px 10px', border: '1px dashed var(--border-subtle)' }}>merchant (optional)</span>
          </div>
          <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', lineHeight: 1.5 }}>Supported date formats: YYYY-MM-DD, MM/DD/YYYY. Amount should be numeric without currency symbols.</p>
        </div>
      </div>

      {/* File History */}
      <div className="fade-up" style={{ background: 'var(--surface-primary)', border: '1px solid var(--border-subtle)', borderRadius: '8px', padding: '24px', animationDelay: '120ms' }}>
        <h2 className="font-geist" style={{ fontSize: '16px', fontWeight: 500, marginBottom: '4px' }}>Sample Upload History</h2>
        <p className="font-geist" style={{ fontSize: '12px', color: 'var(--text-tertiary)', marginBottom: '16px' }}>Example records shown until persistent upload history is added.</p>
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              {['File', 'Size', 'Date', 'Transactions', 'Status'].map(h => (
                <th key={h} className="font-geist" style={{ fontSize: '11px', fontWeight: 500, color: 'var(--text-tertiary)', textTransform: 'uppercase', letterSpacing: '0.03em', textAlign: 'left', padding: '10px 12px', borderBottom: '1px solid var(--border-subtle)' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {fileHistory.map(f => (
              <tr key={f.id} onMouseEnter={e => (e.currentTarget.style.background = 'var(--surface-secondary)')} onMouseLeave={e => (e.currentTarget.style.background = 'transparent')} style={{ transition: 'background 0.15s', cursor: 'pointer' }}>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <FileSpreadsheet size={16} style={{ color: f.status === 'success' ? 'var(--chart-emerald)' : 'var(--severity-high)' }} />
                    <span className="font-geist" style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text-primary)' }}>{f.name}</span>
                  </div>
                </td>
                <td className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{f.size}</td>
                <td className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{f.date}</td>
                <td className="font-geist" style={{ fontSize: '12px', color: 'var(--text-secondary)', padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>{f.transactions > 0 ? f.transactions.toLocaleString() : '—'}</td>
                <td style={{ padding: '12px', borderBottom: '1px solid var(--border-subtle)' }}>
                  {f.status === 'success' && <span className="font-geist" style={{ fontSize: '11px', color: 'var(--chart-emerald)', background: 'rgba(16, 185, 129, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>Analyzed</span>}
                  {f.status === 'error' && <span className="font-geist" style={{ fontSize: '11px', color: 'var(--severity-high)', background: 'rgba(239, 68, 68, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>Failed</span>}
                  {f.status === 'processing' && (
                    <span className="font-geist" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', fontSize: '11px', color: 'var(--severity-medium)', background: 'rgba(245, 158, 11, 0.08)', padding: '3px 8px', borderRadius: '4px' }}>
                      <Clock size={10} /> Processing
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
