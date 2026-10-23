import translate from "translate";

const normalizeLanguageCode = (code: string) => {
    const normalizedCode = code.trim().toLowerCase();
    const languageCodes: Record<string, string> = {
        fra: "fr",
        fre: "fr",
        eng: "en"
    };

    return languageCodes[normalizedCode] ?? normalizedCode.split("-")[0];
};

const translateText = async (text: string, from: string, to: string): Promise<string> => {
    const sourceLanguage = normalizeLanguageCode(from);
    const targetLanguage = normalizeLanguageCode(to);
    const keywordsAbbreviation = ["Abbreviations"];

    const patternAbbreviation = new RegExp(`<h2\\b[^>]*>\\s*(?:<b>)?\\s*(${keywordsAbbreviation.join("|")})`, "i");
    const matchAbbreviation = text.match(patternAbbreviation);

    translate.engine = "google";

    if (matchAbbreviation) {
        let abbreviationArray: string[] = [];

        const abbreviationWords: Record<string, string[]> = {
            fra: [
                "cm",
                "mc",
                "br",
                "ba",
                "ml",
                "ch",
                "ms",
                "b",
                "db",
                "dim",
                "aug",
                "augm"
            ],
            eng: [
                "mr",
                "slst",
                "blo",
                "flo",
                "ch",
                "ch",
                "sc",
                "dc",
                "hdc",
                "dec",
                "inc",
                "inc"
            ]
        };

        const textChecker = text.match(/<\/h2>([\s\S]*)/i)?.[1]?.trim();
        Object.keys(abbreviationWords).forEach((lang) => {
            abbreviationWords[lang].forEach((word: string, index: number) => {
                let pattern = word;

                if (word.length === 2) {
                    pattern = word.split("").join("\\s?");
                }

                const regex = new RegExp(`\\b${pattern}\\b`, "gi");
                const matches = textChecker?.match(regex);

                if (matches) {
                    const engEquivalent = abbreviationWords.eng[index];

                    if (engEquivalent && !abbreviationArray.includes(engEquivalent)) {
                        abbreviationArray.push(engEquivalent);
                    }
                }
            });
        });

        const translatedHeading = await translate('Abbreviations', {
            from: sourceLanguage,
            to: targetLanguage
        });
        text = text.replace(patternAbbreviation, heading =>
            heading.replace(/Abbreviations/i, translatedHeading)
        );

        abbreviationArray = abbreviationArray.sort((a, b) => abbreviationWords.eng.indexOf(a) - abbreviationWords.eng.indexOf(b));

        abbreviationArray.forEach(x => {
            switch (x.toLowerCase()) {
                case "mr":
                    if (targetLanguage === 'fr') {
                        text = text.replace('mr', '<b>cm</b> = (cercle magique)');
                    } else {
                        text = text.replace('mr', '<b>mr</b> = (magic ring)');
                    }
                    break;
                case "st":
                    if (targetLanguage === 'fr') {
                        text = text.replace('st', '<b>m</b> = (maille)');
                    } else {
                        text = text.replace('st', '<b>st</b> = (stitch)');
                    }
                    break;
                case "slst":
                    if (targetLanguage === 'fr') {
                        text = text.replace('slst', '<b>mc</b> = (maille coulée)');
                    } else {
                        text = text.replace('slst', '<b>slst</b> = (slip stitch)');
                    }
                    break;
                case "blo":
                    if (targetLanguage === 'fr') {
                        text = text.replace('blo', '<b>br</b> = (brin arrière)');
                    } else {
                        text = text.replace('blo', '<b>blo</b> = (back loop only)');
                    }
                    break;
                case "flo":
                    if (targetLanguage === 'fr') {
                        text = text.replace('flo', '<b>ba</b> = (brin avant)');
                    } else {
                        text = text.replace('flo', '<b>flo</b> = (front loop only)');
                    }
                    break;
                case "ch":
                    if (targetLanguage === 'fr') {
                        text = text.replace('ch', "<b>ml</b> = (maille en l'air)");
                    } else {
                        text = text.replace('ch', '<b>ch</b> = (chain stitch)');
                    }
                    break;
                case "sc":
                    if (targetLanguage === 'fr') {
                        text = text.replace('sc', '<b>ms</b> = (maille serrée)');
                    } else {
                        text = text.replace('sc', '<b>sc</b> = (single crochet)');
                    }
                    break;
                case "dc":
                    if (targetLanguage === 'fr') {
                        text = text.replace('dc', '<b>br</b> = (bride)');
                    } else {
                        text = text.replace('dc', '<b>dc</b> = (double crochet)');
                    }
                    break;
                case "hdc":
                    if (targetLanguage === 'fr') {
                        text = text.replace('hdc', '<b>db</b> = (demi-bride)');
                    } else {
                        text = text.replace('hdc', '<b>hdc</b> = (half double crochet)');
                    }
                    break;
                case "dec":
                    if (targetLanguage === 'fr') {
                        text = text.replace('dec', '<b>dim</b> = (diminution)');
                    } else {
                        text = text.replace('dec', '<b>dec</b> = (decrease)');
                    }
                    break;
                case "inc":
                    if (to === 'fr') {
                        text = text.replace('inc', '<b>aug</b> = (augmentation)');
                    } else {
                        text = text.replace('inc', '<b>inc</b> = (increase)');
                    }
                    break;
            }
        });

        return text;
    }
    else {
        let translated = await translate(text, {
            from: sourceLanguage,
            to: targetLanguage
        });

        return translated;
    }
};

export default translateText;