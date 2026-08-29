import { el } from "../lib/dom.js";
import { getLang, getProjectText } from "../lib/i18n.js";
import { navigateToSection } from "../lib/router.js";

const ASSET_ROOT = "/assets/projects/raymarching-sdf";

const copy = {
  back: { en: "Back to portfolio", es: "Volver al portfolio" },
  eyebrow: { en: "Rendering project · Technical case study", es: "Proyecto de rendering · Caso de estudio técnico" },
  deck: {
    en: "A native-resolution raymarching system with component-based authoring, constructive solid geometry, GPU-driven rendering, and URP Lit materials.",
    es: "Sistema de raymarching a resolución nativa con edición por componentes, geometría sólida constructiva, renderizado en GPU y materiales URP Lit.",
  },
  meta: {
    en: "Procedural geometry · Real-time rendering · Tools",
    es: "Geometría procedural · Renderizado en tiempo real · Herramientas",
  },
};

const sections = {
  idea: {
    eyebrow: "01 · The idea",
    title: "Building surfaces from distance",
    intro: "Over the past few months, I have been exploring signed distance functions. I first became interested in them through Iñigo Quílez’s work, which showed me how much form and character can come from a small set of equations.",
    definition: "An SDF describes a surface by returning the distance from a point in space to that surface. The sign tells us which side of it we are on.",
    takeaway: "In short: I can create and reshape 3D forms with math instead of stored mesh vertices.",
    signs: [["d(p) < 0", "inside the shape"], ["d(p) = 0", "on the surface"], ["d(p) > 0", "outside the shape"]],
    mediaLabel: "SDF renderer hero reel",
    traceTitle: "How sphere tracing finds a surface",
    traceBody: "For each pixel, the renderer casts a camera ray. The distance field tells it a safe step size, so the ray moves quickly through empty space and stops when it is close enough to the surface or leaves the model’s bounds.",
    traceSteps: ["Camera ray", "Sample distance", "Advance safely", "Surface hit"],
  },
  authoring: {
    eyebrow: "02 · Authoring",
    title: "Math that still feels like Unity",
    body: "I wanted this to be more than a shader demo. Each primitive is a Unity component, and each model keeps an ordered stack of operations and modifiers. I can build, select, move, and tune SDF forms directly in the editor without baking a mesh.",
    mediaLabel: "Component-based authoring workflow",
    caption: "Shapes can be selected in the Scene view and edited through normal components. A refittable bounds BVH keeps scene picking practical in large animated scenes.",
    bullets: [
      ["Six CSG operations", "union, subtraction, intersection, and smooth versions of all three."],
      ["Ten modifiers", "rounding, onion shells, elongation, symmetry, repetition, twist, bend, revolution, and extrusion."],
      ["Material-aware blending", "smooth CSG uses the same blend weight for shape and shading, so transitions stay visually consistent."],
      ["Custom surface modules", "new shading code can be added through .sdfshader assets alongside the built-in models."],
    ],
    note: "Subtraction also keeps the cutter’s material on the newly exposed surface. That small detail makes carved forms much easier to art-direct.",
  },
  architecture: {
    eyebrow: "03 · Rendering architecture",
    title: "Integrated into URP at native resolution",
    intro: "The renderer is built as a Unity 6 ScriptableRendererFeature. It records RenderGraph passes after opaque geometry, writes directly into URP’s active color and depth targets, and never creates a reduced-resolution SDF buffer.",
    flow: [
      ["Unity components", "Shapes, transforms, CSG, modifiers, and materials remain editable scene data."],
      ["Incremental updates", "Change tracking and Burst jobs refresh only the buffers and bounds that became dirty."],
      ["Persistent GPU data", "Models, shapes, modifiers, and materials live in reusable structured buffers."],
      ["Bounded tracing", "Invisible 36-vertex AABBs restrict fragment work before the shader sphere-traces."],
      ["URP output", "Hits write device depth, normals, model ID, and final lit colour into the camera frame."],
    ],
    cards: [
      ["Depth is part of the scene", "Successful SDF hits write SV_Depth, so regular opaque meshes can occlude SDFs and later passes respect their surfaces."],
      ["One hit, reused", "When a depth/normal prepass is active, it stores the winning model ID. The colour pass reuses that hit and normal instead of tracing the same pixel again."],
      ["Several camera types", "Perspective, orthographic, Scene, Game, and inside-volume cameras have dedicated ray setup paths while sharing the same scene buffers."],
    ],
    note: "Why this matters: the SDF renderer coexists with normal URP content instead of replacing the pipeline. Meshes, probes, depth effects, and SDF surfaces all take part in the same frame.",
  },
  scale: {
    eyebrow: "04 · Scale",
    title: "A GPU-driven path for dense scenes",
    mediaLabel: "GPU-instanced SDF scene",
    imageLabel: "5,000-model benchmark capture",
    caption: "The sample benchmark enables animation, CSG operations, modifiers, and GPU-driven updates. The controller can be configured for as many as 10,000 models.",
    body: "The high-count path keeps animation and render data on the GPU. A compute pass updates transforms, inverse matrices, CSG, modifiers, conservative bounds, and full PBR materials in the same layouts used by the production renderer.",
    stats: [["5,000", "models in the recorded sample scene"], ["10,000", "maximum supported by the benchmark controller"]],
    bullets: [
      ["Persistent buffers", "avoid rebuilding the full scene every frame."],
      ["GPU frustum culling", "compacts visible model IDs for each camera."],
      ["Indirect procedural draws", "submit only the compacted list, with no visible-count readback to the CPU."],
      ["Per-camera visibility lists", "let Scene and Game views share immutable scene data."],
    ],
    note: "Raymarching cost still depends heavily on screen coverage, step count, and effect settings. The project includes repeatable sweeps for CPU/GPU timing, upload volume, and dirty-data refresh counts rather than relying on one headline FPS number.",
  },
  shapes: {
    eyebrow: "05 · Shape language",
    title: "More than spheres and boxes",
    intro: "The catalogue contains exact signed distances, conservative distance bounds, and thin surfaces derived from unsigned distances. Each entry has GPU evaluation and conservative bounds; the main set is also covered by focused CPU-side tests.",
    mediaLabel: "Primitive gallery",
    stats: [["33", "primitive entries"], ["6", "ordered CSG operations"], ["10", "stackable modifiers"]],
    groups: [
      ["Organic", "capsules, ellipsoids, cut spheres, round cones, vesica forms."],
      ["Hard surface", "frames, prisms, cylinders, pyramids, octahedra."],
      ["Unbounded", "planes, cylinders, cones, and repetition use explicit clip volumes."],
    ],
  },
  materials: {
    eyebrow: "06 · Materials and lighting",
    title: "SDF surfaces that belong in a URP scene",
    mediaLabel: "URP Lit material examples",
    imageLabel: "Left: SDF · Right: mesh geometry",
    p1: "The built-in URP Lit path turns an analytic hit into Unity surface and lighting data. It supports base colour, tangent-space normal, metallic, separate roughness, occlusion, and emission.",
    p2: "Because there are no mesh UVs or tangents, textures use local-space triplanar projection. Each map has its own scale and offset. Normals are blended in local tangent planes and transformed correctly through rotation and non-uniform scale.",
    cards: [
      ["Ambient occlusion is natural—not free", "Local AO samples the model’s distance field along the surface normal. URP screen-space AO adds contact between separate SDF models and regular geometry through the shared depth/normal prepass."],
      ["Shadows stay focused", "For the main directional light, conservative caster bounds are extruded across the screen. The shader traces only the light-ray segment that crosses each caster’s original bounds."],
    ],
    kicker: "Can you spot the SDF set before reading the label? That visual match was one of the goals.",
  },
  lessons: {
    eyebrow: "07 · What I learned",
    title: "The shader was only the beginning",
    quote: "I wanted to see whether math-defined geometry could feel like a native part of Unity, not a separate rendering trick.",
    p1: "The hardest work appeared around the raymarcher: authoring, conservative bounds, GPU synchronization, material data, depth integration, scene picking, and honest profiling. Building full demonstration scenes exposed problems that isolated primitive tests did not.",
    p2: "The result is an extensible renderer that can move from small hand-authored sculptures to large GPU-driven scenes while keeping the same analytic geometry, CSG, lighting, and material pipeline.",
    takeaways: [
      ["Design for change", "Track transforms, topology, operations, modifiers, materials, and bounds independently."],
      ["Measure the frame", "Separate CPU uploads, GPU work, screen coverage, and editor overhead."],
      ["Keep one contract", "Authored and GPU-produced scenes feed the same render-data layouts."],
      ["Integrate deeply", "Depth, normals, probes, SSAO, and shadows matter as much as the final colour."],
    ],
    note: "Current scope: opaque surfaces are the production path. Transparent composition needs a separate sorting strategy; XR single-pass instancing still needs validation; SDF shadow casting for additional lights is future work.",
    end: "— end of case study",
  },
};

