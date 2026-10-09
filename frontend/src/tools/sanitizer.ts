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
      'href', 'title', 'target', 'src', 'alt', 'width', 'height', 'class', 'style'
    ],
    ALLOW_DATA_ATTR: false,
    RETURN_DOM: false
  } as any

  return String(DOMPurify.sanitize(dirty, config))
}

export function sanitizeNoteHtml(dirty: string): string {
  if (!dirty) return ''

  const sanitized = DOMPurify.sanitize(dirty, {
    ALLOWED_TAGS: ['p', 'div', 'br', 'strong', 'b', 'i', 'em', 'u', 'span'],
    ALLOWED_ATTR: ['style', 'align'],
    ALLOW_DATA_ATTR: false
  })
  const parsed = new DOMParser().parseFromString(String(sanitized), 'text/html')

  parsed.body.querySelectorAll<HTMLElement>('*').forEach((element) => {
    const textAlign = (element.getAttribute('align') || element.style.textAlign).toLowerCase()
    const fontSize = element.style.fontSize.trim()
    const display = element.style.display
    element.removeAttribute('style')
    element.removeAttribute('align')

    if ((element.tagName === 'P' || element.tagName === 'DIV') && ['left', 'center', 'right', 'justify'].includes(textAlign)) {
      element.style.textAlign = textAlign
    }

    if (element.tagName === 'SPAN') {
      if (/^(?:[8-9]|[1-6]\d|7[0-2])px$/.test(fontSize)) {
        element.style.fontSize = fontSize
      }
      if (display === 'inline-block') {
        element.style.display = display
      }
    }
  })

  return parsed.body.innerHTML
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
