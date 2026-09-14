// Long-form body of each article, keyed by article id and then by language.
//
// The body is a list of blocks rendered in order by sections/articleDetail.js:
//   lead      — opening paragraph, set larger than the rest
//   p         — a normal paragraph (**bold** and `code` are supported inline)
//   statement — a single sentence pulled out of the flow
//   chapter   — a numbered section break
//   formula   — a centred, monospaced expression
//   code      — a labelled code block
//   note      — an aside: a caveat, a gotcha, a definition
//   values    — the little value/meaning cards
//   figure    — one image with a caption
//   figures   — two images side by side
//   video     — one native video player with an optional poster and caption
const ASSETS = "/assets/articles/dot-product";
const CROSS_ASSETS = "/assets/articles/cross-product";

const articleStories = {
  "dot-product": {
    en: {
      eyebrow: "Technical article",
      blocks: [
        {
          type: "lead",
          text: "The dot product is, in my opinion, one of the most interesting and useful operations in the whole field of vector maths.",
        },
        {
          type: "p",
          text: "This article is NOT a tutorial as such. I just explain the concept by applying it to real examples related to 3D graphics, software tooling and shader programming. Each one of those could be an article of its own, so I won't dig too deep into any of them — only the basics, assuming the reader has some grounding in maths and, for the examples shown here, in shader programming or game development.",
        },

        { type: "chapter", number: "01", eyebrow: "The maths", title: "It is just multiply and add" },
        {
          type: "p",
          text: "At its core, the dot product is nothing more than a function that takes two vectors and returns a scalar value: multiply each component of one vector by the matching component of the other, then add the results together.",
        },
        {
          type: "p",
          text: "The example below uses 2D vectors, but it applies just as easily to the third dimension — you only add one more multiplication and one more addition, this time between the Z components of vector 1 and vector 2.",
        },
        {
          type: "formula",
          text: "V1 · V2 = (V1.x * V2.x) + (V1.y * V2.y)",
          caption: "Two dimensions. For three, add + (V1.z * V2.z) on the end.",
        },
        { type: "p", text: "In a language like C# it could look like this:" },
        {
          type: "code",
          label: "C#",
          code: [
            "float DotProduct(Vector2 v1, Vector2 v2)",
            "{",
            "    return (v1.x * v2.x) + (v1.y * v2.y);",
            "}",
            "",
            "float DotProduct(Vector3 v1, Vector3 v2)",
            "{",
            "    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);",
            "}",
          ].join("\n"),
        },
        {
          type: "note",
          label: "In practice",
          text: "You will almost never write this yourself — every engine ships it already: `Vector3.Dot` in Unity, `FVector::DotProduct` in Unreal, `a.dot(b)` in Godot, `dot()` in HLSL and GLSL. I spell it out here only so the operation stops being a black box.",
        },

        { type: "chapter", number: "02", eyebrow: "The meaning", title: "How parallel are these two vectors?" },
        {
          type: "p",
          text: "On its own, that formula doesn't look like much. What IS interesting is WHAT the result means, especially when you normalise both vectors first.",
        },
        { type: "statement", text: "The dot product tips you off about how parallel two vectors are." },
        {
          type: "p",
          text: "Without normalising, the result carries the length of both vectors along with it. The identity behind it is `a · b = |a| * |b| * cos(θ)`, so the number grows or shrinks with however long your vectors happen to be, and one pair can't be compared against another.",
        },
        {
          type: "p",
          text: "Normalise them first and both lengths become 1, so the magnitudes cancel out and what is left is exactly `cos(θ)`: a result that lives strictly between -1 and 1.",
        },
        {
          type: "values",
          items: [
            ["1", "Same direction", "Both vectors point the same way. They are perfectly parallel."],
            ["0", "Perpendicular", "The second vector sits at 90° from the first — completely orthogonal."],
            ["-1", "Opposite direction", "Still parallel, but the second vector points exactly the other way."],
          ],
        },
        {
          type: "p",
          text: "And of course every decimal in between is possible, depending on the direction of the second vector.",
        },
        {
          type: "note",
          label: "Shortcut",
          text: "The sign on its own already answers \"is this in front of me or behind me?\". Positive means in front, negative means behind, zero means exactly to the side. You don't need the angle for that, and you don't need an `acos` either.",
        },

        { type: "chapter", number: "03", eyebrow: "Example · Lighting", title: "The simplest lighting model there is" },
        {
          type: "p",
          text: "With that cleared up and applied to the world of games, there are several ways to use it. For instance, the most basic lighting calculation in 3D graphics uses precisely this function to determine which areas of a model are lit and which are in shadow. (I won't go into how a model projects shadows onto itself here — that one is for another article.)",
        },
        {
          type: "p",
          text: "For simplicity, we'll use a sphere. For anyone not too deep into this world: a 3D model is made of vertices, points in space that define its surface. But they usually also hold one very important extra piece of information — the direction that vertex faces on the surface, also known as the **normal**, stored as a unit vector.",
        },
        {
          type: "p",
          text: "With that in mind, we can work out which parts of a model are lit and which are in shadow inside a shader, simply by using the dot product: the first input is the direction of the light in the scene, normalised, and the second is the direction of our model's normals, normalised too.",
        },
        {
          type: "p",
          text: "For visual simplicity I'll use Unity 6 with URP and Shader Graph to work through the example, but it is easily applicable in any other rendering engine, such as Godot or Unreal Engine 5.",
        },
        {
          type: "figure",
          src: ASSETS + "/graph-lambert.png",
          alt: "Shader Graph nodes: main light direction and normal vector, both normalised, feeding a Dot Product node connected to Base Color.",
          caption: "The whole graph — light direction and surface normal, both normalised, into a single Dot Product.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-lambert.png",
          alt: "A sphere in the Unity scene view shaded from white to black across its surface.",
          caption: "That dot product plugged straight into Base Color.",
        },
        {
          type: "p",
          text: "And suddenly, we have a lit sphere! That happens because I fed the dot product result into the model's base colour as a Vector3 with all three of its components set to that same value. In 3D graphics, anything at 0 or below is shown as black, and from 0 upwards it ramps through greyscale until it reaches 1 and beyond, which is white.",
        },
        {
          type: "note",
          label: "Two details in that graph",
          text: "I normalise the normal even though vertex normals arrive as unit vectors, because they get interpolated across the triangle on their way to the fragment stage and drift slightly off unit length. And I multiply the light direction by -1, because that node was handing me the direction the light travels rather than the direction from the surface towards the light. That sign convention changes between engines and versions, so check it rather than assume it.",
        },

        { type: "chapter", number: "04", eyebrow: "Example · Cel shading", title: "From a gradient to two flat colours" },
        {
          type: "p",
          text: "This example is the CORE of cel-shaded lighting effects, the look used in games like *Guilty Gear* or *Dragon Ball: FighterZ*. If we round the scalar result, that gradient disappears.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-stepped.jpg",
          alt: "The same sphere, now split into a flat white region and a flat black region with a hard edge between them.",
          caption: "A Round node on the dot product: no gradient left, only lit and unlit.",
        },
        {
          type: "p",
          text: "`Round` snaps the gradient to whole numbers and `Saturate` throws away the negative half, so what comes out the other side is a clean 0-or-1 mask.",
        },
        {
          type: "note",
          label: "Where the edge lands",
          text: "Rounding puts the cut at 0.5, not at 0 — which is why the lit area above is noticeably smaller than half the sphere. If you want to place that terminator yourself, swap the Round for a `Step` (hard edge) or a `Smoothstep` (soft edge) against a threshold you control.",
        },
        {
          type: "p",
          text: "Now, if we use a linear interpolation node and connect the scalar result to its T input, and finally connect two different colours to inputs A and B... we get to decide the colour of the light and the colour of the shadow on our model!",
        },
        {
          type: "note",
          label: "Saturate, and T",
          text: "`Saturate` is a function that makes sure a float can never be greater than 1 nor smaller than 0: anything above 1 becomes 1 and anything below 0 becomes 0. It matters here because T is the blend factor of the Lerp — not time — and it expects to sit between exactly those two values: at T = 0 you get colour A, at T = 1 you get colour B.",
        },
        {
          type: "figure",
          src: ASSETS + "/graph-cel.png",
          alt: "Shader Graph nodes: Dot Product into Round, into Saturate, into the T input of a Lerp blending a shadow colour and a light colour.",
          caption: "The full graph — Dot Product → Round → Saturate → Lerp between a shadow colour and a light colour.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-cel.png",
          alt: "The same sphere shaded in two flat colours: pale cyan on the lit side, blue on the shadow side.",
          caption: "Same maths, art-directed.",
        },

        { type: "chapter", number: "05", eyebrow: "Example · Gameplay", title: "Vision cones without a single acos" },
        {
          type: "p",
          text: "This is only one of the examples! But using the same function as a base we could work out a search range for an enemy in our game, or decide whether our character is heading in the right direction towards their designated objective, among many other cases where vectors are involved.",
        },
        {
          type: "figure",
          src: ASSETS + "/detection-cone.jpg",
          alt: "A capsule in a Unity scene with a green wireframe cone drawn in front of it and a blue line towards its edge.",
          caption: "Detection angle, using the dot product as its main core.",
        },
        {
          type: "p",
          text: "A vision cone asks the same question the lighting did, only about gameplay: how parallel is the direction from the guard to the player with the direction the guard is facing?",
        },
        {
          type: "code",
          label: "C#",
          code: [
            "bool CanSee(Transform viewer, Vector3 targetPosition, float fieldOfView, float range)",
            "{",
            "    Vector3 toTarget = targetPosition - viewer.position;",
            "    if (toTarget.sqrMagnitude > range * range) return false;",
            "",
            "    float alignment = Vector3.Dot(viewer.forward, toTarget.normalized);",
            "",
            "    // The cosine of half the cone. Anything more aligned than that is inside it.",
            "    return alignment >= Mathf.Cos(fieldOfView * 0.5f * Mathf.Deg2Rad);",
            "}",
          ].join("\n"),
        },
        {
          type: "note",
          label: "Two things worth doing here",
          text: "Compare against the cosine of the angle instead of turning the dot product back into degrees with `acos`: it is the same answer, it is cheaper, and the threshold can be computed once. And if the cone should ignore height — a guard who shouldn't lose you just because you climbed on a crate — zero out the Y of `toTarget` before normalising it.",
        },

        { type: "chapter", number: "06", eyebrow: "Example · Gameplay", title: "Am I going the right way?" },
        {
          type: "p",
          text: "Same idea, fewer moving parts. Compare the direction the player is heading with the direction to the objective, and the sign of the result already tells you whether they are going towards it or away from it.",
        },
        {
          type: "figures",
          items: [
            {
              src: ASSETS + "/target-aligned.jpg",
              alt: "A Unity scene with a cube labelled PLAYER and a capsule labelled TARGET, with green debug lines between them.",
              caption: "Aligned — the check passes and the debug lines turn green.",
            },
            {
              src: ASSETS + "/target-misaligned.jpg",
              alt: "The same scene with red debug lines pointing away from the target.",
              caption: "Not aligned — the same check fails and the lines turn red.",
            },
          ],
        },
        {
          type: "p",
          text: "An example of a mechanic where the player has to reach a point on the map: this way you can let them know whether they are going the right way or not. The sign does all the work — no threshold, no angle — and how close the value gets to 1 tells you how directly they are heading there.",
        },

        { type: "chapter", number: "07", eyebrow: "Closing", title: "One function, a lot of mileage" },
        {
          type: "p",
          text: "Again, I repeat, these are simple examples! The usefulness of the dot product is immense and it applies to many more cases.",
        },
        {
          type: "p",
          text: "You can find the project with these examples and the source code on my GitHub, along with other projects I'd encourage you to take a look at.",
        },
      ],
    },

    es: {
      eyebrow: "Artículo técnico",
      blocks: [
        {
          type: "lead",
          text: "El producto escalar es, en mi opinión, una de las operaciones matemáticas más interesantes y útiles del campo de los vectores.",
        },
        {
          type: "p",
          text: "Este artículo NO es un tutorial como tal. Simplemente explico este concepto matemático aplicándolo en ejemplos reales relacionados con gráficos 3D, herramientas de software o programación de sombreadores. Cada uno de estos conceptos podría ser su propio artículo por separado, así que no ahondaré demasiado en ellos, solo lo básico, dando por hecho que el lector tiene algunas nociones básicas de matemáticas y, en el caso de los ejemplos expuestos, de programación de sombreados o desarrollo de videojuegos.",
        },

        { type: "chapter", number: "01", eyebrow: "Las matemáticas", title: "Multiplicar y sumar, nada más" },
        {
          type: "p",
          text: "El producto escalar, en su núcleo, no es más que una función que toma dos vectores y devuelve un valor escalar como resultado, multiplicando cada componente de un vector por el componente equivalente del otro y sumándolos después.",
        },
        {
          type: "p",
          text: "En el ejemplo de abajo usaremos vectores de 2 dimensiones, pero es fácilmente aplicable a la tercera dimensión: simplemente añadiendo una suma y una multiplicación entre los componentes Z del vector 1 y del vector 2.",
        },
        {
          type: "formula",
          text: "V1 · V2 = (V1.x * V2.x) + (V1.y * V2.y)",
          caption: "Dos dimensiones. Para tres, añade + (V1.z * V2.z) al final.",
        },
        { type: "p", text: "En una función de un lenguaje de código como C# podría verse así:" },
        {
          type: "code",
          label: "C#",
          code: [
            "float DotProduct(Vector2 v1, Vector2 v2)",
            "{",
            "    return (v1.x * v2.x) + (v1.y * v2.y);",
            "}",
            "",
            "float DotProduct(Vector3 v1, Vector3 v2)",
            "{",
            "    return (v1.x * v2.x) + (v1.y * v2.y) + (v1.z * v2.z);",
            "}",
          ].join("\n"),
        },
        {
          type: "note",
          label: "En la práctica",
          text: "Casi nunca vas a escribir esto tú: todos los motores ya lo traen hecho. `Vector3.Dot` en Unity, `FVector::DotProduct` en Unreal, `a.dot(b)` en Godot, `dot()` en HLSL y GLSL. Lo escribo aquí solo para que la operación deje de ser una caja negra.",
        },

        { type: "chapter", number: "02", eyebrow: "El significado", title: "¿Qué tan paralelos son estos dos vectores?" },
        {
          type: "p",
          text: "Así, por sí solo, no parece demasiado interesante. Sin embargo, lo que sí lo es es el QUÉ significa dicho resultado, sobre todo cuando se normalizan los 2 vectores previamente.",
        },
        { type: "statement", text: "El producto escalar, en esencia, te chiva qué tan paralelos son 2 vectores entre ellos." },
        {
          type: "p",
          text: "Sin normalizar, el resultado se lleva consigo la longitud de ambos vectores. La identidad que hay detrás es `a · b = |a| * |b| * cos(θ)`, así que el número crece o encoge según lo largos que sean tus vectores, y no puedes comparar un par con otro.",
        },
        {
          type: "p",
          text: "Si los normalizas previamente, ambas longitudes pasan a valer 1, las magnitudes se cancelan y lo que queda es exactamente `cos(θ)`: de repente tienes un resultado que va estrictamente desde -1 a 1.",
        },
        {
          type: "values",
          items: [
            ["1", "Misma dirección", "Los dos vectores miran hacia el mismo sitio: son completamente paralelos."],
            ["0", "Perpendiculares", "El segundo vector está a 90° del primero, completamente ortogonal."],
            ["-1", "Dirección opuesta", "Siguen siendo paralelos, pero el segundo vector mira justo al revés."],
          ],
        },
        {
          type: "p",
          text: "Por supuesto, en estos casos cualquier valor decimal es posible entre -1 y 1 dependiendo de la dirección del vector 2.",
        },
        {
          type: "note",
          label: "Atajo",
          text: "El signo por sí solo ya responde a \"¿esto lo tengo delante o detrás?\". Positivo es delante, negativo es detrás y cero es justo de lado. Para eso no necesitas el ángulo, y tampoco necesitas un `acos`.",
        },

        { type: "chapter", number: "03", eyebrow: "Ejemplo · Iluminación", title: "El cálculo de luz más sencillo que existe" },
        {
          type: "p",
          text: "Con esto aclarado y aplicándolo al mundo de los videojuegos, existen varios ejemplos de uso. Por ejemplo, el cálculo de iluminación de gráficos 3D más básico usa precisamente esta función para determinar qué áreas de un modelo 3D son luz y cuáles son sombra. (No entraré en detalles en este artículo sobre cómo funciona proyectar sombras del modelo hacia sí mismo, eso es para otro artículo.)",
        },
        {
          type: "p",
          text: "Por simplicidad, usaremos una esfera. Para aquellos que no estén demasiado metidos en el mundillo, un modelo 3D está formado por vértices, puntos en el espacio que determinan la superficie. Pero también albergan una información muy importante: la dirección de dicho vértice en la superficie, también conocida como **normal**, en forma de un vector unitario.",
        },
        {
          type: "p",
          text: "Con eso en mente, podemos calcular qué partes de un modelo están iluminadas y cuáles en sombra dentro de un programa de sombreado (conocido como shader) simplemente usando el producto escalar, siendo el primer input la dirección de la luz en la escena normalizada y el segundo input la dirección de las normales de nuestro modelo 3D, también normalizadas.",
        },
        {
          type: "p",
          text: "Por simpleza visual usaré Unity 6 con URP y Shader Graph para calcular el ejemplo, pero es fácilmente aplicable en cualquier otro motor de renderizado como Godot o Unreal Engine 5.",
        },
        {
          type: "figure",
          src: ASSETS + "/graph-lambert.png",
          alt: "Nodos de Shader Graph: dirección de la luz principal y vector normal, ambos normalizados, entrando en un nodo Dot Product conectado a Base Color.",
          caption: "El grafo completo: dirección de la luz y normal de la superficie, ambas normalizadas, a un único Dot Product.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-lambert.png",
          alt: "Una esfera en la vista de escena de Unity sombreada de blanco a negro a lo largo de su superficie.",
          caption: "Ese producto escalar conectado directamente al Base Color.",
        },
        {
          type: "p",
          text: "¡De repente, tenemos una esfera iluminada! Esto es porque he puesto como input del color base del modelo el resultado del producto escalar como un valor de vector3 con todos sus componentes siendo ese mismo valor. En el campo de los gráficos 3D, un valor de 0 o inferior se representa como negro, mientras que de 0 en adelante se representa en escala de grises hasta llegar a 1 en adelante, que es blanco.",
        },
        {
          type: "note",
          label: "Dos detalles de ese grafo",
          text: "Normalizo la normal aunque las normales de los vértices ya lleguen como vectores unitarios, porque se interpolan a lo largo del triángulo camino del fragmento y dejan de medir exactamente 1. Y multiplico la dirección de la luz por -1 porque ese nodo me estaba dando la dirección hacia la que viaja la luz, en vez de la dirección desde la superficie hacia la luz. Esa convención de signo cambia entre programas y versiones, así que compruébala en lugar de darla por hecha.",
        },

        { type: "chapter", number: "04", eyebrow: "Ejemplo · Cel shading", title: "Del degradado a dos colores planos" },
        {
          type: "p",
          text: "Este ejemplo es el NÚCLEO para calcular efectos de sombreado estilo cel shader, presentes en juegos como *Guilty Gear* o *Dragon Ball: FighterZ*. Si redondeamos el resultado escalar, podemos eliminar ese degradado.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-stepped.jpg",
          alt: "La misma esfera, ahora dividida en una zona blanca plana y una zona negra plana con un borde duro entre ellas.",
          caption: "Un nodo Round sobre el producto escalar: se acabó el degradado, solo luz y sombra.",
        },
        {
          type: "p",
          text: "`Round` ajusta el degradado a números enteros y `Saturate` descarta la mitad negativa, así que lo que sale al otro lado es una máscara limpia de 0 o 1.",
        },
        {
          type: "note",
          label: "Dónde cae el borde",
          text: "Redondear sitúa el corte en 0.5, no en 0, y por eso la zona iluminada de arriba es visiblemente menor que media esfera. Si quieres colocar tú esa frontera, cambia el Round por un `Step` (borde duro) o un `Smoothstep` (borde suave) contra un umbral que controles.",
        },
        {
          type: "p",
          text: "Si usamos una función de interpolado lineal y conectamos el resultado del valor escalar al input T, y finalmente conectamos 2 colores distintos a los inputs A y B... ¡podremos decidir el color de la luz y de la sombra de nuestro modelo!",
        },
        {
          type: "note",
          label: "Saturate, y la T",
          text: "`Saturate` es una función que se asegura de que un valor de tipo float no pueda ser ni mayor que 1 ni menor que 0, siendo que cualquier valor por encima de 1 sea 1 y cualquiera menor que 0 sea 0. Aquí importa porque la T del Lerp es el factor de mezcla — no el tiempo — y espera moverse justo entre esos dos valores: con T = 0 obtienes el color A y con T = 1 el color B.",
        },
        {
          type: "figure",
          src: ASSETS + "/graph-cel.png",
          alt: "Nodos de Shader Graph: Dot Product hacia Round, hacia Saturate, hacia la entrada T de un Lerp que mezcla un color de sombra y un color de luz.",
          caption: "El grafo completo: Dot Product → Round → Saturate → Lerp entre un color de sombra y uno de luz.",
        },
        {
          type: "figure",
          src: ASSETS + "/sphere-cel.png",
          alt: "La misma esfera sombreada con dos colores planos: cian claro en la zona de luz y azul en la de sombra.",
          caption: "Las mismas matemáticas, ahora con dirección artística.",
        },

        { type: "chapter", number: "05", eyebrow: "Ejemplo · Gameplay", title: "Conos de visión sin un solo acos" },
        {
          type: "p",
          text: "¡Este es solo uno de los ejemplos! Pero usando la misma función como base podríamos calcular un rango de búsqueda, por ejemplo, para un enemigo de nuestro videojuego, o definir si nuestro personaje está yendo en la dirección correcta hacia su misión designada, entre muchos otros ejemplos donde haya vectores involucrados.",
        },
        {
          type: "figure",
          src: ASSETS + "/detection-cone.jpg",
          alt: "Una cápsula en una escena de Unity con un cono de alambre verde dibujado delante y una línea azul hacia su borde.",
          caption: "Ángulo de detección usando el producto escalar como núcleo principal.",
        },
        {
          type: "p",
          text: "Un cono de visión hace la misma pregunta que hacíamos con la luz, solo que aplicada al gameplay: ¿qué tan paralela es la dirección del enemigo hacia el jugador con la dirección hacia la que el enemigo está mirando?",
        },
        {
          type: "code",
          label: "C#",
          code: [
            "bool CanSee(Transform viewer, Vector3 targetPosition, float fieldOfView, float range)",
            "{",
            "    Vector3 toTarget = targetPosition - viewer.position;",
            "    if (toTarget.sqrMagnitude > range * range) return false;",
            "",
            "    float alignment = Vector3.Dot(viewer.forward, toTarget.normalized);",
            "",
            "    // El coseno de la mitad del cono. Todo lo que esté más alineado cae dentro.",
            "    return alignment >= Mathf.Cos(fieldOfView * 0.5f * Mathf.Deg2Rad);",
            "}",
          ].join("\n"),
        },
        {
          type: "note",
          label: "Dos cosas que conviene hacer aquí",
          text: "Compara contra el coseno del ángulo en vez de convertir el producto escalar de vuelta a grados con `acos`: es la misma respuesta, es más barato y el umbral se puede calcular una sola vez. Y si el cono debe ignorar la altura — un enemigo que no debería perderte solo porque te has subido a una caja — pon a cero la Y de `toTarget` antes de normalizarlo.",
        },

        { type: "chapter", number: "06", eyebrow: "Ejemplo · Gameplay", title: "¿Voy en la dirección correcta?" },
        {
          type: "p",
          text: "La misma idea con menos piezas: compara la dirección en la que se mueve el jugador con la dirección hacia el objetivo, y el signo del resultado ya te dice si va hacia él o si se está alejando.",
        },
        {
          type: "figures",
          items: [
            {
              src: ASSETS + "/target-aligned.jpg",
              alt: "Una escena de Unity con un cubo etiquetado PLAYER y una cápsula etiquetada TARGET, con líneas de depuración verdes entre ellos.",
              caption: "Alineado: la comprobación se cumple y las líneas de depuración salen verdes.",
            },
            {
              src: ASSETS + "/target-misaligned.jpg",
              alt: "La misma escena con líneas de depuración rojas apuntando lejos del objetivo.",
              caption: "Sin alinear: la misma comprobación falla y las líneas salen rojas.",
            },
          ],
        },
        {
          type: "p",
          text: "Ejemplo de mecánica donde el player tiene que llegar a un punto en el mapa: de esta forma puedes hacer que el jugador sepa si va en la dirección correcta o no. El signo hace todo el trabajo — sin umbrales y sin ángulos — y lo cerca que esté el valor de 1 te dice cómo de directo va.",
        },

        { type: "chapter", number: "07", eyebrow: "Cierre", title: "Una sola función, muchísimo recorrido" },
        {
          type: "p",
          text: "Esto, reitero, ¡son simples ejemplos! La utilidad del producto escalar es inmensa y útil para muchos más casos.",
        },
        {
          type: "p",
          text: "Podéis acceder al proyecto con los ejemplos y el código fuente en mi GitHub, entre otros proyectos que os animo a que echéis un vistazo.",
        },
      ],
    },
  },
  "cross-product": {
    en: {
      eyebrow: "Technical article",
      blocks: [
        {
          type: "lead",
          text: "Having explained the dot product in the previous article, it only feels right to continue with an important cousin of it in the field of vectors: the cross product.",
        },
        {
          type: "p",
          text: "This article is NOT a tutorial. It is a simple explanation of the cross product and a few real applications where the function is used. As before, each example could become an article of its own; here I only want to get to the core and make the maths useful.",
        },

        { type: "chapter", number: "01", eyebrow: "The maths", title: "Two vectors go in, a third comes out" },
        {
          type: "p",
          text: "The cross product takes two 3D vectors as inputs and gives us a third vector as the result. Component by component, the formula is this:",
        },
        {
          type: "formula",
          text: "a × b = (a.y*b.z − a.z*b.y,  a.z*b.x − a.x*b.z,  a.x*b.y − a.y*b.x)",
          caption: "The middle component is often written as −(a.x*b.z − a.z*b.x). It is exactly the same expression.",
        },
        {
          type: "p",
          text: "A little more involved than the dot product, no doubt. But it looks much friendlier inside a simple function and, this time... we'll use Python for the example!",
        },
        {
          type: "code",
          label: "Python",
          code: [
            "def cross_product(a, b):",
            "    result_x = (a.y * b.z) - (a.z * b.y)",
            "    result_y = (a.z * b.x) - (a.x * b.z)",
            "    result_z = (a.x * b.y) - (a.y * b.x)",
            "",
            "    return (result_x, result_y, result_z)",
          ].join("\n"),
        },
        {
          type: "note",
          label: "About that Python",
          text: "The example assumes `a` and `b` are vector objects with `.x`, `.y` and `.z` properties. If they are plain lists or tuples, use `a[0]`, `a[1]`, `a[2]` instead. The maths does not change.",
        },
        {
          type: "note",
          label: "In practice",
          text: "Luckily, even if I am explaining the guts of the function, you do not have to calculate it from zero. You already have `Vector3.Cross` in Unity, `FVector::CrossProduct` in Unreal, `a.cross(b)` in Godot, `cross()` in HLSL and GLSL, and `numpy.cross` in Python.",
        },

        { type: "chapter", number: "02", eyebrow: "The meaning", title: "Perpendicular — but pointing where?" },
        {
          type: "p",
          text: "But... what exactly does this function do? Simple. It returns the vector orthogonal to the plane formed by the two inputs. Two vectors go in; a third comes out perpendicular to both.",
        },
        {
          type: "statement",
          text: "The direction gives you the normal of the plane. The length gives you the area of the parallelogram between the inputs.",
        },
        {
          type: "formula",
          text: "|a × b| = |a| * |b| * sin(θ)",
          caption: "If both inputs are unit vectors, the result's length is sin(θ). If they are also perpendicular, its length is exactly 1.",
        },
        {
          type: "values",
          items: [
            ["90°", "Perpendicular", "The output sits at 90° to both inputs."],
            ["A", "Area", "Its magnitude is the parallelogram's area; half of it is the triangle's area."],
            ["−", "Order matters", "Swap the inputs and you reverse the result: b × a = −(a × b)."],
          ],
        },
        {
          type: "p",
          text: "To know which of the two possible perpendicular directions you get in the conventional right-handed mathematical basis, use the **right-hand rule**: point your index finger along `a`, your middle finger along `b`, and your thumb points along `a × b`. It is not a decorative mnemonic — operand order is part of the answer.",
        },
        {
          type: "note",
          label: "The zero-vector trap",
          text: "Parallel vectors do not form an area, so their cross product is `(0, 0, 0)`. The same happens if either input is zero. Never normalise that result without checking its length first: a zero vector has no direction to recover.",
        },

        { type: "chapter", number: "03", eyebrow: "Example · Coordinate axes", title: "Build the axis you are missing" },
        {
          type: "p",
          text: "A very direct use in a 3D engine is rebuilding one axis from the other two. In Unity, where X is right, Y is up and Z is forward, `right × up` gives forward. In Unreal, where X is forward, Y is right and Z is up, `right × up` — `Y × Z` — gives forward, which is X.",
        },
        {
          type: "p",
          text: "This only gives you a clean unit axis when the two inputs are themselves unit-length and perpendicular. If they are not, normalise the result — after checking it is not zero — or you will carry around an 'axis' with a strange length.",
        },
        {
          type: "note",
          label: "Conventions are part of the maths",
          text: "Engines disagree about which axis means forward and whether their coordinate space is presented as left- or right-handed. That can even change which hand their documentation uses to visualise the operation. The component formula stays the same; test one known basis in your engine instead of memorising a line from somewhere else.",
        },

        { type: "chapter", number: "04", eyebrow: "Example · Gameplay", title: "Is it on my left or on my right?" },
        {
          type: "p",
          text: "The cross product can also tell you whether something is to your left or to your right. Here the whole output vector is not the interesting part; its sign along your chosen up axis is.",
        },
        {
          type: "video",
          src: CROSS_ASSETS + "/left-right.mp4",
          poster: CROSS_ASSETS + "/left-right-poster.jpg",
          caption: "Cross forward with the direction to the target, then inspect how much of the result points along up.",
        },
        {
          type: "code",
          label: "C# · Unity",
          code: [
            "Vector3 toTarget = (target.position - transform.position).normalized;",
            "float side = Vector3.Dot(",
            "    Vector3.Cross(transform.forward, toTarget),",
            "    transform.up",
            ");",
            "",
            "if (side > 0.0001f) Debug.Log(\"Right\");",
            "else if (side < -0.0001f) Debug.Log(\"Left\");",
            "else Debug.Log(\"Directly ahead or behind\");",
          ].join("\n"),
        },
        {
          type: "p",
          text: "With Unity's usual X-right, Y-up, Z-forward basis and exactly that operand order, positive means right and negative means left. Swap the inputs and the meaning swaps too. The final dot product is what turns the cross product into one signed number along `up` — together, this is the **scalar triple product**.",
        },
        {
          type: "note",
          label: "What zero means",
          text: "A result near zero means the target is on the forward/back axis, not necessarily in front. If that distinction matters, use a second check: `Dot(forward, toTarget)` is positive in front and negative behind. For a flat ground-plane test, project both directions onto that plane before doing either calculation.",
        },

        { type: "chapter", number: "05", eyebrow: "Example · Meshes", title: "Calculate the normals of a 3D mesh" },
        {
          type: "p",
          text: "Take one triangle with vertices A, B and C. Two of its edges are `B − A` and `C − A`; cross them and you get the face normal. I am being picky about the word *vertices* here because A, B and C are points — the subtractions are what create the edge vectors.",
        },
        {
          type: "formula",
          text: "faceNormal = normalize((B − A) × (C − A))",
          caption: "Before normalising, the result's magnitude is twice the triangle's area — useful information you may not want to throw away too early.",
        },
        {
          type: "figures",
          items: [
            {
              src: CROSS_ASSETS + "/normal-outward.png",
              alt: "A triangular face of a pyramid with vertices A, B and C and a green normal pointing out of the face.",
              caption: "One winding order: the face normal points outward.",
            },
            {
              src: CROSS_ASSETS + "/normal-inward.png",
              alt: "The same triangular face with its vertex winding reversed and the green normal pointing inward.",
              caption: "Reverse the winding and the same cross product points inward.",
            },
          ],
        },
        {
          type: "p",
          text: "The order in which the vertices are traversed — the **winding order** — decides whether the normal points out of or into the mesh. That same orientation is used by backface culling, the optimisation that normally avoids drawing the hidden side of every triangle. Reverse the winding and suddenly you can see the inside while the outside disappears.",
        },
        {
          type: "note",
          label: "Face normals versus vertex normals",
          text: "A face normal belongs to one triangle. A smooth vertex normal is built from the normals of the faces touching that vertex and then normalised. A plain average works, but production tools often weight the contribution by face area or corner angle so tiny triangles do not distort the result.",
        },

        { type: "chapter", number: "06", eyebrow: "Example · Cameras", title: "Turn a direction into an orientation" },
        {
          type: "p",
          text: "A camera looking at a target gives you one axis immediately: forward is target minus position, normalised. But one direction is not a full orientation. Cross it with a reference up to build right, then cross forward and right to recover the real up — perpendicular even if the reference was slightly crooked.",
        },
        {
          type: "video",
          src: CROSS_ASSETS + "/camera-orientation.mp4",
          poster: CROSS_ASSETS + "/camera-basis.jpg",
          caption: "Reference up only starts the calculation. The green real-up axis is rebuilt so the final basis is orthogonal.",
        },
        {
          type: "code",
          label: "C# · Unity-style +Z forward",
          code: [
            "Vector3 forward = (target - position).normalized;",
            "Vector3 right = Vector3.Cross(referenceUp, forward).normalized;",
            "Vector3 realUp = Vector3.Cross(forward, right);",
            "",
            "// right, realUp and forward now form an orthonormal basis.",
          ].join("\n"),
        },
        {
          type: "p",
          text: "Three unit vectors, all perpendicular to each other: that is your camera basis, ready to become an orientation matrix. Under the hood this is very close to a Gram–Schmidt orthogonalisation step, only written in the language that 3D code tends to use.",
        },
        {
          type: "note",
          label: "When the camera explodes",
          text: "If the camera looks straight along `referenceUp`, forward and reference up become parallel. Their cross product is zero, right has no direction and the basis collapses. Detect a near-parallel pair first — for example `abs(Dot(forward, referenceUp)) > 0.999` — and choose a different fallback reference axis. Also note the order above: `Cross(forward, referenceUp)` would point to the opposite side in this convention.",
        },

        { type: "chapter", number: "07", eyebrow: "Closing", title: "One perpendicular vector, a surprising amount of work" },
        {
          type: "p",
          text: "And these, again, are only simple examples! The cross product also helps build tangent spaces for normal mapping, calculate torque, measure triangle areas, derive plane directions and solve all sorts of geometric tests. Anywhere two directions define a plane, the cross product is probably nearby.",
        },
        {
          type: "p",
          text: "You can access these examples and their source code in the project on my GitHub if you are interested in taking a deeper look — along with other projects I encourage you to check out.",
        },
      ],
    },

    es: {
      eyebrow: "Artículo técnico",
      blocks: [
        {
          type: "lead",
          text: "Habiendo explicado en el anterior artículo el producto escalar, es tan solo correcto en mi opinión continuar con un primo importante suyo en el campo de los vectores: el producto vectorial.",
        },
        {
          type: "p",
          text: "Este artículo NO es un tutorial. Es una explicación simple sobre el producto vectorial y algunos ejemplos de aplicaciones reales en las que se usa dicha función. Como la otra vez, cada ejemplo podría convertirse en su propio artículo; aquí solo quiero llegar al núcleo y hacer útiles las matemáticas.",
        },

        { type: "chapter", number: "01", eyebrow: "Las matemáticas", title: "Entran dos vectores, sale un tercero" },
        {
          type: "p",
          text: "El producto vectorial usa dos vectores 3D como inputs y nos devuelve un tercer vector como resultado. Componente por componente, la fórmula es la siguiente:",
        },
        {
          type: "formula",
          text: "a × b = (a.y*b.z − a.z*b.y,  a.z*b.x − a.x*b.z,  a.x*b.y − a.y*b.x)",
          caption: "El componente central también se suele escribir como −(a.x*b.z − a.z*b.x). Es exactamente la misma expresión.",
        },
        {
          type: "p",
          text: "Un poco más complicada que el producto escalar, sin duda. Pero podemos verla mejor simplificada y aplicada a una función en un lenguaje sencillo como... ¡utilizaremos Python esta vez para el ejemplo!",
        },
        {
          type: "code",
          label: "Python",
          code: [
            "def producto_vectorial(a, b):",
            "    resultado_x = (a.y * b.z) - (a.z * b.y)",
            "    resultado_y = (a.z * b.x) - (a.x * b.z)",
            "    resultado_z = (a.x * b.y) - (a.y * b.x)",
            "",
            "    return (resultado_x, resultado_y, resultado_z)",
          ].join("\n"),
        },
        {
          type: "note",
          label: "Sobre ese Python",
          text: "El ejemplo da por hecho que `a` y `b` son objetos vector con propiedades `.x`, `.y` y `.z`. Si son listas o tuplas corrientes, habría que acceder con `a[0]`, `a[1]` y `a[2]`. Las matemáticas no cambian.",
        },
        {
          type: "note",
          label: "En la práctica",
          text: "Por suerte, aunque esté explicando las tripas de la función, no tenéis por qué calcularla desde cero. Ya existen `Vector3.Cross` en Unity, `FVector::CrossProduct` en Unreal, `a.cross(b)` en Godot, `cross()` en HLSL y GLSL y `numpy.cross` en Python.",
        },

        { type: "chapter", number: "02", eyebrow: "El significado", title: "Perpendicular... ¿pero apuntando hacia dónde?" },
        {
          type: "p",
          text: "Pero... ¿qué es lo que hace exactamente esta función? Sencillo. Devuelve el vector ortogonal al plano que forman los inputs que le des. Entran dos vectores; sale un tercero perpendicular a ambos.",
        },
        {
          type: "statement",
          text: "La dirección te da la normal del plano. La longitud te da el área del paralelogramo que forman los inputs.",
        },
        {
          type: "formula",
          text: "|a × b| = |a| * |b| * sin(θ)",
          caption: "Si ambos inputs son unitarios, la longitud del resultado es sin(θ). Si además son perpendiculares, mide exactamente 1.",
        },
        {
          type: "values",
          items: [
            ["90°", "Perpendicular", "El resultado queda a 90° de los dos inputs."],
            ["A", "Área", "Su magnitud es el área del paralelogramo; la mitad es el área del triángulo."],
            ["−", "El orden importa", "Intercambia los inputs e inviertes el resultado: b × a = −(a × b)."],
          ],
        },
        {
          type: "p",
          text: "Para saber cuál de las dos direcciones perpendiculares posibles obtendrás en la base matemática diestra convencional, usa la **regla de la mano derecha**: coloca el índice siguiendo `a`, el dedo corazón siguiendo `b` y el pulgar señalará `a × b`. No es una regla mnemotécnica de adorno: el orden de los inputs forma parte del resultado.",
        },
        {
          type: "note",
          label: "La trampa del vector cero",
          text: "Dos vectores paralelos no forman ningún área, así que su producto vectorial es `(0, 0, 0)`. Lo mismo ocurre si cualquiera de los inputs es cero. Nunca normalices ese resultado sin comprobar primero su longitud: un vector cero no tiene una dirección que recuperar.",
        },

        { type: "chapter", number: "03", eyebrow: "Ejemplo · Ejes de coordenadas", title: "Construye el eje que te falta" },
        {
          type: "p",
          text: "Un uso muy directo dentro de un motor 3D es reconstruir un eje a partir de los otros dos. En Unity, donde X es derecha, Y es arriba y Z es frontal, `right × up` devuelve forward. En Unreal, donde X es frontal, Y es derecha y Z es arriba, `right × up` — `Y × Z` — devuelve forward, que allí es X.",
        },
        {
          type: "p",
          text: "Esto solo devuelve un eje unitario limpio cuando los dos inputs también son unitarios y perpendiculares. Si no lo son, normaliza el resultado — después de comprobar que no sea cero — o acabarás arrastrando un «eje» con una longitud extraña.",
        },
        {
          type: "note",
          label: "Las convenciones son parte de las matemáticas",
          text: "Los motores no siempre están de acuerdo sobre qué eje significa frontal ni sobre si presentan su espacio de coordenadas como zurdo o diestro. Eso puede cambiar incluso qué mano usa su documentación para visualizar la operación. La fórmula por componentes no cambia; prueba una base conocida en tu motor en vez de memorizar una línea sacada de otro sitio.",
        },

        { type: "chapter", number: "04", eyebrow: "Ejemplo · Gameplay", title: "¿Está a mi izquierda o a mi derecha?" },
        {
          type: "p",
          text: "El producto vectorial también te sirve para saber si algo está a tu izquierda o a tu derecha. Aquí no te interesa demasiado el vector entero, sino su signo sobre el eje up que hayas elegido.",
        },
        {
          type: "video",
          src: CROSS_ASSETS + "/left-right.mp4",
          poster: CROSS_ASSETS + "/left-right-poster.jpg",
          caption: "Cruza forward con la dirección al objetivo y comprueba cuánto apunta el resultado a lo largo de up.",
        },
        {
          type: "code",
          label: "C# · Unity",
          code: [
            "Vector3 haciaObjetivo = (objetivo.position - transform.position).normalized;",
            "float lado = Vector3.Dot(",
            "    Vector3.Cross(transform.forward, haciaObjetivo),",
            "    transform.up",
            ");",
            "",
            "if (lado > 0.0001f) Debug.Log(\"Derecha\");",
            "else if (lado < -0.0001f) Debug.Log(\"Izquierda\");",
            "else Debug.Log(\"Justo delante o detrás\");",
          ].join("\n"),
        },
        {
          type: "p",
          text: "Con la base habitual de Unity — X derecha, Y arriba y Z frontal — y exactamente ese orden de inputs, positivo significa derecha y negativo izquierda. Si intercambias los inputs, intercambias también el significado. El producto escalar final es lo que convierte el cross en un único número con signo sobre `up`; juntos forman el **producto mixto**.",
        },
        {
          type: "note",
          label: "Qué significa cero",
          text: "Un resultado cercano a cero significa que el objetivo está sobre el eje frontal/trasero, no necesariamente delante. Si necesitas distinguirlo, haz una segunda prueba: `Dot(forward, haciaObjetivo)` es positivo delante y negativo detrás. Para una comprobación plana sobre el suelo, proyecta antes ambas direcciones sobre ese plano.",
        },

        { type: "chapter", number: "05", eyebrow: "Ejemplo · Mallas", title: "Calcula las normales de una malla 3D" },
        {
          type: "p",
          text: "Coge un triángulo con vértices A, B y C. Dos de sus aristas son `B − A` y `C − A`; crúzalas y obtendrás la normal de la cara. Soy un poco tiquismiquis con la palabra *vértices* porque A, B y C son puntos: son las restas las que crean los vectores de las aristas.",
        },
        {
          type: "formula",
          text: "normalCara = normalize((B − A) × (C − A))",
          caption: "Antes de normalizar, la magnitud del resultado es el doble del área del triángulo: información útil que quizá no quieras tirar demasiado pronto.",
        },
        {
          type: "figures",
          items: [
            {
              src: CROSS_ASSETS + "/normal-outward.png",
              alt: "Una cara triangular de una pirámide con vértices A, B y C y una normal verde apuntando hacia fuera.",
              caption: "Un orden de recorrido: la normal de la cara apunta hacia fuera.",
            },
            {
              src: CROSS_ASSETS + "/normal-inward.png",
              alt: "La misma cara triangular con el orden de sus vértices invertido y la normal verde apuntando hacia dentro.",
              caption: "Invierte el winding y el mismo producto vectorial apunta hacia dentro.",
            },
          ],
        },
        {
          type: "p",
          text: "El orden en el que recorres los vértices — el **winding order** — decide si la normal apunta hacia fuera o hacia dentro de la malla. Esa misma orientación la usa el backface culling, la optimización que normalmente evita dibujar la cara oculta de cada triángulo. Invierte el winding y de repente podrás ver el interior mientras desaparece el exterior.",
        },
        {
          type: "note",
          label: "Normales de cara y normales de vértice",
          text: "Una normal de cara pertenece a un solo triángulo. Una normal de vértice suave se construye con las normales de las caras que tocan ese vértice y después se normaliza. Un promedio simple funciona, pero las herramientas de producción suelen ponderar la contribución por área o por el ángulo de la esquina para que los triángulos diminutos no deformen el resultado.",
        },

        { type: "chapter", number: "06", eyebrow: "Ejemplo · Cámaras", title: "Convierte una dirección en una orientación" },
        {
          type: "p",
          text: "Una cámara que mira a un objetivo ya te da un eje inmediatamente: forward es objetivo menos posición, normalizado. Pero una dirección no es una orientación completa. Crúzala con un up de referencia para construir right y cruza después forward y right para recuperar el up real, perpendicular aunque la referencia estuviera un poco torcida.",
        },
        {
          type: "video",
          src: CROSS_ASSETS + "/camera-orientation.mp4",
          poster: CROSS_ASSETS + "/camera-basis.jpg",
          caption: "El up de referencia solo inicia el cálculo. El eje verde es el up real, reconstruido para que la base final sea ortogonal.",
        },
        {
          type: "code",
          label: "C# · Estilo Unity con +Z frontal",
          code: [
            "Vector3 forward = (objetivo - posicion).normalized;",
            "Vector3 right = Vector3.Cross(upReferencia, forward).normalized;",
            "Vector3 upReal = Vector3.Cross(forward, right);",
            "",
            "// right, upReal y forward ya forman una base ortonormal.",
          ].join("\n"),
        },
        {
          type: "p",
          text: "Tres vectores unitarios y todos perpendiculares entre ellos: esa es la base de tu cámara, lista para convertirse en una matriz de orientación. Por debajo esto se parece mucho a un paso de ortogonalización de Gram–Schmidt, solo que escrito en el idioma que solemos usar en código 3D.",
        },
        {
          type: "note",
          label: "Cuando la cámara revienta",
          text: "Si la cámara mira justo en la dirección de `upReferencia`, forward y ese up se vuelven paralelos. El cross da cero, right se queda sin dirección y toda la base colapsa. Detecta antes que sean casi paralelos — por ejemplo con `abs(Dot(forward, upReferencia)) > 0.999` — y escoge otro eje de referencia. Fíjate también en el orden de arriba: `Cross(forward, upReferencia)` apuntaría al lado opuesto con esta convención.",
        },

        { type: "chapter", number: "07", eyebrow: "Cierre", title: "Un vector perpendicular que da muchísimo juego" },
        {
          type: "p",
          text: "Y esto, reitero, ¡son simples ejemplos! El producto vectorial también ayuda a construir espacios tangentes para normal maps, calcular torque, medir áreas de triángulos, derivar direcciones de planos y resolver todo tipo de pruebas geométricas. Allí donde dos direcciones formen un plano, seguramente el producto vectorial ande cerca.",
        },
        {
          type: "p",
          text: "Podéis acceder a estos ejemplos y al código fuente en el proyecto subido a mi GitHub, por si os interesa echarles un ojo más a fondo, junto con otros proyectos que os animo a que miréis.",
        },
      ],
    },
  },
};

export default articleStories;
