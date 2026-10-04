import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync, existsSync } from "node:fs";
import { canonicalTag, collectTags, matchesTag } from "../src/lib/tags.js";
import { parseBlogBody, serializeBlogBody } from "../src/lib/blogMarkdown.js";
import projects from "../src/data/projects.js";
import articles from "../src/data/articles.js";
import en from "../src/data/i18n/en.js";
import es from "../src/data/i18n/es.js";
import { parseRoute } from "../src/lib/router.js";
import { orderUpdates } from "../src/lib/updates.js";

test("pinned updates stay above newer updates, with dates ordering each group", () => {
  const posts = [{ id: "new", date: "2026-10-04" }, { id: "pin-old", date: "2020-01-01", pinned: true },
    { id: "pin-new", date: "2025-01-01", pinned: true }, { id: "old", date: "2019-01-01" }];
  assert.deepEqual(orderUpdates(posts).map(post => post.id), ["pin-new", "pin-old", "new", "old"]);
  assert.equal(posts[0].id, "new", "sorting does not mutate saved posts");
  assert.deepEqual(orderUpdates(posts.map(post => ({ ...post, pinned: false }))).map(post => post.id), ["new", "pin-new", "pin-old", "old"]);
});

test("Updates integrates composing and preserves old blog links", () => {
  assert.deepEqual(parseRoute("#/updates"), { name: "section", section: "updates" });
  assert.equal(parseRoute("#/updates?compose").compose, true);
  assert.equal(parseRoute("#/updates?edit=hello").postId, "hello");
  assert.deepEqual(parseRoute("#/blog"), { name: "section", section: "updates" });
  assert.deepEqual(parseRoute("#/write"), { name: "section", section: "updates", compose: true });
  assert.deepEqual(parseRoute("#/blog/hello"), parseRoute("#/updates/hello"));
});

test("engine tags group versions and aliases without merging unrelated tags", () => {
  assert.equal(canonicalTag("Unity 6"), "Unity");
  assert.equal(canonicalTag("Unreal Engine 5"), "Unreal");
  assert.equal(canonicalTag("UE5"), "Unreal");
  assert.equal(canonicalTag("Compute Shaders"), "Compute Shaders");
  const unity = projects.filter((project) => matchesTag(project, "Unity"));
  assert.ok(unity.some((project) => project.id === "raymarching-sdf"));
  assert.ok(unity.some((project) => project.id === "directional-uv"));
  assert.ok(unity.every((project) => !project.tech.includes("Rust")));
  assert.ok(collectTags(articles).includes("Python"));
  assert.equal(projects.filter((entry) => matchesTag(entry, null)).length, projects.length);
});

test("markdown paragraphs, headings, figures and code preserve their order", () => {
  const text = "Intro **bold**.\n\n## Test\n\n![Water](/assets/water.png)\n\n```hlsl\nfloat a = 1;\n\nfloat b = 2;\n```\n\nNext step.";
  const blocks = parseBlogBody(text);
  assert.deepEqual(blocks.map((block) => block.type), ["lead", "chapter", "figure", "code", "p"]);
  assert.equal(blocks[3].code, "float a = 1;\n\nfloat b = 2;");
  assert.deepEqual(parseBlogBody(serializeBlogBody(blocks)), blocks);
});

test("figure parsing rejects executable and protocol-relative URLs", () => {
  for (const url of ["javascript:alert(1)", "//example.com/x.png", "data:image/svg+xml,foo"]) {
    assert.ok(parseBlogBody(`![unsafe](${url})`).every((block) => block.type !== "figure"));
  }
  assert.equal(parseBlogBody("<script>alert(1)</script>")[0].text, "<script>alert(1)</script>");
});

test("unfinished fenced code remains a code block", () => {
  assert.deepEqual(parseBlogBody("```csharp\nvar x = 1;"), [{ type: "code", label: "csharp", code: "var x = 1;" }]);
});

test("mock post fixture has supplied images and bilingual content", () => {
  const post = JSON.parse(readFileSync(new URL("./fixtures/faking-water-caustics.json", import.meta.url), "utf8"));
  assert.ok(post.published);
  assert.ok(post.tags.includes("Unity"));
  for (const language of ["en", "es"]) {
    assert.ok(post.i18n[language].title);
    const figures = post.story[language].blocks.filter((block) => block.type === "figure");
    assert.equal(figures.length, 2);
    figures.forEach((block) => assert.ok(existsSync(new URL(`../public${block.src}`, import.meta.url))));
  }
});

test("new UI copy has matching English and Spanish keys", () => {
  function keys(value, prefix = "") {
    return Object.entries(value).flatMap(([key, child]) => child && typeof child === "object"
      ? keys(child, `${prefix}${key}.`) : [`${prefix}${key}`]);
  }
  for (const namespace of ["filters", "blog", "blogDetail", "writer"]) {
    assert.deepEqual(keys(en[namespace]).sort(), keys(es[namespace]).sort());
  }
});
