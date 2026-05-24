const keywordsByConcept = {
    gauge: {
        fra: ["échantillon", "échantillons", "tension", "tensions"],
        eng: ["gauge", "gauges"],
    },
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const isGaugeSection = (section: string, lang: 'fra' | 'eng') => {
    const gaugeKeywords = keywordsByConcept.gauge[lang];
    const normalizedKeywords = gaugeKeywords.map(k => escapeRegex(normalize(k)));
    const gaugeRegex = new RegExp(`\\b(${normalizedKeywords.join("|")})\\b`, 'i');

    const match = section.match(/<h3>(.*?)<\/h3>/i);
    if (!match) return false;

    const normalizedTitle = normalize(match[1]);
    return gaugeRegex.test(normalizedTitle);
};

export const getPatternGauge = (sections: string[], lang: 'fra' | 'eng' = 'fra'): {
    gauge: string,
    sectionIndex: number | null
} => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (isGaugeSection(section, lang)) {
            const cleanSection = section.replace(/<h3>.*?<\/h3>/gs, "").trim();

            return {
                gauge: cleanSection,
                sectionIndex: i
            };
        }
    }
    return {
        gauge: "",
        sectionIndex: null
    };
};