const sectionsEs = {
  idea: {
    eyebrow: "01 · La idea",
    title: "Construir superficies a partir de distancia",
    intro: "Durante los últimos meses he explorado las funciones de distancia firmada. Me interesaron a través del trabajo de Iñigo Quílez, que demuestra cuánta forma y carácter puede surgir de un conjunto pequeño de ecuaciones.",
    definition: "Una SDF describe una superficie devolviendo la distancia desde un punto del espacio hasta ella. El signo indica en qué lado nos encontramos.",
    takeaway: "En resumen: puedo crear y transformar formas 3D con matemáticas en lugar de almacenar vértices.",
    signs: [["d(p) < 0", "dentro de la forma"], ["d(p) = 0", "sobre la superficie"], ["d(p) > 0", "fuera de la forma"]],
    mediaLabel: "Reel del renderizador SDF",
    traceTitle: "Cómo encuentra una superficie el sphere tracing",
    traceBody: "Para cada píxel, el renderizador lanza un rayo desde la cámara. El campo de distancia proporciona un paso seguro para atravesar rápidamente el espacio vacío hasta alcanzar la superficie o salir de los límites.",
    traceSteps: ["Rayo de cámara", "Muestrear distancia", "Avanzar con seguridad", "Impacto"],
  },
  authoring: {
    eyebrow: "02 · Edición",
    title: "Matemáticas que siguen sintiéndose como Unity",
    body: "Quería que fuese más que una demo de shader. Cada primitiva es un componente de Unity y cada modelo mantiene una pila ordenada de operaciones y modificadores. Puedo crear, seleccionar, mover y ajustar formas SDF directamente en el editor sin hornear una malla.",
    mediaLabel: "Flujo de edición por componentes",
    caption: "Las formas se seleccionan en la vista de escena y se editan como componentes normales. Un BVH de límites reajustable mantiene ágil la selección en escenas grandes y animadas.",
    bullets: [
      ["Seis operaciones CSG", "unión, sustracción, intersección y sus tres versiones suaves."],
      ["Diez modificadores", "redondeo, capas onion, elongación, simetría, repetición, twist, bend, revolución y extrusión."],
      ["Mezcla consciente del material", "la CSG suave comparte el peso de mezcla entre forma y sombreado para conservar transiciones coherentes."],
      ["Módulos de superficie personalizados", "se puede añadir código de sombreado mediante assets .sdfshader junto a los modelos incluidos."],
    ],
    note: "La sustracción conserva además el material del cortador en la superficie recién expuesta. Ese detalle facilita mucho la dirección artística de las formas talladas.",
  },
  architecture: {
    eyebrow: "03 · Arquitectura de rendering",
    title: "Integrado en URP a resolución nativa",
    intro: "El renderizador está construido como una ScriptableRendererFeature de Unity 6. Registra pases de RenderGraph después de la geometría opaca, escribe directamente en los targets activos de color y profundidad de URP y nunca crea un buffer SDF a resolución reducida.",
    flow: [
      ["Componentes de Unity", "Formas, transformaciones, CSG, modificadores y materiales permanecen como datos editables."],
      ["Actualizaciones incrementales", "El seguimiento de cambios y Burst Jobs refrescan solo los buffers y límites modificados."],
      ["Datos GPU persistentes", "Modelos, formas, modificadores y materiales viven en buffers estructurados reutilizables."],
      ["Trazado acotado", "AABB invisibles de 36 vértices limitan el trabajo de fragmento antes del sphere tracing."],
      ["Salida URP", "Los impactos escriben profundidad, normales, ID de modelo y color final iluminado en el frame."],
    ],
    cards: [
      ["La profundidad forma parte de la escena", "Los impactos SDF escriben SV_Depth, de modo que las mallas opacas pueden ocluirlos y los pases posteriores respetan sus superficies."],
      ["Un impacto, reutilizado", "El prepass de profundidad y normales guarda el ID del modelo ganador. El pase de color reutiliza el impacto y la normal sin volver a trazar el píxel."],
      ["Varios tipos de cámara", "Cámaras perspectivas, ortográficas, Scene, Game e interiores comparten buffers, con rutas específicas para construir sus rayos."],
    ],
    note: "Por qué importa: el renderizador SDF convive con el contenido URP normal en vez de reemplazar el pipeline. Mallas, probes, efectos de profundidad y superficies SDF participan en el mismo frame.",
  },
  scale: {
    eyebrow: "04 · Escala",
    title: "Una ruta dirigida por GPU para escenas densas",
    mediaLabel: "Escena SDF instanciada en GPU",
    imageLabel: "Captura del benchmark con 5.000 modelos",
    caption: "El benchmark incluye animación, operaciones CSG, modificadores y actualizaciones en GPU. El controlador puede configurarse para hasta 10.000 modelos.",
    body: "La ruta de alto recuento mantiene la animación y los datos de render en la GPU. Un pase compute actualiza transformaciones, matrices inversas, CSG, modificadores, límites conservadores y materiales PBR con las mismas estructuras del renderizador de producción.",
    stats: [["5.000", "modelos en la escena de muestra"], ["10.000", "máximo admitido por el controlador del benchmark"]],
    bullets: [
      ["Buffers persistentes", "evitan reconstruir toda la escena en cada frame."],
      ["Frustum culling en GPU", "compacta los ID visibles para cada cámara."],
      ["Dibujado procedural indirecto", "envía solo la lista compactada sin leer el recuento visible en CPU."],
      ["Listas de visibilidad por cámara", "permiten que las vistas Scene y Game compartan datos inmutables."],
    ],
    note: "El coste del raymarching depende de la cobertura en pantalla, los pasos y los efectos activos. Barridos repetibles miden tiempos de CPU/GPU, volumen de subida y datos actualizados en lugar de confiar en una sola cifra de FPS.",
  },
  shapes: {
    eyebrow: "05 · Lenguaje de formas",
    title: "Más que esferas y cajas",
    intro: "El catálogo contiene distancias firmadas exactas, límites conservadores y superficies finas derivadas de distancias sin signo. Cada entrada tiene evaluación en GPU y límites conservadores; el conjunto principal también dispone de tests específicos en CPU.",
    mediaLabel: "Galería de primitivas",
    stats: [["33", "primitivas"], ["6", "operaciones CSG ordenadas"], ["10", "modificadores apilables"]],
    groups: [
      ["Orgánicas", "cápsulas, elipsoides, esferas cortadas, conos redondos y formas vesica."],
      ["Hard surface", "marcos, prismas, cilindros, pirámides y octaedros."],
      ["Sin límites", "planos, cilindros, conos y repetición usan volúmenes de recorte explícitos."],
    ],
  },
  materials: {
    eyebrow: "06 · Materiales e iluminación",
    title: "Superficies SDF que pertenecen a una escena URP",
    mediaLabel: "Ejemplos de material URP Lit",
    imageLabel: "Izquierda: SDF · Derecha: geometría de malla",
    p1: "La ruta URP Lit integrada convierte un impacto analítico en datos de superficie e iluminación de Unity. Admite color base, normales en espacio tangente, metalicidad, rugosidad independiente, oclusión y emisión.",
    p2: "Como no hay UV ni tangentes de malla, las texturas usan proyección triplanar en espacio local. Cada mapa tiene su propia escala y offset. Las normales se mezclan en planos tangentes locales y se transforman correctamente con rotación y escalado no uniforme.",
    cards: [
      ["La oclusión ambiental es natural, no gratuita", "El AO local muestrea el campo de distancia a lo largo de la normal. El SSAO de URP añade contacto entre modelos SDF y geometría normal mediante el prepass compartido."],
      ["Sombras enfocadas", "Para la luz direccional principal, los límites conservadores se extruyen sobre la pantalla. El shader traza solo el segmento que cruza los límites originales de cada caster."],
    ],
    kicker: "¿Puedes distinguir el conjunto SDF antes de leer la etiqueta? Conseguir esa coincidencia visual era uno de los objetivos.",
  },
  lessons: {
    eyebrow: "07 · Lo aprendido",
    title: "El shader era solo el principio",
    quote: "Quería comprobar si una geometría definida por matemáticas podía sentirse como parte nativa de Unity, no como un truco de render separado.",
    p1: "El trabajo más difícil apareció alrededor del raymarcher: edición, límites conservadores, sincronización GPU, materiales, integración de profundidad, selección en escena y profiling honesto. Las escenas de demostración completas revelaron problemas que los tests aislados no mostraban.",
    p2: "El resultado es un renderizador extensible que puede pasar de pequeñas esculturas editadas a mano a escenas grandes dirigidas por GPU, manteniendo la misma geometría analítica, CSG, iluminación y pipeline de materiales.",
    takeaways: [
      ["Diseñar para el cambio", "Seguir transformaciones, topología, operaciones, modificadores, materiales y límites de forma independiente."],
      ["Medir el frame", "Separar subidas de CPU, trabajo de GPU, cobertura de pantalla y coste del editor."],
      ["Mantener un contrato", "Las escenas editadas y generadas en GPU alimentan las mismas estructuras de render."],
      ["Integrar en profundidad", "Profundidad, normales, probes, SSAO y sombras importan tanto como el color final."],
    ],
    note: "Alcance actual: las superficies opacas son la ruta de producción. La transparencia requiere otra estrategia de ordenación; XR single-pass aún necesita validación; las sombras SDF para luces adicionales quedan como trabajo futuro.",
    end: "— fin del caso de estudio",
  },
};

