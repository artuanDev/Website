export function orderUpdates(posts) {
  return [...posts].sort((a, b) => Number(b.pinned === true) - Number(a.pinned === true)
    || (b.date || "").localeCompare(a.date || ""));
}
