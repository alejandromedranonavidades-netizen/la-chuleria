/* =============================================================
   COOKIES.JS — Aviso de cookies, analítica y mapa
   - Muestra el aviso la primera vez (Aceptar / Rechazar / Configurar)
   - Guarda la elección del visitante en su navegador
   - Solo carga Google Analytics y Google Maps si se aceptan
   - Cualquier elemento con data-abrir-cookies vuelve a abrir el panel
   ============================================================= */

const CLAVE_COOKIES = "consentimiento-cookies";
const VERSION_COOKIES = 1; // súbelo si cambias las categorías: se volverá a preguntar

function leerConsentimiento() {
  try {
    const guardado = JSON.parse(localStorage.getItem(CLAVE_COOKIES));
    return guardado && guardado.version === VERSION_COOKIES ? guardado : null;
  } catch {
    return null;
  }
}

function guardarConsentimiento(analitica, mapas) {
  const datos = { version: VERSION_COOKIES, analitica, mapas, fecha: new Date().toISOString() };
  try { localStorage.setItem(CLAVE_COOKIES, JSON.stringify(datos)); } catch { /* modo privado */ }
  aplicarConsentimiento(datos);
}


/* ---------- Analítica (Google Analytics 4) ---------- */
let analiticaCargada = false;

function cargarAnalitica() {
  const id = RESTAURANTE.analitica && RESTAURANTE.analitica.ga4;
  if (!id || analiticaCargada) return;
  analiticaCargada = true;

  const script = document.createElement("script");
  script.async = true;
  script.src = `https://www.googletagmanager.com/gtag/js?id=${id}`;
  document.head.appendChild(script);

  window.dataLayer = window.dataLayer || [];
  window.gtag = function () { window.dataLayer.push(arguments); };
  gtag("js", new Date());
  gtag("config", id, { anonymize_ip: true });
}

// Registra una acción (reserva, llamada, WhatsApp). Si no hay analítica, no hace nada.
function registrarEvento(nombre, datos = {}) {
  if (typeof window.gtag === "function") window.gtag("event", nombre, datos);
}


/* ---------- Mapa de Google (se carga solo con permiso) ---------- */
function cargarMapa() {
  const marco = document.getElementById("mapa");
  if (!marco || marco.src) return;
  marco.src = `https://www.google.com/maps?q=${encodeURIComponent(RESTAURANTE.busquedaMapa)}&output=embed`;
  marco.hidden = false;
  const aviso = document.getElementById("mapa-aviso");
  if (aviso) aviso.hidden = true;
}

function prepararMapa() {
  const boton = document.getElementById("cargar-mapa");
  if (!boton) return;
  boton.addEventListener("click", () => {
    const actual = leerConsentimiento() || { analitica: false };
    guardarConsentimiento(actual.analitica, true); // pulsar = aceptar las cookies del mapa
    cerrarAviso();
  });
}


/* ---------- Aplicar la elección ---------- */
function aplicarConsentimiento(consentimiento) {
  if (consentimiento.analitica) cargarAnalitica();
  if (consentimiento.mapas) cargarMapa();
}


/* ---------- Aviso y panel de configuración ---------- */
function crearAviso() {
  const aviso = document.createElement("section");
  aviso.className = "aviso-cookies";
  aviso.setAttribute("aria-labelledby", "aviso-cookies-titulo");
  aviso.hidden = true;
  aviso.innerHTML = `
    <div class="aviso-cookies__caja">
      <h2 id="aviso-cookies-titulo" class="aviso-cookies__titulo">Cookies</h2>
      <p>
        Usamos cookies propias necesarias para que la web funcione y, si nos dejas, cookies de
        Google para medir las visitas y mostrar el mapa.
        <a href="cookies.html">Más información</a>
      </p>

      <form class="aviso-cookies__opciones" hidden>
        <label class="interruptor">
          <input type="checkbox" checked disabled>
          <span><strong>Necesarias</strong> Guardan tu elección sobre las cookies. Siempre activas.</span>
        </label>
        <label class="interruptor">
          <input type="checkbox" name="analitica">
          <span><strong>Analítica</strong> Google Analytics: cuántas personas visitan la web y qué páginas ven.</span>
        </label>
        <label class="interruptor">
          <input type="checkbox" name="mapas">
          <span><strong>Mapas</strong> Google Maps: muestra el mapa con la ubicación del restaurante.</span>
        </label>
      </form>

      <div class="aviso-cookies__botones">
        <button type="button" class="boton boton--cookies" data-accion="rechazar">Rechazar</button>
        <button type="button" class="boton boton--cookies" data-accion="configurar">Configurar</button>
        <button type="button" class="boton boton--cookies" data-accion="aceptar">Aceptar todas</button>
        <button type="button" class="boton boton--cookies" data-accion="guardar" hidden>Guardar mi elección</button>
      </div>
    </div>`;
  document.body.appendChild(aviso);

  const opciones = aviso.querySelector(".aviso-cookies__opciones");
  aviso.addEventListener("click", (e) => {
    const accion = e.target.dataset && e.target.dataset.accion;
    if (!accion) return;

    if (accion === "aceptar") guardarConsentimiento(true, true);
    if (accion === "rechazar") guardarConsentimiento(false, false);
    if (accion === "guardar") guardarConsentimiento(opciones.analitica.checked, opciones.mapas.checked);
    if (accion === "configurar") {
      opciones.hidden = false;
      aviso.querySelector('[data-accion="configurar"]').hidden = true;
      aviso.querySelector('[data-accion="guardar"]').hidden = false;
      return;
    }
    cerrarAviso();
  });
  return aviso;
}

function abrirAviso(conOpciones = false) {
  const aviso = document.querySelector(".aviso-cookies") || crearAviso();
  const actual = leerConsentimiento();
  const opciones = aviso.querySelector(".aviso-cookies__opciones");
  opciones.analitica.checked = actual ? actual.analitica : false;
  opciones.mapas.checked = actual ? actual.mapas : false;
  opciones.hidden = !conOpciones;
  aviso.querySelector('[data-accion="configurar"]').hidden = conOpciones;
  aviso.querySelector('[data-accion="guardar"]').hidden = !conOpciones;

  aviso.hidden = false;
  document.body.classList.add("con-aviso-cookies");
  document.body.style.setProperty("--alto-aviso", `${aviso.offsetHeight + 24}px`);
  requestAnimationFrame(() => aviso.classList.add("visible"));
}

function cerrarAviso() {
  const aviso = document.querySelector(".aviso-cookies");
  if (!aviso) return;
  aviso.classList.remove("visible");
  document.body.classList.remove("con-aviso-cookies");
  setTimeout(() => { aviso.hidden = true; }, 400);
}


/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  prepararMapa();

  const consentimiento = leerConsentimiento();
  if (consentimiento) aplicarConsentimiento(consentimiento);
  else abrirAviso();

  document.addEventListener("click", (e) => {
    if (e.target.closest("[data-abrir-cookies]")) {
      e.preventDefault();
      abrirAviso(true);
    }
  });
});
