import translate from "translate";

const translateText = async (text: string, from: string, to: string) => {
    const keywordsAbbreviation = [
        "abbreviation",
        "abbreviations",
        "abréviation",
        "abréviations",
        "abreviación",
        "abreviaciones"
    ];
    const keywordsMaterial = [
        "matériaux",
        "matériel",
        "material",
        "materials",
        "material",
        "materiales"
    ];

    const patternAbbreviation = new RegExp(`<h3>\\s*<b>\\s*(${keywordsAbbreviation.join("|")})`, "i");
    const patternMaterial = new RegExp(`<h3>\\s*<b>\\s*(${keywordsMaterial.join("|")})`, "i");

    const matchAbbreviation = text.toLowerCase().match(patternAbbreviation);
    const matchMaterial = text.toLowerCase().match(patternMaterial);

    if (matchAbbreviation) {
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
    else if (matchMaterial) {
        let translateText = `<h3><b>${await translate("MATERIALS", { to })}:</b></h3>\n`;

        const translated = await translate(text, { to: 'fr' }); // tout texte traduit

        // Crochet
        if (/crochet/i.test(translated)) {
            const crochetMatch = translated.match(/crochet/i);

            if (crochetMatch && crochetMatch.index !== undefined) {
                const crochetIndex = crochetMatch.index;
                const mmRegex = /(\d+(?:[.,]\d+)?)\s*mm/gi;

                let match;
                let closestSize: string | null = null;
                let closestDistance = Infinity;

                while ((match = mmRegex.exec(translated)) !== null) {
                    const number = match[1];
                    const index = match.index;

                    const distance = Math.abs(index - crochetIndex);

                    if (distance < closestDistance) {
                        closestDistance = distance;
                        closestSize = number.replace(',', '.');
                    }
                }

                if (closestSize) {
                    translateText += `Crochet: ${closestSize}mm\n`;
                } else {
                    console.error('Aucune taille en mm trouvée');
                }
            }
        }
        else {
            translateText += `${text}\n`;
        }

        // Laine
        // =============================
        // Configuration
        // =============================

        // Regex pour blocs multi-lignes et inline
        const yarnRegexMultiLine = /^[\s•●▪\-*·]*([^\n<]*(?:laine|fil|pelote|yarn)[^\n<]*\n[^\n<]*)/gim;
        const yarnRegexInline = /[–\-]\s*(fil|laine|pelote|yarn)[^–\n<]*/gi;

        // Liste de mots qui indiquent des commentaires
        const commentKeywords = [
            'sample made with', 'échantillon réalisé', 'instructions', 'used', 'utilisé'
        ];

        // =============================
        // Extraction des blocs
        // =============================

        const blocks: { block: string, start: number, end: number }[] = [];

        let match: RegExpExecArray | null;

        // 1️⃣ Multi-lignes
        while ((match = yarnRegexMultiLine.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            let block = match[1].trim().replace(/^[\s•●▪\-*·]+/gm, '');

            // Couper après mots-clés commentaire
            for (const keyword of commentKeywords) {
                const idx = block.toLowerCase().indexOf(keyword.toLowerCase());
                if (idx !== -1) {
                    block = block.slice(0, idx).trim();
                }
            }

            blocks.push({ block, start, end });
        }

        // 2️⃣ Inline
        while ((match = yarnRegexInline.exec(text)) !== null) {
            const start = match.index;
            const end = start + match[0].length;
            let block = match[0].replace(/^[–\-]\s*/, '').trim();

            // Couper après mots-clés commentaire
            for (const keyword of commentKeywords) {
                const idx = block.toLowerCase().indexOf(keyword.toLowerCase());
                if (idx !== -1) {
                    block = block.slice(0, idx).trim();
                }
            }

            blocks.push({ block, start, end });
        }

        // =============================
        // Sélection du meilleur bloc
        // =============================
        for (const b of blocks) {
            // =============================
            // Récupérer le bloc dans le texte original
            // =============================
            let originalBlock = text.slice(b.start, b.end)
            .replace(/^[\s•●▪\-*·–]+/gm, '')
            .trim();
            
            // Couper après mots-clés commentaire dans l’original
            for (const keyword of commentKeywords) {
                const idx = originalBlock.toLowerCase().indexOf(keyword.toLowerCase());
                if (idx !== -1) {
                    originalBlock = originalBlock.slice(0, idx).trim();
                }
            }
            
            // Supprimer virgule finale éventuelle
            originalBlock = originalBlock.replace(/[\s,]+$/g, '');
            
            translateText += `Laines: ${originalBlock}\n`;
        }
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