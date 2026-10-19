/* =============================================================
   INICIO.JS — Contenido de la página de inicio
   ============================================================= */

// "Los imprescindibles": platos con destacado: true en datos.js
function pintarDestacados() {
  const pista = document.getElementById("lista-destacados");
  const destacados = PLATOS.filter((p) => p.destacado);

  pista.innerHTML = destacados.map((p) => `
    <li class="carrusel__elemento">
      <a class="tarjeta-plato" href="plato.html?id=${p.id}">
        ${fotoPlato(p, { transicion: true, sizes: "(max-width: 700px) 78vw, 400px" })}
        <span class="tarjeta-plato__capa" aria-hidden="true"></span>
        <span class="tarjeta-plato__arriba">
          <span class="tarjeta-plato__categoria">${nombreCategoria(p.categoria)}</span>
          <span class="tarjeta-plato__precio">${formatoPrecio(p.precio)}</span>
        </span>
        <span class="tarjeta-plato__texto">
          <span class="tarjeta-plato__nombre">${p.nombre}</span>
          <span class="tarjeta-plato__desc">${p.corta}</span>
        </span>
      </a>
    </li>
  `).join("");

  // Botones anterior / siguiente
  const carrusel = pista.closest(".carrusel");
  const paso = () => (pista.querySelector(".carrusel__elemento")?.offsetWidth || 300) + 28;
  document.querySelectorAll("[data-carrusel]").forEach((boton) => {
    boton.addEventListener("click", () => {
      carrusel.scrollBy({ left: boton.dataset.carrusel === "siguiente" ? paso() : -paso(), behavior: "smooth" });
    });
  });

  // Barra de progreso
  const barra = document.querySelector(".carrusel__progreso span");
  if (barra) {
    const actualizar = () => {
      const max = carrusel.scrollWidth - carrusel.clientWidth;
      barra.style.transform = `scaleX(${max > 0 ? Math.max(0.08, carrusel.scrollLeft / max) : 1})`;
    };
    carrusel.addEventListener("scroll", actualizar, { passive: true });
    actualizar();
  }
}


/* "Dentro o fuera": al bajar, se ilumina el sitio que está en pantalla
   y la foto fija de la izquierda cambia a la de ese sitio */
function iniciarSitios() {
  const pasos = document.querySelectorAll(".sitios__paso");
  const fotos = document.querySelectorAll(".sitios__visual .foto");
  if (!pasos.length || !("IntersectionObserver" in window)) return;
  const activar = (i) => {
    pasos.forEach((p, j) => p.classList.toggle("activo", i === j));
    fotos.forEach((f, j) => f.classList.toggle("activa", i === j));
  };
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((e) => { if (e.isIntersecting) activar([...pasos].indexOf(e.target)); });
  }, { rootMargin: "-45% 0px -45% 0px" });
  pasos.forEach((p) => observador.observe(p));
  activar(0);
}


// Arroces de la casa (lista junto a la foto grande)
function pintarArroces() {
  const lista = document.getElementById("lista-arroces");
  if (!lista) return;
  lista.innerHTML = PLATOS.filter((p) => p.categoria === "arroces").map(filaCarta).join("");
}


// Pestañas con un adelanto de cada categoría de la carta
function pintarPestanas() {
  const pestanas = document.getElementById("pestanas-carta");
  const panel = document.getElementById("panel-carta");
  // En la portada, los arroces ya tienen su sección: aquí se enseña el resto
  const categorias = CATEGORIAS.filter((c) => c.id !== "arroces");
  const inicial = "picar"; // la pestaña abierta al llegar

  pestanas.innerHTML = categorias.map((c) => `
    <button class="pestana" role="tab" id="pestana-${c.id}" data-categoria="${c.id}"
            aria-selected="${c.id === inicial}" tabindex="${c.id === inicial ? 0 : -1}">${c.nombre}</button>
  `).join("");

  function mostrar(categoria) {
    const platos = PLATOS.filter((p) => p.categoria === categoria).slice(0, 6);
    panel.setAttribute("aria-labelledby", `pestana-${categoria}`);
    panel.classList.remove("entrando");
    void panel.offsetWidth; // reinicia la animación
    panel.innerHTML = `<ul class="lista-carta">${platos.map(filaCarta).join("")}</ul>`;
    panel.classList.add("entrando");
  }

  pestanas.addEventListener("click", (e) => {
    const boton = e.target.closest(".pestana");
    if (!boton) return;
    pestanas.querySelectorAll(".pestana").forEach((b) => {
      const activa = b === boton;
      b.setAttribute("aria-selected", activa);
      b.tabIndex = activa ? 0 : -1;
    });
    mostrar(boton.dataset.categoria);
  });

  // Flechas del teclado para moverse entre pestañas
  pestanas.addEventListener("keydown", (e) => {
    if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
    const botones = [...pestanas.querySelectorAll(".pestana")];
    const actual = botones.indexOf(document.activeElement);
    const siguiente = botones[(actual + (e.key === "ArrowRight" ? 1 : -1) + botones.length) % botones.length];
    siguiente.focus();
    siguiente.click();
  });

  mostrar(inicial);
}


/* Reserva rápida de la portada: días abiertos, horas de ese día y personas */
function prepararReservaRapida() {
  const selFecha = document.getElementById("rr-fecha");
  if (!selFecha) return;
  const selHora = document.getElementById("rr-hora");
  const selPersonas = document.getElementById("rr-personas");

  // Próximos 14 días en los que se puede reservar
  const dias = [];
  for (let i = 0; i < 21 && dias.length < 14; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    if (!horasDisponibles(d).length) continue;
    const nombre = i === 0 ? "Hoy" : i === 1 ? "Mañana" :
      d.toLocaleDateString("es-ES", { weekday: "short", day: "numeric", month: "short" });
    dias.push(`<option value="${aISO(d)}">${nombre}</option>`);
  }
  selFecha.innerHTML = dias.join("");

  const pintarHoras = () => {
    const horas = horasDisponibles(deISO(selFecha.value));
    // Preselecciona la primera hora de cena, que es la que más se reserva
    const cena = horas.find((h) => aMinutos(h) >= 21 * 60) || horas[0];
    selHora.innerHTML = horas.map((h) => `<option ${h === cena ? "selected" : ""}>${h}</option>`).join("");
  };
  selFecha.addEventListener("change", pintarHoras);
  pintarHoras();

  const max = RESTAURANTE.reservas.maxPersonas;
  selPersonas.innerHTML = Array.from({ length: max }, (_, i) =>
    `<option value="${i + 1}" ${i === 1 ? "selected" : ""}>${i + 1}</option>`).join("");
}


// Servicios (el mapa lo carga cookies.js si se acepta)
function pintarVisitanos() {
  const servicios = document.getElementById("servicios");
  if (servicios) servicios.innerHTML = RESTAURANTE.servicios.map((s) => `<li>${s}</li>`).join("");
}


document.addEventListener("DOMContentLoaded", () => {
  prepararReservaRapida();
  pintarDestacados();
  iniciarSitios();
  pintarArroces();
  pintarPestanas();
  pintarVisitanos();
  iniciarRevelado(); // para los elementos que acabamos de crear
});
