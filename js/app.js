const HASH_CONTRASENA =
  "2947d73cebda89071e9846cdca207323a4cafe3a1dda12024b2c08482f720bb0";
const CLAVE_SESION = "coroSesion";
const TIPOS = [
  {
    campo: "letras",
    contenedor: "guionContainer",
    vacio: "No hay letras disponibles",
  },
  {
    campo: "audios",
    contenedor: "audioContainer",
    vacio: "No hay audios disponibles",
  },
  {
    campo: "partituras",
    contenedor: "partituraContainer",
    vacio: "No hay partituras disponibles",
  },
];

const ICONOS = {
  letra:
    '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M16 13H8"/><path d="M16 17H8"/>',
  audio:
    '<path d="M3 14h3a2 2 0 0 1 2 2v3a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-7a9 9 0 0 1 18 0v7a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3"/>',
  partitura:
    '<path d="M9 18V5l12-2v13"/><circle cx="6" cy="18" r="3"/><circle cx="18" cy="16" r="3"/>',
  flecha: '<path d="m9 18 6-6-6-6"/>',
  cerrar: '<path d="M18 6 6 18"/><path d="m6 6 12 12"/>',
  ver: '<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"/><circle cx="12" cy="12" r="3"/>',
  descargar:
    '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><path d="m7 10 5 5 5-5"/><path d="M12 15V3"/>',
};

function icono(nombre) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("class", "icono");
  svg.innerHTML = ICONOS[nombre];
  return svg;
}

function crear(etiqueta, props = {}, hijos = []) {
  const el = Object.assign(document.createElement(etiqueta), props);
  el.append(...hijos);
  return el;
}

async function sha256(texto) {
  const buf = await crypto.subtle.digest(
    "SHA-256",
    new TextEncoder().encode(texto),
  );
  return [...new Uint8Array(buf)]
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

function ruta(cancion, fichero) {
  return `canciones/${encodeURIComponent(cancion.carpeta)}/${encodeURIComponent(fichero)}`;
}

function nombreVisible(cancion, fichero) {
  const base = fichero.replace(/\.[^.]+$/, "");
  const sinPrefijo = base.toLowerCase().startsWith(cancion.nombre.toLowerCase())
    ? base.slice(cancion.nombre.length).trim()
    : base;
  return sinPrefijo || base;
}

function mostrarLogin() {
  document.getElementById("loginScreen").style.display = "flex";
  document.getElementById("appScreen").style.display = "none";
}

function mostrarApp() {
  document.getElementById("loginScreen").style.display = "none";
  document.getElementById("appScreen").style.display = "flex";
  pintarCanciones(CANCIONES);
}

function mostrarError(mensaje) {
  const el = document.getElementById("errorMessage");
  el.textContent = mensaje;
  el.classList.add("show");
  setTimeout(() => el.classList.remove("show"), 3000);
}

function pintarCanciones(lista) {
  const grid = document.getElementById("songsList");
  grid.replaceChildren();
  if (lista.length === 0) {
    grid.append(
      crear("p", {
        className: "vacio",
        textContent: "No se encontraron canciones",
      }),
    );
    return;
  }
  for (const cancion of lista) {
    const insignia = (nombreIcono, titulo, n) =>
      crear("span", { className: "badge", title: titulo }, [
        icono(nombreIcono),
        crear("span", { textContent: n }),
      ]);
    grid.append(
      crear(
        "button",
        { className: "song-card", onclick: () => abrirCancion(cancion) },
        [
          crear("div", { className: "song-card-info" }, [
            crear("h3", { textContent: cancion.nombre }),
            crear("div", { className: "badges" }, [
              insignia("letra", "Letras", cancion.letras?.length || 0),
              insignia("audio", "Audios", cancion.audios?.length || 0),
              insignia(
                "partitura",
                "Partituras",
                cancion.partituras?.length || 0,
              ),
            ]),
          ]),
          icono("flecha"),
        ],
      ),
    );
  }
}

function cambiarPestana(nombre) {
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) => b.classList.toggle("active", b.dataset.tab === nombre));
  document
    .querySelectorAll(".tab-content")
    .forEach((t) => t.classList.toggle("active", t.id === `${nombre}-tab`));
}

