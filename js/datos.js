/* =============================================================
   DATOS DEL RESTAURANTE — La Chulería (Valdemoro)
   -------------------------------------------------------------
   Este es el ÚNICO archivo que hace falta tocar para cambiar la
   información de la web: teléfono, horario, carta, precios...
   Todo lo que aparece aquí se pinta solo en las páginas.

   Datos tomados de la web actual del restaurante (lachuleria.es)
   y de su ficha de Google en octubre de 2026. Lo marcado como
   PENDIENTE hay que confirmarlo con el restaurante.
   ============================================================= */

const RESTAURANTE = {
  nombre: "La Chulería",
  lema: "Bar & restaurante",

  telefono: "915 04 38 19",         // Teléfono de reservas, como se muestra en la web
  telefonoEnlace: "+34915043819",   // Sin espacios, para el enlace "llamar"
  whatsapp: "",                     // PENDIENTE: móvil con WhatsApp (34 + número). Vacío = botón de llamar
  email: "chulebaryrestaurante@hotmail.com",

  direccion: "Glorieta de las Amazonas, 25",
  ciudad: "28341 Valdemoro, Madrid",
  busquedaMapa: "Restaurante La Chulería, Glorieta de las Amazonas 25, Valdemoro",

  precioMedio: "20–30 €",           // Por persona (ficha de Google)
  valoracion: { nota: "4,6", resenas: "815", fecha: "octubre de 2026" }, // Ficha de Google

  servicios: ["Sala y terraza", "Reservas", "Para llevar", "A domicilio", "Menú para peques", "Carta de vinos y cervezas", "Menús para eventos"],

  // Pedidos a domicilio (enlaces de la web actual del restaurante)
  domicilio: {
    glovo: "https://glovoapp.com/es/es/valdemoro-ciempozuelos/la-chuleria-valdemoro-ciempozuelos/",
    justEat: "https://www.just-eat.es/restaurants-la-chuleria-valdemoro-28341/menu"
  },

  redes: {
    instagram: "",   // PENDIENTE: los enlaces de la web actual llevan a otra cuenta
    facebook: ""
  },

  /* Ficha de Google: enlace "Compartir" de Google Maps y enlace para dejar reseñas. */
  fichaGoogle: "https://www.google.com/maps/search/?api=1&query=Restaurante+La+Chuler%C3%ADa+Valdemoro",
  resenasGoogle: "https://www.google.com/maps/search/?api=1&query=Restaurante+La+Chuler%C3%ADa+Valdemoro",

  /* Dirección pública de la web (sin barra final). */
  urlWeb: "https://lachuleria.es",

  /* Datos legales del titular (obligatorios en el aviso legal y la privacidad). */
  legal: {
    titular: "PENDIENTE (razón social del restaurante)",
    nif: "PENDIENTE",
    domicilio: "Glorieta de las Amazonas, 25, 28341 Valdemoro (Madrid)",
    registro: "PENDIENTE",
    emailPrivacidad: "chulebaryrestaurante@hotmail.com",
    actualizado: "19 de octubre de 2026"
  },

  /* Analítica: ID de Google Analytics 4 (empieza por "G-"). Vacío = no se carga. */
  analitica: {
    ga4: ""
  },

  /* Horario del local. Días de domingo (0) a sábado (6), como en JavaScript.
     Para cerrar después de medianoche se suma 24: la 1:00 es "25:00".
     Es el horario publicado en su web (verano); PENDIENTE confirmar el de invierno. */
  horario: {
    0: [["12:30", "17:30"], ["20:00", "25:00"]],  // Domingo
    1: [],                                        // Lunes: cerrado
    2: [["12:30", "17:30"], ["20:00", "25:00"]],  // Martes
    3: [["12:30", "17:30"], ["20:00", "25:00"]],  // Miércoles
    4: [["12:30", "17:30"], ["20:00", "25:00"]],  // Jueves
    5: [["12:30", "17:30"], ["20:00", "25:00"]],  // Viernes
    6: [["12:30", "17:30"], ["20:00", "25:00"]]   // Sábado
  },

  /* Horario de cocina: de aquí salen las horas que se ofrecen para reservar. */
  notaCocina: "Cocina de 13:15 a 16:00 y de 20:30 a 23:15 (viernes y sábado, hasta las 23:30).",
  cocina: {
    0: [["13:15", "16:00"], ["20:30", "23:15"]],
    1: [],
    2: [["13:15", "16:00"], ["20:30", "23:15"]],
    3: [["13:15", "16:00"], ["20:30", "23:15"]],
    4: [["13:15", "16:00"], ["20:30", "23:15"]],
    5: [["13:15", "16:00"], ["20:30", "23:30"]],
    6: [["13:15", "16:00"], ["20:30", "23:30"]]
  },

  reservas: {
    maxPersonas: 12,          // Más personas: se pide que llamen (menú de grupo)
    intervaloMinutos: 15,     // Cada cuánto se ofrecen horas (13:15, 13:30...)
    ultimaAntesDelCierre: 45, // Minutos antes del cierre de cocina en que ya no se reserva
    diasAntelacion: 60,       // Hasta cuántos días en el futuro se puede reservar
    /* Para recibir las reservas por email: crea un formulario gratis en formspree.io
       y pega aquí su dirección (https://formspree.io/f/xxxx). Vacío = modo demostración. */
    formspree: ""
  }
};


