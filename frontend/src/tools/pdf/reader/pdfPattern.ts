function isGarbage(line: string): boolean {
  const trimmed = line.trim();

  // déjà géré avant mais on peut renforcer
  if (/(https?:\/\/|www\.|©|hobbii)/i.test(trimmed)) return true;

  // lignes avec séparateurs typiques de crédits
  if (trimmed.includes("|")) return true;

  // lignes très courtes (ex: "3")
  if (trimmed.length <= 3) return true;

  // pattern type "Nom | No."
  if (/^[A-Z][a-z]+.*\|\s*No\.?/i.test(trimmed)) return true;

  return false;
}

export const getPatternSection = (sections: string): { finalSection: string[] } => {
    const lines = sections
        .split(/(?<=<\/h3>)|\n/)
        .map(l => l.trim())
        .filter(Boolean)
        .filter(l => !isGarbage(l));

    const groupedSections: string[] = [];
    let currentSection: string[] = [];

    for (const line of lines) {
        // Vérifier si c'est un titre de section
        if (line.startsWith("<h3>")) {
            // Si une section existait, l'assembler et la sauvegarder
            if (currentSection.length > 0) {
                groupedSections.push(currentSection.join("\n"));
            }
            // Créer une nouvelle section avec le titre
            currentSection = [line];
        } else {
            // Ajouter le contenu à la section actuelle
            currentSection.push(line);
        }
    }

    // Ne pas oublier de sauvegarder la dernière section
    if (currentSection.length > 0) {
        groupedSections.push(currentSection.join("\n"));
    }

    console.log("Grouped sections:", groupedSections);

    return {
        finalSection: groupedSections
    };
};