const heroTags = ["Unity 6", "URP 17.3", "C#", "HLSL", "Compute shaders", "RenderGraph"];
const closingTags = ["RenderGraph integration", "Compute-driven updates", "Indirect rendering", "Burst + Jobs", "Custom shader importer", "Edit/Play Mode tests"];

function localized(entry) {
  return entry[getLang() === "es" ? "es" : "en"];
}

function textBlock(tag, className, text) {
  return el(tag, { class: className }, text);
}

function renderIdeaIntro(text) {
  const linkedName = "Iñigo Quílez";
  const nameIndex = text.indexOf(linkedName);
  if (nameIndex === -1) return el("p", {}, text);

  return el("p", {}, [
    text.slice(0, nameIndex),
    el("a", {
      class: "sdf-inline-link",
      href: "https://iquilezles.org/articles/raymarchingdf/",
      target: "_blank",
      rel: "noreferrer noopener",
    }, linkedName),
    text.slice(nameIndex + linkedName.length),
  ]);
}

function mediaLabel(text) {
  return el("span", { class: "sdf-media-label" }, text);
}

function videoFigure({ src, poster, label, caption, className = "" }) {
  return el("figure", { class: `sdf-media ${className}`.trim() }, [
    el("div", { class: "sdf-media-frame" }, [
      el("video", { src, poster, controls: "", preload: "metadata", playsinline: "" }),
      mediaLabel(label),
    ]),
    caption ? el("figcaption", {}, caption) : null,
  ]);
}

