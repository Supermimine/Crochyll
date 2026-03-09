import Tesseract from "tesseract.js";

/**
 * OCR d'une image (base64) en texte
 * @param image string - base64
 * @returns string - texte extrait
 */
export const ocrImage = async (image: string): Promise<string> => {
  const { data } = await Tesseract.recognize(image, "eng+fra", {});

  return data.text;
};

/**
 * OCR d'un PDF (tableau de pages images) en texte complet
 * @param images string[] - tableau de base64
 * @returns string - texte complet
 */
export const ocrPdfImages = async (images: string[]): Promise<string> => {
  let fullText = "";

  for (const img of images) {
    const text = await ocrImage(img);
    fullText += text + " ";
  }

  return fullText;
};
