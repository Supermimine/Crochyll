const keywordsByConcept = {
  hookSize: {
    fra: ["crochet", "aiguille"],
    eng: ["hook size", "crochet hook", "hook"],
  },
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
  str
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

export const getPatternHookSize = (sections: string[], lang: 'fra' | 'eng' = 'fra') => {
  const hookSizeKeywords = keywordsByConcept.hookSize[lang];
  const normalizedKeywords = hookSizeKeywords.map(k => escapeRegex(normalize(k)));
  const hookRegex = new RegExp(`\\b(${normalizedKeywords.join("|")})\\b`, 'i');

  // Concaténer toutes les sections en un seul texte
  const fullText = sections.join('\n');

  // Chercher le mot-clé crochet/hook
  const hookMatch = fullText.match(hookRegex);
  if (!hookMatch || hookMatch.index === undefined) {
    return "";
  }

  const hookIndex = hookMatch.index;

  // Regex pour trouver les tailles en mm
  const mmRegex = /(\d+(?:[.,]\d+)?)\s*mm/gi;

  let match;
  let closestSize: string | null = null;
  let closestDistance = Infinity;

  while ((match = mmRegex.exec(fullText)) !== null) {
    const number = match[1];
    const index = match.index;

    const distance = Math.abs(index - hookIndex);

    if (distance < closestDistance) {
      closestDistance = distance;
      closestSize = number.replace(',', '.');
    }
  }

  if (closestSize) {
    return `Hook: ${closestSize}mm`;
  }

  return "";
};