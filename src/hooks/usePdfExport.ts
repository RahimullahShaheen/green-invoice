import { useRef } from 'react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { Invoice } from '@/types/invoice';

export function usePdfExport() {
  const previewRef = useRef<HTMLDivElement>(null);

  const exportToPdfBlob = async (invoice: Invoice, element?: HTMLElement | null): Promise<Blob | null> => {
    const targetElement = element || previewRef.current;
    if (!targetElement) return null;

    // Clone the target and render the clone at A4 dimensions off-screen so the PDF matches the downloaded design
    const mmToPx = (mm: number) => mm * 3.7795275591; // 1mm ≈ 3.7795 px at 96dpi
    const a4WidthMm = 210;
    const a4HeightMm = 297;

    // Create off-screen container
    const container = document.createElement('div');
    container.style.position = 'fixed';
    container.style.left = '-9999px';
    container.style.top = '0';
    container.style.width = `${a4WidthMm}mm`;
    container.style.background = '#ffffff';
    container.style.padding = '0';
    container.style.boxSizing = 'border-box';

    // Clone the node
    const clone = targetElement.cloneNode(true) as HTMLElement;
    // Force the clone to occupy full A4 width and remove any limiting max-width
    clone.style.width = `${a4WidthMm}mm`;
    clone.style.maxWidth = 'none';
    clone.style.boxSizing = 'border-box';
    clone.style.background = '#ffffff';

    // Append clone to container and to body
    container.appendChild(clone);
    document.body.appendChild(container);

    try {
      // Wait for fonts to be ready for accurate rendering
      if ((document as any).fonts && (document as any).fonts.ready) {
        await (document as any).fonts.ready;
      }

      // Use devicePixelRatio to get crisp output, but cap scale to avoid excessive memory use
      const dpr = Math.min(window.devicePixelRatio || 1, 2);

      const canvas = await html2canvas(clone, {
        scale: 2 * dpr,
        useCORS: true,
        logging: false,
        backgroundColor: '#ffffff',
        windowWidth: Math.max(clone.scrollWidth, mmToPx(a4WidthMm)),
        windowHeight: Math.max(clone.scrollHeight, mmToPx(a4HeightMm)),
      });

      // Convert canvas to PDF with A4 size (mm)
      const imgWidth = a4WidthMm; // A4 width in mm
      const pageHeight = a4HeightMm; // A4 height in mm
      const imgHeight = (canvas.height * imgWidth) / canvas.width;

      const pdf = new jsPDF({
        orientation: imgHeight > pageHeight ? 'portrait' : 'portrait',
        unit: 'mm',
        format: 'a4',
      });

      const imgData = canvas.toDataURL('image/jpeg', 1.0);

      // Add padding
      const margin = 10;
      const contentWidth = imgWidth - margin * 2;
      const contentHeight = (canvas.height * contentWidth) / canvas.width;

      pdf.addImage(imgData, 'PNG', margin, margin, contentWidth, contentHeight);

      // @ts-ignore
      const blob = pdf.output('blob') as Blob;
      return blob;
    } catch (error) {
      console.error('Error generating PDF:', error);
      throw error;
    } finally {
      // Cleanup
      container.remove();
    }
  };

  const exportToPdf = async (invoice: Invoice, element?: HTMLElement | null) => {
    const blob = await exportToPdfBlob(invoice, element);
    if (!blob) return;
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${invoice.clientInfo.name}.pdf`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  return { previewRef, exportToPdf, exportToPdfBlob };
}