/* Categorías de la carta, en el orden en que aparecen. */
const CATEGORIAS = [
  { id: "sugerencias", nombre: "Sugerencias" },
  { id: "picar",       nombre: "Para picar" },
  { id: "ensaladas",   nombre: "Ensaladas" },
  { id: "arroces",     nombre: "Arroces" },
  { id: "mar",         nombre: "Del mar" },
  { id: "carnes",      nombre: "Carnes" },
  { id: "peques",      nombre: "Peques" },
  { id: "postres",     nombre: "Postres" }
];

// Nombre largo de cada categoría (como en la carta del restaurante)
const TITULOS_CATEGORIA = {
  sugerencias: "Sugerencias de la casa",
  picar: "Entrantes y para picar",
  ensaladas: "Nuestras ensaladas",
  arroces: "Arroces de la casa",
  mar: "Del mar a la mesa",
  carnes: "Selección de carnes",
  peques: "Para los más peques",
  postres: "Postres"
};

/* Etiquetas que pueden llevar los platos. */
const ETIQUETAS = {
  popular: "De los más pedidos",
  compartir: "Para compartir"
};


/* Fotos: son las fotos del propio restaurante, publicadas en su web actual.
   Cada foto tiene varios tamaños y el navegador descarga solo el que necesita.
   Al publicar esta web conviene copiarlas a la carpeta img/ (en WebP). */
