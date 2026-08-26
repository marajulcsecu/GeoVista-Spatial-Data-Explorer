import { useState, useRef, type FC, type DragEvent, type ChangeEvent } from 'react';
import { Upload, FileCode, CheckCircle2, AlertTriangle, Loader2, Shield } from 'lucide-react';
import { useAppStore } from '../../app/store';
import { detectFormat } from '../../importers/detectFormat';
import { importGeoJSON } from '../../importers/importGeoJSON';
import { importShapefileZip } from '../../importers/importShapefileZip';
import { importCSV, parseCsvFile } from '../../importers/importCSV';

export const FileDropzone: FC = () => {
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { addDataset, setPendingCsvInfo, triggerFlyTo } = useAppStore();

  const handleProcessFile = async (file: File) => {
    setIsProcessing(true);
    setErrorMessage(null);

    try {
      const format = await detectFormat(file);

      if (format === 'geojson') {
        const dataset = await importGeoJSON(file);
        addDataset(dataset);
        const [minX, minY, maxX, maxY] = dataset.bbox;
        triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2);
      } else if (format === 'shapefile') {
        const dataset = await importShapefileZip(file);
        addDataset(dataset);
        const [minX, minY, maxX, maxY] = dataset.bbox;
        triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2);
      } else if (format === 'csv') {
        try {
          const dataset = await importCSV(file);
          addDataset(dataset);
          const [minX, minY, maxX, maxY] = dataset.bbox;
          triggerFlyTo((minX + maxX) / 2, (minY + maxY) / 2);
        } catch (csvErr: any) {
          if (csvErr.needsMapping) {
            setPendingCsvInfo({
              file,
              headers: csvErr.headers,
              rows: csvErr.rawRows
            });
          } else {
            throw csvErr;
          }
        }
      } else {
        throw new Error(
          `Unsupported file format for "${file.name}". Please upload standard GeoJSON (.json/.geojson), ESRI Shapefile (.zip), or Delimited CSV.`
        );
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Failed to process spatial file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleProcessFile(e.dataTransfer.files[0]);
    }
  };

  const onFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleProcessFile(e.target.files[0]);
    }
  };

  return (
    <div style={{ padding: '12px 14px' }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `1px dashed ${isDragging ? 'var(--border-focus)' : 'var(--border-strong)'}`,
          background: isDragging ? 'var(--bg-active)' : 'var(--bg-surface)',
          borderRadius: 'var(--radius-sm)',
          padding: '16px 12px',
          textAlign: 'center',
          cursor: isProcessing ? 'wait' : 'pointer',
          transition: 'var(--transition-fast)',
          position: 'relative'
        }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".geojson,.json,.zip,.csv,.tsv,.txt"
          style={{ display: 'none' }}
          onChange={onFileChange}
          disabled={isProcessing}
        />

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8 }}>
          <div
            style={{
              width: 32,
              height: 32,
              borderRadius: 'var(--radius-xs)',
              background: 'rgba(2, 132, 199, 0.1)',
              border: '1px solid rgba(56, 189, 248, 0.2)',
              color: 'var(--accent-cyan)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isProcessing ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Upload size={16} />
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: 12, color: 'var(--text-primary)' }}>
              {isProcessing ? 'Parsing Spatial Topology...' : 'Ingest Spatial Dataset'}
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
              Drag & drop layers or click to browse
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 4,
              marginTop: 2,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span className="badge badge-info">GEOJSON</span>
            <span className="badge badge-info">SHP (.ZIP)</span>
            <span className="badge badge-info">CSV (LAT/LON)</span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div
          style={{
            marginTop: 8,
            padding: '8px 10px',
            background: 'rgba(244, 63, 94, 0.08)',
            border: '1px solid rgba(244, 63, 94, 0.25)',
            borderRadius: 'var(--radius-xs)',
            color: '#fb7185',
            fontSize: 11,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 6
          }}
        >
          <AlertTriangle size={14} style={{ flexShrink: 0, marginTop: 1 }} />
          <div style={{ lineHeight: 1.3 }}>{errorMessage}</div>
        </div>
      )}

      {/* Security & Client-Side Notice */}
      <div
        style={{
          marginTop: 8,
          fontSize: 10,
          color: 'var(--text-muted)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 4,
          fontFamily: 'var(--font-mono)'
        }}
      >
        <Shield size={11} style={{ opacity: 0.7 }} />
        <span>100% Client-Side Ingestion • Zero Data Leakage</span>
      </div>
    </div>
  );
};
