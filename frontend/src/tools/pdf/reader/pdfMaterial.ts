import { yarnData } from '@/data/yarnData';

const keywordsByConcept = {
    material: {
        fra: ["materiel", "materiaux", "mat."],
        eng: ["material", "materials", "equipment", "supplies", "mat."],
    },
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const yarnColors = {
    fra: [
        "blanc", "blanche", "noir", "noire", "gris", "grise", "rouge", "rose",
        "orange", "jaune", "vert", "verte", "bleu", "bleue", "violet", "violette",
        "mauve", "beige", "marron", "brun", "brune", "turquoise", "crème", "ecru",
        "écru", "doré", "dorée", "argenté", "argentée"
    ],
    eng: [
        "white", "ivory", "black", "gray", "grey", "red", "pink", "orange", "yellow",
        "green", "blue", "purple", "violet", "mauve", "beige", "brown", "tan",
        "turquoise", "teal", "cream", "ecru", "gold", "silver", "navy", "aqua"
    ]
};

const knownYarnNames = [...yarnData].sort((first, second) => second.name.length - first.name.length);

const getYarnDisplayName = (entry: string, lang: 'fra' | 'eng') => {
    const normalizedEntry = normalize(entry);
    const knownYarn = knownYarnNames.find((yarn) => normalizedEntry.includes(normalize(yarn.name)));

    if (knownYarn) return knownYarn.name;

    const colorTerms = yarnColors[lang]
        .sort((first, second) => second.length - first.length)
        .map(escapeRegex);
    const colorPattern = new RegExp(`\\b(${colorTerms.join("|")})\\b`, "gi");
    const colors = [...entry.matchAll(colorPattern)].map((match) => match[0]);

    return colors.join(" ");
};

const isMaterialSection = (section: string, lang: 'fra' | 'eng') => {
    const materialKeywords = keywordsByConcept.material[lang];
    const normalizedKeywords = materialKeywords.map(k => escapeRegex(normalize(k)));
    const matRegex = new RegExp(`\\b(${normalizedKeywords.join("|")})\\b`, 'i');

    const match = section.match(/<h3>(.*?)<\/h3>/i);
    if (!match) return false;

    const normalizedTitle = normalize(match[1]);
    return matRegex.test(normalizedTitle);
};

export const getPatternMaterials = (sections: string[], lang: 'fra' | 'eng' = 'fra'): {
    materials: [string, boolean, boolean, boolean, boolean],
    sectionIndex: number | null
} => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (isMaterialSection(section, lang)) {
            const cleanSection = section.replace(/<h3>.*?<\/h3>/gs, "").trim();

            const hasBulletPoints = cleanSection.includes('\uf0b7');
            const lines = (hasBulletPoints
                ? cleanSection.split(/\uf0b7+/)
                : cleanSection.split(/[\r\n]+/)
            )
                .map((line) => line.replace(/^[\s–-]*/, '').trim())
                .filter(Boolean)
                .map((line) => line.replace(/<[^>]+>/g, "").trim())
                .filter(Boolean);

            const hasHookInfo = (line: string) => /\b(crochet|hook)\b/i.test(line);
            const isStuffingLine = (line: string) => /\b(rembourrage|bourre|filling|stuffing|fiberfill|fibre)\b/i.test(line);
            const isNeedlesLine = (line: string) => /\b(aiguille|aiguilles|needle|needles)\b/i.test(line) && !/\b(crochet|hook)\b/i.test(line);
            const isMarkerLine = (line: string) => /\b(?:marque(?:ur)?s?(?:\s*de\s*)?mailles?|marker)s?\b/i.test(line);
            const isSafetyEyesLine = (line: string) => {
                const normalizedLine = normalize(line);
                return /\b(yeux\s*de\s*securite|yeux\s*securite|safety\s*eyes)\b/i.test(normalizedLine);
            }
            const brandNames = ["pica pau", "bernat"];
            const isBrandLine = (line: string) => {
                const normalizedLine = normalize(line);
                return brandNames.some((brand) => normalizedLine.includes(brand));
            };
            const isYarnLine = (line: string) => {
                const normalizedLine = normalize(line);
                const isYarn = /\b(laine|laines|fil|pelote|yarn|wool|thread|skein)\b/i.test(normalizedLine);
                return (
                    isYarn &&
                    !isNeedlesLine(line) &&
                    !isMarkerLine(line) &&
                    !isStuffingLine(line) &&
                    !isSafetyEyesLine(line)
                );
            }

            const yarnLines: string[] = [];
            let lastBrandLine = "";
            let hasNeedles = false;
            let hasMarker = false;
            let hasStuffing = false;
            let hasSafetyEyes = false;

            for (const line of lines) {
                if (hasHookInfo(line)) {
                    continue;
                }

                if (isBrandLine(line)) {
                    lastBrandLine = line.trim();
                }

                if (isYarnLine(line)) {
                    const yarnLine = lastBrandLine && !isBrandLine(line)
                        ? `${line} ${lastBrandLine}`
                        : line;
                    const conjunction = lang === 'fra' ? 'et' : 'and';
                    const yarnEntries = yarnLine
                        .split(new RegExp(`\\s*,\\s*|\\s+${conjunction}\\s+`, 'i'))
                        .map((entry) => getYarnDisplayName(entry.trim(), lang))
                        .filter(Boolean);
                    const yarnMarker = hasBulletPoints ? '##yarn##' : '';

                    yarnLines.push(...yarnEntries.map((entry) => yarnMarker + entry));
                }

                if (isNeedlesLine(line)) {
                    hasNeedles = true;
                }

                if (isMarkerLine(line)) {
                    hasMarker = true;
                }

                if (isStuffingLine(line)) {
                    hasStuffing = true;
                }

                if (isSafetyEyesLine(line)) {
                    hasSafetyEyes = true;
                }
            }

            return {
                materials: [
                    yarnLines.join("\n"),
                    hasNeedles,
                    hasMarker,
                    hasStuffing,
                    hasSafetyEyes,
                ],
                sectionIndex: i
            };
        }
    }
    return {
        materials: ["", false, false, false, false],
        sectionIndex: null
    };
};