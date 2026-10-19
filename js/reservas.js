/* =============================================================
   RESERVAS.JS — Formulario de reserva
   - Solo deja elegir días en que el restaurante abre
   - Calcula las horas según el horario de cocina de datos.js
   - Valida los campos y muestra una confirmación

   ENVÍO: si en datos.js hay una dirección de Formspree
   (reservas.formspree), la reserva llega por email al restaurante.
   Si está vacía, la web funciona en modo demostración: enseña la
   confirmación, pero avisa de que no se ha enviado.
   ============================================================= */

const form = document.getElementById("formulario-reserva");
const campoFecha = document.getElementById("fecha");
const campoHora = document.getElementById("hora");
const campoPersonas = document.getElementById("personas");
const MAX = RESTAURANTE.reservas.maxPersonas;
const MODO_DEMO = !RESTAURANTE.reservas.formspree;


/* Las funciones de fechas y horas (aISO, deISO, horasDisponibles...) están en main.js */

function prepararFecha() {
  const hoy = new Date();
  const limite = new Date();
  limite.setDate(hoy.getDate() + RESTAURANTE.reservas.diasAntelacion);
  campoFecha.min = aISO(hoy);
  campoFecha.max = aISO(limite);
}

function actualizarHoras() {
  const error = campoFecha.closest(".campo").querySelector(".campo__error");
  campoHora.innerHTML = "";
  error.textContent = "";
  campoFecha.removeAttribute("aria-invalid");

  if (!campoFecha.value) {
    campoHora.disabled = true;
    campoHora.innerHTML = `<option value="">Elige primero el día</option>`;
    return;
  }

  const fecha = deISO(campoFecha.value);
  const horas = horasDisponibles(fecha);

  if (!horas.length) {
    const cerrado = !RESTAURANTE.horario[fecha.getDay()].length;
    error.textContent = cerrado
      ? `Los ${DIAS[fecha.getDay()].toLowerCase()} cerramos. Elige otro día.`
      : "Ya no quedan horas para hoy. Elige otro día.";
    campoFecha.setAttribute("aria-invalid", "true");
    campoHora.disabled = true;
    campoHora.innerHTML = `<option value="">Sin horas disponibles</option>`;
    return;
  }

  // Agrupa las horas en "Comida" y "Cena"
  const comida = horas.filter((h) => aMinutos(h) < 18 * 60);
  const cena = horas.filter((h) => aMinutos(h) >= 18 * 60);
  const grupo = (titulo, lista) =>
    lista.length ? `<optgroup label="${titulo}">${lista.map((h) => `<option>${h}</option>`).join("")}</optgroup>` : "";

  campoHora.innerHTML = `<option value="">Elige una hora</option>` + grupo("Comida", comida) + grupo("Cena", cena);
  campoHora.disabled = false;
}


/* ---------- Contador de personas ---------- */
function prepararPersonas() {
  document.querySelectorAll(".max-personas").forEach((el) => { el.textContent = MAX; });
  campoPersonas.max = MAX;

  document.querySelectorAll(".contador__boton").forEach((boton) => {
    boton.addEventListener("click", () => {
      const valor = Number(campoPersonas.value) || 0;
      campoPersonas.value = Math.min(MAX, Math.max(1, valor + Number(boton.dataset.cambio)));
      campoPersonas.dispatchEvent(new Event("input"));
    });
  });

  campoPersonas.addEventListener("input", () => {
    const ayuda = document.getElementById("ayuda-personas");
    const n = Number(campoPersonas.value);
    ayuda.textContent = n >= MAX ? `Para más de ${MAX} personas, llámanos al ${RESTAURANTE.telefono} y te preparamos un menú de grupo.` : "";
  });
}


/* ---------- Validación ---------- */
const MENSAJES = {
  fecha: "Elige el día de la reserva.",
  hora: "Elige una hora.",
  nombre: "Escribe tu nombre para saber a quién guardamos la mesa.",
  telefono: "Escribe un teléfono de al menos 9 cifras para poder confirmarte.",
  email: "Escribe un email válido, por ejemplo nombre@correo.com.",
  acepto: "Marca la casilla para poder guardar la reserva."
};

