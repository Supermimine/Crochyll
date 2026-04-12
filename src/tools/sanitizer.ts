import DOMPurify from 'dompurify'

/**
 * Sanitise le contenu HTML pour prévenir les attaques XSS
 * Permet les balises HTML communes (h1-h6, p, strong, b, i, em, ul, ol, li, br, etc.)
 * @param dirty Le HTML à nettoyer
 * @returns Le HTML sécurisé
 */
export function sanitizeHtml(dirty: string): string {
  if (!dirty) return ''

  const config = {
    ALLOWED_TAGS: [
      'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'p', 'br', 'strong', 'b', 'i', 'em', 'u',
      'ul', 'ol', 'li',
      'table', 'thead', 'tbody', 'tr', 'td', 'th',
      'div', 'span',
      'a', 'img'
    ],
    ALLOWED_ATTR: [
      'href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class'
    ],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false
  } as any

  return String(DOMPurify.sanitize(dirty, config))
}

/**
 * Sanitise pour SVG et symboles internes seulement
 * (pour Maker.vue où on affiche des symboles générés)
 * @param dirty Le HTML à nettoyer
 * @returns Le HTML sécurisé
 */
export function sanitizeInternalHtml(dirty: string): string {
  if (!dirty) return ''

  const config = {
    ALLOWED_TAGS: [
      'image', 'svg', 'g', 'path', 'circle', 'rect', 'text', 'tspan'
    ],
    ALLOWED_ATTR: [
      'href', 'src', 'xlink:href', 'width', 'height', 'x', 'y', 'cx', 'cy', 'r', 
      'fill', 'stroke', 'd', 'viewBox', 'id', 'class', 'flex', 'dominant-baseline', 
      'text-anchor', 'font-size', 'font-family', 'preserveAspectRatio', 'xmlns'
    ],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false
  } as any

  return String(DOMPurify.sanitize(dirty, config))
}