const FOTOS_WEB = "https://lachuleria.es/wp-content/uploads/";
const FOTOS = {
  berenjenas:    { ruta: "2024/03/BERENJENAS-CRUJIENTES", tamanos: ["768x582", "1024x776", "1536x1164"] },
  bravas:        { ruta: "2024/03/BRAVAS", tamanos: ["768x1024", "1152x1536"] },
  ensaladilla:   { ruta: "2024/03/WhatsApp-Image-2024-03-01-at-13.10.23", ext: "jpeg", tamanos: ["768x1024", "1152x1536"] },
  croqBoletus:   { ruta: "2024/03/CROQUETAS-BOLETUS", tamanos: ["768x1024", "1152x1536"] },
  croqGambas:    { ruta: "2024/03/croquetas-gambas-ajillo", tamanos: ["768x754", "1024x1006", "1536x1509"] },
  hummus:        { ruta: "2024/03/HUMMUS-DE-GARBANZOS", tamanos: ["768x1024", "1152x1536"] },
  tempura:       { ruta: "2024/03/TEMPURA-DE-GAMBON", tamanos: ["768x1024", "1152x1536"] },
  quesoCabra:    { ruta: "2024/03/QUESO-DE-CABRA-2", tamanos: ["768x501", "1024x668", "1536x1002"] },
  alcachofas:    { ruta: "2024/03/ALCACHOFAS", tamanos: ["768x459", "1024x612", "1536x919"] },
  parmPulpo:     { ruta: "2024/03/PARMENTIER-DE-PATATA-Y-PULPO", tamanos: ["768x511", "1024x681", "1536x1022"] },
  paletilla:     { ruta: "2024/03/PALETILLA-IBERICA", tamanos: ["768x511", "1024x681", "1536x1022"] },
  parmPaletilla: { ruta: "2024/03/parmentier-paletilla-y-torreznos", tamanos: ["768x921", "854x1024", "1281x1536"] },
  tresTomates:   { ruta: "2024/03/ENS-TRES-TOMATES", tamanos: ["768x1024", "1152x1536"] },
  ensPollo:      { ruta: "2024/03/ENSALADA-POLLO-CRUJIENTE", tamanos: ["768x532", "1024x709", "1536x1064"] },
  ensQueso:      { ruta: "2024/03/ENSALADA-QUESO-DE-CABRA", tamanos: ["768x472", "1024x630", "1536x945"] },
  burrata:       { ruta: "2024/03/ENS-BURRATA", tamanos: ["768x383", "1024x511", "1536x767"] },
  paella:        { ruta: "2024/03/PAELLA-DE-SECRETO-2", tamanos: ["768x511", "1024x681", "1536x1022"] },
  arrozNegro:    { ruta: "2024/03/ARROZ-NEGRO", tamanos: ["768x576", "1024x768", "1536x1152"] },

  // El local
  salaRoja:      { ruta: "2024/03/DSC5617", tamanos: ["768x511", "1024x681", "1536x1022"] },
  salaRoja2:     { ruta: "2024/03/DSC5618", tamanos: ["768x511", "1024x681", "1536x1022"] },
  salaMostaza:   { ruta: "2024/03/DSC5643", tamanos: ["768x511", "1024x681", "1536x1022"] },
  salaLuz:       { ruta: "2024/03/DSC5640", tamanos: ["768x511", "1024x681", "1536x1022"] },
  barra:         { ruta: "2024/03/DSC5771", tamanos: ["768x587", "1024x783", "1536x1174"] },
  copas:         { ruta: "2024/03/DSC5657", tamanos: ["768x511", "1024x681", "1536x1022"] },
  flores:        { ruta: "2024/03/DSC5747", tamanos: ["768x637", "1024x849", "1536x1274"] },
  floresAlta:    { ruta: "2024/03/DSC5669", tamanos: ["768x948", "830x1024", "1244x1536"] },
  mesa:          { ruta: "2024/03/DSC5631", tamanos: ["768x511", "1024x682", "1536x1022"] },
  entrada:       { ruta: "2024/01/DSC5622", tamanos: ["768x511", "1024x681", "1536x1022"] },
  parque:        { ruta: "2024/01/mueble-verde-y-salida-al-parque", tamanos: ["768x512", "1024x683", "1536x1024"] }
};


/* La carta. Campos de cada plato:
   id        -> identificador único, sin espacios (se usa en la dirección de la ficha)
   categoria -> uno de los id de CATEGORIAS
   precio    -> número (se formatea solo: 9.6 -> "9,60 €")
   corta     -> descripción de la carta
   nota      -> aclaración (unidades, suplementos, precio por kg...)
   foto      -> clave de FOTOS (sin foto = recuadro con el nombre del plato)
   alt       -> descripción de la foto
   destacado -> true para que salga en "Los imprescindibles" de la portada
   etiquetas -> claves de ETIQUETAS */
