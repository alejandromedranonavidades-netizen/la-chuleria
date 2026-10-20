/* =============================================================
   ANIMACIONES.JS — Animaciones con GSAP
   -------------------------------------------------------------
   Librerías (se cargan desde jsDelivr en el <head> de cada página):
   - GSAP + ScrollTrigger + SplitText  https://gsap.com

   La idea del movimiento en esta versión es "poco, pero bien hecho".
   El scroll es el normal del navegador: nada va atado a él ni lo frena.
   Hay un solo momento grande al entrar y el resto responde a lo que
   hace el visitante:
   1.  Portada: se dibuja el círculo del logo, la foto de la sala se abre
       dentro y el nombre sube letra a letra (al cruzar el círculo
       se vuelve blanco)
   2.  Páginas interiores: el título sube palabra a palabra
   3.  El local: los tres paneles se descubren uno tras otro al llegar
   4.  Los imprescindibles: carrusel que se desliza o se arrastra en horizontal,
       solo en su zona (bajar por la página no lo mueve)
   5.  Reserva: al llegar, la foto se abre desde un círculo (una sola vez)
   6.  Ratón: burbuja "Ver plato" y foto redonda que sigue al ratón en la carta

   Si las librerías no cargan o el visitante prefiere menos movimiento,
   la web se ve completa y sin animaciones.
   ============================================================= */

const MENOS_MOVIMIENTO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const PUNTERO_FINO = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const RAIZ = document.documentElement;

// main.js mira esta marca para no duplicar las animaciones de aparición
window.ANIMACIONES_GSAP = !!(window.gsap && window.ScrollTrigger && !MENOS_MOVIMIENTO);
if (window.ANIMACIONES_GSAP) RAIZ.classList.add("con-gsap");


document.addEventListener("DOMContentLoaded", () => {
  if (!window.ANIMACIONES_GSAP) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: "power3.out" });

  if (!animarPortada()) animarCabezaInterior();
  animarLocal();
  animarDestacados();
  animarReserva();
  if (PUNTERO_FINO) {
    burbujaVerPlato();
    vistaPreviaCarta();
  }

  // Recalcula posiciones cuando terminan de cargar fuentes y fotos
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());
});


/* ---------- 1. Portada ---------- */
function animarPortada() {
  const portada = document.querySelector(".portada");
  if (!portada) return false;

  const trazo = portada.querySelector(".portada__trazo circle");
  const circulo = portada.querySelector(".portada__circulo");
  const foto = portada.querySelector(".portada__foto img");
  const sello = portada.querySelector(".portada__sello");
  const pie = portada.querySelectorAll(".portada__pie > *");
  const cabecera = window.matchMedia("(min-width: 861px)").matches
    ? document.querySelectorAll(".cabecera .logo, .cabecera .nav__item, .cabecera .nav__reservar")
    : document.querySelectorAll(".cabecera .logo, .cabecera__boton-menu");

  // Las dos copias del nombre (la oscura y la blanca de dentro del círculo)
  // se parten igual y se animan a la vez, así siguen coincidiendo letra a letra
  const nombres = [...portada.querySelectorAll(".portada__nombre")];
  const partidos = window.SplitText
    ? nombres.map((n) => SplitText.create(n, { type: "chars", mask: "chars", charsClass: "letra" }))
    : [];
  const letras = partidos.length ? partidos.map((p) => p.chars) : [nombres];
  // Al terminar, las letras vuelven a ser texto normal (con su espaciado original)
  const juntarLetras = () => partidos.forEach((p) => p.revert());

  const tl = gsap.timeline({ defaults: { ease: "expo.out" } });
  if (trazo) {
    const largo = trazo.getTotalLength ? trazo.getTotalLength() : 625;
    tl.set(trazo, { strokeDasharray: largo, strokeDashoffset: largo, rotation: -90, transformOrigin: "50% 50%" })
      .to(trazo, { strokeDashoffset: 0, duration: 1.6, ease: "power2.inOut" }, 0);
  }
  tl.fromTo(circulo, { clipPath: "circle(0% at 50% 50%)" }, { clipPath: "circle(50% at 50% 50%)", duration: 1.6, ease: "expo.inOut", clearProps: "clipPath" }, 0.3);
  if (foto) tl.fromTo(foto, { scale: 1.4 }, { scale: 1, duration: 2.4, clearProps: "transform" }, 0.3);
  letras.forEach((grupo) => tl.from(grupo, { yPercent: 110, duration: 1.2, stagger: 0.04 }, 0.95));
  tl.call(juntarLetras, null, ">");
  if (sello) tl.from(sello, { autoAlpha: 0, rotation: -60, duration: 1.4 }, 1.4);
  tl.from(pie, { autoAlpha: 0, y: 14, duration: 1, stagger: 0.08 }, 1.45);
  tl.from(cabecera, { autoAlpha: 0, y: -10, duration: 0.9, stagger: 0.05, clearProps: "all" }, 1.3);
  return true;
}