function imageFigure({ src, alt, label, caption, className = "" }) {
  return el("figure", { class: `sdf-media ${className}`.trim() }, [
    el("div", { class: "sdf-media-frame" }, [
      el("img", { src, alt, loading: "lazy" }),
      mediaLabel(label),
    ]),
    caption ? el("figcaption", {}, caption) : null,
  ]);
}

function bulletList(items) {
  return el("ul", { class: "sdf-clean-list" }, items.map(([title, body]) =>
    el("li", {}, [el("strong", {}, `${title}: `), body])
  ));
}

function cardGrid(items, className = "") {
  return el("div", { class: `sdf-card-grid ${className}`.trim() }, items.map(([title, body]) =>
    el("article", { class: "sdf-card" }, [el("h3", {}, title), el("p", {}, body)])
  ));
}

function chapter(key, data, children) {
  return el("section", { class: `sdf-chapter sdf-chapter-${key}`, id: `sdf-${key}` }, [
    el("div", { class: "sdf-chapter-heading" }, [
      textBlock("p", "sdf-eyebrow", data.eyebrow),
      textBlock("h2", "sdf-title", data.title),
    ]),
    ...children,
    el("span", { class: "sdf-chapter-number", "aria-hidden": "true" }, data.eyebrow.slice(0, 2)),
  ]);
}

