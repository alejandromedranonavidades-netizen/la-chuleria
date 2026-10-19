/* =============================================================
   CARTA.JS — Página de la carta completa
   - Pinta todas las categorías, los platos y las bebidas
   - Resalta en la barra la categoría que se está viendo
   - Buscador: escribe "croquetas", "pulpo", "queso"...
   ============================================================= */

let textoBuscado = "";

// Quita tildes y mayúsculas para comparar ("Bravas" = "bravas", "jamón" = "jamon")
function normalizar(texto) {
  return texto.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
}

function coincide(...textos) {
  if (!textoBuscado) return true;
  return normalizar(textos.join(" ")).includes(textoBuscado);
}

// Una fila de bebida (sin ficha propia)
function filaBebida([nombre, origen, precio]) {
  return `
    <li>
      <div class="fila-carta fila-carta--bebida">
        <span class="fila-carta__cuerpo">
          <span class="fila-carta__linea">
            <span class="fila-carta__nombre">${nombre}</span>
            <span class="fila-carta__puntos" aria-hidden="true"></span>
            <span class="fila-carta__precio">${precio}</span>
          </span>
          <span class="fila-carta__desc">${origen}</span>
        </span>
      </div>
    </li>`;
}

function pintarCarta() {
  const contenedor = document.getElementById("carta-completa");
  let hayPlatos = false;

  const comida = CATEGORIAS.map((cat) => {
    const platos = PLATOS.filter((p) => p.categoria === cat.id && coincide(p.nombre, p.corta, p.nota || ""));
    if (!platos.length) return "";
    hayPlatos = true;
    const aviso = cat.id === "arroces"
      ? `<p class="carta-categoria__aviso">Pregunta por nuestros menús especiales para eventos: cumpleaños, comuniones, fiestas y reuniones.</p>`
      : "";
    return `
      <section class="carta-categoria" id="${cat.id}" aria-labelledby="titulo-${cat.id}">
        <h2 class="carta-categoria__titulo" id="titulo-${cat.id}">${TITULOS_CATEGORIA[cat.id] || cat.nombre}</h2>
        <ul class="lista-carta">${platos.map(filaCarta).join("")}</ul>
        ${aviso}
      </section>`;
  }).join("");

  const bebidas = BEBIDAS.map((grupo) => {
    const lista = grupo.lista.filter((b) => coincide(...b));
    if (!lista.length) return "";
    hayPlatos = true;
    return `
      <div class="bebidas__grupo">
        <h3 class="bebidas__titulo">${grupo.nombre}</h3>
        <ul class="lista-carta lista-carta--bebidas">${lista.map(filaBebida).join("")}</ul>
      </div>`;
  }).join("");

  contenedor.innerHTML = comida + (bebidas
    ? `<section class="carta-categoria carta-categoria--bebidas" id="bebidas" aria-labelledby="titulo-bebidas">
         <h2 class="carta-categoria__titulo" id="titulo-bebidas">Bodega y cervezas</h2>
         ${bebidas}
       </section>`
    : "");

  document.getElementById("carta-vacia").hidden = hayPlatos;
  contenedor.classList.remove("entrando");
  void contenedor.offsetWidth;
  contenedor.classList.add("entrando");

  pintarNavCategorias();
}

function pintarNavCategorias() {
  const nav = document.getElementById("carta-categorias");
  const visibles = [...CATEGORIAS, { id: "bebidas", nombre: "Bebidas" }].filter((c) => document.getElementById(c.id));
  nav.innerHTML = visibles.map((c) => `<a href="#${c.id}" data-categoria="${c.id}">${c.nombre}</a>`).join("");
  observarCategorias();
}


// Marca en la barra la categoría que hay en pantalla
let observadorCategorias;
function observarCategorias() {
  if (observadorCategorias) observadorCategorias.disconnect();
  const enlaces = document.querySelectorAll("#carta-categorias a");

  observadorCategorias = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (!entrada.isIntersecting) return;
      enlaces.forEach((a) => {
        const activo = a.dataset.categoria === entrada.target.id;
        a.classList.toggle("activa", activo);
        if (activo) {
          // En móvil, desplaza la barra para que la categoría activa quede centrada
          const nav = a.parentElement;
          nav.scrollTo({ left: a.offsetLeft - nav.clientWidth / 2 + a.clientWidth / 2, behavior: "smooth" });
        }
      });
    });
  }, { rootMargin: "-45% 0px -50% 0px" });

  document.querySelectorAll(".carta-categoria").forEach((s) => observadorCategorias.observe(s));
}


function iniciarBuscador() {
  const campo = document.getElementById("buscar-carta");
  if (!campo) return;
  let espera;
  campo.addEventListener("input", () => {
    clearTimeout(espera);
    espera = setTimeout(() => {
      textoBuscado = normalizar(campo.value.trim());
      pintarCarta();
      document.getElementById("texto-buscado").textContent = campo.value.trim();
    }, 150);
  });
}


/* Datos estructurados de la carta (Google puede mostrarla en los resultados) */
function datosEstructuradosCarta() {
  const datos = {
    "@context": "https://schema.org",
    "@type": "Menu",
    name: `Carta de ${RESTAURANTE.nombre}`,
    url: `${RESTAURANTE.urlWeb}/carta.html`,
    inLanguage: "es",
    hasMenuSection: CATEGORIAS.map((cat) => ({
      "@type": "MenuSection",
      name: TITULOS_CATEGORIA[cat.id] || cat.nombre,
      hasMenuItem: PLATOS.filter((p) => p.categoria === cat.id).map((p) => ({
        "@type": "MenuItem",
        name: p.nombre,
        description: p.corta,
        url: `${RESTAURANTE.urlWeb}/plato.html?id=${p.id}`,
        offers: { "@type": "Offer", price: p.precio.toFixed(2), priceCurrency: "EUR" }
      }))
    }))
  };
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(datos);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", () => {
  datosEstructuradosCarta();
  pintarCarta();
  iniciarBuscador();
});
