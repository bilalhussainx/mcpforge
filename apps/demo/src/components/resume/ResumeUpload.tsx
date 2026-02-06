'use client';

import { useState, useCallback, useRef } from 'react';
import { motion } from 'framer-motion';
import { Upload, FileText, X, Check, Loader2 } from 'lucide-react';

interface ResumeUploadProps {
  onUpload: (base64: string, filename: string) => void;
  uploadedFilename?: string | null;
  onClear?: () => void;
}

export default function ResumeUpload({ onUpload, uploadedFilename, onClear }: ResumeUploadProps) {
  const [dragOver, setDragOver] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const processFile = useCallback(
    async (file: File) => {
      setError(null);

      if (file.type !== 'application/pdf') {
        setError('Only PDF files are accepted');
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        setError('File too large. Maximum size is 10MB.');
        return;
      }

      setIsUploading(true);
      try {
        const formData = new FormData();
        formData.append('file', file);

        const response = await fetch('/api/upload', {
          method: 'POST',
          body: formData,
        });

        if (!response.ok) {
          const data = await response.json();
          throw new Error(data.error || 'Upload failed');
        }

        const data = await response.json();
        onUpload(data.base64, data.filename);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Upload failed');
      } finally {
        setIsUploading(false);
      }
    },
    [onUpload]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      setDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) processFile(file);
    },
    [processFile]
  );

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => setDragOver(false);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
    e.target.value = '';
  };

  if (uploadedFilename) {
    return (
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="flex items-center gap-3 rounded-lg border border-success/30 bg-success/5 p-3"
      >
        <div className="w-10 h-10 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
          <Check size={20} className="text-success" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-medium text-text truncate">{uploadedFilename}</p>
          <p className="text-xs text-text-muted">PDF uploaded successfully</p>
        </div>
        {onClear && (
          <button
            onClick={onClear}
            className="p-1.5 rounded text-text-muted hover:text-error transition-colors"
          >
            <X size={16} />
          </button>
        )}
      </motion.div>
    );
  }

  return (
    <div>
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        className={`cursor-pointer rounded-lg border-2 border-dashed p-6 text-center transition-all ${
          dragOver
            ? 'border-accent bg-accent/5'
            : 'border-border hover:border-accent/50 hover:bg-surface-light/20'
        }`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileChange}
          className="hidden"
        />

        {isUploading ? (
          <div className="flex flex-col items-center gap-2">
            <Loader2 size={32} className="text-accent animate-spin" />
            <p className="text-sm text-text-dim">Uploading...</p>
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2">
            <div className="w-12 h-12 rounded-xl bg-surface-light flex items-center justify-center">
              {dragOver ? (
                <FileText size={24} className="text-accent" />
              ) : (
                <Upload size={24} className="text-text-muted" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-text-dim">
                {dragOver ? 'Drop PDF here' : 'Upload Resume PDF'}
              </p>
              <p className="text-xs text-text-muted mt-0.5">
                Drag and drop or click to browse (max 10MB)
              </p>
            </div>
          </div>
        )}
      </div>

      {error && (
        <p className="mt-2 text-xs text-error">{error}</p>
      )}
    </div>
  );
}
