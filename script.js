// Campos principales
const campoFuncion = document.getElementById('entradaFuncion');
const campoVariable = document.getElementById('entradaVariable');
const campoLimiteInferior = document.getElementById('limiteInferior');
const campoLimiteSuperior = document.getElementById('limiteSuperior');
const areaResultado = document.getElementById('areaResultado');
const mensajeIntegral = document.getElementById('mensajeIntegral');
const N_PASOS_INTEGRAL = 10000;

// Inserta texto en el campo
function insertarTexto(t) {
    const ini = campoFuncion.selectionStart;
    const fin = campoFuncion.selectionEnd;
    const val = campoFuncion.value;
    campoFuncion.value = val.substring(0, ini) + t + val.substring(fin);
    let pos = ini + t.length;
    if (t.endsWith('(')) pos -= 1;
    campoFuncion.selectionStart = pos;
    campoFuncion.selectionEnd = pos;
    campoFuncion.focus();
}

// Limpia entrada
function limpiarEntrada() {
    campoFuncion.value = '';
    campoFuncion.focus();
}

// Muestra resultados
function mostrarResultado(msg, err = false) {
    areaResultado.textContent = msg;
    areaResultado.classList.toggle('text-red-600', err);
    areaResultado.classList.toggle('text-gray-900', !err);
    mensajeIntegral.classList.add('hidden');
}

// Procesa texto para math.js
function preprocesarExpresion(e) {
    e = e.trim();
    e = e.replace(/sen/gi, 'sin');
    e = e.replace(/ln/gi, 'log');
    e = e.replace(/(\s*d[a-z]\s*)$/i, '');
    return e;
}

// Compila función
function compilarFuncion(e) {
    try { return math.compile(e); }
    catch (err) { mostrarResultado(`Error de sintaxis: ${err.message}`, true); return null; }
}

// Derivada simbólica
function calcularDerivada() {
    let exp = campoFuncion.value;
    const v = campoVariable.value.trim() || 'x';
    if (!exp) { mostrarResultado("Por favor, introduce una función.", true); return; }
    exp = preprocesarExpresion(exp);
    try {
        const der = math.derivative(exp, v);
        const res = der.toString({ parenthesis: 'auto', implicit: 'hide' }).replace(/1 \* /g, '');
        mostrarResultado(`d/d${v} [${exp}] = ${res}`);
    } catch (err) {
        mostrarResultado(`Error al derivar: ${err.message}`, true);
    }
}

// Integral numérica
function calcularIntegralDefinida() {
    let exp = campoFuncion.value;
    const v = campoVariable.value.trim() || 'x';
    const a = parseFloat(campoLimiteInferior.value);
    const b = parseFloat(campoLimiteSuperior.value);
    if (!exp || isNaN(a) || isNaN(b)) { mostrarResultado("Por favor, introduce la función y límites válidos.", true); return; }
    exp = preprocesarExpresion(exp);
    const f = compilarFuncion(exp);
    if (!f) return;
    const n = N_PASOS_INTEGRAL, h = (b - a) / n;
    const signo = a > b ? -1 : 1;
    const ini = Math.min(a, b), fin = Math.max(a, b);
    let integral = 0;
    try {
        const evalF = x => f.evaluate({ [v]: x });
        integral += (evalF(ini) + evalF(fin)) / 2;
        for (let i = 1; i < n; i++) integral += evalF(ini + i * h);
        integral *= h * signo;
        mostrarResultado(`El valor de la integral definida de ${exp} entre ${a} y ${b} es ≈ ${integral.toFixed(8)}`);
        mensajeIntegral.classList.remove('hidden');
    } catch (err) {
        mostrarResultado(`Error al integrar: ${err.message}`, true);
    }
}

// Fondo animado con partículas
const canvas = document.getElementById('particulas');
const ctx = canvas.getContext('2d');
let w, h;
const estrellas = [];

function resize() {
    w = canvas.width = window.innerWidth;
    h = canvas.height = Math.max(window.innerHeight, document.body.scrollHeight);
}

// Genera partículas
function crearEstrellas() {
    for (let i = 0; i < 150; i++) {
        estrellas.push({
            x: Math.random() * w,
            y: Math.random() * h,
            r: Math.random() * 1.8 + 0.5,
            v: Math.random() * 0.3 + 0.1
        });
    }
}

// Animación simple
function animar() {
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.8)';
    for (let e of estrellas) {
        ctx.beginPath();
        ctx.arc(e.x, e.y, e.r, 0, Math.PI * 2);
        ctx.fill();
        e.y += e.v;
        if (e.y > h) e.y = 0;
    }
    requestAnimationFrame(animar);
}

window.addEventListener('resize', resize);
resize();
crearEstrellas();
animar();
