import { pdfToImages } from "./pdfToImage";
import { ocrPdfImages } from "@/tools/ocr";

export async function fallbackOCR(file: File): Promise<string> {
  const images = await pdfToImages(file);
  const text = await ocrPdfImages(images);
  return text;
}
