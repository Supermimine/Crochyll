const keywordsByConcept = {
    abbreviation: {
        fra: ["Abréviation", "Abréviations"],
        eng: ["abbreviation", "abbreviations"],
    },
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const isAbbreviationSection = (section: string, lang: 'fra' | 'eng') => {
    const abbreviationKeywords = keywordsByConcept.abbreviation[lang];
    const normalizedKeywords = abbreviationKeywords.map(k => escapeRegex(normalize(k)));
    const abbrRegex = new RegExp(`\\b(${normalizedKeywords.join("|")})\\b`, 'i');

    const match = section.match(/<h3>(.*?)<\/h3>/i);
    if (!match) return false;

    const normalizedTitle = normalize(match[1]);
    return abbrRegex.test(normalizedTitle);
};

export const getPatternAbbreviations = (sections: string[], lang: 'fra' | 'eng' = 'fra'): {
    abbreviations: string,
    sectionIndex: number | null
} => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (isAbbreviationSection(section, lang)) {
            const cleanSection = section.replace(/<h3>.*?<\/h3>/gs, "").trim();

            let abbreviationArray: string[] = [];
            let abbreviations = '';

            const abbreviationWords: Record<string, string[]> = {
                fra: [
                    "cm",
                    "ch",
                    "m",
                    "mc",
                    "br",
                    "ba",
                    "ms",
                    "b",
                    "db",
                    "dim",
                    "aug",
                    "augm"
                ],
                eng: [
                    "mr",
                    "ch",
                    "st",
                    "slst",
                    "blo",
                    "flo",
                    "sc",
                    "dc",
                    "hdc",
                    "dec",
                    "inc",
                    "inc"
                ]
            };

            Object.keys(abbreviationWords).forEach((lang) => {
                abbreviationWords[lang].forEach((word: string, index: number) => {
                    let pattern = word;

                    if (word.length === 2) {
                        pattern = word.split("").join("\\s?");
                    }

                    const regex = new RegExp(`\\b${pattern}\\b`, "gi");
                    const matches = cleanSection?.match(regex);

                    if (matches) {
                        const engEquivalent = abbreviationWords.eng[index];

                        if (engEquivalent && !abbreviationArray.includes(engEquivalent)) {
                            abbreviationArray.push(engEquivalent);
                        }
                    }
                });
            });

            abbreviationArray = abbreviationArray.sort((a, b) => abbreviationWords.eng.indexOf(a) - abbreviationWords.eng.indexOf(b));
            abbreviationArray.forEach(engEquivalent => {
                abbreviations += `<span>${engEquivalent}</span><br/>`;
            });

            return {
                abbreviations,
                sectionIndex: i
            };
        }
    }
    return {
        abbreviations: "",
        sectionIndex: null
    };
};