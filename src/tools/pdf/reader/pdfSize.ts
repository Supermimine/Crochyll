export const getPatternSize = (sections: string[]) => {
    const fullText = sections.join('\n');

    const hookKeywords = /(?:crochet|aiguille|hook|needle)/i;

    const sizePatterns = [
        /\d+\s*x\s*\d+(?:\s*x\s*\d+)?(?!(?:\s*(?:pillow|form|cm|mm|inches?|")*\s*)*(?:crochet|aiguille|hook|needle))/gi,
        /(?:height|hauteur).*?\d+(?:\.\d+)?\s*(?:cm|mm|inches?|")(?!(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:cm|mm|inches?|"))*\s*(?:crochet|aiguille|hook|needle))/gi,
        /\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)+(?:\s*\/\s*\d+(?:\.\d+)?(?:x\d+(?:\.\d+)?)+)?(?!(?:\s*(?:cm|mm|inches?|"))*\s*(?:crochet|aiguille|hook|needle))/gi,
        /\d+(?:\.\d+)?\s*(?:cm|mm|inches?|")(?!(?:\s*\/\s*\d+(?:\.\d+)?\s*(?:cm|mm|inches?|"))*\s*(?:crochet|aiguille|hook|needle))/gi
    ];

    for (const pattern of sizePatterns) {
        const matches = fullText.match(pattern);
        if (matches && matches.length > 0) {
            const match = matches[0];
            const matchIndex = fullText.indexOf(match);
            const contextBefore = fullText.substring(Math.max(0, matchIndex - 50), matchIndex);
            const contextAfter = fullText.substring(matchIndex + match.length, matchIndex + match.length + 50);

            if (!hookKeywords.test(contextBefore) && !hookKeywords.test(contextAfter)) {
                return match.trim();
            }
        }
    }

    return "";
};