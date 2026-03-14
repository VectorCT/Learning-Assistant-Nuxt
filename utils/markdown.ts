/**
 * Simple markdown parser for chapter content
 * Handles common markdown patterns and converts them to HTML
 */

export function parseMarkdown(content: string): string {
  if (!content) return ''
  
  let html = content
  
  // First, convert literal \n to actual newlines
  html = html.replace(/\\n/g, '\n')
  
  // Escape HTML to prevent XSS
  html = html
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
  
  // Headers (must be done before other replacements)
  // H3 (###)
  html = html.replace(/^### (.*?)$/gm, '<h3>$1</h3>')
  
  // H2 (##)
  html = html.replace(/^## (.*?)$/gm, '<h2>$1</h2>')
  
  // H1 (#)
  html = html.replace(/^# (.*?)$/gm, '<h1>$1</h1>')
  
  // Bold (**text** or __text__)
  html = html.replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
  html = html.replace(/__(.+?)__/g, '<strong>$1</strong>')
  
  // Italic (*text* or _text_)
  html = html.replace(/\*(.+?)\*/g, '<em>$1</em>')
  html = html.replace(/_(.+?)_/g, '<em>$1</em>')
  
  // Code blocks (```code```)
  html = html.replace(/```([\s\S]*?)```/g, '<pre><code>$1</code></pre>')
  
  // Inline code (`code`)
  html = html.replace(/`(.+?)`/g, '<code>$1</code>')
  
  // Links [text](url)
  html = html.replace(/\[(.+?)\]\((.+?)\)/g, '<a href="$2" target="_blank" rel="noopener noreferrer">$1</a>')
  
  // Unordered lists (- item or * item)
  html = html.replace(/^[*-] (.+)$/gm, '<li>$1</li>')
  html = html.replace(/(<li>.*<\/li>)/s, '<ul>$1</ul>')
  
  // Ordered lists (1. item)
  html = html.replace(/^\d+\. (.+)$/gm, '<li>$1</li>')
  
  // Blockquotes (> text)
  html = html.replace(/^> (.+)$/gm, '<blockquote>$1</blockquote>')
  
  // Horizontal rules (--- or ***)
  html = html.replace(/^(---|\*\*\*)$/gm, '<hr>')
  
  // Paragraph breaks (double newline)
  // First, protect existing HTML tags
  const protectedTags = ['h1', 'h2', 'h3', 'ul', 'ol', 'pre', 'blockquote', 'hr']
  const tagPattern = new RegExp(`<(${protectedTags.join('|')})[^>]*>.*?</\\1>|<(${protectedTags.join('|')})[^>]*>`, 'gs')
  
  const parts: Array<{ type: 'html' | 'text', content: string }> = []
  let lastIndex = 0
  let match
  
  while ((match = tagPattern.exec(html)) !== null) {
    // Add text before the tag
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: html.substring(lastIndex, match.index) })
    }
    // Add the HTML tag
    parts.push({ type: 'html', content: match[0] })
    lastIndex = match.index + match[0].length
  }
  
  // Add remaining text
  if (lastIndex < html.length) {
    parts.push({ type: 'text', content: html.substring(lastIndex) })
  }
  
  // Process text parts for paragraphs
  html = parts.map(part => {
    if (part.type === 'html') {
      return part.content
    }
    
    // Split by double newlines and wrap in paragraphs
    return part.content
      .split(/\n\n+/)
      .map(para => {
        para = para.trim()
        if (!para) return ''
        // Don't wrap if it's already wrapped in a tag
        if (para.startsWith('<') && para.endsWith('>')) return para
        return `<p>${para.replace(/\n/g, '<br>')}</p>`
      })
      .join('')
  }).join('')
  
  // Clean up extra whitespace
  html = html.replace(/\n{3,}/g, '\n\n')
  
  return html
}

/**
 * Extract plain text title from markdown content
 */
export function extractTitle(content: string): string {
  if (!content) return 'Untitled Section'
  
  // Convert literal \n to actual newlines first
  content = content.replace(/\\n/g, '\n')
  
  // Try to extract from markdown heading
  const h1Match = content.match(/^# (.+)$/m)
  if (h1Match) return h1Match[1].trim()
  
  const h2Match = content.match(/^## (.+)$/m)
  if (h2Match) return h2Match[1].trim()
  
  const h3Match = content.match(/^### (.+)$/m)
  if (h3Match) return h3Match[1].trim()
  
  // Fallback to first line
  const firstLine = content.split('\n')[0].trim()
  return firstLine.substring(0, 60) + (firstLine.length > 60 ? '...' : '')
}

/**
 * Remove the first heading from content (to avoid duplication)
 */
export function removeFirstHeading(content: string): string {
  if (!content) return ''
  
  // Convert literal \n to actual newlines first
  content = content.replace(/\\n/g, '\n')
  
  // Remove first H1, H2, or H3
  return content
    .replace(/^# .+$/m, '')
    .replace(/^## .+$/m, '')
    .replace(/^### .+$/m, '')
    .trim()
}
