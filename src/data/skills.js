// Item names (languages, software, tools) are not translated — they're proper
// nouns / technical terms. Category labels and soft-skill copy are bilingual.

export const technicalSkills = [
  {
    id: "core-languages",
    i18n: { en: { category: "Core Languages" }, es: { category: "Lenguajes Principales" } },
    items: ["C++", "C#", "Python"],
  },
  {
    id: "shader-languages",
    i18n: { en: { category: "Shader Languages" }, es: { category: "Lenguajes de Shader" } },
    items: ["HLSL", "GLSL", "MDL"],
  },
  {
    id: "software",
    i18n: { en: { category: "Software" }, es: { category: "Software" } },
    items: ["Unreal Engine 4/5", "Unity", "Blender", "Substance"],
  },
  {
    id: "ai-integration",
    i18n: { en: { category: "AI Integration" }, es: { category: "Integración con IA" } },
    items: ["Claude Code", "Codex", "Copilot"],
  },
  {
    id: "tooling",
    i18n: { en: { category: "Tooling" }, es: { category: "Herramientas" } },
    items: ["Git", "Linux", "Windows"],
  },
  {
    id: "additional",
    i18n: { en: { category: "Additional" }, es: { category: "Adicionales" } },
    items: ["Rust", "JavaScript", "NVidia Isaac Sim", "3Ds Max", "ZBrush"],
  },
];

export const softSkills = [
  {
    id: "cross-team-collaboration",
    i18n: {
      en: { title: "Cross-team collaboration", description: "Experienced collaborating with cross-functional teams and facilitating communication across different areas to achieve shared goals." },
      es: { title: "Colaboración entre equipos", description: "Experiencia colaborando con equipos multidisciplinares y facilitando la comunicación entre diferentes áreas para alcanzar objetivos comunes." },
    },
  },
  {
    id: "adaptability",
    i18n: {
      en: { title: "Adaptability", description: "Quick to adapt to new technologies, processes, and responsibilities." },
      es: { title: "Adaptabilidad", description: "Capacidad para adaptarme rápidamente a nuevos procesos, tecnologías y responsabilidades." },
    },
  },
  {
    id: "clear-communication",
    i18n: {
      en: { title: "Clear communication", description: "Clear and effective communicator, developed through daily collaboration with technical teams, managers, and cross-functional stakeholders." },
      es: { title: "Comunicación clara", description: "Comunicación clara y efectiva, desarrollada mediante la colaboración diaria con equipos técnicos, responsables y otros departamentos." },
    },
  },
  {
    id: "accountability",
    i18n: {
      en: { title: "Accountability", description: "Committed to quality and delivery, taking responsibility for the outcomes of my work." },
      es: { title: "Responsabilidad", description: "Trabajo con autonomía y sentido de la responsabilidad, impulsando las tareas hasta su finalización sin necesidad de supervisión constante." },
    },
  },
  {
    id: "problem-solving",
    i18n: {
      en: { title: "Problem-solving skills", description: "Comfortable working autonomously, identifying problems and finding solutions beyond my primary area of expertise." },
      es: { title: "Resolución de problemas", description: "Acostumbrado a trabajar con autonomía, identificando problemas y encontrando soluciones incluso fuera de mi área de especialización." },
    },
  },
];

export const languages = [
  {
    id: "spanish",
    i18n: {
      en: { name: "Spanish", level: "Native" },
      es: { name: "Español", level: "Nativo" },
    },
  },
  {
    id: "english",
    i18n: {
      en: { name: "English", level: "Full professional proficiency" },
      es: { name: "Inglés", level: "Competencia profesional completa" },
    },
  },
];
