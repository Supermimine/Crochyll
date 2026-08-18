import { extractAdvancedPdfText } from "./pdfTextExtractor";
import { detectLanguage } from "@/tools/languageDetector";
import type { FilePattern } from "@core/model/filepattern";

export async function importPdfFile(file: File): Promise<FilePattern | null> {
  const content = await extractAdvancedPdfText(file);

  const lang = detectLanguage(content);

  if (!lang) return null;

  return {
    name: file.name,
    content,
    lang,
    state: 0,
  };
}