const PLATOS = [
  // ---------- Sugerencias ----------
  { id: "anchoas-santona", categoria: "sugerencias", nombre: "Anchoa extra del Cantábrico \"Casa Santoña\"", precio: 23.9, nota: "10 unidades", corta: "Anchoas extra del Cantábrico de Casa Santoña." },
  { id: "gambon-ajillo", categoria: "sugerencias", nombre: "Cazuela de gambón al ajillo y brandy al estilo de Ana", precio: 16.9, nota: "+2 € con huevos fritos", corta: "Gambón al ajillo con un golpe de brandy, como lo hace Ana." },

  // ---------- Entrantes y para picar ----------
  { id: "berenjenas-miel", categoria: "picar", nombre: "Berenjenas crujientes a la miel y soja", precio: 9.9, corta: "Berenjena frita y crujiente con miel y soja.", foto: "berenjenas", alt: "Berenjenas fritas crujientes en un cesto sobre papel de periódico" },
  { id: "bravas", categoria: "picar", nombre: "Las patatas bravas más chulas", precio: 9.6, corta: "Las bravas de la casa, con nuestra salsa brava.", foto: "bravas", alt: "Patatas bravas con salsa brava y alioli en un plato rosa", destacado: true, etiquetas: ["popular"] },
  { id: "chicharron-cadiz", categoria: "picar", nombre: "Chicharrón de Cádiz con hummus de garbanzos", precio: 12.9, corta: "Con crunch de torreznos y un toque de limón." },
  { id: "ensaladilla", categoria: "picar", nombre: "Ensaladilla rusa con langostinos", precio: 12.9, corta: "Con guacamole, atún, huevo duro y picos camperos.", foto: "ensaladilla", alt: "Ensaladilla rusa con langostinos, guacamole y picos en una fuente", destacado: true },
  { id: "croquetas-boletus", categoria: "picar", nombre: "Mini croquetas de boletus con alioli suave", precio: 10.9, corta: "Croquetitas de boletus con alioli suave.", foto: "croqBoletus", alt: "Croquetas de boletus con alioli en una bandeja blanca" },
  { id: "croquetas-gambas", categoria: "picar", nombre: "Croquetas cremosas de gambas al ajillo", precio: 12.95, corta: "Con alioli de pimentón.", foto: "croqGambas", alt: "Croquetas de gambas al ajillo con alioli de pimentón", destacado: true },
  { id: "hummus", categoria: "picar", nombre: "Hummus de garbanzos y albahaca", precio: 9.9, corta: "Con nueces, tomate seco confitado y pan pita.", foto: "hummus", alt: "Hummus con nueces y tomate seco acompañado de pan de pita" },
  { id: "pate-perdiz", categoria: "picar", nombre: "Paté de perdiz \"Real Carolina\" con AOVE de cosecha temprana \"Olievo\"", precio: 12.9, corta: "Con pimienta rosa y tostaditas." },
  { id: "tempura-gambon", categoria: "picar", nombre: "Tempura de gambón en brocheta con salsa kaysou", precio: 12.7, nota: "8 unidades", corta: "Brochetas de gambón en tempura con salsa kaysou.", foto: "tempura", alt: "Brochetas de gambón en tempura sobre papel de periódico", destacado: true },
  { id: "coca-pulpo", categoria: "picar", nombre: "Coca de pulpo braseado con mojo rojo al queso de cabra", precio: 16.9, corta: "Con rúcula, AOVE y pimentón de la Vera." },
  { id: "queso-cabra-foie", categoria: "picar", nombre: "Queso de cabra gratinado con foie", precio: 13.5, corta: "Con pasas al Pedro Ximénez.", foto: "quesoCabra", alt: "Queso de cabra gratinado con foie y reducción de Pedro Ximénez", destacado: true, etiquetas: ["popular"] },
  { id: "alcachofas", categoria: "picar", nombre: "Alcachofas confitadas con paletilla ibérica", precio: 18.6, corta: "Con huevo frito trufado y sal Maldon.", foto: "alcachofas", alt: "Alcachofas confitadas con paletilla ibérica y huevo", destacado: true },
  { id: "parmentier-pulpo", categoria: "picar", nombre: "Parmentier de patata, huevos rotos y pulpo", precio: 14.9, corta: "Al pimentón ahumado de la Vera.", foto: "parmPulpo", alt: "Parmentier de patata con huevos rotos y pulpo al pimentón" },
  { id: "tabla-paletilla", categoria: "picar", nombre: "Nuestra tabla de paletilla ibérica y queso puro de oveja", precio: 18.9, corta: "Con pan de coca tostado y tomate aliñado.", foto: "paletilla", alt: "Tabla de paletilla ibérica con pan de coca y tomate" },
  { id: "parmentier-paletilla", categoria: "picar", nombre: "Parmentier de patata, huevos rotos, paletilla ibérica y torreznos crujientes", precio: 12.9, corta: "Patata cremosa, huevos rotos, paletilla ibérica y torreznos.", foto: "parmPaletilla", alt: "Parmentier de patata con huevos rotos, paletilla y torreznos" },
  { id: "sardina-marinada", categoria: "picar", nombre: "Lomito de sardina marinada", precio: 3.5, nota: "1 unidad", corta: "Sobre tosta de focaccia al pomodoro y albahaca." },

  // ---------- Ensaladas ----------
  { id: "ensalada-bacalao", categoria: "ensaladas", nombre: "Ensalada de bacalao ahumado, tomate aliñado y alcaparras", precio: 16.9, corta: "Bacalao ahumado sobre tomate aliñado con alcaparras." },
  { id: "ensalada-tres-tomates", categoria: "ensaladas", nombre: "Ensalada de 3 tomates con ventresca de atún", precio: 14.9, corta: "Con cebolla morada, piparras y sal Maldon.", foto: "tresTomates", alt: "Ensalada de tomate con ventresca de atún, cebolla morada y piparras" },
  { id: "ensalada-pollo", categoria: "ensaladas", nombre: "Ensalada de pollo crujiente", precio: 13.9, corta: "Bacon, parmesano, dados de pan tostado y salsa César.", foto: "ensPollo", alt: "Ensalada César con pollo crujiente y bacon" },
  { id: "ensalada-queso-mango", categoria: "ensaladas", nombre: "Ensalada de queso de cabra y mango", precio: 13.9, corta: "Con granola y vinagreta de balsámico y miel.", foto: "ensQueso", alt: "Ensalada con queso de cabra, mango y granola" },
  { id: "burrata", categoria: "ensaladas", nombre: "Burrata cremosa (250 g) y \"Pesto Rosso\"", precio: 14.9, corta: "Con espinacas frescas y nueces.", foto: "burrata", alt: "Burrata con pesto rosso sobre espinacas frescas" },

  // ---------- Arroces de la casa ----------
  { id: "paella-juanma", categoria: "arroces", nombre: "La paella de Juanma", precio: 16.9, corta: "Con secreto ibérico, pollo y verduras de la huerta.", foto: "paella", alt: "Paella de secreto ibérico, pollo y verduras en su paellera", destacado: true },
  { id: "arroz-negro", categoria: "arroces", nombre: "Arroz negro con calamarcitos en su tinta", precio: 17.9, corta: "Con alioli casero.", foto: "arrozNegro", alt: "Arroz negro con calamarcitos en la paellera", destacado: true },
  { id: "arroz-pulpo-carabineros", categoria: "arroces", nombre: "Arroz meloso con pulpo y carabineros", precio: 19.9, corta: "Arroz meloso de pulpo y carabineros." },
  { id: "risotto-boletus", categoria: "arroces", nombre: "Risotto meloso de boletus al aroma de trufa y parmesano", precio: 16.9, corta: "Risotto de boletus con trufa y parmesano." },
  { id: "arroz-rabo-toro", categoria: "arroces", nombre: "Arroz de nuestro chef Alfredo con rabo de toro estofado y alcachofas", precio: 22.9, corta: "El arroz de Alfredo: rabo de toro estofado y alcachofas." },

  // ---------- Del mar a la mesa ----------
  { id: "langostinos-tikka", categoria: "mar", nombre: "Langostinos salteados al tikka masala", precio: 13.9, corta: "Con arroz frito, verduritas y setas shiitake." },
  { id: "calamarcitos", categoria: "mar", nombre: "Calamarcitos de potera a la plancha", precio: 15.9, corta: "Con morcilla de cebolla bien confitada." },
  { id: "bacalao-alioli", categoria: "mar", nombre: "Lomo de bacalao gratinado al alioli sobre pisto casero", precio: 19.9, corta: "Bacalao gratinado con alioli sobre pisto casero." },
  { id: "tartar-atun", categoria: "mar", nombre: "Tartar de atún rojo a nuestro estilo", precio: 17.6, corta: "Con auténtico guacamole casero." },
  { id: "tataki-salmon", categoria: "mar", nombre: "Dados de salmón en tataki", precio: 17.9, corta: "Con algas wakame, chutney de mango, soja, sésamo y pimienta rosa." },

  // ---------- Selección de carnes ----------
  { id: "pollo-curry", categoria: "carnes", nombre: "Pollo confitado al curry", precio: 13.9, corta: "Con verduritas y fideos vermicelli." },
  { id: "tacos-costillar", categoria: "carnes", nombre: "Tacos de costillar BBQ", precio: 16.95, nota: "3 unidades", corta: "Costillar deshuesado con yogur griego especiado y cilantro fresco." },
  { id: "chuletillas-cordero", categoria: "carnes", nombre: "Chuletillas de cordero glaseadas a la plancha", precio: 18.9, corta: "Marinadas en miel, soja y vino, con \"las papas de la Chule\"." },
  { id: "t-bone", categoria: "carnes", nombre: "T-bone de vaca madurada (+30 días) a la plancha", precio: 56.9, nota: "Precio por kg", corta: "Con patatas deluxe, pimientos de Gernika y cherris.", etiquetas: ["compartir"] },
  { id: "costillar-angus", categoria: "carnes", nombre: "Costillar de Angus asado en su jugo a baja temperatura", precio: 22.9, corta: "Con patatas y pimientos de Padrón." },
  { id: "burger-cabra", categoria: "carnes", nombre: "Burger con queso de cabra", precio: 14.9, nota: "180 g de vaca madurada", corta: "Con espinacas frescas, cebolla caramelizada y patatas deluxe." },
  { id: "codillo", categoria: "carnes", nombre: "Codillo de cerdo asado a baja temperatura", precio: 18.9, corta: "Con parmentier de patata y chucrut." },
  { id: "entrecot", categoria: "carnes", nombre: "Entrecot de ternera a la plancha", precio: 20.9, nota: "300 g", corta: "Con patatas deluxe y pimientos de Gernika." },
  { id: "rabo-boniato", categoria: "carnes", nombre: "Cazuelita de rabo de vacuno desmigado sobre boniato asado", precio: 25.9, corta: "Rabo de vacuno desmigado sobre boniato asado." },
  { id: "carrillada", categoria: "carnes", nombre: "Lingote de carrillada de ternera estofada al vino tinto", precio: 23.6, corta: "Con dados de calabaza confitada." },

  // ---------- Para los más peques ----------
  { id: "fingers-pollo", categoria: "peques", nombre: "Fingers de pollo crujiente con patatas deluxe", precio: 8.5, corta: "Tiras de pollo crujiente con patatas." },
  { id: "croquetas-jamon-peques", categoria: "peques", nombre: "Croquetas de jamón con patatas deluxe", precio: 8, nota: "6 unidades", corta: "Croquetas de jamón con patatas." },
  { id: "salchichas", categoria: "peques", nombre: "Salchichas Frankfurt con huevo frito y patatas deluxe", precio: 8.5, corta: "Salchichas, huevo frito y patatas." },
  { id: "burger-peques", categoria: "peques", nombre: "Burger clásica con patatas deluxe", precio: 8.9, corta: "Con lechuga, tomate y queso." },

  // ---------- Postres ----------
  { id: "flan", categoria: "postres", nombre: "Flan de huevo de la casa", precio: 4.9, corta: "Con nata montada." },
  { id: "cheesecake", categoria: "postres", nombre: "Royal Cheesecake", precio: 6.5, corta: "Con sorbete de frambuesas." },
  { id: "kuchen", categoria: "postres", nombre: "Kuchen de nueces y helado de turrón", precio: 6.5, corta: "Con crema quemada y chocolate fundido." },
  { id: "helados", categoria: "postres", nombre: "Helado de sabores", precio: 4.5, corta: "Vainilla, chocolate, fresa, leche merengada, sorbete de frambuesa o de limón." },
  { id: "torrija", categoria: "postres", nombre: "Torrija de pan de brioche caramelizada", precio: 6.7, corta: "Con helado de leche merengada y canela." },
  { id: "tiramisu", categoria: "postres", nombre: "Tiramisú cremoso hecho al momento", precio: 6.4, corta: "Lo montamos cuando lo pides." },
  { id: "brownie", categoria: "postres", nombre: "Brownie cremoso de chocolate", precio: 6.5, corta: "Con helado de vainilla y chocolate fundido." }
];


