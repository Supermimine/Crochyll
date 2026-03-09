import translate from "translate";

const translateText = async (text: string, from: string, to: string) => {

    // Check for the presence of an "Abbreviations" section in the text and translate manually
    const keywords = [
        "abbreviation",
        "abbreviations",
        "abréviation",
        "abréviations",
        "abreviación",
        "abreviaciones"
    ];

    const pattern = new RegExp(`<h3>\\s*<b>\\s*(${keywords.join("|")})`, "i");

    const match = text.match(pattern);
    if (match) {
        let abbreviationArray: string[] = [];

        const abbreviationWords: Record<string, string[]> = {
            fra: [
                "balle",
                "cm",
                "m",
                "tour",
                "mc",
                "br",
                "ba",
                "ch",
                "ms",
                "db",
                "b",
                "dim",
                "aug",
                "augm"
            ],
            eng: [
                "skein",
                "mr",
                "st",
                "rnd",
                "slst",
                "blo",
                "flo",
                "ch",
                "sc",
                "hdc",
                "dc",
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

        let translateText = `<h3><b>${await translate("ABBREVIATIONS", { to })}:</b></h3>\n`;
        abbreviationArray.forEach(x => {
            switch (x.toLowerCase()) {
                case "skein":
                    translateText += "balle";
                    break;
                case "mr":
                    translateText += "cm = (cercle magique)";
                    break;
                case "st":
                    translateText += "m = (maille)";
                    break;
                case "rnd":
                    translateText += "t = (tour)";
                    break;
                case "slst":
                    translateText += "mc = (maille coulée)";
                    break;
                case "blo":
                    translateText += "br = (brin arrière)";
                    break;
                case "flo":
                    translateText += "ba = (brin avant)";
                    break;
                case "ch":
                    translateText += "ch = (chaînette)";
                    break;
                case "sc":
                    translateText += "ms = (maille serrée)";
                    break;
                case "hdc":
                    translateText += "db = (demi-bride)";
                    break;
                case "dc":
                    translateText += "b = (bride)";
                    break;
                case "dec":
                    translateText += "dim = (diminution)";
                    break;
                case "inc":
                    translateText += "aug = (augmentation)";
                    break;
            }

            translateText += "\n";
        });

        return translateText;
    }
    else {
        if (from === to) {
            return text;
        }

        translate.engine = "google";
        let translated = await translate(text, { to });

        return translated;
    }
};

export default translateText;