function renderHero(project) {
  return el("header", { class: "sdf-hero" }, [
    el("video", {
      class: "sdf-hero-video", src: `${ASSET_ROOT}/hero.mp4`, poster: project.thumb,
      autoplay: "", muted: "", loop: "", playsinline: "", preload: "metadata",
    }),
    el("div", { class: "sdf-hero-shade" }),
    el("div", { class: "sdf-hero-copy" }, [
      textBlock("p", "sdf-eyebrow", localized(copy.eyebrow)),
      textBlock("h1", "sdf-hero-title", getProjectText(project, "title")),
      textBlock("p", "sdf-hero-deck", localized(copy.deck)),
      el("ul", { class: "sdf-pill-row" }, heroTags.map((tag) => el("li", {}, tag))),
    ]),
    el("div", { class: "sdf-hero-meta" }, [el("span", { class: "sdf-rule" }), localized(copy.meta)]),
    el("button", {
      class: "sdf-hero-play", type: "button", "aria-label": "Play or pause the hero video",
      onClick: (event) => {
        const video = event.currentTarget.closest(".sdf-hero").querySelector("video");
        video.controls = true;
        if (video.paused) video.play(); else video.pause();
      },
    }, "▶"),
  ]);
}

function renderIdea(c) {
  return chapter("idea", c, [
    el("div", { class: "sdf-two-col sdf-idea-grid" }, [
      el("div", { class: "sdf-copy" }, [
        renderIdeaIntro(c.intro), el("p", {}, c.definition),
        el("div", { class: "sdf-sign-grid" }, c.signs.map(([formula, label]) => el("div", { class: "sdf-sign" }, [el("strong", {}, formula), el("span", {}, label)]))),
        textBlock("p", "sdf-kicker", c.takeaway),
      ]),
      el("div", {}, [
        videoFigure({ src: `${ASSET_ROOT}/hero.mp4`, poster: `${ASSET_ROOT}/thumb.png`, label: c.mediaLabel, className: "sdf-media-large" }),
        el("div", { class: "sdf-trace" }, [
          el("h3", {}, c.traceTitle), el("p", {}, c.traceBody),
          el("ol", { class: "sdf-trace-steps" }, c.traceSteps.map((step) => el("li", {}, step))),
        ]),
      ]),
    ]),
  ]);
}