/* ---------- 2. Páginas interiores: el título sube palabra a palabra ---------- */
function animarCabezaInterior() {
  const titulo = document.querySelector(".cabeza-pagina__titulo, .ficha__nombre");
  if (titulo && window.SplitText) {
    const partido = SplitText.create(titulo, { type: "words", mask: "words" });
    gsap.from(partido.words, { yPercent: 110, duration: 1.2, ease: "expo.out", stagger: 0.06, delay: 0.1 });
  }
  const texto = document.querySelectorAll(".cabeza-pagina__texto, .migas, .ficha__texto > :not(.ficha__nombre)");
  if (texto.length) gsap.from(texto, { autoAlpha: 0, y: 14, duration: 1, stagger: 0.06, delay: 0.35 });

  const foto = document.querySelector(".ficha__foto .foto img");
  if (foto) gsap.fromTo(foto, { scale: 1.15 }, { scale: 1, duration: 1.8, ease: "expo.out", clearProps: "transform" });
}


/* ---------- 3. El local: los paneles se descubren de abajo arriba, uno tras otro ----------
   Al terminar se quitan los estilos de GSAP para que el panel vuelva a abrirse con CSS. */
function animarLocal() {
  const paneles = gsap.utils.toArray(".local .panel");
  if (!paneles.length) return;
  const fotos = paneles.map((p) => p.querySelector(".panel__foto"));
  const textos = paneles.map((p) => p.querySelector(".panel__texto"));

  gsap.timeline({ scrollTrigger: { trigger: ".local__paneles", start: "top 82%", once: true } })
    .fromTo(paneles,
      { clipPath: "inset(100% 0% 0% 0%)" },
      { clipPath: "inset(0% 0% 0% 0%)", duration: 1.4, ease: "expo.out", stagger: 0.14, clearProps: "clipPath" })
    .fromTo(fotos, { scale: 1.25 }, { scale: 1, duration: 1.8, ease: "expo.out", stagger: 0.14, clearProps: "transform" }, 0)
    .from(textos, { autoAlpha: 0, y: 20, duration: 1, stagger: 0.14, clearProps: "all" }, 0.5);
}


/* ---------- 4. Los imprescindibles ----------
   El carrusel se mueve en horizontal solo en su zona: deslizando con el
   panel táctil o el dedo, arrastrando con el ratón o con las flechas. */
function animarDestacados() {
  const carrusel = document.querySelector(".destacados .carrusel");
  const pista = carrusel && carrusel.querySelector(".carrusel__pista");
  if (!pista || !pista.children.length) return;

  deslizarConRueda(carrusel);
  arrastrarConRaton(carrusel);

  // Al deslizar, las fotos se mueven un poco más despacio que la tarjeta (profundidad)
  const fotos = [...pista.querySelectorAll(".foto img")];
  let pendiente = false;
  const moverFotos = () => {
    pendiente = false;
    const caja = carrusel.getBoundingClientRect();
    const centro = caja.left + caja.width / 2;
    fotos.forEach((img) => {
      const marco = img.parentElement.getBoundingClientRect();
      const distancia = (marco.left + marco.width / 2 - centro) / caja.width;
      gsap.set(img, { xPercent: gsap.utils.clamp(-6, 6, -distancia * 10), scale: 1.14 });
    });
  };
  carrusel.addEventListener("scroll", () => {
    if (!pendiente) { pendiente = true; requestAnimationFrame(moverFotos); }
  }, { passive: true });
  moverFotos();
  window.addEventListener("resize", moverFotos);
}

