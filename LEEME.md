# La Chulería: propuesta de web

Propuesta de diseño de la web de **La Chulería, bar & restaurante** (Glorieta de las Amazonas, 25, Valdemoro).
Está hecha con HTML, CSS y JavaScript, sin instalar nada: basta con abrir `index.html` en el navegador
(con internet, para las fuentes, las fotos y las animaciones).

Los datos (carta, precios, horario, teléfono, historia) salen de la web actual del restaurante
(lachuleria.es) y de su ficha de Google en octubre de 2026. **No es la web oficial**: el pie lo indica y
los buscadores tienen prohibido indexarla hasta que el restaurante la apruebe.

## Lo que falta confirmar con el restaurante

| Qué | Dónde se cambia |
|---|---|
| Móvil con WhatsApp (ahora sale un botón de llamar) | `whatsapp` en `js/datos.js` |
| Horario de invierno (el de su web es el de verano) | `horario`, `cocina` y `notaCocina` en `js/datos.js` y el bloque de datos estructurados de `index.html` |
| Razón social, NIF y datos registrales | `legal` en `js/datos.js` (salen marcados como PENDIENTE) |
| Recibir las reservas por email | Crear un formulario gratis en formspree.io y pegar su dirección en `reservas.formspree` |
| Google Analytics | ID de GA4 en `analitica.ga4` |
| Instagram y Facebook (los de su web actual llevan a otra cuenta) | `redes` en `js/datos.js` |
| Permiso para usar sus fotos y su nombre | Las fotos se cargan desde su web; al publicar, copiarlas a `img/` |

## Para enseñarla con un enlace (WhatsApp)

1. En github.com, crear un repositorio público llamado exactamente `la-chuleria`.
2. "uploading an existing file": arrastrar todo lo que hay dentro de esta carpeta y pulsar "Commit changes".
3. Settings → Pages → Branch `main`, carpeta `/ (root)` → Save.
4. Al cabo de 1 o 2 minutos la web está en
   `https://alejandromedranonavidades-netizen.github.io/la-chuleria/`. Ese enlace se manda por WhatsApp
   y sale con la foto de vista previa (`og:image` de cada página apunta ahí).

## Para publicarla como web oficial

1. Que el restaurante dé el visto bueno y rellenar lo pendiente de la tabla de arriba.
2. En el `<head>` de cada página, cambiar `noindex, nofollow` por `index, follow`, y en `og:image`
   poner `https://lachuleria.es/img/compartir.jpg`.
3. En `robots.txt`, cambiar `Disallow: /` por `Allow: /`.
4. Descargar las fotos a `img/` (en WebP, unos 1200 px y menos de 200 KB) y cambiar `FOTOS_WEB` en `js/datos.js`
   y las fotos de los HTML.
5. Subir todo a su hosting o a GitHub Pages con dominio propio y activar HTTPS.

## Estructura

```
la-chuleria/
├── index.html        Inicio: portada, historia, sala/barra/terraza, imprescindibles, arroces, carta, eventos, a domicilio, horario y mapa
├── carta.html        Carta completa con buscador, bodega y cervezas
├── plato.html        Ficha de cada plato (plato.html?id=bravas)
├── reservas.html     Formulario de reserva (modo demostración hasta conectar Formspree)
├── aviso-legal.html  privacidad.html  cookies.html  404.html
├── sitemap.xml  robots.txt  site.webmanifest  favicon.ico
├── css/estilos.css   Todo el diseño. Colores y fuentes al principio
├── js/datos.js       TODOS LOS DATOS: horario, teléfono, carta, bebidas, fotos, datos legales
├── js/main.js        Común: datos, fotos, horario, abierto/cerrado, sello de Google, botón de llamar
├── js/cookies.js     Aviso de cookies, Google Analytics y mapa (solo con permiso)
├── js/inicio.js  carta.js  plato.js  reservas.js   Cada página
├── js/animaciones.js Animaciones con GSAP y scroll suave con Lenis
└── img/              Iconos e imagen para compartir
```

