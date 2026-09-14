// Written articles. Same shape as projects.js: shared metadata at the top,
// translated copy under i18n. The long-form body of each article lives in
// articleStories.js, keyed by the same id.
const articles = [
  {
    id: "cross-product",
    date: "2026-09-14",
    readingMinutes: 10,
    tags: ["Vector Maths", "Unity", "C#", "3D Graphics"],
    thumb: "/assets/articles/cross-product/thumb.jpg",
    links: {
      repo: "https://github.com/artuanDev/ProductoVectorial",
    },
    i18n: {
      en: {
        title: "The Cross Product",
        kicker: "Maths for real-time graphics",
        displayDate: "September 2026",
        summary:
          "Two vectors go in and a third comes out, perpendicular to both. From left/right checks to mesh normals and camera orientation, this is where the cross product earns its keep.",
      },
      es: {
        title: "El Producto Vectorial",
        kicker: "Matemáticas para gráficos en tiempo real",
        displayDate: "Septiembre de 2026",
        summary:
          "Entran dos vectores y sale un tercero, perpendicular a ambos. Desde saber qué queda a cada lado hasta calcular normales y orientar cámaras: aquí es donde el producto vectorial se gana el sueldo.",
      },
    },
  },
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