function renderAuthoring(c) {
  return chapter("authoring", c, [
    el("div", { class: "sdf-two-col sdf-authoring-grid" }, [
      videoFigure({ src: `${ASSET_ROOT}/authoring.mp4`, poster: `${ASSET_ROOT}/thumb.png`, label: c.mediaLabel, caption: c.caption, className: "sdf-media-tall" }),
      el("div", { class: "sdf-copy" }, [el("p", {}, c.body), bulletList(c.bullets), textBlock("p", "sdf-note", c.note)]),
    ]),
  ]);
}

function renderArchitecture(c) {
  return chapter("architecture", c, [
    textBlock("p", "sdf-lead", c.intro),
    el("ol", { class: "sdf-flow" }, c.flow.map(([title, body], index) => el("li", {}, [
      el("span", { class: "sdf-flow-num" }, String(index + 1).padStart(2, "0")), el("h3", {}, title), el("p", {}, body),
    ]))),
    cardGrid(c.cards, "sdf-card-grid-three"),
    textBlock("p", "sdf-note", c.note),
  ]);
}

function renderScale(c) {
  return chapter("scale", c, [
    el("div", { class: "sdf-two-col sdf-scale-grid" }, [
      el("div", {}, [
        videoFigure({ src: `${ASSET_ROOT}/gpu-instancing.mp4`, poster: `${ASSET_ROOT}/benchmark.png`, label: c.mediaLabel, className: "sdf-media-large" }),
        imageFigure({ src: `${ASSET_ROOT}/benchmark.png`, alt: c.imageLabel, label: c.imageLabel, caption: c.caption, className: "sdf-benchmark-image" }),
      ]),
      el("div", { class: "sdf-copy" }, [
        el("div", { class: "sdf-stat-grid" }, c.stats.map(([value, label]) => el("div", { class: "sdf-stat" }, [el("strong", {}, value), el("span", {}, label)]))),
        el("p", {}, c.body), bulletList(c.bullets), textBlock("p", "sdf-note", c.note),
      ]),
    ]),
  ]);
}

