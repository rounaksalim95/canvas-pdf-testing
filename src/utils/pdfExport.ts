import html2pdf from 'html2pdf.js';

interface ExportToPDFOptions {
  filename?: string;
  pageSize?: string;
  margin?: number[];
}

export const exportToPDF = async (
  element: HTMLElement,
  options: ExportToPDFOptions = {}
) => {
  const defaultOptions = {
    filename: 'workbook.pdf',
    pageSize: 'A4',
    margin: [40, 40, 40, 40],
    image: { type: 'jpeg', quality: 0.98 },
    html2canvas: {
      scale: 2,
      useCORS: true,
      letterRendering: true,
    },
    jsPDF: {
      unit: 'pt',
      format: 'a4',
      orientation: 'portrait',
    },
  };

  const mergedOptions = {
    ...defaultOptions,
    ...options,
  };

  try {
    await html2pdf().set(mergedOptions).from(element).save();
    return true;
  } catch (error) {
    console.error('Error generating PDF:', error);
    return false;
  }
}; 