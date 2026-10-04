export function orderUpdates(posts) {
  return [...posts].sort((a, b) => Number(b.pinned === true) - Number(a.pinned === true)
    || (b.date || "").localeCompare(a.date || ""));
}

export function localUpdateDate(value = new Date()) {
  return [String(value.getFullYear()).padStart(4, "0"), String(value.getMonth() + 1).padStart(2, "0"),
    String(value.getDate()).padStart(2, "0")].join("-");
}

export function normalizeUpdateUrlName(value) {
  return value.trim().normalize("NFKD").replace(/\p{M}/gu, "").toLowerCase()
    .replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "").slice(0, 100).replace(/-+$/g, "");
}

export function updateValidationError(post) {
  if (!["en", "es"].some(language => post.story[language]?.blocks.length)) return "emptyUpdate";
  if (!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(post.id)) return "invalidSlug";
  const date = new Date(`${post.date}T12:00:00`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(post.date) || Number.isNaN(date.getTime()) || localUpdateDate(date) !== post.date) return "invalidDate";
  if (post.links?.linkedin) {
    try { if (new URL(post.links.linkedin).protocol !== "https:") return "unsafeUrl"; }
    catch { return "unsafeUrl"; }
  }
  return null;
}
