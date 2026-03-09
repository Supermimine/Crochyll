import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";

// Configurer le worker
pdfjsLib.GlobalWorkerOptions.workerSrc = "/pdf.worker.min.mjs";

/**
 * Convertit un PDF en images (base64) pour OCR
 * @param file File - PDF
 * @returns string[] - tableau de base64 pour chaque page
 */
export const pdfToImages = async (file: File): Promise<string[]> => {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument(arrayBuffer).promise;

  const images: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const viewport = page.getViewport({ scale: 2 }); // scale 2 pour meilleure résolution

    const canvas = document.createElement("canvas");
    canvas.width = viewport.width;
    canvas.height = viewport.height;

    const ctx = canvas.getContext("2d");
    if (!ctx) throw new Error("Impossible de créer le contexte du canvas");

    await page.render({ canvasContext: ctx, viewport }).promise;

    // Convertir le canvas en base64
    const imageBase64 = canvas.toDataURL("image/png");
    images.push(imageBase64);
  }

  return images;
};
