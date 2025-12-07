'use client';

import { useState } from 'react';
import { Upload, FileText } from 'lucide-react';
import { validateFileSize, validateFileType } from '@/lib/utils';

interface FileUploaderProps {
  onFileUpload: (file: File) => void;
  accept?: string;
  maxSizeMB?: number;
}

export function FileUploader({
  onFileUpload,
  accept = '.csv,.xlsx,.xls',
  maxSizeMB = 10,
}: FileUploaderProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const allowedTypes = accept.split(',').map(t => t.replace('.', '').trim());

  const handleFile = (file: File) => {
    setError(null);

    // Check file type
    if (!validateFileType(file, allowedTypes)) {
      setError(`Invalid file type "${file.type || 'unknown'}". Please upload a ${accept} file.`);
      return;
    }

    // Check file size
    if (!validateFileSize(file, maxSizeMB)) {
      const fileSizeMB = (file.size / (1024 * 1024)).toFixed(2);
      setError(`File too large (${fileSizeMB}MB). Maximum size is ${maxSizeMB}MB.`);
      return;
    }

    // Check if file is empty
    if (file.size === 0) {
      setError('File is empty. Please upload a file with content.');
      return;
    }

    onFileUpload(file);
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = () => {
    setIsDragging(false);
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  };

  return (
    <div className="w-full">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-xl p-12 text-center transition-all duration-200
          ${isDragging
            ? 'border-bitcoin bg-bitcoin/10 scale-[1.02]'
            : 'border-border hover:border-border-light'
          }
        `}
      >
        <div className="flex flex-col items-center gap-4">
          <div className="w-16 h-16 bg-bitcoin/20 rounded-full flex items-center justify-center">
            {isDragging ? (
              <Upload className="w-8 h-8 text-bitcoin animate-pulse" />
            ) : (
              <FileText className="w-8 h-8 text-bitcoin" />
            )}
          </div>

          <div>
            <p className="text-lg font-medium mb-2">
              {isDragging ? 'Drop file here' : 'Drop file here or click to browse'}
            </p>
            <p className="text-text-secondary text-sm">
              Supported: {accept} • Max size: {maxSizeMB}MB
            </p>
          </div>

          <label className="btn-primary cursor-pointer">
            Browse Files
            <input
              type="file"
              accept={accept}
              onChange={handleFileInput}
              className="hidden"
            />
          </label>
        </div>
      </div>

      {error && (
        <div className="mt-4 p-4 bg-status-error/10 border border-status-error/30 rounded-lg">
          <p className="text-status-error text-sm">{error}</p>
        </div>
      )}
    </div>
  );
}
