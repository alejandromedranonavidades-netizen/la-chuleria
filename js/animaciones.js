/* =============================================================
   ANIMACIONES.JS — Animaciones con GSAP y scroll suave con Lenis
   -------------------------------------------------------------
   Librerías (se cargan desde jsDelivr en el <head> de cada página):
   - GSAP + ScrollTrigger + SplitText  https://gsap.com
   - Lenis (scroll suave)              https://lenis.darkroom.engineering
   Varios efectos están inspirados en React Bits (SplitText, BlurText,
   ScrollReveal, CountUp, Magnet, TiltedCard), hechos con GSAP para no
   necesitar React.

   La idea del movimiento es "con chulería": el círculo del logo se
   dibuja, las cosas entran con un pequeño rebote y algo de giro, y
   las fotos caen en su sitio como quien deja un plato en la mesa.

   Qué hace este archivo (cada apartado es una función de abajo):
   1.  Intro: se dibuja el círculo del logo, sale el nombre y sube el telón
   2.  Portada: la foto se ilumina, el título sube letra a letra, la
       palabra "chulería" entra con rebote y el sello gira hasta su sitio
   3.  Scroll suave (Lenis) y enlaces internos que se deslizan
   4.  Títulos que salen de un desenfoque, palabra a palabra
   5.  Texto de la historia que se enciende palabra a palabra al bajar
   6.  Fotos que se descubren con su azulejo de color; fotos redondas que caen girando
   7.  El local: los tres paneles se descubren de abajo arriba
   8.  Los imprescindibles: carrusel que se desliza o se arrastra en horizontal
   9.  Carta: pestaña que se desliza y platos en cascada
   10. Eventos y a domicilio, llamada a reservar (ventana que se abre) y horario
   11. Cifras, pie y páginas interiores (la cinta se mueve sola, con CSS)
   12. Ratón: botones magnéticos, tarjetas que se inclinan, burbuja
       "Ver plato" y foto que sigue al ratón en la carta

   Si las librerías no cargan o el visitante prefiere menos movimiento,
   la web funciona igual con las animaciones sencillas de CSS.
   ============================================================= */

const MENOS_MOVIMIENTO = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const PUNTERO_FINO = window.matchMedia("(hover: hover) and (pointer: fine)").matches;
const ESCRITORIO = "(min-width: 1025px)";
const RAIZ = document.documentElement;

// main.js mira esta marca para no duplicar las animaciones de aparición
window.ANIMACIONES_GSAP = !!(window.gsap && window.ScrollTrigger && !MENOS_MOVIMIENTO);
if (window.ANIMACIONES_GSAP) {
  RAIZ.classList.add("con-gsap");
  // De la intro se encarga GSAP; por si algo fallara, se quita sola a los 4,5 segundos
  clearTimeout(window.__temporizadorIntro);
  window.__temporizadorIntro = setTimeout(() => RAIZ.classList.remove("intro-pendiente"), 4500);
}


document.addEventListener("DOMContentLoaded", () => {
  if (!window.ANIMACIONES_GSAP) return;

  gsap.registerPlugin(ScrollTrigger);
  if (window.SplitText) gsap.registerPlugin(SplitText);
  gsap.defaults({ ease: "power3.out" });

  const lenis = iniciarScrollSuave();
  entradaDePagina(lenis);
  animarTitulos();
  animarApariciones();
  animarEntradilla();
  animarFotos();
  animarCollage();
  animarParallax();
  animarCifras();
  animarLocal();
  animarDestacados();
  animarPestanas();
  animarPlanes();
  animarLlamada();
  animarVisitanos();
  animarPie();
  if (PUNTERO_FINO) {
    botonesMagneticos();
    tarjetasQueSeInclinan();
    burbujaVerPlato();
    vistaPreviaCarta();
  }

  // Recalcula posiciones cuando terminan de cargar fuentes y fotos
  window.addEventListener("load", () => ScrollTrigger.refresh());
  if (document.fonts) document.fonts.ready.then(() => ScrollTrigger.refresh());

  // Contenido que se repinta (filtros de la carta)
  document.addEventListener("click", (e) => {
    if (e.target.closest(".pestana, .filtro")) setTimeout(() => ScrollTrigger.refresh(), 80);
  });

  window.lenis = lenis; // por si hace falta desde la consola
});


