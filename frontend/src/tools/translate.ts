import translate from "translate";

const translateText = async (text: string, from: string, to: string): Promise<string> => {
    const keywordsAbbreviation = ["Abbreviations"];

    const patternAbbreviation = new RegExp(`<h3>\\s*<b>\\s*(${keywordsAbbreviation.join("|")})`, "i");
    const matchAbbreviation = text.toLowerCase().match(patternAbbreviation);

    translate.engine = "google";

    if (matchAbbreviation) {
        let abbreviationArray: string[] = [];

        const abbreviationWords: Record<string, string[]> = {
            fra: [
                "cm",
                "m",
                "mc",
                "br",
                "ba",
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
                "st",
                "slst",
                "blo",
                "flo",
                "ch",
                "sc",
                "dc",
                "hdc",
                "dec",
                "inc",
                "inc"
            ]
        };

        const textChecker = text.match(/<\/h3>([\s\S]*)/i)?.[1]?.trim();
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

        text = text.replace('Abbreviations', await translate('Abbreviations', { to }));

        abbreviationArray = abbreviationArray.sort((a, b) => abbreviationWords.eng.indexOf(a) - abbreviationWords.eng.indexOf(b));

        abbreviationArray.forEach(x => {
            switch (x.toLowerCase()) {
                case "mr":
                    if (to === 'fr') {
                        text = text.replace('mr', 'cm = (cercle magique)');
                    } else {
                        text = text.replace('mr', 'mr = (magic ring)');
                    }
                    break;
                case "st":
                    if (to === 'fr') {
                        text = text.replace('st', 'm = (maille)');
                    } else {
                        text = text.replace('st', 'st = (stitch)');
                    }
                    break;
                case "slst":
                    if (to === 'fr') {
                        text = text.replace('slst', 'mc = (maille coulée)');
                    } else {
                        text = text.replace('slst', 'slst = (slip stitch)');
                    }
                    break;
                case "blo":
                    if (to === 'fr') {
                        text = text.replace('blo', 'br = (brin arrière)');
                    } else {
                        text = text.replace('blo', 'blo = (back loop only)');
                    }
                    break;
                case "flo":
                    if (to === 'fr') {
                        text = text.replace('flo', 'ba = (brin avant)');
                    } else {
                        text = text.replace('flo', 'flo = (front loop only)');
                    }
                    break;
                case "ch":
                    if (to === 'fr') {
                        text = text.replace('ch', 'ch = (chaînette)');
                    } else {
                        text = text.replace('ch', 'ch = (chain stitch)');
                    }
                    break;
                case "sc":
                    if (to === 'fr') {
                        text = text.replace('sc', 'ms = (maille serrée)');
                    } else {
                        text = text.replace('sc', 'sc = (single crochet)');
                    }
                    break;
                case "dc":
                    if (to === 'fr') {
                        text = text.replace('dc', 'b = (bride)');
                    } else {
                        text = text.replace('dc', 'dc = (double crochet)');
                    }
                    break;
                case "hdc":
                    if (to === 'fr') {
                        text = text.replace('hdc', 'db = (demi-bride)');
                    } else {
                        text = text.replace('hdc', 'hdc = (half double crochet)');
                    }
                    break;
                case "dec":
                    if (to === 'fr') {
                        text = text.replace('dec', 'dim = (diminution)');
                    } else {
                        text = text.replace('dec', 'dec = (decrease)');
                    }
                    break;
                case "inc":
                    if (to === 'fr') {
                        text = text.replace('inc', 'aug = (augmentation)');
                    } else {
                        text = text.replace('inc', 'inc = (increase)');
                    }
                    break;
            }
        });

        return text;
    }
    else {
        let translated = await translate(text, { to });

        return translated;
    }
};

export default translateText;