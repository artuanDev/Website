// Tiny DOM helpers used by every section renderer.

export function el(tag, attrs = {}, children = []) {
  const node = document.createElement(tag);
  for (const [key, value] of Object.entries(attrs)) {
    if (value == null || value === false) continue;
    if (key === "class") node.className = value;
    else if (key === "html") node.innerHTML = value;
    else if (key.startsWith("on") && typeof value === "function") {
      node.addEventListener(key.slice(2).toLowerCase(), value);
    } else {
      node.setAttribute(key, value);
    }
  }
  for (const child of [].concat(children)) {
    if (child == null || child === false) continue;
    node.appendChild(typeof child === "string" ? document.createTextNode(child) : child);
  }
  return node;
}

export function qs(selector, root = document) {
  return root.querySelector(selector);
}

export function clear(node) {
  while (node.firstChild) node.removeChild(node.firstChild);
}

// Splits a "\n\n"-separated description into <p> elements.
export function paragraphs(text) {
  return text
    .split("\n\n")
    .map((part) => el("p", {}, part));
}