/* ---------- 3. Lenis: scroll suave ---------- */
function iniciarScrollSuave() {
  if (!window.Lenis) return null;

  const lenis = new Lenis({ lerp: 0.09, smoothWheel: true });
  lenis.on("scroll", ScrollTrigger.update);
  gsap.ticker.add((tiempo) => lenis.raf(tiempo * 1000));
  gsap.ticker.lagSmoothing(0);

  // Enlaces a secciones de la misma página (#visitanos, categorías de la carta...)
  document.addEventListener("click", (e) => {
    const enlace = e.target.closest("a[href*='#']");
    if (!enlace) return;
    const url = new URL(enlace.href, location.href);
    const ruta = (p) => p.replace(/index\.html$/, "");
    if (ruta(url.pathname) !== ruta(location.pathname) || !url.hash) return;
    const destino = document.getElementById(decodeURIComponent(url.hash.slice(1)));
    if (!destino) return;
    e.preventDefault();
    lenis.scrollTo(destino, { offset: -margenSuperior(), duration: 1.4 });
    history.pushState(null, "", url.hash);
  });

  // Con el menú del móvil o la intro abiertos, el fondo no se mueve
  new MutationObserver(() => {
    document.body.classList.contains("sin-scroll") ? lenis.stop() : lenis.start();
  }).observe(document.body, { attributes: true, attributeFilter: ["class"] });

  return lenis;
}

// Altura de lo que queda fijo arriba (cabecera y barra de categorías de la carta)
function margenSuperior() {
  const cabecera = document.querySelector(".cabecera");
  const cartaNav = document.querySelector(".carta-nav");
  return (cabecera ? cabecera.offsetHeight : 0) + (cartaNav ? cartaNav.offsetHeight : 0) + 16;
}

// Inclinación según la velocidad del scroll: sube de golpe y vuelve a 0 suavemente
function inclinarConVelocidad(elementos, maximo) {
  const poner = gsap.quickSetter(elementos, "skewX", "deg");
  const limitar = gsap.utils.clamp(-maximo, maximo);
  const estado = { valor: 0 };
  return (velocidad) => {
    const objetivo = limitar(velocidad);
    if (Math.abs(objetivo) <= Math.abs(estado.valor)) return;
    estado.valor = objetivo;
    gsap.to(estado, { valor: 0, duration: 0.8, ease: "power3", overwrite: true, onUpdate: () => poner(estado.valor) });
  };
}


/* ---------- 1 y 2. Intro y entrada de la página ---------- */
function entradaDePagina(lenis) {
  const intro = RAIZ.classList.contains("intro-pendiente") ? animarIntro(lenis) : null;
  const portada = animarPortada();
  if (intro && portada) intro.add(portada, "-=0.75");
  if (!portada) animarCabezaInterior();
}

function animarIntro(lenis) {
  const intro = document.querySelector(".intro");
  if (!intro) {
    RAIZ.classList.remove("intro-pendiente");
    return null;
  }
  const marca = intro.querySelector(".intro__marca");
  const circulo = intro.querySelector(".intro__circulo circle");
  const nombre = intro.querySelector(".intro__nombre");
  const sub = intro.querySelector(".intro__sub");
  const letras = window.SplitText ? SplitText.create(nombre, { type: "chars" }).chars : [nombre];
  const largo = circulo.getTotalLength ? circulo.getTotalLength() : 604;

  if (lenis) lenis.stop();
  window.scrollTo(0, 0);
  // Al subir el telón ya se puede bajar por la página (aunque la portada siga animándose)
  const terminar = () => {
    RAIZ.classList.remove("intro-pendiente");
    if (lenis) lenis.start();
    try { sessionStorage.setItem("intro-vista", "1"); } catch { /* modo privado */ }
  };
  const tl = gsap.timeline();
  tl.set(intro, { clipPath: "ellipse(150% 110% at 50% 0%)" })
    .set(circulo, { strokeDasharray: largo, strokeDashoffset: largo, rotation: -90, transformOrigin: "50% 50%" })
    // El círculo del logo se dibuja de una sola pasada
    .to(circulo, { strokeDashoffset: 0, duration: 1.15, ease: "power2.inOut" }, 0)
    // El nombre sube letra a letra, con un poco de giro
    .from(letras, { yPercent: 120, rotation: 8, duration: 0.8, stagger: 0.045 }, 0.25)
    .from(sub, { autoAlpha: 0, letterSpacing: "0.8em", duration: 1, ease: "power2.out" }, 0.6)
    // Todo se recoge y el telón sube con el borde curvo
    .to(marca, { scale: 0.9, autoAlpha: 0, duration: 0.5, ease: "power2.in" }, "+=0.25")
    .to(intro, { clipPath: "ellipse(150% 0% at 50% 0%)", duration: 1.1, ease: "power4.inOut" }, "-=0.3")
    .call(terminar);
  return tl;
}

