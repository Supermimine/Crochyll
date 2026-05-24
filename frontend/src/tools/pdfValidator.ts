/**
 * Validateur pour les fichiers PDF
 * Vérifie: MIME type, taille, extension, et magic number
 */

const MAX_PDF_SIZE = 50 * 1024 * 1024; // 50 MB

interface ValidationResult {
  valid: boolean;
  error?: string;
}

/**
 * Vérifie si un fichier est un PDF valide
 * @param file Le fichier à valider
 * @returns Résultat de la validation
 */
export async function validatePdfFile(file: File): Promise<ValidationResult> {
  // Vérifier le MIME type
  if (file.type !== 'application/pdf') {
    return {
      valid: false,
      error: `Type de fichier invalide: ${file.type}. Seuls les PDFs sont acceptés.`
    };
  }

  // Vérifier l'extension
  if (!file.name.toLowerCase().endsWith('.pdf')) {
    return {
      valid: false,
      error: `L'extension du fichier doit être .pdf (trouvé: ${file.name})`
    };
  }

  // Vérifier la taille
  if (file.size > MAX_PDF_SIZE) {
    const sizeMB = (MAX_PDF_SIZE / (1024 * 1024)).toFixed(1);
    return {
      valid: false,
      error: `Le fichier est trop volumineux (${(file.size / (1024 * 1024)).toFixed(1)} MB). Taille maximale: ${sizeMB} MB`
    };
  }

  // Vérifier si le fichier est vide
  if (file.size === 0) {
    return {
      valid: false,
      error: 'Le fichier is vide. Veuillez sélectionner un PDF valide.'
    };
  }

  // Vérifier le magic number (signature) du PDF
  // Les PDFs commencent par "%PDF"
  const headerBuffer = await file.slice(0, 4).arrayBuffer();
  const headerArray = new Uint8Array(headerBuffer);
  const headerText = String.fromCharCode(...headerArray);

  if (headerText !== '%PDF') {
    return {
      valid: false,
      error: 'Le fichier ne semble pas être un PDF valide (signature manquante). Vérifiez que le fichier n\'est pas corrompu.'
    };
  }

  return { valid: true };
}