function renderShapes(c) {
  return chapter("shapes", c, [
    textBlock("p", "sdf-lead", c.intro),
    el("div", { class: "sdf-gallery-wrap" }, [
      imageFigure({ src: `${ASSET_ROOT}/primitive-gallery.png`, alt: c.mediaLabel, label: c.mediaLabel, className: "sdf-gallery-hero" }),
      el("div", { class: "sdf-gallery-stats" }, c.stats.map(([value, label]) => el("div", { class: "sdf-card sdf-mini-stat" }, [el("strong", {}, value), el("span", {}, label)]))),
    ]),
    el("div", { class: "sdf-group-grid" }, c.groups.map(([title, body]) => el("p", {}, [el("strong", {}, `${title}: `), body]))),
  ]);
}

function renderMaterials(c) {
  return chapter("materials", c, [
    el("div", { class: "sdf-two-col sdf-materials-grid" }, [
      el("div", {}, [
        videoFigure({ src: `${ASSET_ROOT}/pbr-materials.mp4`, poster: `${ASSET_ROOT}/geometry-comparison.png`, label: c.mediaLabel, className: "sdf-media-large" }),
        imageFigure({ src: `${ASSET_ROOT}/geometry-comparison.png`, alt: c.imageLabel, label: c.imageLabel }),
      ]),
      el("div", { class: "sdf-copy" }, [el("p", {}, c.p1), el("p", {}, c.p2), cardGrid(c.cards), textBlock("p", "sdf-kicker", c.kicker)]),
    ]),
  ]);
}

function renderLessons(c, title) {
  return chapter("lessons", c, [
    el("div", { class: "sdf-two-col sdf-lessons-grid" }, [
      el("div", { class: "sdf-copy" }, [
        textBlock("blockquote", "sdf-quote", c.quote), el("p", {}, c.p1), el("p", {}, c.p2),
        el("ul", { class: "sdf-pill-row sdf-closing-tags" }, closingTags.map((tag) => el("li", {}, tag))),
      ]),
      el("div", {}, [cardGrid(c.takeaways, "sdf-takeaways"), textBlock("p", "sdf-note", c.note)]),
    ]),
    el("p", { class: "sdf-end" }, [title, el("span", {}, c.end)]),
  ]);
}

export function renderSdfCaseStudy(project) {
  const sectionCopy = getLang() === "es" ? sectionsEs : sections;

  return el("section", { class: "project-detail sdf-project-detail" }, [
    el("div", { class: "sdf-article-shell" }, [
      el("a", {
        href: "#/portfolio", class: "back-link sdf-back-link",
        onClick: (event) => { event.preventDefault(); navigateToSection("portfolio"); },
      }, `← ${localized(copy.back)}`),
      renderHero(project),
      el("article", { class: "sdf-article" }, [
        renderIdea(sectionCopy.idea), renderAuthoring(sectionCopy.authoring), renderArchitecture(sectionCopy.architecture),
        renderScale(sectionCopy.scale), renderShapes(sectionCopy.shapes), renderMaterials(sectionCopy.materials),
        renderLessons(sectionCopy.lessons, getProjectText(project, "title")),
      ]),
    ]),
  ]);
}
