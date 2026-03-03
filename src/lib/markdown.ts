function escapeHtml(text: string): string {
  return text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

function isValidUrl(url: string): boolean {
  return /^https?:\/\//i.test(url);
}

export function parseMarkdown(text: string): string {
  // 1. Escape ALL HTML first (XSS prevention)
  const escaped = escapeHtml(text);

  // 2. Process line by line
  const lines = escaped.split("\n");
  const result: string[] = [];
  let inList = false;

  for (const line of lines) {
    const trimmed = line.trim();

    // Bullet list
    if (trimmed.startsWith("- ")) {
      if (!inList) {
        result.push("<ul>");
        inList = true;
      }
      result.push(`<li>${processInline(trimmed.slice(2))}</li>`);
      continue;
    }

    if (inList) {
      result.push("</ul>");
      inList = false;
    }

    if (trimmed === "") {
      result.push("<br>");
    } else {
      result.push(`<p>${processInline(trimmed)}</p>`);
    }
  }

  if (inList) result.push("</ul>");

  return result.join("");
}

function processInline(text: string): string {
  // Bold: **text**
  let result = text.replace(/\*\*(.+?)\*\*/g, "<strong>$1</strong>");

  // Links: [text](url) — only allow http/https
  result = result.replace(/\[([^\]]+)\]\(([^)]+)\)/g, (_match, linkText: string, url: string) => {
    // URL was already HTML-escaped, decode to validate the actual URL
    const decodedUrl = url
      .replace(/&amp;/g, "&")
      .replace(/&lt;/g, "<")
      .replace(/&gt;/g, ">")
      .replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'");
    if (isValidUrl(decodedUrl)) {
      // Re-escape the decoded URL for safe attribute insertion
      const safeHref = escapeHtml(decodedUrl);
      return `<a href="${safeHref}" rel="noopener noreferrer" target="_blank">${linkText}</a>`;
    }
    return linkText;
  });

  return result;
}
