'use client';

import { useState, type ReactNode } from 'react';
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import { Loader2 } from 'lucide-react';

interface Props {
  invoiceId?: string;
  fileName: string;
  targetId?: string;
  className?: string;
  children?: ReactNode;
}

export default function InvoiceDownloadButton({ invoiceId, fileName, targetId = 'invoice-preview', className, children }: Props) {
  const [isDownloading, setIsDownloading] = useState(false);

  const handleDownload = async () => {
    if (isDownloading) return;
    setIsDownloading(true);

    try {
      // Method 1: Fetch PDF from server API endpoint if invoiceId is available
      if (invoiceId) {
        try {
          const res = await fetch(`/api/invoices/${invoiceId}/pdf`, {
            credentials: 'include'
          });

          if (res.ok) {
            const blob = await res.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            window.URL.revokeObjectURL(url);
            setIsDownloading(false);
            return;
          }
        } catch (apiErr) {
          console.warn('API PDF download failed, trying client-side fallback:', apiErr);
        }
      }

      // Method 2: Client-side DOM canvas export fallback
      if ((document as unknown as { fonts?: { ready: Promise<void> } }).fonts?.ready) {
        await (document as unknown as { fonts?: { ready: Promise<void> } }).fonts!.ready;
      }

      const el = document.getElementById(targetId);
      if (!el) {
        alert('Elemen invoice tidak ditemukan');
        setIsDownloading(false);
        return;
      }

      const canvas = await html2canvas(el, {
        scale: 2,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: '#ffffff',
        onclone: (clonedDoc) => {
          const clonedEl = clonedDoc.getElementById(targetId);
          if (clonedEl) {
            clonedEl.style.backgroundColor = '#ffffff';
            clonedEl.style.color = '#0f172a';
          }
        }
      });

      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const imgWidth = pageWidth;
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      let heightLeft = imgHeight;
      let position = 0;
      pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
      heightLeft -= pageHeight;

      while (heightLeft > 0) {
        pdf.addPage();
        position = heightLeft - imgHeight;
        pdf.addImage(imgData, 'PNG', 0, position, imgWidth, imgHeight);
        heightLeft -= pageHeight;
      }

      pdf.save(fileName.endsWith('.pdf') ? fileName : `${fileName}.pdf`);
    } catch (e) {
      console.error('PDF Download Error:', e);
      alert('Gagal membuat PDF. Silakan coba lagi.');
    } finally {
      setIsDownloading(false);
    }
  };

  return (
    <button
      onClick={handleDownload}
      disabled={isDownloading}
      className={className || 'app-btn-primary disabled:opacity-50'}
    >
      {isDownloading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin shrink-0" />
          <span>Mengunduh...</span>
        </>
      ) : (
        children || 'Download PDF'
      )}
    </button>
  );
}
