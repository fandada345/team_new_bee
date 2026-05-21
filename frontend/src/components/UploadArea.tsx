import { useCallback } from 'react';
import { Upload, FileSpreadsheet, AlertCircle, X } from 'lucide-react';
import type { AppState, ErrorType } from '@/types';

interface UploadAreaProps {
  state: AppState;
  onFileSelect: (file: File) => void;
  onClear: () => void;
}

const errorMessages: Record<Exclude<ErrorType, null>, { title: string; message: string }> = {
  invalid_csv: {
    title: 'Invalid CSV File',
    message: 'The file could not be parsed as a valid CSV. Please check the file format.',
  },
  missing_columns: {
    title: 'Missing Required Columns',
    message: 'CSV must include: date, category, amount. Optional: merchant. Please check your headers.',
  },
  invalid_dates: {
    title: 'Invalid Date Format',
    message: 'Date column contains unrecognized formats. Use YYYY-MM-DD or MM/DD/YYYY.',
  },
  invalid_amounts: {
    title: 'Invalid Amount Format',
    message: 'Amount column should contain numeric values. Remove currency symbols or commas.',
  },
  network_error: {
    title: 'Network Error',
    message: 'Could not connect to the analysis server. Please try again.',
  },
  empty_file: {
    title: 'Empty File',
    message: 'The uploaded CSV file contains no data rows.',
  },
};

