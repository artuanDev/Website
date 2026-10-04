// A small, text-only authoring format. Raw HTML is never inserted into the DOM.
export function parseBlogBody(text) {
  const blocks = [];
  let paragraph = [], code = null, codeLabel = "", chapter = 0;
  const flush = () => {
    if (paragraph.length) blocks.push({ type: blocks.length ? "p" : "lead", text: paragraph.join("\n") });
    paragraph = [];
  };
  for (const line of text.replace(/\r\n/g, "\n").split("\n")) {
    if (line.startsWith("```")) {
      flush();
      if (code !== null) { blocks.push({ type: "code", label: codeLabel, code: code.join("\n") }); code = null; }
      else { code = []; codeLabel = line.slice(3).trim(); }
    } else if (code !== null) code.push(line);
    else if (line.startsWith("## ")) {
      flush();
      blocks.push({ type: "chapter", number: String(++chapter).padStart(2, "0"), eyebrow: "", title: line.slice(3).trim() });
    } else {
      const figure = /^!\[([^\]]*)\]\(([^\s)]+)\)$/.exec(line.trim());
      if (figure && /^(?:https:\/\/|\/(?!\/))/.test(figure[2])) {
        flush(); blocks.push({ type: "figure", src: figure[2], alt: figure[1], caption: figure[1] });
      } else if (!line.trim()) flush();
      else paragraph.push(line);
    }
  }
  if (code !== null) blocks.push({ type: "code", label: codeLabel, code: code.join("\n") });
  flush();
  return blocks;
}

export function serializeBlogBody(blocks = []) {
  return blocks.map((block) => {
    if (block.type === "chapter") return `## ${block.title}`;
    if (block.type === "figure") return `![${block.alt || ""}](${block.src})`;
    if (block.type === "code") return `\`\`\`${block.label || ""}\n${block.code}\n\`\`\``;
    return block.text || "";
  }).join("\n\n");
}