function animarPortada() {
  const portada = document.querySelector(".portada");
  if (!portada) return null;

  const lineas = portada.querySelectorAll(".portada__titulo .linea > span");
  const letras = window.SplitText
    ? SplitText.create(lineas, { type: "words,chars", charsClass: "letra" }).chars
    : lineas;
  const acento = portada.querySelector(".portada__acento");
  const foto = portada.querySelector(".portada__fondo img");
  const sello = portada.querySelector(".portada__sello");
  const resto = portada.querySelectorAll(".estado--chip, .portada__lema, .portada__intro, .portada__acciones, .portada__pie");
  const cabecera = window.matchMedia("(min-width: 861px)").matches
    ? document.querySelectorAll(".cabecera .logo, .cabecera .nav > *")
    : document.querySelectorAll(".cabecera .logo, .cabecera__boton-menu");

  const tl = gsap.timeline();
  // La foto de la sala se enciende mientras se aleja
  if (foto) {
    tl.fromTo(foto, { scale: 1.3, filter: "brightness(0.3) saturate(0.6)" }, {
      scale: 1, filter: "brightness(1) saturate(1)", duration: 2.6, ease: "power2.out", clearProps: "filter"
    }, 0);
  }
  tl.fromTo(letras, { yPercent: 120, rotation: 7 }, { yPercent: 0, rotation: 0, duration: 1.1, stagger: 0.024 }, 0.2);
  // "chulería" entra con chulería: un rebote y un pequeño giro
  if (acento) tl.fromTo(acento, { rotation: -12, scale: 0.6, transformOrigin: "0% 100%" }, { rotation: 0, scale: 1, duration: 1.2, ease: "back.out(2.4)" }, 0.8);
  tl.fromTo(resto, { autoAlpha: 0, y: 26 }, { autoAlpha: 1, y: 0, duration: 0.9, stagger: 0.08 }, 0.55);
  // El sello llega girando, como una chapa
  if (sello) tl.fromTo(sello, { autoAlpha: 0, scale: 0, rotation: -160 }, { autoAlpha: 1, scale: 1, rotation: 0, y: 0, duration: 1.3, ease: "back.out(1.6)" }, 1);
  tl.from(cabecera, { autoAlpha: 0, y: -24, duration: 0.8, stagger: 0.06, clearProps: "all" }, 0.5);

  // Al bajar: la foto se queda atrás y se oscurece, y el texto se desvanece
  const alBajar = { trigger: portada, start: "top top", end: "bottom top", scrub: true };
  if (foto) gsap.to(foto, { yPercent: 16, ease: "none", scrollTrigger: alBajar });
  gsap.to(portada.querySelector(".portada__fondo"), { autoAlpha: 0.35, ease: "none", scrollTrigger: alBajar });
  gsap.to(".portada__contenido", { y: -90, autoAlpha: 0, ease: "none", scrollTrigger: { ...alBajar, start: "15% top", end: "85% top" } });
  return tl;
}