// Lleva el carrusel suavemente a la tarjeta más cercana a "destino"
function encajarCarrusel(carrusel, destino) {
  const borde = parseFloat(getComputedStyle(carrusel).scrollPaddingLeft) || 0;
  const caja = carrusel.getBoundingClientRect();
  const posiciones = [...carrusel.querySelectorAll(".carrusel__elemento")]
    .map((el) => carrusel.scrollLeft + el.getBoundingClientRect().left - caja.left - borde);
  const maximo = carrusel.scrollWidth - carrusel.clientWidth;
  const masCerca = posiciones.reduce((a, b) => (Math.abs(b - destino) < Math.abs(a - destino) ? b : a), 0);
  gsap.to(carrusel, {
    scrollLeft: gsap.utils.clamp(0, maximo, destino >= maximo - 4 ? maximo : masCerca),
    duration: 0.8,
    ease: "power3.out",
    overwrite: true,
    onComplete: () => carrusel.classList.remove("sin-encaje", "arrastrando")
  });
}

// Deslizar en horizontal con el panel táctil (o Mayús + rueda): el carrusel se mueve
// suave y encaja al terminar. La rueda normal (vertical) sigue bajando la página.
function deslizarConRueda(carrusel) {
  let objetivo = null;
  let espera;
  carrusel.addEventListener("wheel", (e) => {
    if (Math.abs(e.deltaX) <= Math.abs(e.deltaY)) return;
    e.preventDefault();
    const maximo = carrusel.scrollWidth - carrusel.clientWidth;
    if (objetivo === null) objetivo = carrusel.scrollLeft;
    objetivo = gsap.utils.clamp(0, maximo, objetivo + e.deltaX * (e.deltaMode === 1 ? 40 : 1));
    carrusel.classList.add("sin-encaje");
    gsap.to(carrusel, { scrollLeft: objetivo, duration: 0.6, ease: "power3.out", overwrite: true });
    clearTimeout(espera);
    espera = setTimeout(() => { encajarCarrusel(carrusel, objetivo); objetivo = null; }, 180);
  }, { passive: false });
}

// Arrastrar el carrusel con el ratón, con inercia, y que encaje en la tarjeta más cercana
function arrastrarConRaton(carrusel) {
  let inicioX = 0, inicioScroll = 0, arrastrando = false, pulsado = false, recorrido = 0;
  let muestras = [];

  carrusel.addEventListener("pointerdown", (e) => {
    if (e.pointerType !== "mouse" || e.button !== 0) return;
    gsap.killTweensOf(carrusel);
    pulsado = true;
    arrastrando = false;
    recorrido = 0;
    inicioX = e.clientX;
    inicioScroll = carrusel.scrollLeft;
    muestras = [{ x: e.clientX, t: performance.now() }];
  });
  window.addEventListener("pointermove", (e) => {
    if (!pulsado) return;
    recorrido = e.clientX - inicioX;
    if (!arrastrando && Math.abs(recorrido) > 6) {
      arrastrando = true;
      carrusel.classList.add("sin-encaje", "arrastrando");
    }
    if (!arrastrando) return;
    carrusel.scrollLeft = inicioScroll - recorrido;
    muestras.push({ x: e.clientX, t: performance.now() });
    if (muestras.length > 5) muestras.shift();
  });
  window.addEventListener("pointerup", () => {
    if (!pulsado) return;
    pulsado = false;
    if (!arrastrando) return;
    const a = muestras[0], b = muestras[muestras.length - 1];
    const velocidad = b && b.t > a.t ? (b.x - a.x) / (b.t - a.t) : 0; // píxeles por milisegundo
    encajarCarrusel(carrusel, carrusel.scrollLeft - velocidad * 280);
  });
  // Si se ha arrastrado, que soltar no abra el plato
  carrusel.addEventListener("click", (e) => {
    if (Math.abs(recorrido) > 6) {
      e.preventDefault();
      e.stopPropagation();
      recorrido = 0;
    }
  }, true);
  carrusel.addEventListener("dragstart", (e) => e.preventDefault());
}


/* ---------- 5. Reserva: al llegar, la foto se abre desde un círculo (una sola vez, sin ir atada al scroll) ---------- */
function animarReserva() {
  const reserva = document.querySelector(".reserva");
  const fondo = reserva && reserva.querySelector(".reserva__fondo");
  if (!fondo) return;
  const inicio = window.innerWidth < 700 ? 30 : 17;
  gsap.fromTo(fondo, { clipPath: `circle(${inicio}% at 50% 50%)` }, {
    clipPath: "circle(75% at 50% 50%)",
    duration: 1.8,
    ease: "expo.inOut",
    clearProps: "clipPath",
    scrollTrigger: { trigger: reserva, start: "top 60%", once: true }
  });
}


