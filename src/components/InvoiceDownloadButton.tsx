'use client';

import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';
import type { ReactNode } from 'react';

interface Props {
  fileName: string;
  targetId?: string;
  className?: string;
  children?: ReactNode;
}

export default function InvoiceDownloadButton({ fileName, targetId = 'invoice-preview', className, children }: Props) {
  const handleDownload = async () => {
    try {
      if ((document as unknown as { fonts?: { ready: Promise<void> } }).fonts?.ready) {
        await (document as unknown as { fonts?: { ready: Promise<void> } }).fonts!.ready;
      }

      const el = document.getElementById(targetId);
      if (!el) {
        alert('Elemen invoice tidak ditemukan');
        return;
      }

      const canvas = await html2canvas(el, {
        scale: 3,
        useCORS: true,
        logging: false,
        allowTaint: true,
        backgroundColor: getComputedStyle(document.body).backgroundColor || '#ffffff'
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

      pdf.save(fileName);
    } catch (e) {
      alert('Gagal membuat PDF');
      console.error(e);
    }
  };

  return (
    <button onClick={handleDownload} className={className || 'app-btn-primary'}>{children || 'Download PDF'}</button>
  );
}