function animarCabezaInterior() {
  const titulo = document.querySelector(".cabeza-pagina__titulo, .ficha__nombre");
  if (titulo && window.SplitText) {
    const partido = SplitText.create(titulo, { type: "words", mask: "words" });
    gsap.from(partido.words, { yPercent: 115, rotation: 5, duration: 1.1, stagger: 0.07, delay: 0.1 });
  }
  const texto = document.querySelector(".cabeza-pagina__texto");
  if (texto) gsap.from(texto, { autoAlpha: 0, y: 20, duration: 0.9, delay: 0.45 });

  const fondo = document.querySelector(".cabeza-pagina__fondo img");
  if (fondo) {
    gsap.fromTo(fondo, { scale: 1.25, filter: "brightness(0.3)" }, { scale: 1, filter: "brightness(1)", duration: 2.4, ease: "power2.out", clearProps: "filter" });
  }

  // Ficha de un plato: el texto entra en cascada junto a la foto
  const ficha = document.querySelectorAll(".ficha__texto > :not(.ficha__nombre), .migas");
  if (ficha.length) gsap.from(ficha, { autoAlpha: 0, y: 30, duration: 0.9, stagger: 0.08, delay: 0.25 });

  // Reservas: el formulario sube y se monta sobre la foto
  const caja = document.querySelector(".reservas__caja");
  if (caja) {
    gsap.from(caja, { autoAlpha: 0, y: 90, duration: 1.2, delay: 0.3, ease: "power4.out" });
    gsap.from(".reservas__lateral > *", { autoAlpha: 0, x: 40, duration: 1, stagger: 0.1, delay: 0.6 });
  }
}


/* ---------- 4. Títulos: palabra a palabra, saliendo de un desenfoque (BlurText) ---------- */
function animarTitulos() {
  if (!window.SplitText) return;
  document.querySelectorAll(".titulo-seccion, .llamada__titulo, .carta-categoria__titulo, .plan__titulo").forEach((titulo) => {
    const partido = SplitText.create(titulo, { type: "words" });
    gsap.from(partido.words, {
      autoAlpha: 0,
      y: 22,
      filter: "blur(12px)",
      duration: 0.95,
      ease: "power2.out",
      stagger: 0.07,
      clearProps: "filter",
      scrollTrigger: { trigger: titulo, start: "top 88%", once: true }
    });
  });
}


/* ---------- Bloques que aparecen al bajar ---------- */
function animarApariciones() {
  gsap.set(".revelar", { autoAlpha: 0, y: 40 });
  ScrollTrigger.batch(".revelar", {
    start: "top 90%",
    once: true,
    onEnter: (elementos) => gsap.to(elementos, {
      autoAlpha: 1,
      y: 0,
      duration: 1,
      stagger: 0.12,
      onComplete: () => elementos.forEach((el) => el.classList.add("visible"))
    })
  });

  // Filas de la carta completa: entran en cascada
  document.querySelectorAll(".carta-categoria .lista-carta").forEach((lista) => {
    gsap.from(lista.children, {
      autoAlpha: 0,
      y: 28,
      duration: 0.75,
      stagger: 0.06,
      scrollTrigger: { trigger: lista, start: "top 90%", once: true }
    });
  });
}


/* ---------- 5. Texto que se enciende al bajar (ScrollReveal) ----------
   Las palabras de la entradilla empiezan apagadas y se van iluminando
   al ritmo del scroll, como cuando se encienden las luces de la sala. */
function animarEntradilla() {
  if (!window.SplitText) return;
  document.querySelectorAll(".entradilla").forEach((parrafo) => {
    const palabras = SplitText.create(parrafo, { type: "words" }).words;
    gsap.fromTo(palabras, { opacity: 0.14 }, {
      opacity: 1,
      ease: "none",
      stagger: 0.1,
      scrollTrigger: { trigger: parrafo, start: "top 85%", end: "bottom 45%", scrub: true }
    });
  });
}


/* ---------- 6. Fotos con marco: se descubren y el azulejo de color se coloca detrás ---------- */
function animarFotos() {
  gsap.utils.toArray(".marco").forEach((marco) => {
    // Las fotos redondas tienen su propia animación
    if (marco.classList.contains("marco--circulo")) return;
    const foto = marco.querySelector(".foto");
    if (!foto) return;
    const img = foto.querySelector("img");
    const { x, y } = desplazamientoMarco(marco);

    const tl = gsap.timeline({ scrollTrigger: { trigger: marco, start: "top 88%", once: true } });
    tl.fromTo(foto, { clipPath: "inset(100% 0% 0% 0% round 22px)" }, {
      clipPath: "inset(0% 0% 0% 0% round 22px)",
      duration: 1.3,
      ease: "power4.inOut",
      clearProps: "clipPath"
    });
    if (img && !img.hasAttribute("data-parallax")) {
      tl.fromTo(img, { scale: 1.35 }, { scale: 1, duration: 1.8, clearProps: "transform" }, 0);
    }
    tl.add(colocarMarco(marco, x, y), 0.75);
  });
}