/* Bebidas (en la carta completa). Precio en texto porque algunas tienen dos formatos. */
const BEBIDAS = [
  {
    id: "tintos", nombre: "Vinos tintos",
    lista: [
      ["Legaris Roble", "D.O. Ribera del Duero", "19,00 €"],
      ["La Planta Arzuaga", "D.O. Ribera del Duero", "19,00 €"],
      ["Finca Resalso Cosecha", "D.O. Ribera del Duero", "23,00 €"],
      ["Carmelo Rodero 9 meses", "D.O. Ribera del Duero", "29,00 €"],
      ["Matarromera Crianza", "D.O. Ribera del Duero", "37,00 €"],
      ["Muga Crianza", "D.O. Rioja", "35,00 €"],
      ["Viña Pomal Centenario Crianza", "D.O. Rioja", "19,00 €"],
      ["Ramón Bilbao Crianza", "D.O. Rioja", "21,00 €"],
      ["La Mateo Cosecha 2021", "D.O. Rioja", "32,00 €"],
      ["Viñas del Vero", "D.O. Somontano", "18,00 €"],
      ["La Escucha Crianza", "D.O. Bierzo", "21,00 €"],
      ["24 Mozas Crianza", "D.O. Toro", "21,00 €"],
      ["Habla del Silencio", "V.T. Extremadura", "24,00 €"]
    ]
  },
  {
    id: "blancos", nombre: "Blancos, rosado y cava",
    lista: [
      ["Árabe Aguja Semidulce", "V.T. Extremadura", "16,00 €"],
      ["Ramón Bilbao Verdejo", "D.O. Rueda", "18,00 €"],
      ["José Pariente Verdejo", "D.O. Rueda", "23,00 €"],
      ["Faustino Rivero Albariño", "D.O. Rías Baixas", "18,00 €"],
      ["Conde del Pazo Godello", "D.O. Bierzo", "17,50 €"],
      ["Doña Isabella Rosado", "D.O. Navarra", "17,00 €"],
      ["Anna de Codorníu Blanc de Blancs", "Cava", "21,00 €"],
      ["Codorníu Cuvée Original Brut", "Cava ecológico", "15,00 €"]
    ]
  },
  {
    id: "cervezas", nombre: "Cervezas",
    lista: [
      ["El Águila Dorada", "Nacional · suave y refrescante", "3,00 € copa · 3,00 € botella 33 cl"],
      ["El Águila Sin Filtrar", "Nacional · suave y refrescante", "3,10 € botella 33 cl"],
      ["Amstel Radler", "Nacional · suave y refrescante", "3,00 € copa"],
      ["Cruzcampo Sin Gluten", "Nacional · suave y refrescante", "3,00 € botella 33 cl"],
      ["18/70", "Nacional · suave y refrescante", "3,20 € botella 33 cl"],
      ["Cruzcampo Gran Reserva", "Nacional · tostada y con cuerpo", "3,50 € botella 33 cl"],
      ["El Alcázar", "Nacional · suave y refrescante", "3,00 € botella 33 cl"],
      ["Amstel Oro Tostada", "Nacional · tostada y con cuerpo", "3,50 € botella 33 cl"],
      ["Amstel Oro 0,0 Tostada", "Nacional · tostada y con cuerpo", "3,20 € botella 33 cl"],
      ["Heineken 0,0", "Del mundo · suave y refrescante", "3,25 € botella 33 cl"],
      ["Heineken Silver", "Del mundo · suave y refrescante", "3,00 € botella 33 cl"],
      ["Heineken", "Del mundo · suave y refrescante", "3,20 € botella 33 cl"],
      ["Paulaner Weissbier", "Trigo · refrescante y afrutada", "5,20 € botella 50 cl"],
      ["Ladrón de Manzanas", "Sidra · manzanas dulces y ácidas", "3,00 € botella 33 cl"],
      ["Desperados", "Nuevos sabores", "3,50 € botella 33 cl"]
    ]
  }
];
