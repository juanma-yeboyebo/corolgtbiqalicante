const HASH_CONTRASENA = '2947d73cebda89071e9846cdca207323a4cafe3a1dda12024b2c08482f720bb0';
const CLAVE_SESION = 'coroSesion';
const TIPOS = [
    { campo: 'letras', contenedor: 'guionContainer', clase: 'guion-item', vacio: 'No hay letras disponibles' },
    { campo: 'audios', contenedor: 'audioContainer', clase: 'audio-item', vacio: 'No hay audios disponibles' },
    { campo: 'partituras', contenedor: 'partituraContainer', clase: 'partitura-item', vacio: 'No hay partituras disponibles' }
];

function crear(etiqueta, props = {}, hijos = []) {
    const el = Object.assign(document.createElement(etiqueta), props);
    el.append(...hijos);
    return el;
}

async function sha256(texto) {
    const buf = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(texto));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, '0')).join('');
}

function ruta(cancion, fichero) {
    return `canciones/${encodeURIComponent(cancion.carpeta)}/${encodeURIComponent(fichero)}`;
}

function nombreVisible(cancion, fichero) {
    const base = fichero.replace(/\.[^.]+$/, '');
    const sinPrefijo = base.toLowerCase().startsWith(cancion.nombre.toLowerCase())
        ? base.slice(cancion.nombre.length).trim()
        : base;
    return sinPrefijo || base;
}

function mostrarLogin() {
    document.getElementById('loginScreen').style.display = 'flex';
    document.getElementById('appScreen').style.display = 'none';
}

function mostrarApp() {
    document.getElementById('loginScreen').style.display = 'none';
    document.getElementById('appScreen').style.display = 'flex';
    pintarCanciones(CANCIONES);
}

function mostrarError(mensaje) {
    const el = document.getElementById('errorMessage');
    el.textContent = mensaje;
    el.classList.add('show');
    setTimeout(() => el.classList.remove('show'), 3000);
}

function pintarCanciones(lista) {
    const grid = document.getElementById('songsList');
    grid.replaceChildren();
    if (lista.length === 0) {
        grid.append(crear('p', { textContent: 'No se encontraron canciones', style: 'grid-column: 1/-1; text-align: center; color: white;' }));
        return;
    }
    for (const cancion of lista) {
        const fila = (texto, n) => crear('div', { className: 'song-info-item' }, [crear('span', { textContent: texto }), crear('strong', { textContent: n })]);
        grid.append(crear('div', { className: 'song-card' }, [
            crear('div', { className: 'song-card-header' }, [crear('h3', { textContent: `🎵 ${cancion.nombre}` })]),
            crear('div', { className: 'song-card-body' }, [
                fila('📝 Letras:', cancion.letras?.length || 0),
                fila('🎧 Audios:', cancion.audios?.length || 0),
                fila('📄 Partituras:', cancion.partituras?.length || 0),
                crear('button', { className: 'btn-view', textContent: 'Ver todos los archivos', onclick: () => abrirCancion(cancion) })
            ])
        ]));
    }
}

function cambiarPestana(nombre) {
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.toggle('active', b.dataset.tab === nombre));
    document.querySelectorAll('.tab-content').forEach(t => t.classList.toggle('active', t.id === `${nombre}-tab`));
}

function abrirPantallaCompleta(url) {
    const capa = crear('div', { className: 'pdf-fullscreen' });
    const cerrar = () => { capa.remove(); document.removeEventListener('keydown', alPulsar); };
    const alPulsar = e => { if (e.key === 'Escape') cerrar(); };
    capa.append(
        crear('button', { className: 'pdf-fullscreen-close', textContent: '✕', onclick: cerrar }),
        crear('iframe', { className: 'pdf-fullscreen-viewer', src: url })
    );
    document.addEventListener('keydown', alPulsar);
    document.body.append(capa);
}

function elementoArchivo(cancion, campo, fichero) {
    const url = ruta(cancion, fichero);
    const nombre = nombreVisible(cancion, fichero);
    const descarga = crear('a', { className: 'btn-download', href: url, download: fichero, textContent: 'Descargar' });
    if (campo === 'audios') {
        return [crear('h4', { textContent: `🎵 ${nombre}` }), crear('audio', { controls: true, preload: 'none', src: url }), descarga];
    }
    return [
        crear('h4', { textContent: nombre }),
        crear('a', { className: 'btn-download', href: '#', textContent: 'Ver', onclick: e => { e.preventDefault(); abrirPantallaCompleta(url); } }),
        descarga
    ];
}

function abrirCancion(cancion) {
    document.getElementById('modalSongTitle').textContent = cancion.nombre;
    for (const tipo of TIPOS) {
        const contenedor = document.getElementById(tipo.contenedor);
        const ficheros = cancion[tipo.campo] || [];
        contenedor.replaceChildren(...(ficheros.length
            ? ficheros.map(f => crear('div', { className: tipo.clase }, elementoArchivo(cancion, tipo.campo, f)))
            : [crear('p', { className: 'loading', textContent: tipo.vacio })]));
    }
    cambiarPestana('guion');
    document.getElementById('songModal').style.display = 'flex';
}

function cerrarCancion() {
    document.querySelectorAll('#songModal audio').forEach(a => a.pause());
    document.getElementById('songModal').style.display = 'none';
}

async function alEnviarLogin(e) {
    e.preventDefault();
    const input = document.getElementById('password');
    if (await sha256(input.value) === HASH_CONTRASENA) {
        sessionStorage.setItem(CLAVE_SESION, '1');
        input.value = '';
        mostrarApp();
    } else {
        mostrarError('Contraseña incorrecta. Intenta de nuevo.');
        input.value = '';
        input.focus();
    }
}

function cerrarSesion() {
    if (!confirm('¿Seguro que quieres cerrar sesión?')) return;
    sessionStorage.removeItem(CLAVE_SESION);
    mostrarLogin();
}

function iniciar() {
    document.getElementById('loginForm').addEventListener('submit', alEnviarLogin);
    document.getElementById('logoutBtn').addEventListener('click', cerrarSesion);
    document.getElementById('searchInput').addEventListener('input', e => {
        const texto = e.target.value.toLowerCase();
        pintarCanciones(CANCIONES.filter(c => c.nombre.toLowerCase().includes(texto)));
    });
    document.querySelector('.modal-close').addEventListener('click', cerrarCancion);
    document.getElementById('songModal').addEventListener('click', e => { if (e.target.id === 'songModal') cerrarCancion(); });
    document.querySelectorAll('.tab-btn').forEach(b => b.addEventListener('click', () => cambiarPestana(b.dataset.tab)));

    if (sessionStorage.getItem(CLAVE_SESION) === '1') mostrarApp();
    else mostrarLogin();
}

document.addEventListener('DOMContentLoaded', iniciar);
