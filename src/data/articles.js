// Written articles. Same shape as projects.js: shared metadata at the top,
// translated copy under i18n. The long-form body of each article lives in
// articleStories.js, keyed by the same id.
const articles = [
  {
    id: "dot-product",
    date: "2026-09-11",
    readingMinutes: 8,
    tags: ["Unity", "Shader Graph", "C#", "HLSL"],
    thumb: "/assets/articles/dot-product/thumb.png",
    links: {
      repo: "https://github.com/artuanDev/ArtculosStudies",
    },
    i18n: {
      en: {
        title: "The Dot Product",
        kicker: "Maths for real-time graphics",
        displayDate: "September 2026",
        summary:
          "One multiplication and one addition per component, and suddenly you can light a sphere, cut a cel-shaded terminator, and build a guard's vision cone. A tour of the dot product through the places I actually use it.",
      },
      es: {
        title: "El Producto Escalar",
        kicker: "Matemáticas para gráficos en tiempo real",
        displayDate: "Septiembre de 2026",
        summary:
          "Una multiplicación y una suma por componente, y de repente puedes iluminar una esfera, cortar la sombra de un cel shader o construir el cono de visión de un enemigo. Un recorrido por el producto escalar a través de los sitios donde realmente lo uso.",
      },
    },
  },
];

export default articles;
