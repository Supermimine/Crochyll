const excludedTitleFragments = [
  "crochet pattern",
  "pattern",
  "materials",
  "materials from previous characters",
  "yarn quality",
  "questions",
  "size",
  "measurements",
  "gauge",
  "abbreviations",
  "pattern notes",
  "assembly",
  "info and tips",
  "from tamara of",
  "powered by tcpdf",
  "hobbii-pattern-sku",
  "design",
  "one size",
  "free",
  "pattern information",
  "head and body",
  "scarf",
  "beret",
  "tail",
];

const cleanTitle = (text: string) =>
  text.replace(/<\/?[^>]+>/gi, " ").replace(/\s+/g, " ").trim();

const isTitleCandidate = (candidate: string) => {
  const normalized = candidate
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  return Boolean(normalized) && !excludedTitleFragments.some((fragment) => normalized.includes(fragment));
};

export function getPatternTitle(sections: string[]) {
  for (const section of sections.slice(0, 8)) {
    const candidate =
      section.match(/<h3[^>]*>(.*?)<\/h3>/i)?.[1] ||
      section.split(/\r?\n/).map((line) => line.trim()).find(Boolean) ||
      "";

    const title = cleanTitle(candidate);
    if (isTitleCandidate(title)) {
      return title;
    }
  }

  return "";
}
