'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Loader2, Upload, FileSpreadsheet, CheckCircle } from 'lucide-react';
import { ParsedData } from '@/types/migration';
import { cn } from '@/lib/utils';

interface FileUploadProps {
  onUpload: (data: ParsedData) => void;
}

export function FileUpload({ onUpload }: FileUploadProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploaded, setUploaded] = useState(false);
  const [fileInfo, setFileInfo] = useState<{ name: string; rows: number } | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleFile = async (file: File) => {
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData();
      formData.append('file', file);

      const res = await fetch('/api/migration/upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Upload failed');
      }

      setUploaded(true);
      setFileInfo({ name: data.fileName, rows: data.totalRows });
      onUpload({
        fields: data.fields,
        rows: data.rows,
        totalRows: data.totalRows,
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setLoading(false);
    }
  };

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) handleFile(file);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  }, []);

  const handleDragLeave = useCallback(() => {
    setIsDragging(false);
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
  };

  return (
    <div className="space-y-6">
      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={cn(
          'border-2 border-dashed rounded-lg p-12 text-center transition-colors',
          isDragging ? 'border-primary bg-primary/5' : 'border-muted-foreground/25',
          uploaded && 'border-green-500 bg-green-50'
        )}
      >
        {loading ? (
          <Loader2 className="mx-auto h-12 w-12 animate-spin text-muted-foreground" />
        ) : uploaded ? (
          <>
            <CheckCircle className="mx-auto h-12 w-12 text-green-500" />
            <p className="mt-4 text-green-700 font-medium">{fileInfo?.name}</p>
            <p className="text-sm text-green-600">{fileInfo?.rows} rows detected</p>
          </>
        ) : (
          <>
            <FileSpreadsheet className="mx-auto h-12 w-12 text-muted-foreground" />
            <p className="mt-4 text-muted-foreground">
              Drag and drop your file here, or click to browse
            </p>
            <p className="text-sm text-muted-foreground">
              Supports CSV, JSON, and Excel (.xlsx)
            </p>
          </>
        )}
      </div>

      {!uploaded && (
        <div className="flex justify-center">
          <Button asChild variant="outline">
            <label className="cursor-pointer">
              <Upload className="mr-2 h-4 w-4" />
              Choose File
              <input
                type="file"
                accept=".csv,.json,.xlsx,.xls"
                className="hidden"
                onChange={handleInputChange}
              />
            </label>
          </Button>
        </div>
      )}

      {error && (
        <Alert variant="destructive">
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}
    </div>
  );
}