function desplazamientoMarco(marco) {
  const estilo = getComputedStyle(marco);
  return {
    x: estilo.getPropertyValue("--marco-x").trim() || "14px",
    y: estilo.getPropertyValue("--marco-y").trim() || "14px"
  };
}

// El azulejo de color aparece detrás de la foto y se desplaza a su sitio
function colocarMarco(marco, x, y) {
  return gsap.fromTo(marco, { "--marco-x": "0px", "--marco-y": "0px", "--marco-opacidad": 0 }, {
    "--marco-x": x,
    "--marco-y": y,
    "--marco-opacidad": 1,
    duration: 1.1,
    clearProps: "--marco-x,--marco-y,--marco-opacidad"
  });
}

// Fotos redondas (Nosotros y Arroces): caen girando y flotan más rápido que la foto grande
function animarCollage() {
  document.querySelectorAll(".marco--circulo").forEach((pequena) => {
    const foto = pequena.querySelector(".foto");
    if (!foto) return;
    const { x, y } = desplazamientoMarco(pequena);
    gsap.set(pequena, { "--marco-opacidad": 0 });

    const tl = gsap.timeline({ scrollTrigger: { trigger: pequena, start: "top 92%", once: true } });
    tl.from(foto, { scale: 0.55, rotation: -14, autoAlpha: 0, y: 80, duration: 1.3, ease: "back.out(1.4)", delay: 0.35 })
      .add(colocarMarco(pequena, x, y), "-=0.5");

    gsap.fromTo(pequena, { y: 70 }, {
      y: -50,
      ease: "none",
      scrollTrigger: { trigger: pequena.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });
}


/* ---------- Parallax en las fotos grandes ---------- */
function animarParallax() {
  document.querySelectorAll("[data-parallax]").forEach((img) => {
    gsap.fromTo(img, { yPercent: -9, scale: 1.2 }, {
      yPercent: 9,
      scale: 1.2,
      ease: "none",
      scrollTrigger: { trigger: img.parentElement, start: "top bottom", end: "bottom top", scrub: true }
    });
  });
}


/* ---------- Cifras que cuentan hacia arriba (CountUp) ---------- */
function animarCifras() {
  document.querySelectorAll(".cifras dd:not([data-no-contar])").forEach((dd) => contarHasta(dd));
}

// Cuenta desde 0 hasta el número del texto ("45", "80 kg", "18,50 €")
function contarHasta(elemento, retraso = 0) {
  const texto = elemento.textContent.trim();
  const coincide = texto.match(/^(\d+(?:[.,]\d+)?)(.*)$/);
  if (!coincide) return;
  const decimales = (coincide[1].split(/[.,]/)[1] || "").length;
  const numero = parseFloat(coincide[1].replace(",", "."));
  const sufijo = coincide[2];
  const contador = { valor: 0 };
  elemento.setAttribute("aria-label", texto);
  elemento.textContent = (0).toFixed(decimales).replace(".", ",") + sufijo;
  gsap.to(contador, {
    valor: numero,
    duration: 2,
    delay: retraso,
    ease: "power2.out",
    scrollTrigger: { trigger: elemento, start: "top 90%", once: true },
    onUpdate: () => { elemento.textContent = contador.valor.toFixed(decimales).replace(".", ",") + sufijo; }
  });
}


/* ---------- 7. El local: los paneles se descubren de abajo arriba, uno tras otro ----------
   La foto de dentro se aleja un poco a la vez y el nombre sube al final.
   Al terminar se quitan los estilos de GSAP para que el panel vuelva a abrirse con CSS. */
function animarLocal() {
  const paneles = gsap.utils.toArray(".local .panel");
  if (!paneles.length) return;
  const fotos = paneles.map((p) => p.querySelector(".panel__foto"));
  const textos = paneles.map((p) => p.querySelector(".panel__texto"));

  gsap.timeline({ scrollTrigger: { trigger: ".local__paneles", start: "top 82%", once: true } })
    .fromTo(paneles,
      { clipPath: "inset(100% 0% 0% 0% round 22px)" },
      { clipPath: "inset(0% 0% 0% 0% round 22px)", duration: 1.4, ease: "expo.out", stagger: 0.14, clearProps: "clipPath" })
    .fromTo(fotos, { scale: 1.3 }, { scale: 1, duration: 1.8, ease: "expo.out", stagger: 0.14, clearProps: "transform" }, 0)
    .from(textos, { autoAlpha: 0, y: 26, duration: 0.9, stagger: 0.14, clearProps: "all" }, 0.5);
}


/* ---------- 8. Platos destacados ----------
   El carrusel se mueve en horizontal solo en su zona: deslizando con el
   panel táctil o el dedo, arrastrando con el ratón o con las flechas.
   Bajar por la página no lo mueve. */
function animarDestacados() {
  const seccion = document.querySelector(".destacados");
  if (!seccion) return;
  const carrusel = seccion.querySelector(".carrusel");
  const pista = seccion.querySelector(".carrusel__pista");
  if (!carrusel || !pista || !pista.children.length) return;
  const tarjetas = [...pista.children];

  // Las tarjetas entran escalonadas, como cartas que se reparten
  gsap.from(tarjetas, {
    y: 120,
    rotation: 4,
    autoAlpha: 0,
    duration: 1.2,
    stagger: 0.09,
    ease: "power4.out",
    scrollTrigger: { trigger: carrusel, start: "top 88%", once: true }
  });

  deslizarConRueda(carrusel);
  arrastrarConRaton(carrusel);

  // Al deslizar, las tarjetas se inclinan con la velocidad y las fotos se mueven
  // un poco más despacio que la tarjeta (sensación de profundidad)
  const inclinar = inclinarConVelocidad(tarjetas, 6);
  const fotos = [...pista.querySelectorAll(".foto img")];
  let ultima = carrusel.scrollLeft;
  let pendiente = false;
  const moverFotos = () => {
    pendiente = false;
    const caja = carrusel.getBoundingClientRect();
    const centro = caja.left + caja.width / 2;
    fotos.forEach((img) => {
      const marco = img.parentElement.getBoundingClientRect();
      const distancia = (marco.left + marco.width / 2 - centro) / caja.width;
      gsap.set(img, { xPercent: gsap.utils.clamp(-8, 8, -distancia * 12), scale: 1.18 });
    });
  };
  carrusel.addEventListener("scroll", () => {
    inclinar((ultima - carrusel.scrollLeft) * 0.35);
    ultima = carrusel.scrollLeft;
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
    e.stopPropagation(); // que no lo coja el scroll suave de la página
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


/* ---------- 9. Carta del inicio: pestaña que se desliza y platos en cascada ---------- */
function animarPestanas() {
  const pestanas = document.getElementById("pestanas-carta");
  const panel = document.getElementById("panel-carta");
  if (!pestanas || !panel) return;

  const indicador = document.createElement("span");
  indicador.className = "pestanas__indicador";
  indicador.setAttribute("aria-hidden", "true");
  pestanas.prepend(indicador);
  RAIZ.classList.add("con-indicador");

  const activa = () => pestanas.querySelector('[aria-selected="true"]');
  const colocar = (boton, animar) => {
    if (!boton) return;
    const medidas = { x: boton.offsetLeft, y: boton.offsetTop, width: boton.offsetWidth, height: boton.offsetHeight };
    animar ? gsap.to(indicador, { ...medidas, duration: 0.55, ease: "expo.out" }) : gsap.set(indicador, medidas);
  };
  const entrarFilas = () => gsap.fromTo(panel.querySelectorAll(".lista-carta > li"),
    { autoAlpha: 0, y: 26 },
    { autoAlpha: 1, y: 0, duration: 0.65, stagger: 0.07, overwrite: true });

  colocar(activa(), false);
  // inicio.js ya ha cambiado el contenido cuando llega este clic
  pestanas.addEventListener("click", (e) => {
    if (!e.target.closest(".pestana")) return;
    colocar(activa(), true);
    entrarFilas();
  });
  window.addEventListener("resize", () => colocar(activa(), false));
  if (document.fonts) document.fonts.ready.then(() => colocar(activa(), false));

  // La primera vez, los platos entran al llegar a la sección
  gsap.from(panel.querySelectorAll(".lista-carta > li"), {
    autoAlpha: 0,
    y: 26,
    duration: 0.75,
    stagger: 0.08,
    scrollTrigger: { trigger: panel, start: "top 88%", once: true }
  });
}


/* ---------- 10. Eventos y a domicilio, llamada a reservar y horario ---------- */
function animarPlanes() {
  const apps = document.querySelectorAll(".plan__apps li");
  if (apps.length) {
    gsap.from(apps, {
      x: 50,
      autoAlpha: 0,
      duration: 0.8,
      stagger: 0.1,
      ease: "back.out(1.6)",
      scrollTrigger: { trigger: ".plan__apps", start: "top 88%", once: true }
    });
  }
  const foto = document.querySelector(".plan__foto img");
  if (foto) {
    gsap.fromTo(foto, { scale: 1.25 }, {
      scale: 1,
      ease: "none",
      scrollTrigger: { trigger: ".plan--eventos", start: "top bottom", end: "bottom top", scrub: true }
    });
  }
}

// La foto de la llamada empieza como una ventana pequeña y se abre a todo lo ancho
function animarLlamada() {
  const llamada = document.querySelector(".llamada:not(.llamada--corta)");
  if (!llamada) return;
  const fondo = llamada.querySelector(".llamada__fondo");
  if (!fondo) return;
  RAIZ.classList.add("con-llamada-ventana");
  const lados = window.innerWidth < 700 ? 3 : 9; // en el móvil, que el título quepa en la ventana
  gsap.fromTo(fondo, { clipPath: `inset(12% ${lados}% 12% ${lados}% round 40px)` }, {
    clipPath: "inset(0% 0% 0% 0% round 0px)",
    ease: "none",
    scrollTrigger: { trigger: llamada, start: "top 95%", end: "top 15%", scrub: true }
  });
}

function animarVisitanos() {
  const filas = document.querySelectorAll(".tabla-horario tr");
  if (filas.length) {
    gsap.from(filas, {
      autoAlpha: 0,
      x: -24,
      duration: 0.6,
      stagger: 0.05,
      scrollTrigger: { trigger: ".tabla-horario", start: "top 88%", once: true }
    });
  }
  const hoy = document.querySelector(".marca-hoy");
  if (hoy) gsap.from(hoy, { scale: 0, duration: 0.7, ease: "back.out(2.5)", delay: 0.6, scrollTrigger: { trigger: hoy, start: "top 90%", once: true } });

  const chips = document.querySelectorAll("#servicios li");
  if (chips.length) gsap.from(chips, { autoAlpha: 0, scale: 0.7, duration: 0.5, stagger: 0.05, ease: "back.out(2)", scrollTrigger: { trigger: "#servicios", start: "top 92%", once: true } });

  const pin = document.querySelector(".mapa-aviso__icono");
  if (pin) gsap.from(pin, { y: -70, autoAlpha: 0, duration: 1.2, ease: "bounce.out", scrollTrigger: { trigger: pin, start: "top 85%", once: true } });
}


/* ---------- 11. Pie: el contenido sube desde atrás y el nombre gigante letra a letra ---------- */
function animarPie() {
  const pie = document.querySelector(".pie");
  if (!pie) return;
  gsap.from(pie.querySelector(".pie__rejilla"), {
    yPercent: -35,
    autoAlpha: 0.2,
    ease: "none",
    scrollTrigger: { trigger: pie, start: "top bottom", end: "top 35%", scrub: true }
  });

  const marca = pie.querySelector(".pie__marca");
  if (!marca || !window.SplitText) return;
  const partido = SplitText.create(marca, { type: "chars", mask: "chars" });
  gsap.from(partido.chars, {
    yPercent: 100,
    rotation: 8,
    duration: 1.3,
    stagger: 0.06,
    ease: "power4.out",
    scrollTrigger: { trigger: pie, start: "top 70%", once: true }
  });
}


/* ---------- 12. Interacciones con ratón ---------- */

// Botones principales magnéticos (Magnet)
function botonesMagneticos() {
  document.querySelectorAll(".boton--rojo").forEach((boton) => {
    const moverX = gsap.quickTo(boton, "x", { duration: 0.5 });
    const moverY = gsap.quickTo(boton, "y", { duration: 0.5 });
    boton.addEventListener("pointermove", (e) => {
      const caja = boton.getBoundingClientRect();
      moverX((e.clientX - caja.left - caja.width / 2) * 0.25);
      moverY((e.clientY - caja.top - caja.height / 2) * 0.35);
    });
    boton.addEventListener("pointerleave", () => { moverX(0); moverY(0); });
  });
}

/* Dónde está el ratón. Se comprueba al moverlo y también al hacer scroll,
   porque al bajar la página los platos pasan por debajo de un ratón quieto
   y el navegador tarda en darse cuenta (por eso la burbuja se quedaba pillada). */
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

// Las tarjetas de platos se inclinan en 3D hacia el ratón (TiltedCard)
function tarjetasQueSeInclinan() {
  if (!document.querySelector(".tarjeta-plato")) return;
  let actual = null, girarX = null, girarY = null;
  alMoverPuntero(() => {
    const tarjeta = bajoPuntero(".tarjeta-plato");
    if (tarjeta !== actual) {
      if (actual) gsap.to(actual, { rotationX: 0, rotationY: 0, duration: 0.6, overwrite: true });
      actual = tarjeta;
      if (actual) {
        gsap.set(actual, { transformPerspective: 900 });
        girarX = gsap.quickTo(actual, "rotationX", { duration: 0.5 });
        girarY = gsap.quickTo(actual, "rotationY", { duration: 0.5 });
      }
    }
    if (!actual) return;
    const caja = actual.getBoundingClientRect();
    girarY(((PUNTERO.x - caja.left) / caja.width - 0.5) * 12);
    girarX(-((PUNTERO.y - caja.top) / caja.height - 0.5) * 12);
  });
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
      ? { scale: 1, duration: 0.3, ease: "back.out(1.8)", overwrite: "auto" }
      : { scale: 0, duration: 0.15, ease: "power2.in", overwrite: "auto" });
  });
}

// En la carta: la foto del plato aparece junto al ratón
function vistaPreviaCarta() {
  if (!document.querySelector(".lista-carta, #panel-carta")) return;
  const vista = document.createElement("div");
  vista.className = "vista-plato";
  vista.setAttribute("aria-hidden", "true");
  vista.innerHTML = '<img alt="">';
  document.body.appendChild(vista);
  gsap.set(vista, { scale: 0.6, autoAlpha: 0 });
  const img = vista.querySelector("img");
  RAIZ.classList.add("con-vista-previa");

  const moverX = gsap.quickTo(vista, "x", { duration: 0.4 });
  const moverY = gsap.quickTo(vista, "y", { duration: 0.4 });
  const inclinar = gsap.quickTo(vista, "rotate", { duration: 0.6 });
  let ultimaX = 0, actual = null;
  alMoverPuntero((movido) => {
    if (movido) {
      if (!actual) gsap.set(vista, { x: PUNTERO.x, y: PUNTERO.y });
      moverX(PUNTERO.x);
      moverY(PUNTERO.y);
      inclinar(Math.max(-8, Math.min(8, (PUNTERO.x - ultimaX) * 0.6)));
      ultimaX = PUNTERO.x;
    }
    const fila = bajoPuntero(".fila-carta[data-imagen]");
    if (fila === actual) return;
    actual = fila;
    if (fila) {
      if (img.getAttribute("src") !== fila.dataset.imagen) img.src = fila.dataset.imagen;
      gsap.to(vista, { autoAlpha: 1, scale: 1, duration: 0.4, overwrite: "auto" });
    } else {
      gsap.to(vista, { autoAlpha: 0, scale: 0.6, duration: 0.25, overwrite: "auto" });
    }
  });
}