async function abrirPantallaCompleta(url) {
  const hoja = crear("div", { className: "pdf-paginas" }, [
    crear("p", { className: "pdf-cargando", textContent: "Cargando…" }),
  ]);
  const capa = crear("div", { className: "pdf-fullscreen" });
  const cerrar = () => {
    capa.remove();
    document.removeEventListener("keydown", alPulsar);
  };
  const alPulsar = (e) => {
    if (e.key === "Escape") cerrar();
  };
  capa.append(
    crear(
      "button",
      {
        className: "pdf-fullscreen-close",
        ariaLabel: "Cerrar",
        onclick: cerrar,
      },
      [icono("cerrar")],
    ),
    hoja,
  );
  document.addEventListener("keydown", alPulsar);
  document.body.append(capa);

  try {
    pdfjsLib.GlobalWorkerOptions.workerSrc =
      "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";
    const pdf = await pdfjsLib.getDocument(url).promise;
    const ancho = hoja.clientWidth;
    hoja.replaceChildren();
    for (let i = 1; i <= pdf.numPages && capa.isConnected; i++) {
      const pagina = await pdf.getPage(i);
      const escala = ancho / pagina.getViewport({ scale: 1 }).width;
      const vista = pagina.getViewport({
        scale: escala * window.devicePixelRatio,
      });
      const lienzo = crear("canvas", {
        width: vista.width,
        height: vista.height,
      });
      hoja.append(lienzo);
      await pagina.render({
        canvasContext: lienzo.getContext("2d"),
        viewport: vista,
      }).promise;
    }
  } catch {
    hoja.replaceChildren(
      crear("iframe", { className: "pdf-fullscreen-viewer", src: url }),
    );
  }
}

function elementoArchivo(cancion, campo, fichero) {
  const url = ruta(cancion, fichero);
  const nombre = nombreVisible(cancion, fichero);
  const tipo = { letras: "letra", audios: "audio", partituras: "partitura" }[
    campo
  ];
  const acciones = crear("div", { className: "acciones" });
  if (campo !== "audios") {
    acciones.append(
      crear(
        "button",
        {
          className: "boton boton-principal",
          onclick: () => abrirPantallaCompleta(url),
        },
        [icono("ver"), crear("span", { textContent: "Ver" })],
      ),
    );
  }
  acciones.append(
    crear("a", { className: "boton", href: url, download: fichero }, [
      icono("descargar"),
      crear("span", { textContent: "Descargar" }),
    ]),
  );
  const partes = [
    crear("div", { className: "archivo-nombre" }, [
      icono(tipo),
      crear("span", { textContent: nombre }),
    ]),
    acciones,
  ];
  if (campo === "audios") {
    partes.push(crear("audio", { controls: true, preload: "none", src: url }));
  }
  return partes;
}

function abrirCancion(cancion) {
  document.getElementById("modalSongTitle").textContent = cancion.nombre;
  for (const tipo of TIPOS) {
    const contenedor = document.getElementById(tipo.contenedor);
    const ficheros = cancion[tipo.campo] || [];
    contenedor.replaceChildren(
      ...(ficheros.length
        ? ficheros.map((f) =>
            crear(
              "div",
              { className: "archivo" },
              elementoArchivo(cancion, tipo.campo, f),
            ),
          )
        : [crear("p", { className: "vacio", textContent: tipo.vacio })]),
    );
  }
  cambiarPestana("guion");
  document.getElementById("songModal").style.display = "flex";
}

function cerrarCancion() {
  document.querySelectorAll("#songModal audio").forEach((a) => a.pause());
  document.getElementById("songModal").style.display = "none";
}

async function alEnviarLogin(e) {
  e.preventDefault();
  const input = document.getElementById("password");
  if ((await sha256(input.value)) === HASH_CONTRASENA) {
    sessionStorage.setItem(CLAVE_SESION, "1");
    input.value = "";
    mostrarApp();
  } else {
    mostrarError("Contraseña incorrecta. Intenta de nuevo.");
    input.value = "";
    input.focus();
  }
}

function iniciar() {
  document
    .getElementById("loginForm")
    .addEventListener("submit", alEnviarLogin);
  document.getElementById("searchInput").addEventListener("input", (e) => {
    const texto = e.target.value.toLowerCase();
    pintarCanciones(
      CANCIONES.filter((c) => c.nombre.toLowerCase().includes(texto)),
    );
  });
  document
    .querySelector(".modal-close")
    .addEventListener("click", cerrarCancion);
  document.getElementById("songModal").addEventListener("click", (e) => {
    if (e.target.id === "songModal") cerrarCancion();
  });
  document
    .querySelectorAll(".tab-btn")
    .forEach((b) =>
      b.addEventListener("click", () => cambiarPestana(b.dataset.tab)),
    );

  if (sessionStorage.getItem(CLAVE_SESION) === "1") mostrarApp();
  else mostrarLogin();
}

document.addEventListener("DOMContentLoaded", iniciar);
