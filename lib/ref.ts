// Referral/creator handles ride URLs (?ref=) and share-card params (?by=),
// so they're strictly sanitized everywhere they cross a boundary: lowercase
// slug, 1-32 chars, nothing else survives.
export function cleanRef(raw: string | null | undefined): string | null {
  if (!raw) return null;
  const slug = raw.trim().toLowerCase();
  return /^[a-z0-9_-]{1,32}$/.test(slug) ? slug : null;
}
