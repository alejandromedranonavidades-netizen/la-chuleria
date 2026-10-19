/* =============================================================
   MAIN.JS — Funciones comunes a todas las páginas
   - Rellena los datos del restaurante (teléfono, dirección...)
   - Fotos con varios tamaños
   - Menú de navegación en móvil y cabecera que se esconde
   - Estado "Abierto ahora / Cerrado" y tabla de horario
   - Botón flotante (WhatsApp o llamar) y barra del móvil
   ============================================================= */

const DIAS = ["Domingo", "Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const ORDEN_SEMANA = [1, 2, 3, 4, 5, 6, 0]; // Para mostrar la semana empezando en lunes


/* ---------- Utilidades ---------- */

// "13:30" -> 810 (minutos desde medianoche). "25:00" -> 1500 (la 1:00 del día siguiente)
function aMinutos(hora) {
  const [h, m] = hora.split(":").map(Number);
  return h * 60 + m;
}

// 810 -> "13:30"   (1500 -> "01:00")
function aHora(minutos) {
  const h = Math.floor(minutos / 60) % 24;
  const m = minutos % 60;
  return String(h).padStart(2, "0") + ":" + String(m).padStart(2, "0");
}

// "a las 13:30" / "a la 01:00"
function aLas(minutos) {
  const hora = aHora(minutos);
  return (hora.startsWith("01:") ? "a la " : "a las ") + hora;
}

// 9.6 -> "9,60 €"
function formatoPrecio(numero) {
  return numero.toLocaleString("es-ES", { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + " €";
}

function buscarPlato(id) {
  return PLATOS.find((p) => p.id === id);
}

function nombreCategoria(id) {
  const cat = CATEGORIAS.find((c) => c.id === id);
  return cat ? cat.nombre : "";
}

// Texto de los turnos de un día: "12:30 – 17:30 y 20:00 – 01:00"
function textoTurnos(turnos) {
  if (!turnos.length) return "Cerrado";
  return turnos.map(([a, c]) => `<span class="turno">${a} – ${aHora(aMinutos(c))}</span>`).join(" y ");
}


/* ---------- Fechas y horas de reserva (se usan en el inicio y en reservas) ---------- */

// Date -> "2026-10-11" (en hora local, no UTC)
function aISO(fecha) {
  const y = fecha.getFullYear();
  const m = String(fecha.getMonth() + 1).padStart(2, "0");
  const d = String(fecha.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
}

// "2026-10-11" -> Date local
function deISO(texto) {
  const [y, m, d] = texto.split("-").map(Number);
  return new Date(y, m - 1, d);
}

function fechaLarga(fecha) {
  return fecha.toLocaleDateString("es-ES", { weekday: "long", day: "numeric", month: "long" });
}

// Horas en las que se puede reservar un día concreto (según el horario de cocina)
function horasDisponibles(fecha) {
  const { intervaloMinutos, ultimaAntesDelCierre } = RESTAURANTE.reservas;
  const turnos = (RESTAURANTE.cocina || RESTAURANTE.horario)[fecha.getDay()];
  const esHoy = aISO(fecha) === aISO(new Date());
  const ahora = new Date().getHours() * 60 + new Date().getMinutes();

  const horas = [];
  turnos.forEach(([apertura, cierre]) => {
    const fin = aMinutos(cierre) - ultimaAntesDelCierre;
    for (let m = aMinutos(apertura); m <= fin; m += intervaloMinutos) {
      if (esHoy && m <= ahora + 30) continue; // hoy: al menos media hora de margen
      horas.push(aHora(m));
    }
  });
  return horas;
}


/* ---------- Fotos ----------
   Las fotos están en FOTOS (datos.js) con varios tamaños; el navegador
   descarga solo el que necesita según el ancho de la pantalla. */
function urlFoto(foto, tamano) {
  return `${FOTOS_WEB}${foto.ruta}-${tamano}.${foto.ext || "jpg"}`;
}

// Atributos src/srcset/sizes/width/height de una foto de FOTOS
function atributosFoto(clave, sizes = "100vw") {
  const foto = FOTOS[clave];
  if (!foto) return "";
  const srcset = foto.tamanos.map((t) => `${urlFoto(foto, t)} ${t.split("x")[0]}w`).join(", ");
  const media = foto.tamanos[Math.min(1, foto.tamanos.length - 1)];
  const [ancho, alto] = media.split("x");
  return `src="${urlFoto(foto, media)}" srcset="${srcset}" sizes="${sizes}" width="${ancho}" height="${alto}"`;
}

// Foto pequeña (miniaturas y vista previa al pasar el ratón)
function fotoPequena(plato) {
  const foto = plato.foto && FOTOS[plato.foto];
  return foto ? urlFoto(foto, foto.tamanos[0]) : "";
}

// Foto de un plato dentro de su recuadro (.foto). Si no tiene foto o no carga,
// el recuadro muestra el nombre del plato sobre el azulejo de la casa.
function fotoPlato(plato, { sizes = "(max-width: 700px) 80vw, 380px", prioridad = false, transicion = false, clase = "" } = {}) {
  const vt = transicion ? ` style="view-transition-name: plato-${plato.id}"` : "";
  if (!plato.foto || !FOTOS[plato.foto]) {
    return `<div class="foto sin-foto ${clase}" data-nombre="${plato.nombre}"${vt}></div>`;
  }
  const carga = prioridad ? 'fetchpriority="high"' : 'loading="lazy"';
  return `<div class="foto ${clase}" data-nombre="${plato.nombre}"${vt}>
            <img ${atributosFoto(plato.foto, sizes)} alt="${plato.alt || plato.nombre}" decoding="async" ${carga}>
          </div>`;
}

// Foto de la ficha de un plato dentro de su envoltorio (.marco)
function marcoPlato(plato, clasesExtra = "", prioridad = false) {
  return `<figure class="marco ${clasesExtra}">
            ${fotoPlato(plato, { prioridad, transicion: true, sizes: "(max-width: 860px) 92vw, 46vw" })}
          </figure>`;
}

// Una fila de la carta (se usa en el inicio, en la carta y en la ficha).
// En pantallas táctiles lleva miniatura; con ratón, la foto aparece al pasar por encima.
function filaCarta(p) {
  const etiquetas = (p.etiquetas || [])
    .map((e) => `<span class="etiqueta etiqueta--${e}">${ETIQUETAS[e]}</span>`).join("");
  const mini = fotoPequena(p);
  return `
    <li>
      <a class="fila-carta" href="plato.html?id=${p.id}"${mini ? ` data-imagen="${mini}"` : ""}>
        ${mini ? `<span class="fila-carta__miniatura"><img src="${mini}" alt="" width="120" height="120" loading="lazy" decoding="async"></span>` : ""}
        <span class="fila-carta__cuerpo">
          <span class="fila-carta__linea">
            <span class="fila-carta__nombre">${p.nombre}</span>
            <span class="fila-carta__puntos" aria-hidden="true"></span>
            <span class="fila-carta__precio">${formatoPrecio(p.precio)}</span>
          </span>
          <span class="fila-carta__desc">${p.corta}${p.nota ? ` <span class="fila-carta__nota">${p.nota}</span>` : ""}</span>
          ${etiquetas ? `<span class="fila-carta__etiquetas">${etiquetas}</span>` : ""}
        </span>
      </a>
    </li>`;
}


// Si alguna foto no carga, el recuadro pasa a mostrar el nombre del plato
function fotoFallida(img) {
  const caja = img.closest(".foto");
  if (caja) caja.classList.add("sin-foto");
  img.remove();
}
document.addEventListener("error", (e) => {
  if (e.target.tagName === "IMG" && e.target.closest(".foto")) fotoFallida(e.target);
}, true);

// Fotos que ya fallaron antes de que este archivo se cargara
function revisarFotos() {
  document.querySelectorAll(".foto img").forEach((img) => {
    if (img.complete && img.naturalWidth === 0) fotoFallida(img);
  });
}


/* ---------- Rellenar datos del restaurante ----------
   En el HTML: <span data-dato="telefono"></span>  (admite "valoracion.nota")
   Enlaces:    <a data-enlace="telefono">  /  "email" / "mapa" / "glovo"... */
function rellenarDatos() {
  document.querySelectorAll("[data-dato]").forEach((el) => {
    const valor = el.dataset.dato.split(".").reduce((o, k) => (o ? o[k] : undefined), RESTAURANTE);
    if (valor !== undefined) el.textContent = valor;
  });

  const enlaces = {
    telefono: `tel:${RESTAURANTE.telefonoEnlace}`,
    email: `mailto:${RESTAURANTE.email}`,
    whatsapp: RESTAURANTE.whatsapp ? `https://wa.me/${RESTAURANTE.whatsapp}` : "",
    mapa: `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(RESTAURANTE.busquedaMapa)}`,
    instagram: RESTAURANTE.redes.instagram,
    facebook: RESTAURANTE.redes.facebook,
    fichaGoogle: RESTAURANTE.fichaGoogle,
    resenasGoogle: RESTAURANTE.resenasGoogle,
    glovo: RESTAURANTE.domicilio.glovo,
    justEat: RESTAURANTE.domicilio.justEat,
    web: RESTAURANTE.urlWeb
  };
  document.querySelectorAll("[data-enlace]").forEach((el) => {
    const destino = enlaces[el.dataset.enlace];
    if (destino) el.href = destino;
    else el.hidden = true; // enlace sin rellenar en datos.js: no se muestra
  });

  // Datos legales: <span data-legal="nif"></span>
  document.querySelectorAll("[data-legal]").forEach((el) => {
    const valor = RESTAURANTE.legal[el.dataset.legal];
    if (valor === undefined) return;
    el.textContent = valor;
    el.classList.toggle("pendiente", valor.startsWith("PENDIENTE"));
  });

  document.querySelectorAll(".anio-actual").forEach((el) => {
    el.textContent = new Date().getFullYear();
  });
}


/* ---------- Sello con la nota de Google ----------
   <a class="sello"></a> se convierte en un sello redondo con el texto girando alrededor */
function pintarSellos() {
  const v = RESTAURANTE.valoracion;
  document.querySelectorAll(".sello").forEach((sello, i) => {
    const vuelta = `${v.resenas} reseñas en Google  —  `.toUpperCase();
    sello.innerHTML = `
      <svg class="sello__anillo" viewBox="0 0 200 200" aria-hidden="true" focusable="false">
        <defs><path id="sello-curva-${i}" d="M100,100 m-76,0 a76,76 0 1,1 152,0 a76,76 0 1,1 -152,0"/></defs>
        <text><textPath href="#sello-curva-${i}" textLength="474" lengthAdjust="spacing">${vuelta}${vuelta}</textPath></text>
      </svg>
      <span class="sello__centro" aria-hidden="true"><strong>${v.nota}</strong><span>★ Google</span></span>`;
    sello.setAttribute("aria-label", `${v.nota} sobre 5 en Google con ${v.resenas} reseñas. Ver reseñas`);
  });
}


/* ---------- Abierto / cerrado ---------- */
function estadoActual(fecha = new Date()) {
  const dia = fecha.getDay();
  const ahora = fecha.getHours() * 60 + fecha.getMinutes();

  // Turnos de ayer que pasan de medianoche (hasta la 1:00, por ejemplo)
  const ayer = (dia + 6) % 7;
  for (const [, cierre] of RESTAURANTE.horario[ayer]) {
    if (aMinutos(cierre) > 1440 && ahora < aMinutos(cierre) - 1440) {
      return { abierto: true, texto: `Abierto ahora, cerramos ${aLas(aMinutos(cierre))}` };
    }
  }

  // ¿Estamos dentro de algún turno de hoy?
  for (const [apertura, cierre] of RESTAURANTE.horario[dia]) {
    if (ahora >= aMinutos(apertura) && ahora < aMinutos(cierre)) {
      return { abierto: true, texto: `Abierto ahora, cerramos ${aLas(aMinutos(cierre))}` };
    }
  }

  // Buscar la próxima apertura (hoy más tarde o en los próximos días)
  for (let i = 0; i < 8; i++) {
    const d = (dia + i) % 7;
    for (const [apertura] of RESTAURANTE.horario[d]) {
      if (i === 0 && aMinutos(apertura) <= ahora) continue;
      const cuando = i === 0 ? "hoy" : i === 1 ? "mañana" : `el ${DIAS[d].toLowerCase()}`;
      return { abierto: false, texto: `Cerrado ahora, abrimos ${cuando} ${aLas(aMinutos(apertura))}` };
    }
  }
  return { abierto: false, texto: "Cerrado" };
}

function pintarEstado() {
  const estado = estadoActual();
  document.querySelectorAll(".estado").forEach((el) => {
    el.classList.toggle("estado--abierto", estado.abierto);
    el.querySelector(".estado__texto").textContent = estado.texto;
  });
}


/* ---------- Tabla de horario ---------- */
function pintarHorario() {
  const hoy = new Date().getDay();
  document.querySelectorAll(".tabla-horario").forEach((tabla) => {
    tabla.innerHTML = ORDEN_SEMANA.map((d) => {
      const turnos = RESTAURANTE.horario[d];
      return `<tr class="${d === hoy ? "es-hoy" : ""} ${turnos.length ? "" : "cerrado"}">
                <th scope="row">${DIAS[d]}${d === hoy ? ' <span class="marca-hoy">hoy</span>' : ""}</th>
                <td>${textoTurnos(turnos)}</td>
              </tr>`;
    }).join("");
  });
}


/* ---------- Cabecera y menú móvil ---------- */
function iniciarCabecera() {
  const cabecera = document.querySelector(".cabecera");
  const boton = document.querySelector(".cabecera__boton-menu");
  if (!cabecera) return;

  // Al bajar se vuelve sólida y se esconde; al subir, reaparece
  let ultimaY = window.scrollY;
  const alHacerScroll = () => {
    const y = window.scrollY;
    cabecera.classList.toggle("cabecera--compacta", y > 40);
    const bajando = y > ultimaY && y > 320 && !cabecera.classList.contains("menu-abierto");
    cabecera.classList.toggle("cabecera--oculta", bajando);
    ultimaY = y;
  };
  alHacerScroll();
  window.addEventListener("scroll", alHacerScroll, { passive: true });

  // Abrir / cerrar menú en móvil
  if (boton) {
    boton.addEventListener("click", () => {
      const abierto = cabecera.classList.toggle("menu-abierto");
      boton.setAttribute("aria-expanded", abierto);
      boton.setAttribute("aria-label", abierto ? "Cerrar menú" : "Abrir menú");
      document.body.classList.toggle("sin-scroll", abierto);
    });
    cabecera.querySelectorAll(".nav a").forEach((a) =>
      a.addEventListener("click", () => {
        cabecera.classList.remove("menu-abierto");
        boton.setAttribute("aria-expanded", false);
        document.body.classList.remove("sin-scroll");
      })
    );
  }

  // Marca el enlace de la página actual
  const pagina = location.pathname.split("/").pop() || "index.html";
  cabecera.querySelectorAll(".nav a").forEach((a) => {
    if (a.getAttribute("href") === pagina) a.setAttribute("aria-current", "page");
  });
}


/* ---------- Aparición de elementos al hacer scroll ----------
   Añade la clase "revelar" a cualquier elemento del HTML. */
function iniciarRevelado() {
  if (window.ANIMACIONES_GSAP) return; // de esto se encarga animaciones.js
  const elementos = document.querySelectorAll(".revelar:not(.visible)");
  if (!("IntersectionObserver" in window)) {
    elementos.forEach((el) => el.classList.add("visible"));
    return;
  }
  const observador = new IntersectionObserver((entradas) => {
    entradas.forEach((entrada) => {
      if (entrada.isIntersecting) {
        entrada.target.classList.add("visible");
        observador.unobserve(entrada.target);
      }
    });
  }, { threshold: 0.15, rootMargin: "0px 0px -40px 0px" });
  elementos.forEach((el) => observador.observe(el));
}


/* ---------- Botón flotante y barra del móvil ----------
   Con WhatsApp en datos.js: botón de WhatsApp. Sin él: botón de llamar. */
const ICONO_WHATSAPP = `<svg viewBox="0 0 32 32" aria-hidden="true" focusable="false"><path fill="currentColor" d="M16 3a13 13 0 0 0-11.2 19.6L3 29l6.6-1.7A13 13 0 1 0 16 3zm0 23.7c-2 0-4-.6-5.7-1.6l-.4-.2-3.9 1 1-3.8-.3-.4A10.7 10.7 0 1 1 16 26.7zm5.9-8c-.3-.2-1.9-1-2.2-1-.3-.2-.5-.2-.7.1l-1 1.3c-.2.2-.4.2-.7.1a8.8 8.8 0 0 1-4.4-3.8c-.3-.6.3-.5 1-1.7.1-.2 0-.4 0-.6l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.6.1-.9.4-.3.3-1.2 1.2-1.2 2.9s1.2 3.3 1.4 3.6c.2.2 2.4 3.7 5.8 5.1 2.2.9 3 1 4.1.8.7-.1 1.9-.8 2.2-1.5.3-.8.3-1.4.2-1.5l-.5-.3z"/></svg>`;
const ICONO_TELEFONO = `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false"><path fill="currentColor" d="M6.6 10.8a15.2 15.2 0 0 0 6.6 6.6l2.2-2.2c.3-.3.7-.4 1-.2 1.1.4 2.3.6 3.6.6.6 0 1 .4 1 1V20c0 .6-.4 1-1 1A17 17 0 0 1 3 4c0-.6.4-1 1-1h3.5c.6 0 1 .4 1 1 0 1.3.2 2.5.6 3.6.1.3 0 .7-.2 1l-2.3 2.2z"/></svg>`;

function crearBotonFlotante() {
  const conWhatsapp = !!RESTAURANTE.whatsapp;
  const mensaje = encodeURIComponent(`Hola, os escribo desde la web de ${RESTAURANTE.nombre}.`);
  const boton = document.createElement("a");
  boton.className = "flotante" + (conWhatsapp ? " flotante--whatsapp" : "");
  boton.href = conWhatsapp ? `https://wa.me/${RESTAURANTE.whatsapp}?text=${mensaje}` : `tel:${RESTAURANTE.telefonoEnlace}`;
  if (conWhatsapp) { boton.target = "_blank"; boton.rel = "noopener"; }
  boton.innerHTML = `${conWhatsapp ? ICONO_WHATSAPP : ICONO_TELEFONO}<span class="flotante__texto">${conWhatsapp ? "Escríbenos" : "Llámanos"}</span>`;
  boton.setAttribute("aria-label", conWhatsapp ? "Escribir por WhatsApp" : `Llamar al ${RESTAURANTE.telefono}`);
  document.body.appendChild(boton);

  // En el móvil: barra fija abajo con "Reservar mesa" y el botón siempre a mano
  // (no se muestra en la página de reservas, que ya es el formulario)
  if (document.body.classList.contains("pagina-reservas")) return;
  const barra = document.createElement("div");
  barra.className = "barra-movil";
  barra.innerHTML = `
    <a class="boton boton--rojo" href="reservas.html">Reservar mesa</a>
    <a class="barra-movil__contacto${conWhatsapp ? " barra-movil__contacto--whatsapp" : ""}" href="${boton.href}"
       ${conWhatsapp ? 'target="_blank" rel="noopener"' : ""} aria-label="${boton.getAttribute("aria-label")}">
      ${conWhatsapp ? ICONO_WHATSAPP : ICONO_TELEFONO}
    </a>`;
  document.body.appendChild(barra);
  document.body.classList.add("con-barra-movil");
}


/* ---------- Medir acciones importantes (solo si hay analítica) ---------- */
function iniciarEventos() {
  document.addEventListener("click", (e) => {
    const enlace = e.target.closest("a");
    if (!enlace || typeof registrarEvento !== "function") return;
    if (enlace.href.startsWith("tel:")) registrarEvento("llamada");
    else if (enlace.href.includes("wa.me")) registrarEvento("whatsapp");
    else if (enlace.href.includes("glovoapp") || enlace.href.includes("just-eat")) registrarEvento("pedir_domicilio");
    else if (enlace.href.includes("reservas.html")) registrarEvento("ir_a_reservar");
  });
}


/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  rellenarDatos();
  pintarSellos();
  revisarFotos();
  pintarEstado();
  pintarHorario();
  iniciarCabecera();
  iniciarRevelado();
  crearBotonFlotante();
  iniciarEventos();
  document.body.classList.add("cargado"); // dispara la animación de entrada
});