function validarCampo(campo) {
  const error = campo.closest(".campo").querySelector(".campo__error");
  let valido = campo.checkValidity();

  if (campo.id === "telefono") valido = campo.value.replace(/\D/g, "").length >= 9;
  if (campo.id === "fecha" && campo.getAttribute("aria-invalid") === "true" && campo.value) return false;

  if (error) error.textContent = valido ? "" : MENSAJES[campo.id] || "Revisa este campo.";
  campo.toggleAttribute("aria-invalid", !valido);
  return valido;
}

function validarFormulario() {
  const campos = ["fecha", "hora", "nombre", "telefono", "email", "acepto"].map((id) => document.getElementById(id));
  const invalidos = campos.filter((c) => !validarCampo(c));
  if (invalidos.length) {
    invalidos[0].focus();
    return false;
  }
  return true;
}


/* ---------- Envío ---------- */
async function enviarReserva(datos) {
  if (MODO_DEMO) return new Promise((resolver) => setTimeout(resolver, 700)); // simula el envío
  const respuesta = await fetch(RESTAURANTE.reservas.formspree, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ ...datos, _subject: `Reserva web: ${datos.fecha} ${datos.hora}, ${datos.personas} pers.` })
  });
  if (!respuesta.ok) throw new Error("No se pudo enviar");
}

function mostrarConfirmacion(datos) {
  const codigo = "CHU-" + Math.random().toString(36).slice(2, 7).toUpperCase();
  const fecha = fechaLarga(deISO(datos.fecha));

  const caja = document.getElementById("caja-reserva");
  caja.innerHTML = `
    <div class="confirmacion" tabindex="-1">
      <div class="confirmacion__sello" aria-hidden="true"></div>
      <h2 class="confirmacion__titulo">¡Mesa solicitada!</h2>
      <p>Gracias, ${datos.nombre.split(" ")[0]}. Te llamaremos o te escribiremos a <strong>${datos.email}</strong> para confirmarla.</p>

      <dl class="confirmacion__resumen">
        <div><dt>Día</dt><dd>${fecha}</dd></div>
        <div><dt>Hora</dt><dd>${datos.hora}</dd></div>
        <div><dt>Personas</dt><dd>${datos.personas}</dd></div>
        <div><dt>Zona</dt><dd>${datos.zona}</dd></div>
        <div><dt>Código</dt><dd>${codigo}</dd></div>
      </dl>

      ${MODO_DEMO ? `<p class="confirmacion__demo">Esta web es una propuesta de diseño: la solicitud no se ha enviado. Para reservar de verdad, llama al <a href="tel:${RESTAURANTE.telefonoEnlace}">${RESTAURANTE.telefono}</a>.</p>` : ""}

      <div class="confirmacion__acciones">
        <a class="boton boton--rojo" href="tel:${RESTAURANTE.telefonoEnlace}">Llamar al ${RESTAURANTE.telefono}</a>
        <a class="boton boton--contorno" href="index.html">Volver al inicio</a>
      </div>
    </div>`;

  const confirmacion = caja.querySelector(".confirmacion");
  confirmacion.focus();
  caja.scrollIntoView({ behavior: "smooth", block: "start" });
}

/* ---------- Antispam ----------
   1. Campo trampa (_gotcha): invisible para personas; si viene relleno, es un robot.
   2. Tiempo mínimo: nadie rellena el formulario en menos de 3 segundos.
   3. Límite: como mucho 3 reservas por hora desde el mismo navegador. */
const CARGADO_EN = Date.now();
const CLAVE_ENVIOS = "reservas-enviadas";

function enviosRecientes() {
  try {
    const lista = JSON.parse(localStorage.getItem(CLAVE_ENVIOS)) || [];
    return lista.filter((t) => Date.now() - t < 60 * 60 * 1000);
  } catch {
    return [];
  }
}

