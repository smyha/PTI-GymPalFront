const LIST_MARKER_REGEX = /([^\n\r])(\s*)([-*]|\d+\.)\s+/g;
const HEADING_REGEX = /([^\n\r])(#{1,6}\s)/g;

/**
 * Normalizes AI responses so they render nicely when interpreted as Markdown.
 * Ensures list markers, headings, and paragraphs are separated by new lines.
 */
export function normalizeAiResponse(content: string): string {
  if (!content) return '';

  let normalized = content.replace(/\r/g, '').trim();

  // Ensure list markers (bulleted or numbered) start on a new line
  normalized = normalized.replace(LIST_MARKER_REGEX, (_, prev, spaces, marker) => {
    const separator = prev === '\n' ? '' : '\n';
    return `${prev}${separator}${marker} `;
  });

  // Ensure headings have a blank line before them to render correctly
  normalized = normalized.replace(HEADING_REGEX, (_, prev, heading) => {
    const separator = prev === '\n' ? '\n' : '\n\n';
    return `${prev}${separator}${heading}`;
  });

  // Collapse multiple blank lines to just two
  normalized = normalized.replace(/\n{3,}/g, '\n\n');

  return normalized;
}

export default normalizeAiResponse;

