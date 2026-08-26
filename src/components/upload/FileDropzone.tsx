import { useState, useRef, type FC, type DragEvent, type ChangeEvent } from 'react';
import { UploadCloud, FileType, CheckCircle2, AlertTriangle, Loader2 } from 'lucide-react';
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
          `Unsupported file format for "${file.name}". Please upload .geojson, .zip (Shapefile), or .csv.`
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
    <div style={{ padding: '14px 16px' }}>
      <div
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={onDrop}
        onClick={() => fileInputRef.current?.click()}
        style={{
          border: `2px dashed ${isDragging ? 'var(--accent-primary)' : 'var(--border-strong)'}`,
          background: isDragging ? 'var(--bg-hover)' : 'var(--bg-surface)',
          borderRadius: 'var(--radius-md)',
          padding: '24px 16px',
          textAlign: 'center',
          cursor: isProcessing ? 'wait' : 'pointer',
          transition: 'var(--transition-normal)',
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

        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 10 }}>
          <div
            style={{
              width: 44,
              height: 44,
              borderRadius: 'var(--radius-full)',
              background: 'rgba(59, 130, 246, 0.15)',
              color: 'var(--accent-primary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {isProcessing ? (
              <Loader2 size={24} className="animate-spin" />
            ) : (
              <UploadCloud size={24} />
            )}
          </div>

          <div>
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--text-primary)' }}>
              {isProcessing ? 'Parsing Spatial File...' : 'Drop your spatial file here'}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              or click to browse from your computer
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: 6,
              marginTop: 4,
              flexWrap: 'wrap',
              justifyContent: 'center'
            }}
          >
            <span className="badge badge-info">GeoJSON (.json)</span>
            <span className="badge badge-info">Shapefile (.zip)</span>
            <span className="badge badge-info">Coordinate CSV</span>
          </div>
        </div>
      </div>

      {/* Error Notice */}
      {errorMessage && (
        <div
          style={{
            marginTop: 12,
            padding: '10px 12px',
            background: 'rgba(244, 63, 94, 0.12)',
            border: '1px solid rgba(244, 63, 94, 0.3)',
            borderRadius: 'var(--radius-sm)',
            color: '#fb7185',
            fontSize: 12,
            display: 'flex',
            alignItems: 'flex-start',
            gap: 8
          }}
        >
          <AlertTriangle size={16} style={{ flexShrink: 0, marginTop: 2 }} />
          <div>{errorMessage}</div>
        </div>
      )}

      {/* Privacy Notice */}
      <div
        style={{
          marginTop: 10,
          fontSize: 11,
          color: 'var(--text-muted)',
          textAlign: 'center'
        }}
      >
        🔒 100% Client-Side. Files are processed locally and never leave your device.
      </div>
    </div>
  );
};
