'use client';

import { useState, useRef, useCallback } from 'react';
import { Send, Paperclip, X, FileText, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface ChatInputProps {
  onSend: (message: string, resumePdf?: string | null) => void;
  isLoading: boolean;
  disabled?: boolean;
}

export default function ChatInput({ onSend, isLoading, disabled }: ChatInputProps) {
  const [input, setInput] = useState('');
  const [uploadedFile, setUploadedFile] = useState<{ name: string; base64: string } | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSubmit = useCallback(() => {
    const trimmed = input.trim();
    if (!trimmed || isLoading || disabled) return;
    onSend(trimmed, uploadedFile?.base64 || null);
    setInput('');
    setUploadedFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  }, [input, isLoading, disabled, onSend, uploadedFile]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSubmit();
    }
  };

  const handleTextareaChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setInput(e.target.value);
    const textarea = e.target;
    textarea.style.height = 'auto';
    textarea.style.height = `${Math.min(textarea.scrollHeight, 200)}px`;
  };

  const handleFileUpload = async (file: File) => {
    if (file.type !== 'application/pdf') {
      alert('Only PDF files are accepted');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('File too large. Maximum size is 10MB');
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
      setUploadedFile({ name: data.filename, base64: data.base64 });
    } catch (error) {
      alert(error instanceof Error ? error.message : 'Upload failed');
    } finally {
      setIsUploading(false);
    }
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFileUpload(file);
    e.target.value = '';
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  return (
    <div className="border-t border-border bg-surface-dark p-4">
      <AnimatePresence>
        {uploadedFile && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mb-3"
          >
            <div className="flex items-center gap-2 rounded-lg bg-surface px-3 py-2 text-sm">
              <FileText size={16} className="text-accent shrink-0" />
              <span className="text-text-dim truncate">{uploadedFile.name}</span>
              <button
                onClick={() => setUploadedFile(null)}
                className="ml-auto text-text-muted hover:text-error transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div
        className={`flex items-end gap-2 rounded-xl border ${
          dragOver ? 'border-accent bg-accent/5' : 'border-border'
        } bg-surface p-2 transition-colors`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <button
          onClick={() => fileInputRef.current?.click()}
          disabled={isUploading || isLoading}
          className="flex items-center justify-center rounded-lg p-2 text-text-muted hover:text-accent hover:bg-surface-light transition-colors disabled:opacity-50"
          title="Upload PDF resume"
        >
          {isUploading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Paperclip size={20} />
          )}
        </button>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf,application/pdf"
          onChange={handleFileInputChange}
          className="hidden"
        />

        <textarea
          ref={textareaRef}
          value={input}
          onChange={handleTextareaChange}
          onKeyDown={handleKeyDown}
          placeholder={
            dragOver
              ? 'Drop PDF here...'
              : 'Ask about resumes, portfolios, or GitHub repos...'
          }
          disabled={isLoading || disabled}
          rows={1}
          className="flex-1 resize-none bg-transparent text-text placeholder:text-text-muted outline-none text-sm leading-6 max-h-[200px] disabled:opacity-50"
        />

        <button
          onClick={handleSubmit}
          disabled={!input.trim() || isLoading || disabled}
          className="flex items-center justify-center rounded-lg bg-accent p-2 text-primary hover:bg-accent/90 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
        >
          {isLoading ? (
            <Loader2 size={20} className="animate-spin" />
          ) : (
            <Send size={20} />
          )}
        </button>
      </div>

      {dragOver && (
        <p className="mt-2 text-center text-xs text-accent">
          Drop your PDF resume here
        </p>
      )}
    </div>
  );
}
