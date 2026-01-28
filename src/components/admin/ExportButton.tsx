'use client';

import { useState } from 'react';
import { Download, Loader2, Check } from 'lucide-react';
import { clsx } from 'clsx';

interface ExportButtonProps {
  data: Record<string, unknown>[];
  filename: string;
  headers?: { key: string; label: string }[];
}

export default function ExportButton({
  data,
  filename,
  headers,
}: ExportButtonProps) {
  const [isExporting, setIsExporting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const handleExport = () => {
    setIsExporting(true);

    try {
      // Determine headers
      const columnHeaders = headers || Object.keys(data[0] || {}).map((key) => ({
        key,
        label: key.charAt(0).toUpperCase() + key.slice(1).replace(/_/g, ' '),
      }));

      // Create CSV content
      const headerRow = columnHeaders.map((h) => h.label).join(',');
      const dataRows = data.map((row) =>
        columnHeaders
          .map((h) => {
            const value = row[h.key];
            // Escape values with commas or quotes
            if (value === null || value === undefined) return '';
            const stringValue = String(value);
            if (stringValue.includes(',') || stringValue.includes('"')) {
              return `"${stringValue.replace(/"/g, '""')}"`;
            }
            return stringValue;
          })
          .join(',')
      );

      const csv = [headerRow, ...dataRows].join('\n');

      // Download
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${filename}-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      // Show success state
      setShowSuccess(true);
      setTimeout(() => setShowSuccess(false), 2000);
    } catch (error) {
      console.error('Export failed:', error);
    } finally {
      setIsExporting(false);
    }
  };

  return (
    <button
      onClick={handleExport}
      disabled={isExporting || data.length === 0}
      className={clsx(
        'group relative flex items-center gap-2.5 px-5 py-2.5 rounded-xl',
        'font-medium text-sm',
        'transition-all duration-300 ease-out',
        'disabled:opacity-50 disabled:cursor-not-allowed',
        showSuccess
          ? 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white shadow-lg shadow-emerald-500/30'
          : 'bg-gradient-to-r from-slate-800/90 to-slate-800/70 backdrop-blur-sm border border-slate-700/50 text-white hover:border-slate-600/50 hover:shadow-xl hover:shadow-black/20 hover:scale-[1.02]'
      )}
    >
      {/* Shimmer effect */}
      <div className="absolute inset-0 rounded-xl overflow-hidden pointer-events-none">
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-500">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/[0.05] to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
        </div>
      </div>

      {isExporting ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>Exporting...</span>
        </>
      ) : showSuccess ? (
        <>
          <Check className="w-4 h-4" />
          <span>Exported!</span>
        </>
      ) : (
        <>
          <Download className="w-4 h-4 transition-transform group-hover:-translate-y-0.5 group-hover:scale-110" />
          <span>Export CSV</span>
        </>
      )}
    </button>
  );
}
