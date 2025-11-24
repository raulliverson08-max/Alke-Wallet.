/* ============================================================
    SISTEMA CENTRALIZADO - app.js
    Maneja: saldo, contactos, transacciones, UI y validaciones
   ============================================================ */


/* ============================================================
    LOCAL STORAGE - FUNCIONES BASE
   ============================================================ */

function getSaldo() {
    return parseInt(localStorage.getItem("saldo") || "0");
}

function setSaldo(nuevoSaldo) {
    localStorage.setItem("saldo", nuevoSaldo);
}

function getTransacciones() {
    return JSON.parse(localStorage.getItem("transacciones") || "[]");
}

function addTransaccion(tipo, monto) {
    const lista = getTransacciones();
    lista.push({
        tipo: tipo,
        monto: monto,
        fecha: new Date().toLocaleString()
    });

    localStorage.setItem("transacciones", JSON.stringify(lista));
}

function getContactos() {
    return JSON.parse(localStorage.getItem("contactos") || "[]");
}

function setContactos(lista) {
    localStorage.setItem("contactos", JSON.stringify(lista));
}


/* ============================================================
    VALIDACIONES
   ============================================================ */

function validarEmail(email) {
    return /\S+@\S+\.\S+/.test(email);
}

function validarCBU(cbu) {
    return /^\d{12}$/.test(cbu);
}

function validarNumero(valor) {
    return !isNaN(valor) && valor > 0;
}


/* ============================================================
    UI - ALERTAS BOOTSTRAP
   ============================================================ */

function showAlert(containerId, mensaje, tipo) {
    document.getElementById(containerId).innerHTML = `
        <div class="alert alert-${tipo}">${mensaje}</div>
    `;
}

function limpiarAlert(containerId) {
    document.getElementById(containerId).innerHTML = "";
}


/* ============================================================
    REDIRECCIONES
   ============================================================ */

function goTo(page) {
    window.location.href = page;
}

function goToDelay(page, delay = 1500) {
    setTimeout(() => {
        window.location.href = page;
    }, delay);
}


/* ============================================================
    CONTACTOS - FUNCIONALIDADES
   ============================================================ */

function agregarContacto(nombre, cbu) {
    const lista = getContactos();
    lista.push({ nombre, cbu });
    setContactos(lista);
}

function buscarContactos(filtro) {
    const lista = getContactos();
    return lista.filter(c =>
        c.nombre.toLowerCase().includes(filtro.toLowerCase())
    );
}


/* ============================================================
    TRANSACCIONES - FILTRADO
   ============================================================ */

function filtrarTransacciones(tipo) {
    const lista = getTransacciones();

    if (tipo === "todos") return lista;

    return lista.filter(t => t.tipo === tipo);
}


/* ============================================================
    OPERACIONES PRINCIPALES
   ============================================================ */

// DEPÓSITO
function realizarDeposito(monto) {
    const saldoActual = getSaldo();
    const nuevoSaldo = saldoActual + monto;

    setSaldo(nuevoSaldo);
    addTransaccion("depósito", monto);

    return nuevoSaldo;
}

// ENVÍO DE DINERO (solo registra movimiento)
function enviarDineroA(contacto, monto) {
    addTransaccion("transferencia enviada", monto);
}


/* ============================================================
    UTILIDADES
   ============================================================ */

function formatearDinero(valor) {
    return "$" + valor.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ".");
}

function vacio(valor) {
    return valor.trim() === "";
}


/* ============================================================
    RESET GENERAL (ÚTIL EN DESARROLLO)
   ============================================================ */

function resetApp() {
    localStorage.removeItem("saldo");
    localStorage.removeItem("contactos");
    localStorage.removeItem("transacciones");
    alert("Sistema reiniciado.");
}