/* ---------- 6. Interacciones con ratón ---------- */

/* Dónde está el ratón. Se comprueba al moverlo y también al hacer scroll,
   porque al bajar la página los platos pasan por debajo de un ratón quieto
   y el navegador tarda en darse cuenta (así la burbuja no se queda pillada). */
const PUNTERO = { x: -999, y: -999 };
const avisosPuntero = [];
function alMoverPuntero(funcion) {
  if (!avisosPuntero.length) {
    const avisar = (movido) => avisosPuntero.forEach((f) => f(movido));
    window.addEventListener("pointermove", (e) => {
      if (e.pointerType !== "mouse") return;
      PUNTERO.x = e.clientX;
      PUNTERO.y = e.clientY;
      avisar(true);
    }, { passive: true });
    let pendiente = false;
    document.addEventListener("scroll", () => {
      if (pendiente) return;
      pendiente = true;
      requestAnimationFrame(() => { pendiente = false; avisar(false); });
    }, { capture: true, passive: true });
    document.documentElement.addEventListener("mouseleave", () => {
      PUNTERO.x = PUNTERO.y = -999;
      avisar(false);
    });
  }
  avisosPuntero.push(funcion);
}
function bajoPuntero(selector) {
  if (PUNTERO.x < 0) return null;
  const elemento = document.elementFromPoint(PUNTERO.x, PUNTERO.y);
  return elemento ? elemento.closest(selector) : null;
}

// Burbuja "Ver plato" que sustituye al cursor sobre las tarjetas de platos
function burbujaVerPlato() {
  if (!document.querySelector(".tarjeta-plato")) return;
  const burbuja = document.createElement("div");
  burbuja.className = "cursor-ver";
  burbuja.setAttribute("aria-hidden", "true");
  burbuja.textContent = "Ver plato";
  document.body.appendChild(burbuja);
  gsap.set(burbuja, { scale: 0 });
  RAIZ.classList.add("con-cursor");

  const moverX = gsap.quickTo(burbuja, "x", { duration: 0.15, ease: "power3" });
  const moverY = gsap.quickTo(burbuja, "y", { duration: 0.15, ease: "power3" });
  let visible = false;
  alMoverPuntero((movido) => {
    if (movido) {
      if (!visible) gsap.set(burbuja, { x: PUNTERO.x, y: PUNTERO.y }); // aparece ya en su sitio
      moverX(PUNTERO.x);
      moverY(PUNTERO.y);
    }
    const sobre = !!bajoPuntero(".tarjeta-plato");
    if (sobre === visible) return;
    visible = sobre;
    gsap.to(burbuja, sobre
      ? { scale: 1, duration: 0.35, ease: "expo.out", overwrite: "auto" }
      : { scale: 0, duration: 0.15, ease: "power2.in", overwrite: "auto" });
  });
}

// En la carta: la foto del plato aparece en un círculo junto al ratón
function vistaPreviaCarta() {
  if (!document.querySelector(".lista-carta, #panel-carta")) return;
  const vista = document.createElement("div");
  vista.className = "vista-plato";
  vista.setAttribute("aria-hidden", "true");
  vista.innerHTML = '<img alt="">';
  document.body.appendChild(vista);
  gsap.set(vista, { scale: 0.7, autoAlpha: 0 });
  const img = vista.querySelector("img");

  const moverX = gsap.quickTo(vista, "x", { duration: 0.45 });
  const moverY = gsap.quickTo(vista, "y", { duration: 0.45 });
  let actual = null;
  alMoverPuntero((movido) => {
    if (movido) {
      if (!actual) gsap.set(vista, { x: PUNTERO.x, y: PUNTERO.y });
      moverX(PUNTERO.x);
      moverY(PUNTERO.y);
    }
    const fila = bajoPuntero(".fila-carta[data-imagen]");
    if (fila === actual) return;
    actual = fila;
    if (fila) {
      if (img.getAttribute("src") !== fila.dataset.imagen) img.src = fila.dataset.imagen;
      gsap.to(vista, { autoAlpha: 1, scale: 1, duration: 0.45, ease: "expo.out", overwrite: "auto" });
    } else {
      gsap.to(vista, { autoAlpha: 0, scale: 0.7, duration: 0.25, overwrite: "auto" });
    }
  });
}
