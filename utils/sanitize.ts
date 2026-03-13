import DOMPurify from 'isomorphic-dompurify'

export function sanitizeHTML(htmlContent: string): string {
  if (!htmlContent) return ''
  
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: [
      'p', 'div', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6',
      'ul', 'ol', 'li', 'strong', 'em', 'u', 'br', 'img', 'a',
      'table', 'thead', 'tbody', 'tr', 'th', 'td', 'blockquote', 'code', 'pre'
    ],
    ALLOWED_ATTR: ['href', 'src', 'alt', 'title', 'class', 'id'],
    ALLOW_DATA_ATTR: false
  })
}
