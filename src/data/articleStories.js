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
const ASSETS = "/assets/articles/dot-product";

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
};

export default articleStories;
