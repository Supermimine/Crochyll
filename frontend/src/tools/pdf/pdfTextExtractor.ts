import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf";
import workerUrl from "pdfjs-dist/legacy/build/pdf.worker.min.mjs?url";

pdfjsLib.GlobalWorkerOptions.workerSrc = workerUrl;

export interface PdfTextItem {
  str: string;
  transform: [number, number, number, number, number, number];
  width: number;
  height: number;
  dir?: string;
  fontName?: string;
}

export async function extractAdvancedPdfText(file: File): Promise<string> {
  const arrayBuffer = await file.arrayBuffer();
  const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;

  const allLines: string[] = [];

  for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
    const page = await pdf.getPage(pageNum);
    const lines = await extractLinesFromPage(page);
    allLines.push(...lines);
  }

  return allLines.join("");
}

function isSubtitle(line: string): boolean {
  const forbidden = ["Lion Brand", "Pittsburgh", "New York", "White", "Yellow"];
  if (forbidden.some(k => line.includes(k))) return false;

  const clean = line.trim();
  if (!clean) return false;

  const words = clean.split(/\s+/);
  const letters = clean.replace(/[^\p{L}'-]/gu, "");
  if (!letters) return false;

  const upperRatio =
    [...letters].filter(c => c === c.toUpperCase()).length / letters.length;
  if (upperRatio > 0.9 && letters.length > 3) return true;

  if (clean.endsWith(":")) return true;

  const titleCaseRatio =
    words.filter(word => /^[A-ZÀ-ÖØ-Ý][a-zà-öø-ÿ'’\-]*:?$/u.test(word)).length /
    words.length;
  return titleCaseRatio > 0.8;
}

function isWebsite(line: string): boolean {
  const urlPattern = /https?:\/\/[^\s]+/i;
  const domainPattern = /\b(?:www\.)?[a-z0-9-]+\.[a-z]{2,}(?:\.[a-z]{2,})?\b/i;
  return urlPattern.test(line) || domainPattern.test(line);
};

async function extractLinesFromPage(page: any): Promise<string[]> {
  const content = await page.getTextContent();
  const items: PdfTextItem[] = content.items.filter(
    (i: any): i is PdfTextItem => !!i.str?.trim()
  );

  if (!items.length) return [];

  const thresholdColumnGap = 80;
  const thresholdY = 4;
  const thresholdParagraphGap = 10;

  const sortedByX = [...items].sort((a, b) => a.transform[4] - b.transform[4]);

  const columns: PdfTextItem[][] = [];

  sortedByX.forEach(item => {
    const x = item.transform[4];

    const existing = columns.find(col => {
      const avgX = col.reduce((sum, i) => sum + i.transform[4], 0) / col.length;
      return Math.abs(avgX - x) < thresholdColumnGap;
    });

    if (existing) {
      existing.push(item);
    } else {
      columns.push([item]);
    }
  });

  columns.sort((a, b) => {
    const ax = a.reduce((s, i) => s + i.transform[4], 0) / a.length;
    const bx = b.reduce((s, i) => s + i.transform[4], 0) / b.length;
    return ax - bx;
  });

  const output: string[] = [];

  for (const columnItems of columns) {
    const lines: { y: number; items: PdfTextItem[] }[] = [];

    columnItems.forEach(item => {
      const y = item.transform[5];

      const existing = lines.find(l => Math.abs(l.y - y) < thresholdY);

      if (existing) {
        existing.items.push(item);
      } else {
        lines.push({ y, items: [item] });
      }
    });

    lines.sort((a, b) => b.y - a.y);

    const cleanLines = lines.map(line => {
      line.items.sort((a, b) => a.transform[4] - b.transform[4]);
      return {
        text: line.items.map(i => i.str).join(" ").trim(),
        y: line.y
      };
    });

    let current = cleanLines[0];

    for (let i = 1; i < cleanLines.length; i++) {
      const line = cleanLines[i];
      const gap = current.y - line.y;

      if (gap < thresholdParagraphGap) {
        current.text += " " + line.text;
        current.y = line.y;
      } else {
        pushParagraph(current.text);
        current = line;
      }
    }

    pushParagraph(current.text);
  }

  return output;

  function pushParagraph(text: string) {
    const clean = text.trim();
    if (!clean) return;

    if (isSubtitle(clean) || isWebsite(clean)) {
      output.push(`***SECTION***<h3><b>${clean}</b></h3>`);
    } else {
      output.push(`${clean}\n`);
    }
  }
}
