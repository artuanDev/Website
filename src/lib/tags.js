// Keep engine versions together while preserving the original labels on cards.
export function canonicalTag(tag) {
  const value = tag.trim();
  if (/^unity(?:\s+\d.*)?$/i.test(value)) return "Unity";
  if (/^(?:unreal(?:\s+engine)?(?:\s+\d.*)?|ue[45])$/i.test(value)) return "Unreal";
  return value;
}

export function entryTags(entry) {
  return [...new Set((entry.tags || entry.tech || []).map(canonicalTag))];
}

export function collectTags(entries) {
  return [...new Set(entries.flatMap(entryTags))].sort((a, b) => a.localeCompare(b));
}

export function matchesTag(entry, tag) {
  return tag === null || entryTags(entry).includes(tag);
}
