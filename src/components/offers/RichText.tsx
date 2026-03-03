import { parseMarkdown } from "@/lib/markdown";

interface RichTextProps {
  text: string;
  className?: string;
}

// SECURITY NOTE: parseMarkdown() escapes ALL HTML entities first (& < > " '),
// then applies markdown patterns on the escaped output. This escape-first
// approach prevents XSS because user input like <script> becomes &lt;script&gt;
// before any pattern matching occurs. Only http/https URLs are allowed in links.

export function RichText({ text, className }: RichTextProps) {
  const html = parseMarkdown(text);

  return (
    <div
      className={`rich-text text-sm text-slate-300 leading-relaxed [&_strong]:text-white [&_a]:text-indigo-400 [&_a:hover]:underline [&_ul]:list-disc [&_ul]:list-inside [&_ul]:my-1 [&_li]:text-slate-300 [&_p]:mb-1 [&_p:last-child]:mb-0 ${className ?? ""}`}
      dangerouslySetInnerHTML={{ __html: html }}
    />
  );
}
