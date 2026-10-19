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
        ${fotoPlato(p, { transicion: true, sizes: "(max-width: 700px) 72vw, 330px" })}
        <span class="tarjeta-plato__texto">
          <span class="tarjeta-plato__nombre">${p.nombre}</span>
          <span class="tarjeta-plato__precio">${formatoPrecio(p.precio)}</span>
          <span class="tarjeta-plato__desc">${p.corta}</span>
        </span>
      </a>
    </li>
  `).join("");

  // Botones anterior / siguiente
  const carrusel = pista.closest(".carrusel");
  const paso = () => (pista.querySelector(".carrusel__elemento")?.offsetWidth || 300) + parseFloat(getComputedStyle(pista).columnGap || 24);
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


/* El local: el panel que señalas con el ratón (o tocas) se abre y los otros se estrechan.
   En el móvil el CSS los enseña todos abiertos, uno debajo de otro. */
function iniciarLocal() {
  const paneles = [...document.querySelectorAll(".local .panel")];
  if (!paneles.length) return;
  const abrir = (panel) => paneles.forEach((p) => p.classList.toggle("activo", p === panel));
  paneles.forEach((panel) => {
    panel.addEventListener("pointerenter", (e) => { if (e.pointerType === "mouse") abrir(panel); });
    panel.addEventListener("click", () => abrir(panel));
  });
}


// Pestañas con un adelanto de cada categoría de la carta
function pintarPestanas() {
  const pestanas = document.getElementById("pestanas-carta");
  const panel = document.getElementById("panel-carta");
  const categorias = CATEGORIAS;
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
  iniciarLocal();
  pintarPestanas();
  pintarVisitanos();
  iniciarRevelado(); // para los elementos que acabamos de crear
});