## Lista de comprobación

| Punto | Dónde está |
|---|---|
| Aviso legal, privacidad, cookies | Páginas propias + aviso de cookies con aceptar y rechazar al mismo nivel |
| Forzar HTTPS | Se activa en el hosting; además cada página pide los recursos por HTTPS |
| Meta títulos y descripciones | En el `<head>` de cada página; las fichas de plato los generan solas |
| Datos estructurados | Restaurante con horario en `index.html`, carta en `carta.js`, cada plato en `plato.js` |
| Sitemap y robots.txt | `sitemap.xml` (con los 54 platos) y `robots.txt` |
| Ficha de Google | Ya existe (4,6 con 815 reseñas); la web enlaza a ella y a sus reseñas |
| Favicon | `favicon.ico` e iconos en `img/` |
| Texto alternativo | Todas las fotos describen lo que se ve |
| Imágenes comprimidas | Cada foto tiene 2 o 3 tamaños y el navegador baja solo el que necesita |
| Velocidad | Foto de portada con prioridad, scripts diferidos, mapa bajo demanda |
| Contraste | Comprobado: todo el texto supera 4,5:1 |
| Móvil | Diseño adaptable, barra inferior con "Reservar mesa" y llamar |
| Página 404 | `404.html` |
| Enlaces rotos | Revisados los 115 destinos internos y anclas: ninguno roto |
| Antispam | Campo trampa, tiempo mínimo y límite de envíos en `reservas.js` |
| Botón de WhatsApp | Preparado: aparece en cuanto se pone el número; mientras, botón de llamar |
| Analítica | Google Analytics 4, solo con permiso: falta el ID |
| Una sola llamada a la acción | "Reservar mesa" es el único botón rojo; lo demás son enlaces |

## Diseño

- **Colores del propio local**: verde botella (muebles), rojo (banquetas), mostaza (sillas de terciopelo)
  y blanco azulejo (paredes). Están en el apartado 1 de `css/estilos.css`.
- **Fuentes**: Bricolage Grotesque para títulos, Instrument Serif en cursiva para la palabra destacada
  de cada título y Figtree para el texto.
- **El círculo del logo** se repite en la intro, el logo de la cabecera, el sello de Google, las fotos
  redondas, la vista previa de la carta y la 404.
- **Marco de las fotos**: recuadro redondeado con un azulejo de color desplazado detrás
  (`.marco--rojo`, `.marco--mostaza`, `.marco--verde`, `.marco--circulo`).
- **Platos sin foto**: azulejo verde con el nombre del plato dentro del círculo.

## Animaciones

- GSAP 3.13 (ScrollTrigger y SplitText) y Lenis 1.3 se cargan desde jsDelivr.
- `js/animaciones.js` hace la intro (se dibuja el círculo del logo y sube el telón), la portada que se
  ilumina con "chulería" entrando con rebote, el sello que llega girando, los títulos que salen del
  desenfoque, la historia que se enciende al bajar, las fotos que se descubren con su azulejo, las fotos
  redondas que caen girando, la línea de los sitios, el carrusel que se desliza o se arrastra solo en su
  zona, las pestañas con fondo que se desliza, la foto de "Reserva tu mesa" que se abre como una ventana,
  las cifras que cuentan y el pie que sube. Con ratón: botones magnéticos, tarjetas que se inclinan,
  burbuja "Ver plato" y foto redonda que sigue al ratón en la carta.
- La cinta roja se mueve sola con CSS, siempre hacia el mismo lado.
- Sin las librerías, o con "reducir movimiento" activado, la web funciona igual con animaciones sencillas.

## Para verla mientras editas

En VS Code, instala la extensión **Live Server**, haz clic derecho sobre `index.html` y elige
"Open with Live Server".