function anotarEnvio() {
  try { localStorage.setItem(CLAVE_ENVIOS, JSON.stringify([...enviosRecientes(), Date.now()])); } catch { /* modo privado */ }
}

function mostrarAvisoEnvio(texto) {
  const aviso = document.getElementById("aviso-envio");
  aviso.textContent = texto;
  aviso.hidden = !texto;
}

form.addEventListener("submit", async (e) => {
  e.preventDefault();
  mostrarAvisoEnvio("");
  if (!validarFormulario()) return;

  const datos = Object.fromEntries(new FormData(form));

  // Robot: se le muestra la confirmación, pero la reserva no se envía
  if (datos._gotcha) {
    mostrarConfirmacion(datos);
    return;
  }
  if (Date.now() - CARGADO_EN < 3000) {
    mostrarAvisoEnvio("Revisa que los datos estén bien y vuelve a pulsar Reservar mesa.");
    return;
  }
  if (enviosRecientes().length >= 3) {
    mostrarAvisoEnvio(`Ya has enviado varias reservas en la última hora. Si quieres cambiar algo, llámanos al ${RESTAURANTE.telefono}.`);
    return;
  }

  const boton = form.querySelector("[type=submit]");
  boton.disabled = true;
  boton.classList.add("cargando");
  boton.textContent = "Reservando...";

  delete datos._gotcha;
  try {
    await enviarReserva(datos);
    anotarEnvio();
    if (typeof registrarEvento === "function") registrarEvento("reserva_enviada", { personas: Number(datos.personas) });
    mostrarConfirmacion(datos);
  } catch {
    boton.disabled = false;
    boton.classList.remove("cargando");
    boton.textContent = "Reservar mesa";
    mostrarAvisoEnvio(`No hemos podido enviar la reserva. Inténtalo de nuevo o llámanos al ${RESTAURANTE.telefono}.`);
  }
});


/* ---------- Arranque ---------- */
document.addEventListener("DOMContentLoaded", () => {
  prepararFecha();
  prepararPersonas();
  campoFecha.addEventListener("change", actualizarHoras);

  // Un campo con error se vuelve a comprobar mientras se corrige,
  // así el aviso desaparece en cuanto el dato es válido
  form.querySelectorAll("input, select").forEach((campo) => {
    const evento = campo.type === "checkbox" || campo.tagName === "SELECT" ? "change" : "input";
    campo.addEventListener(evento, () => {
      if (campo.hasAttribute("aria-invalid") && campo.id !== "fecha") validarCampo(campo);
    });
  });

  // Si se llega desde la reserva rápida de la portada, se rellenan día, hora y personas
  const parametros = new URLSearchParams(location.search);
  const fechaUrl = parametros.get("fecha");
  if (fechaUrl && /^\d{4}-\d{2}-\d{2}$/.test(fechaUrl) && fechaUrl >= campoFecha.min && fechaUrl <= campoFecha.max) {
    campoFecha.value = fechaUrl;
    actualizarHoras();
    const horaUrl = parametros.get("hora");
    if (horaUrl && [...campoHora.options].some((o) => o.value === horaUrl)) campoHora.value = horaUrl;
  }
  const personasUrl = Number(parametros.get("personas"));
  if (personasUrl >= 1 && personasUrl <= MAX) {
    campoPersonas.value = personasUrl;
    campoPersonas.dispatchEvent(new Event("input"));
  }

  // Si se llega desde la ficha de un plato, se anota en las peticiones
  const plato = buscarPlato(parametros.get("plato"));
  if (plato) document.getElementById("notas").value = `Nos gustaría tomar: ${plato.nombre}.`;

  // Si se llega desde "eventos", se indica en las peticiones
  if (parametros.get("motivo") === "evento") {
    document.getElementById("notas").value = "Queremos celebrar un evento (cumpleaños, comunión, reunión...). ¿Qué menús tenéis?";
  }
});
