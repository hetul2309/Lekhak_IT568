import DOMPurify from "dompurify";

export const sanitizeRichText = (html: string) =>
  DOMPurify.sanitize(html, {
    USE_PROFILES: { html: true },
  });
