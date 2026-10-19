/* =============================================================
   PLATO.JS — Ficha de un plato
   Lee el id de la dirección (plato.html?id=bravas) y busca
   ese plato en datos.js.
   ============================================================= */

function pintarFicha() {
  const id = new URLSearchParams(location.search).get("id");
  const plato = buscarPlato(id);
  const ficha = document.getElementById("ficha");

  if (!plato) {
    ficha.innerHTML = `
      <div class="ficha__no-encontrado">
        <h1 class="ficha__nombre">Este plato ya no está en la carta</h1>
        <p>Puede que lo hayamos cambiado. Echa un vistazo a la carta de hoy.</p>
        <a class="boton boton--oscuro" href="carta.html">Ver la carta</a>
      </div>`;
    return;
  }

  actualizarSEO(plato);

  // Platos anterior y siguiente dentro de la misma categoría
  const deCategoria = PLATOS.filter((p) => p.categoria === plato.categoria);
  const pos = deCategoria.indexOf(plato);
  const anterior = deCategoria[pos - 1];
  const siguiente = deCategoria[pos + 1];

  const etiquetas = (plato.etiquetas || [])
    .map((e) => `<li class="etiqueta etiqueta--${e}">${ETIQUETAS[e]}</li>`).join("");
  const marcos = ["marco--rojo", "marco--mostaza", "marco--verde"];
  const color = marcos[PLATOS.indexOf(plato) % marcos.length];

  ficha.innerHTML = `
    <nav class="migas" aria-label="Estás en">
      <a href="carta.html">Carta</a>
      <span aria-hidden="true">/</span>
      <a href="carta.html#${plato.categoria}">${TITULOS_CATEGORIA[plato.categoria]}</a>
    </nav>

    <div class="ficha__rejilla">
      <div class="ficha__foto">${marcoPlato(plato, `marco--ficha ${color}`, true)}</div>

      <div class="ficha__texto">
        <p class="ficha__categoria">${TITULOS_CATEGORIA[plato.categoria]}</p>
        <h1 class="ficha__nombre">${plato.nombre}</h1>
        <p class="ficha__precio">
          ${formatoPrecio(plato.precio)}
          ${plato.nota ? `<span class="ficha__nota">${plato.nota}</span>` : ""}
        </p>
        ${etiquetas ? `<ul class="ficha__etiquetas">${etiquetas}</ul>` : ""}

        <p class="ficha__descripcion">${plato.corta}</p>

        <div class="ficha__bloque">
          <h2>Alérgenos</h2>
          <p>Si tienes alguna alergia o intolerancia, díselo a nuestro equipo al reservar o al sentarte: te contamos qué lleva cada plato.</p>
        </div>

        <div class="ficha__bloque">
          <h2>Para acompañar</h2>
          <p>Vinos de Ribera, Rioja, Rueda o Rías Baixas y cervezas nacionales y del mundo. <a href="carta.html#bebidas">Ver bodega y cervezas</a></p>
        </div>

        <div class="ficha__acciones">
          <a class="boton boton--rojo" href="reservas.html?plato=${plato.id}">Reservar mesa</a>
          <a class="enlace-flecha" href="carta.html#${plato.categoria}">Volver a la carta</a>
        </div>
      </div>
    </div>

    <nav class="ficha__paso" aria-label="Otros platos">
      ${anterior ? `<a class="ficha__paso-anterior" href="plato.html?id=${anterior.id}"><small>Anterior</small>${anterior.nombre}</a>` : "<span></span>"}
      ${siguiente ? `<a class="ficha__paso-siguiente" href="plato.html?id=${siguiente.id}"><small>Siguiente</small>${siguiente.nombre}</a>` : "<span></span>"}
    </nav>`;

  // Otros platos de la misma categoría
  const otros = deCategoria.filter((p) => p !== plato);
  if (otros.length) {
    document.getElementById("lista-relacionados").innerHTML = otros.map(filaCarta).join("");
    document.getElementById("relacionados").hidden = false;
  }
}


/* ---------- SEO de la ficha ----------
   Título, descripción, dirección canónica y datos estructurados
   propios de cada plato (Google lee la página ya pintada). */
function actualizarSEO(plato) {
  const titulo = `${plato.nombre} | ${RESTAURANTE.nombre}, Valdemoro`;
  const url = `${RESTAURANTE.urlWeb}/plato.html?id=${plato.id}`;
  document.title = titulo;

  const meta = (selector, valor) => {
    const el = document.querySelector(selector);
    if (el) el.setAttribute("content", valor);
  };
  meta('meta[name="description"]', `${plato.nombre}: ${plato.corta} ${formatoPrecio(plato.precio)}. ${RESTAURANTE.nombre}, bar y restaurante en Valdemoro.`.slice(0, 155));
  meta('meta[property="og:title"]', titulo);
  meta('meta[property="og:description"]', plato.corta);

  const canonica = document.createElement("link");
  canonica.rel = "canonical";
  canonica.href = url;
  document.head.appendChild(canonica);

  const foto = plato.foto && FOTOS[plato.foto];
  const datos = [
    {
      "@context": "https://schema.org",
      "@type": "MenuItem",
      name: plato.nombre,
      description: plato.corta,
      url,
      ...(foto && { image: urlFoto(foto, foto.tamanos[foto.tamanos.length - 1]) }),
      offers: { "@type": "Offer", price: plato.precio.toFixed(2), priceCurrency: "EUR" }
    },
    {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      itemListElement: [
        { "@type": "ListItem", position: 1, name: "Carta", item: `${RESTAURANTE.urlWeb}/carta.html` },
        { "@type": "ListItem", position: 2, name: TITULOS_CATEGORIA[plato.categoria], item: `${RESTAURANTE.urlWeb}/carta.html#${plato.categoria}` },
        { "@type": "ListItem", position: 3, name: plato.nombre, item: url }
      ]
    }
  ];
  const script = document.createElement("script");
  script.type = "application/ld+json";
  script.textContent = JSON.stringify(datos);
  document.head.appendChild(script);
}

document.addEventListener("DOMContentLoaded", pintarFicha);