export function UploadArea({ state, onFileSelect, onClear }: UploadAreaProps) {
  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      const files = e.dataTransfer.files;
      if (files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const files = e.target.files;
      if (files && files.length > 0) {
        onFileSelect(files[0]);
      }
    },
    [onFileSelect]
  );

  return (
    <div
      className="fade-up"
      style={{
        background: 'var(--surface-primary)',
        border: '1px solid var(--border-subtle)',
        borderRadius: '8px',
        padding: '24px',
        animationDelay: '120ms',
      }}
    >
      <div className="flex items-center gap-2 mb-5">
        <Upload size={16} style={{ color: 'var(--text-tertiary)' }} />
        <h2
          className="font-geist"
          style={{
            fontSize: '16px',
            fontWeight: 500,
            color: 'var(--text-primary)',
          }}
        >
          Upload CSV
        </h2>
      </div>

      {/* Drop Zone */}
      <div
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        style={{
          border: `2px dashed ${
            state.status === 'error' ? 'var(--severity-high)' : 'var(--border-subtle)'
          }`,
          borderRadius: '8px',
          padding: '32px',
          textAlign: 'center',
          background: state.status === 'error' ? 'rgba(239, 68, 68, 0.03)' : 'var(--surface-secondary)',
          transition: 'border-color 0.2s, background 0.2s',
          cursor: 'pointer',
        }}
        onClick={() => document.getElementById('csv-input')?.click()}
        onMouseEnter={(e) => {
          if (state.status !== 'error') {
            e.currentTarget.style.borderColor = 'var(--border-focus)';
          }
        }}
        onMouseLeave={(e) => {
          if (state.status !== 'error') {
            e.currentTarget.style.borderColor = 'var(--border-subtle)';
          }
        }}
      >
        {state.status === 'uploading' || state.status === 'analyzing' ? (
          <div className="flex flex-col items-center gap-3">
            <div
              style={{
                width: '32px',
                height: '32px',
                border: '2px solid var(--border-subtle)',
                borderTopColor: 'var(--text-primary)',
                borderRadius: '50%',
                animation: 'spin 0.8s linear infinite',
              }}
            />
            <span
              className="font-geist"
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
              }}
            >
              {state.status === 'uploading' ? 'Uploading file...' : 'Analyzing data...'}
            </span>
          </div>
        ) : (
          <>
            <FileSpreadsheet
              size={28}
              style={{
                color: 'var(--text-tertiary)',
                margin: '0 auto 12px',
              }}
            />
            <p
              className="font-geist"
              style={{
                fontSize: '13px',
                color: 'var(--text-secondary)',
                marginBottom: '4px',
              }}
            >
              Drag & drop your CSV file here
            </p>
            <p
              className="font-geist"
              style={{
                fontSize: '11px',
                color: 'var(--text-tertiary)',
              }}
            >
              or click to browse files
            </p>
          </>
        )}
        <input
          id="csv-input"
          type="file"
          accept=".csv"
          onChange={handleFileInput}
          style={{ display: 'none' }}
        />
      </div>

      {/* File Info */}
      {state.fileName && state.status !== 'error' && (
        <div
          className="flex items-center justify-between mt-4"
          style={{
            background: 'var(--surface-secondary)',
            borderRadius: '6px',
            padding: '10px 14px',
          }}
        >
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={16} style={{ color: 'var(--chart-emerald)' }} />
            <div>
              <p
                className="font-geist"
                style={{ fontSize: '12px', color: 'var(--text-primary)', fontWeight: 500 }}
              >
                {state.fileName}
              </p>
              <p
                className="font-geist"
                style={{ fontSize: '11px', color: 'var(--text-tertiary)' }}
              >
                {state.fileSize}
              </p>
            </div>
          </div>
          <button
            onClick={onClear}
            style={{
              background: 'transparent',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-tertiary)',
              padding: '4px',
              borderRadius: '4px',
              transition: 'color 0.2s',
            }}
            onMouseEnter={(e) => (e.currentTarget.style.color = 'var(--text-primary)')}
            onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--text-tertiary)')}
          >
            <X size={14} />
          </button>
        </div>
      )}

      {/* Error State */}
      {state.status === 'error' && state.errorType && (
        <div
          className="flex items-start gap-3 mt-4"
          style={{
            background: 'rgba(239, 68, 68, 0.06)',
            border: '1px solid rgba(239, 68, 68, 0.15)',
            borderRadius: '6px',
            padding: '14px 16px',
          }}
        >
          <AlertCircle size={16} style={{ color: 'var(--severity-high)', flexShrink: 0, marginTop: '2px' }} />
          <div>
            <p
              className="font-geist"
              style={{ fontSize: '12px', fontWeight: 500, color: 'var(--severity-high)', marginBottom: '4px' }}
            >
              {errorMessages[state.errorType]?.title || 'Error'}
            </p>
            <p
              className="font-geist"
              style={{ fontSize: '12px', color: 'var(--text-secondary)', lineHeight: 1.5 }}
            >
              {errorMessages[state.errorType]?.message || state.errorMessage}
            </p>
          </div>
        </div>
      )}

      {/* CSV Requirements Hint */}
      <div
        className="mt-4"
        style={{
          background: 'var(--surface-secondary)',
          borderRadius: '6px',
          padding: '12px 14px',
        }}
      >
        <p
          className="font-geist"
          style={{
            fontSize: '11px',
            fontWeight: 500,
            color: 'var(--text-tertiary)',
            marginBottom: '6px',
            textTransform: 'uppercase',
            letterSpacing: '0.03em',
          }}
        >
          Required CSV Format
        </p>
        <div className="flex flex-wrap gap-2">
          {['date', 'category', 'amount'].map((field) => (
            <span
              key={field}
              className="font-geist"
              style={{
                fontSize: '11px',
                color: 'var(--text-secondary)',
                background: 'var(--surface-tertiary)',
                borderRadius: '4px',
                padding: '3px 8px',
                border: '1px solid var(--border-subtle)',
              }}
            >
              {field}
            </span>
          ))}
          <span
            className="font-geist"
            style={{
              fontSize: '11px',
              color: 'var(--text-tertiary)',
              background: 'transparent',
              borderRadius: '4px',
              padding: '3px 8px',
              border: '1px dashed var(--border-subtle)',
            }}
          >
            merchant (optional)
          </span>
        </div>
      </div>
    </div>
  );
}
