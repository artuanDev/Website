// Each project drives both the Portfolio grid card and its detail view.
// To add a new project: drop assets in public/assets/projects/<slug>/ following
// the thumb / gallery-NN / video naming convention, then append an object here.
// See HOW_TO_ADD_A_PROJECT.md for the full walkthrough.

const projects = [
  {
    id: "dt-buildings",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "C++", "Procedural Generation"],
    thumb: "/assets/projects/dt-buildings/thumb.png",
    gallery: [
      "/assets/projects/dt-buildings/gallery-01.png",
      "/assets/projects/dt-buildings/gallery-02.png",
    ],
    video: "/assets/projects/dt-buildings/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Digital Twins Building Generation",
        summary: "Procedural building generation system for CARLA's Digital Twins project.",
        description:
          "A procedural content generation system built for the Digital Twins project, capable of generating building geometry and variations to populate large-scale digital-twin city environments quickly. The system reduced manual modeling work for environment artists and standardized how buildings are dressed and varied across a level.\n\nBuilt as an Unreal Engine editor extension, it exposes artist-facing controls so non-programmers can drive procedural variation without touching code.",
        role: "Sole technical artist responsible for design and implementation of the building generation tool.",
      },
      es: {
        title: "Generación de Edificios para Digital Twins",
        summary: "Sistema de generación procedural de edificios para el proyecto Digital Twins de CARLA.",
        description:
          "Sistema de generación procedural de contenido desarrollado para el proyecto Digital Twins, capaz de generar geometría de edificios y variaciones para poblar rápidamente entornos urbanos de gemelos digitales a gran escala. El sistema redujo el trabajo de modelado manual para los artistas de entorno y estandarizó cómo se visten y varían los edificios en un nivel.\n\nConstruido como una extensión del editor de Unreal Engine, expone controles orientados a artistas para que personas sin perfil de programación puedan dirigir la variación procedural sin tocar código.",
        role: "Único artista técnico responsable del diseño e implementación de la herramienta de generación de edificios.",
      },
    },
  },
  {
    id: "dt-traffic-sign",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "C++", "Procedural Generation"],
    thumb: "/assets/projects/dt-traffic-sign/thumb.png",
    gallery: [
      "/assets/projects/dt-traffic-sign/gallery-01.png",
      "/assets/projects/dt-traffic-sign/gallery-02.png",
      "/assets/projects/dt-traffic-sign/gallery-03.png",
    ],
    video: "/assets/projects/dt-traffic-sign/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Digital Twins Traffic Sign Generation",
        summary: "Procedural traffic sign generation tool for populating Digital Twins environments.",
        description:
          "An artist-facing procedural tool for generating and placing traffic signage across Digital Twins city environments, automating a previously manual and repetitive process. Supports variation in sign types, mounting, and placement rules to match real-world reference layouts.\n\nDeveloped as part of the broader Digital Twins toolset used to accelerate environment construction within Unreal Engine.",
        role: "Designed and built the traffic sign generation pipeline and its in-editor tooling.",
      },
      es: {
        title: "Generación de Señalización para Digital Twins",
        summary: "Herramienta de generación procedural de señales de tráfico para poblar entornos de Digital Twins.",
        description:
          "Herramienta procedural orientada a artistas para generar y colocar señalización de tráfico en entornos urbanos de Digital Twins, automatizando un proceso anteriormente manual y repetitivo. Permite variar tipos de señal, montaje y reglas de colocación para ajustarse a referencias del mundo real.\n\nDesarrollada como parte del conjunto de herramientas de Digital Twins usado para acelerar la construcción de entornos en Unreal Engine.",
        role: "Diseñé y construí la pipeline de generación de señales y su herramienta de editor.",
      },
    },
  },
  {
    id: "pfd",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "Rust", "C++", "HLSL"],
    thumb: "/assets/projects/pfd/thumb.png",
    gallery: [
      "/assets/projects/pfd/gallery-01.png",
      "/assets/projects/pfd/gallery-02.jpg",
      "/assets/projects/pfd/gallery-03.jpg",
    ],
    video: null,
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Primary Flight Display (AeroSim)",
        summary: "Primary Flight Display API and procedural visualization for the AeroSim aerospace simulator.",
        description:
          "Developed the Primary Flight Display (PFD) API and procedural visualization systems for AeroSim, an aerospace simulation platform built with Rust and Unreal Engine in partnership with Supernal. The PFD renders real-time flight instrumentation — attitude, airspeed, altitude, heading — driven procedurally from simulation data.\n\nThis work required tight collaboration between the Rust simulation backend and Unreal Engine's rendering front-end to keep instrumentation accurate and responsive.",
        role: "Developed the PFD API and its real-time procedural visualization in Unreal Engine.",
      },
      es: {
        title: "Primary Flight Display (AeroSim)",
        summary: "API del Primary Flight Display y visualización procedimental para el simulador aeroespacial AeroSim.",
        description:
          "Desarrollé la API del Primary Flight Display (PFD) y los sistemas de visualización procedimental para AeroSim, una plataforma de simulación aeroespacial construida con Rust y Unreal Engine en colaboración con Supernal. El PFD renderiza instrumentación de vuelo en tiempo real — actitud, velocidad, altitud, rumbo — generada de forma procedimental a partir de los datos de simulación.\n\nEste trabajo requirió una estrecha colaboración entre el backend de simulación en Rust y el front-end de renderizado de Unreal Engine para mantener la instrumentación precisa y responsiva.",
        role: "Desarrollé la API del PFD y su visualización procedimental en tiempo real en Unreal Engine.",
      },
    },
  },
  {
    id: "decal-dresser",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "C++", "Editor Tooling"],
    thumb: "/assets/projects/decal-dresser/thumb.png",
    gallery: [
      "/assets/projects/decal-dresser/gallery-01.png",
      "/assets/projects/decal-dresser/gallery-02.png",
      "/assets/projects/decal-dresser/gallery-03.png",
    ],
    video: "/assets/projects/decal-dresser/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Decal Dresser",
        summary: "Unreal Engine editor extension for quickly dressing scenes with procedural decals.",
        description:
          "An Unreal Engine editor extension that streamlines applying surface decals (dirt, wear, markings) across a scene, replacing a slow manual placement workflow with a fast, artist-driven tool. Built to improve content creation throughput for environment artists working on Digital Twins scenes.\n\nThe tool exposes simple in-editor controls for decal selection, randomization, and placement constraints.",
        role: "Designed and built the editor extension end-to-end.",
      },
      es: {
        title: "Decal Dresser",
        summary: "Extensión del editor de Unreal Engine para vestir escenas rápidamente con decals procedurales.",
        description:
          "Una extensión del editor de Unreal Engine que agiliza la aplicación de decals de superficie (suciedad, desgaste, marcas) en una escena, sustituyendo un flujo de colocación manual lento por una herramienta rápida dirigida por el artista. Construida para mejorar el rendimiento de creación de contenido de los artistas de entorno en escenas de Digital Twins.\n\nLa herramienta expone controles sencillos dentro del editor para selección de decals, aleatorización y restricciones de colocación.",
        role: "Diseñé y construí la extensión de editor de principio a fin.",
      },
    },
  },
  {
    id: "general-scene-settings",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "Blueprint"],
    thumb: "/assets/projects/general-scene-settings/thumb.jpg",
    gallery: [
      "/assets/projects/general-scene-settings/gallery-01.png",
      "/assets/projects/general-scene-settings/gallery-02.png",
      "/assets/projects/general-scene-settings/gallery-03.png",
      "/assets/projects/general-scene-settings/gallery-04.png",
      "/assets/projects/general-scene-settings/gallery-05.png",
      "/assets/projects/general-scene-settings/gallery-06.png",
    ],
    video: "/assets/projects/general-scene-settings/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "General Scene Settings",
        summary: "Blueprint-driven scene configuration system for consistent environment setup.",
        description:
          "A Blueprint-based scene settings system that centralizes environment configuration (lighting, fog, post-processing, and other scene-wide parameters) so environments are set up consistently and quickly across the Digital Twins project. Reduced setup time and configuration drift between scenes.\n\nDesigned to be approachable for artists, with clearly grouped, well-labeled parameters rather than raw engine settings scattered across multiple actors.",
        role: "Designed the Blueprint system and its artist-facing parameter layout.",
      },
      es: {
        title: "General Scene Settings",
        summary: "Sistema de configuración de escena basado en Blueprint para una puesta a punto coherente del entorno.",
        description:
          "Sistema de ajustes de escena basado en Blueprint que centraliza la configuración del entorno (iluminación, niebla, post-procesado y otros parámetros generales) para que los entornos se configuren de forma coherente y rápida en todo el proyecto Digital Twins. Redujo el tiempo de configuración y la dispersión entre escenas.\n\nDiseñado para ser accesible a artistas, con parámetros bien agrupados y etiquetados en lugar de ajustes de motor dispersos en múltiples actores.",
        role: "Diseñé el sistema Blueprint y la disposición de parámetros orientada a artistas.",
      },
    },
  },
  {
    id: "proc-building",
    featuredRank: 2,
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "C++", "Procedural Generation"],
    thumb: "/assets/projects/proc-building/thumb.jpg",
    gallery: ["/assets/projects/proc-building/gallery-01.png"],
    video: "/assets/projects/proc-building/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Procedural Building System",
        summary: "Standalone procedural building generator producing varied building geometry from configurable rules.",
        description:
          "A procedural building generation system that produces varied building geometry and facade details from a set of configurable rules and parameters, enabling rapid population of large environments without hand-modeling every structure.\n\nIncludes detail variation passes (window layouts, trim, materials) to avoid visibly repetitive results across many generated instances.",
        role: "Designed and implemented the procedural generation rules and detail-variation pipeline.",
      },
      es: {
        title: "Sistema de Edificios Procedurales",
        summary: "Generador procedural de edificios independiente que produce geometría variada a partir de reglas configurables.",
        description:
          "Sistema de generación procedural de edificios que produce geometría y detalles de fachada variados a partir de un conjunto de reglas y parámetros configurables, permitiendo poblar rápidamente grandes entornos sin modelar cada estructura a mano.\n\nIncluye pasadas de variación de detalle (distribución de ventanas, molduras, materiales) para evitar resultados visiblemente repetitivos entre muchas instancias generadas.",
        role: "Diseñé e implementé las reglas de generación procedural y la pipeline de variación de detalle.",
      },
    },
  },
  {
    id: "proc-sat",
    category: "work",
    year: "2023 - 2026",
    tech: ["Unreal Engine", "C++", "Procedural Generation"],
    thumb: "/assets/projects/proc-sat/thumb.png",
    gallery: [
      "/assets/projects/proc-sat/gallery-01.png",
      "/assets/projects/proc-sat/gallery-02.png",
      "/assets/projects/proc-sat/gallery-03.png",
      "/assets/projects/proc-sat/gallery-04.png",
    ],
    video: "/assets/projects/proc-sat/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Procedural Satellite Generation",
        summary: "Procedural generator for satellite models used in simulation environments.",
        description:
          "A procedural generation tool for producing varied satellite models, used to populate simulation scenes that require many distinct space assets without manually modeling each one. Parameters drive structural layout, panel arrangement, and surface detail.\n\nBuilt to plug into the broader Unreal Engine procedural-content pipeline used across the simulation projects.",
        role: "Designed and implemented the procedural satellite generator.",
      },
      es: {
        title: "Generación Procedural de Satélites",
        summary: "Generador procedural de modelos de satélite para entornos de simulación.",
        description:
          "Herramienta de generación procedural para producir modelos de satélite variados, usada para poblar escenas de simulación que requieren muchos activos espaciales distintos sin modelarlos manualmente uno a uno. Los parámetros controlan la disposición estructural, la distribución de paneles y el detalle de superficie.\n\nConstruida para integrarse en la pipeline de contenido procedural de Unreal Engine usada en los proyectos de simulación.",
        role: "Diseñé e implementé el generador procedural de satélites.",
      },
    },
  },
  {
    id: "gas-shader",
    category: "work",
    year: "2026",
    tech: ["HLSL", "Unreal Engine", "Shader Optimization"],
    thumb: "/assets/projects/gas-shader/thumb.png",
    gallery: ["/assets/projects/gas-shader/gallery-01.png"],
    video: "/assets/projects/gas-shader/video.mp4",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Gas / Smoke Shader",
        summary: "Optimized cross-platform shader for real-time gas and smoke effects.",
        description:
          "A real-time gas/smoke shader developed as part of an effort to improve rendering quality while keeping cross-platform performance in check. Profiled against the rendering pipeline to identify and resolve bottlenecks before shipping.\n\nTuned to balance visual fidelity with the performance budget required for real-time simulation use cases.",
        role: "Developed and optimized the shader.",
      },
      es: {
        title: "Shader de Gas / Humo",
        summary: "Shader optimizado multiplataforma para efectos de gas y humo en tiempo real.",
        description:
          "Shader de gas/humo en tiempo real desarrollado como parte de un esfuerzo por mejorar la calidad de renderizado manteniendo el rendimiento bajo control en múltiples plataformas. Analizado contra la canalización de renderizado para identificar y resolver cuellos de botella antes de su uso en producción.\n\nAjustado para equilibrar fidelidad visual con el presupuesto de rendimiento que exigen los casos de uso de simulación en tiempo real.",
        role: "Desarrollé y optimicé el shader.",
      },
    },
  },
  {
    id: "vegetation",
    featuredRank: 4,
    category: "work",
    year: "2025",
    tech: ["HLSL", "Unreal Engine", "Shader Optimization"],
    thumb: "/assets/projects/vegetation/thumb.png",
    gallery: [
      "/assets/projects/vegetation/gallery-01.png",
      "/assets/projects/vegetation/gallery-02.png",
      "/assets/projects/vegetation/gallery-03.png",
      "/assets/projects/vegetation/gallery-04.png",
      "/assets/projects/vegetation/gallery-05.png",
      "/assets/projects/vegetation/gallery-06.png",
      "/assets/projects/vegetation/gallery-07.png",
      "/assets/projects/vegetation/gallery-08.png",
    ],
    video: null,
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Vegetation Shader",
        summary: "Custom vegetation shader supporting wind, variation, and real-time performance for large environments.",
        description:
          "A custom vegetation shader built to render large volumes of foliage efficiently in real time, supporting per-instance variation and wind motion without exceeding the rendering performance budget of the simulation environments it ships in.\n\nPart of a broader effort to improve rendering quality and production efficiency through optimized, cross-platform shaders.",
        role: "Developed the shader and profiled its performance impact.",
      },
      es: {
        title: "Shader de Vegetación",
        summary: "Shader de vegetación personalizado con soporte de viento, variación y rendimiento en tiempo real para entornos grandes.",
        description:
          "Shader de vegetación personalizado construido para renderizar grandes volúmenes de vegetación de forma eficiente en tiempo real, con soporte de variación por instancia y movimiento de viento sin superar el presupuesto de rendimiento de los entornos de simulación en los que se usa.\n\nParte de un esfuerzo más amplio por mejorar la calidad de renderizado y la eficiencia de producción mediante shaders optimizados y multiplataforma.",
        role: "Desarrollé el shader y analicé su impacto en el rendimiento.",
      },
    },
  },
  {
    id: "npr-rendering",
    featuredRank: 3,
    category: "personal",
    year: "2026",
    tech: ["HLSL", "GLSL", "Unity", "Unreal Engine", "Blender"],
    thumb: "/assets/projects/npr-rendering/thumb.png",
    gallery: [
      "/assets/projects/npr-rendering/gallery-01.jpg",
      "/assets/projects/npr-rendering/gallery-02.jpg",
      "/assets/projects/npr-rendering/gallery-03.jpg",
      "/assets/projects/npr-rendering/gallery-04.png",
    ],
    video: null,
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "NPR Rendering",
        summary: "Multiple non-photorealistic rendering shaders built across Unity, Unreal Engine, and Blender.",
        description:
          "A personal exploration of non-photorealistic rendering (NPR) techniques, implemented as a set of shaders across Unity, Unreal Engine, and Blender. Covers stylized lighting, outline rendering, and cel-shading approaches.\n\nBuilt to deepen shader-writing skills outside of a specific production pipeline and to compare how the same NPR techniques translate across different engines.",
        role: "Personal project — research, design, and implementation.",
      },
      es: {
        title: "NPR Rendering",
        summary: "Múltiples shaders de renderizado no fotorrealista desarrollados en Unity, Unreal Engine y Blender.",
        description:
          "Exploración personal de técnicas de renderizado no fotorrealista (NPR), implementada como un conjunto de shaders en Unity, Unreal Engine y Blender. Incluye iluminación estilizada, renderizado de contornos y enfoques de cel-shading.\n\nDesarrollado para profundizar en la escritura de shaders fuera de una pipeline de producción concreta y para comparar cómo se traducen las mismas técnicas NPR entre distintos motores.",
        role: "Proyecto personal — investigación, diseño e implementación.",
      },
    },
  },
  {
    id: "directional-uv",
    category: "personal",
    year: "2026",
    tech: ["HLSL", "Unity", "Shaders"],
    thumb: "/assets/projects/directional-uv/thumb.png",
    gallery: [],
    video: "/assets/projects/directional-uv/video.mp4",
    demoVideos: [
      {
        src: "/assets/projects/directional-uv/video.mp4",
        i18n: {
          en: "Original procedural cross-hatching demo",
          es: "Demo original de cross-hatching procedural",
        },
      },
      {
        src: "/assets/projects/directional-uv/lighting-direction.mp4",
        i18n: {
          en: "Cross-hatching lighting-direction showcase",
          es: "Demostración de la dirección de luz en el cross-hatching",
        },
      },
    ],
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Screen-Aligned UV Coordinates",
        summary: "A light-aligned UV coordinate system in Unity enabling procedural cross-hatching effects.",
        description:
          "A light-aligned (screen/directional) UV coordinate system implemented in Unity, used to drive procedural effects such as cross-hatching that stay consistent with the light direction rather than the underlying mesh UVs. This decouples stylized shading detail from a model's actual UV layout.\n\nA personal project exploring procedural, non-photorealistic shading techniques.",
        role: "Personal project — research, design, and implementation.",
      },
      es: {
        title: "Coordenadas UV Alineadas con la Pantalla",
        summary: "Sistema de coordenadas UV alineadas con la luz en Unity que permite efectos procedurales de cross-hatching.",
        description:
          "Sistema de coordenadas UV alineadas con la luz (pantalla/dirección) implementado en Unity, usado para generar efectos procedurales como el cross-hatching que se mantienen coherentes con la dirección de la luz en lugar de las UV reales de la malla. Esto desacopla el detalle de sombreado estilizado del UV layout real de un modelo.\n\nProyecto personal de exploración de técnicas de sombreado procedural y no fotorrealista.",
        role: "Proyecto personal — investigación, diseño e implementación.",
      },
    },
  },
  {
    id: "raymarching-sdf",
    featuredRank: 1,
    category: "personal",
    year: "2026",
    tech: ["Unity 6", "URP 17.3", "C#", "HLSL", "Compute Shaders", "RenderGraph"],
    thumb: "/assets/projects/raymarching-sdf/thumb.png",
    gallery: [
      "/assets/projects/raymarching-sdf/benchmark.png",
      "/assets/projects/raymarching-sdf/primitive-gallery.png",
      "/assets/projects/raymarching-sdf/geometry-comparison.png",
    ],
    video: "/assets/projects/raymarching-sdf/hero.mp4",
    detailRenderer: "sdf-case-study",
    links: { artstation: null, repo: null },
    i18n: {
      en: {
        title: "Real-Time SDF Renderer for Unity URP",
        summary:
          "A native-resolution raymarching system with component-based authoring, CSG, GPU-driven rendering, and URP Lit materials.",
        description:
          "An extensible signed-distance-field renderer built as a native part of Unity's Universal Render Pipeline. It combines editable components, constructive solid geometry, stackable modifiers, GPU-driven scene updates, and physically based materials in one real-time workflow.",
        role: "Personal project — research, rendering architecture, tools, and implementation.",
      },
      es: {
        title: "Renderizador SDF en Tiempo Real para Unity URP",
        summary:
          "Sistema de raymarching a resolución nativa con edición por componentes, CSG, renderizado en GPU y materiales URP Lit.",
        description:
          "Un renderizador extensible de campos de distancia firmado integrado de forma nativa en Universal Render Pipeline. Combina componentes editables, geometría sólida constructiva, modificadores apilables, actualización de escena en GPU y materiales físicamente correctos en un único flujo de trabajo en tiempo real.",
        role: "Proyecto personal — investigación, arquitectura de renderizado, herramientas e implementación.",
      },
    },
  },
];

export default projects;
