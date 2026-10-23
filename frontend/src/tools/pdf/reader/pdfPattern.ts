const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

function isGarbage(line: string): boolean {
  const trimmed = line.trim();

  if (/(https?:\/\/|www\.|©|hobbii)/i.test(trimmed)) return true;

  if (trimmed.includes("|")) return true;

  if (trimmed.length <= 3) return true;

  if (/^[A-Z][a-z]+.*\|\s*No\.?/i.test(trimmed)) return true;

  return false;
}

export const normalizePatternAbbreviations = (
    section: string,
    abbreviationSection: string,
    listedAbbreviationsHtml: string,
    sourceLanguage: 'fra' | 'eng',
    targetLanguage: string
) => {
    const normalizedDefinitions = abbreviationSection
        .replace(/<br\s*\/?>|<\/(?:p|li|div|tr|td)>/gi, "\n")
        .replace(/<[^>]+>/g, " ")
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .toLowerCase();
    const brDefinitionLines = normalizedDefinitions
        .split(/[\r\n]+/)
        .filter(line => /\bbr\b/.test(line));
    const brMeansBackLoop = brDefinitionLines.some(line => /brin\s+arriere/.test(line));
    const brMeansBride = brDefinitionLines.some(line => /\bbride\b/.test(line));
    const isFrenchTarget = targetLanguage.toLowerCase().startsWith("fr");
    const frenchToEnglish: Record<string, string> = {
        cm: "mr",
        ch: "ch",
        ml: "ch",
        m: "st",
        mc: "slst",
        br: brMeansBride && !brMeansBackLoop ? "dc" : "blo",
        ba: "flo",
        ms: "sc",
        b: "dc",
        db: "hdc",
        dim: "dec",
        aug: "inc",
        augm: "inc"
    };
    const englishToFrench: Record<string, string> = {
        mr: "cm",
        ch: "ml",
        st: "m",
        slst: "mc",
        blo: "br",
        flo: "ba",
        sc: "ms",
        dc: "b",
        hdc: "db",
        dec: "dim",
        inc: "aug"
    };
    const sourceAliases = sourceLanguage === 'fra'
        ? frenchToEnglish
        : Object.fromEntries(Object.keys(englishToFrench).map(abbreviation => [abbreviation, abbreviation]));
    const listedAbbreviations = new Set(
        [...listedAbbreviationsHtml.matchAll(/<span>([^<]+)<\/span>/gi)]
            .map(match => match[1].trim().toLowerCase())
    );

    return section.split(/(<[^>]+>)/g).map((part, index) => {
        if (index % 2 === 1) return part;

        return Object.entries(sourceAliases)
            .sort(([first], [second]) => second.length - first.length)
            .reduce((text, [alias, englishEquivalent]) => {
                if (!listedAbbreviations.has(englishEquivalent)) return text;

                const preferred = isFrenchTarget
                    ? englishToFrench[englishEquivalent] ?? englishEquivalent
                    : englishEquivalent;
                const pattern = new RegExp(`\\b${escapeRegex(alias)}\\b`, "gi");
                return text.replace(pattern, match =>
                    match === match.toUpperCase() ? preferred.toUpperCase() : preferred
                );
            }, part);
    }).join("");
};

export const getPatternSection = (sections: string): { finalSection: string[] } => {
    const lines = sections
        .split(/(?<=<\/h3>)|\n/)
        .map(l => l.trim())
        .filter(Boolean)
        .filter(l => !isGarbage(l));

    const groupedSections: string[] = [];
    let currentSection: string[] = [];

    for (const line of lines) {
        if (line.startsWith("<h3>")) {
            if (currentSection.length > 0) {
                groupedSections.push(currentSection.join("\n"));
            }
            currentSection = [line];
        } else {
            currentSection.push(line);
        }
    }

    if (currentSection.length > 0) {
        groupedSections.push(currentSection.join("\n"));
    }

    return {
        finalSection: groupedSections
    };
};

export const boldPatternRoundHeadings = (html: string) => {
    const document = new DOMParser().parseFromString(html, "text/html");
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const textNodes: Text[] = [];
    const headingPattern = /\b((?:tours?|rounds?|rnds?\.?|rows?|rangs?|rangées?|runden?|vueltas?|giros?)\s*(?:(?:#|n[º°.]?)\s*)?\d+(?:\s*(?:[-–—]|à|to)\s*\d+)?(?:\s*[:：.])?)(?=\s|$)/gi;

    while (walker.nextNode()) {
        textNodes.push(walker.currentNode as Text);
    }

    textNodes.forEach((textNode) => {
        if (textNode.parentElement?.closest("b, strong")) return;

        const content = textNode.textContent ?? "";
        const headingMatches = [...content.matchAll(headingPattern)];
        if (headingMatches.length === 0) return;

        const fragment = document.createDocumentFragment();
        let currentIndex = 0;

        headingMatches.forEach(match => {
            const matchIndex = match.index ?? currentIndex;
            if (matchIndex > currentIndex) {
                fragment.appendChild(document.createTextNode(content.slice(currentIndex, matchIndex)));
            }

            const heading = document.createElement("b");
            heading.textContent = match[1].trimEnd();
            fragment.appendChild(heading);
            currentIndex = matchIndex + match[0].length;
        });

        if (currentIndex < content.length) {
            fragment.appendChild(document.createTextNode(content.slice(currentIndex)));
        }
        textNode.replaceWith(fragment);
    });

    return document.body.innerHTML;
};