const keywordsByConcept = {
    tips: {
        fra: ["conseil", "conseils", "astuce", "astuces"],
        eng: ["tip", "tips"],
    }
};

const escapeRegex = (str: string) => str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalize = (str: string) =>
    str
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "");

const isTipsSection = (section: string, lang: 'fra' | 'eng') => {
    const tipsKeywords = keywordsByConcept.tips[lang];
    const normalizedKeywords = tipsKeywords.map(k => escapeRegex(normalize(k)));
    const tipsRegex = new RegExp(`\\b(${normalizedKeywords.join("|")})\\b`, 'i');

    const match = section.match(/<h3>(.*?)<\/h3>/i);
    if (!match) return false;

    const normalizedTitle = normalize(match[1]);
    return tipsRegex.test(normalizedTitle);
};

export const getPatternTips = (sections: string[], lang: 'fra' | 'eng' = 'fra'): {
    tips: string,
    sectionIndex: number | null
} => {
    for (let i = 0; i < sections.length; i++) {
        const section = sections[i];
        if (isTipsSection(section, lang)) {
            const cleanSection = section.replace(/<h3>.*?<\/h3>/gs, "").trim();

            return {
                tips: cleanSection,
                sectionIndex: i
            };
        }
    }
    return {
        tips: "",
        sectionIndex: null
    };
};