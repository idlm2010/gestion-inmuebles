import "../styles/pagos-alquiler.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerPagos,
    crearPago,
    actualizarPago,
    eliminarPago
} from "../services/pagosAlquiler.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    formatearMoneda,
    crearBotonAccion
} from "../utils/formato.js";

const pagosTitle = document.getElementById("pagos-title");
const pagosList = document.getElementById("pagos-list");
const addPagoBtn = document.getElementById("add-pago-btn");
const backToFichaFromPagosBtn = document.getElementById("back-to-ficha-from-pagos-btn");

const addPagoForm = document.getElementById("add-pago-form");
const addPagoMessage = document.getElementById("add-pago-message");
const addPagoCancelBtn = document.getElementById("add-pago-cancel-btn");

const editPagoForm = document.getElementById("edit-pago-form");
const editPagoMessage = document.getElementById("edit-pago-message");
const editPagoCancelBtn = document.getElementById("edit-pago-cancel-btn");

let contratoActual = null;
let pagoActual = null;


function leerDatosPagoForm(prefix) {
    return {
        fecha_prevista: valorFecha(`${prefix}-fecha-prevista`),
        fecha_pago: valorFecha(`${prefix}-fecha-pago`),
        importe_previsto: valorNumero(`${prefix}-importe-previsto`),
        importe_pagado: valorNumero(`${prefix}-importe-pagado`),
        estado: valorTexto(`${prefix}-estado`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioPago(prefix, pago) {
    document.getElementById(`${prefix}-fecha-prevista`).value = fechaAValorInput(pago.fecha_prevista);
    document.getElementById(`${prefix}-fecha-pago`).value = fechaAValorInput(pago.fecha_pago);
    document.getElementById(`${prefix}-importe-previsto`).value = pago.importe_previsto ?? "";
    document.getElementById(`${prefix}-importe-pagado`).value = pago.importe_pagado ?? "";
    document.getElementById(`${prefix}-estado`).value = pago.estado ?? "Pendiente";
    document.getElementById(`${prefix}-observaciones`).value = pago.observaciones ?? "";
}

function crearBadgeEstado(estado) {

    const badge = document.createElement("span");
    badge.className = "badge";

    const clasePorEstado = {
        "Pendiente": "badge-pendiente",
        "Pagado": "badge-pagado",
        "Parcial": "badge-parcial",
        "Impagado": "badge-impagado"
    };

    badge.classList.add(clasePorEstado[estado] ?? "badge-pendiente");
    badge.textContent = estado ?? "";

    return badge;
}

function crearFilaPago(pago) {

    const fila = document.createElement("article");
    fila.className = "pago-row";

    const cabecera = document.createElement("div");
    cabecera.className = "pago-header";

    const fechaPrevista = document.createElement("span");
    fechaPrevista.className = "pago-fecha";
    fechaPrevista.textContent = formatearFecha(pago.fecha_prevista) ?? "";

    cabecera.appendChild(fechaPrevista);
    cabecera.appendChild(crearBadgeEstado(pago.estado));
    fila.appendChild(cabecera);

    if (pago.fecha_pago) {
        const fechaPago = document.createElement("p");
        fechaPago.className = "pago-meta";
        fechaPago.textContent = `Pagado el: ${formatearFecha(pago.fecha_pago)}`;
        fila.appendChild(fechaPago);
    }

    const importes = [];

    if (pago.importe_previsto !== undefined && pago.importe_previsto !== null) {
        importes.push(`Previsto: ${formatearMoneda(pago.importe_previsto)}`);
    }

    if (pago.importe_pagado !== undefined && pago.importe_pagado !== null) {
        importes.push(`Pagado: ${formatearMoneda(pago.importe_pagado)}`);
    }

    if (importes.length > 0) {
        const importesEl = document.createElement("p");
        importesEl.className = "pago-meta";
        importesEl.textContent = importes.join(" · ");
        fila.appendChild(importesEl);
    }

    if (pago.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "pago-observaciones";
        observaciones.textContent = pago.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(pago)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(pago)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(pagos) {

    pagosList.innerHTML = "";

    if (pagos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay pagos registrados.";
        pagosList.appendChild(vacio);
        return;
    }

    for (const pago of pagos) {
        pagosList.appendChild(crearFilaPago(pago));
    }
}

async function cargarPagos() {

    if (!state.inmuebleActual || !contratoActual) {
        return;
    }

    pagosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando pagos...";
    pagosList.appendChild(cargando);

    try {

        const pagos = await obtenerPagos(state.inmuebleActual.id, contratoActual.id);
        renderizar(pagos);

    } catch (error) {

        console.error("Error al cargar los pagos:", error);

        pagosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los pagos.";
        pagosList.appendChild(errorMsg);
    }
}

export async function abrirPagos(contrato) {

    contratoActual = contrato;

    const arrendatario = [contrato.nombre_arrendatario, contrato.apellidos_arrendatario]
        .filter(Boolean)
        .join(" ");

    pagosTitle.textContent = `Pagos: ${arrendatario || contrato.tipo || "contrato"}`;

    const puedeEditar = state.inmuebleActual && state.inmuebleActual.permiso === "Edición";
    addPagoBtn.hidden = !puedeEditar;

    mostrarVista("pagos");

    await cargarPagos();
}

backToFichaFromPagosBtn.addEventListener("click", () => {
    contratoActual = null;
    mostrarVista("property");
});

function abrirEdicion(pago) {
    pagoActual = pago;
    rellenarFormularioPago("edit-pago", pago);
    editPagoMessage.textContent = "";
    mostrarVista("edit-pago");
}

async function eliminar(pago) {

    if (!state.inmuebleActual || !contratoActual) {
        return;
    }

    const confirmado = confirm("¿Eliminar este pago?");

    if (!confirmado) {
        return;
    }

    try {
        await eliminarPago(state.inmuebleActual.id, contratoActual.id, pago.id);
        await cargarPagos();
    } catch (error) {
        console.error("Error al eliminar el pago:", error);
        alert("No se ha podido eliminar el pago.");
    }
}

addPagoBtn.addEventListener("click", () => {

    if (!state.inmuebleActual || !contratoActual) {
        return;
    }

    addPagoForm.reset();
    addPagoMessage.textContent = "";
    mostrarVista("add-pago");
});

addPagoCancelBtn.addEventListener("click", () => {
    addPagoMessage.textContent = "";
    mostrarVista("pagos");
});

addPagoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !contratoActual) {
        return;
    }

    addPagoMessage.textContent = "Guardando...";

    const datos = leerDatosPagoForm("pago");

    try {

        await crearPago(state.inmuebleActual.id, contratoActual.id, datos);

        addPagoMessage.textContent = "";
        addPagoForm.reset();

        mostrarVista("pagos");
        await cargarPagos();

    } catch (error) {

        console.error("Error al guardar el pago:", error);

        addPagoMessage.textContent =
            "No se ha podido guardar el pago.";
    }
});

editPagoCancelBtn.addEventListener("click", () => {
    pagoActual = null;
    editPagoMessage.textContent = "";
    mostrarVista("pagos");
});

editPagoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !contratoActual || !pagoActual) {
        return;
    }

    editPagoMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosPagoForm("edit-pago");

    try {

        await actualizarPago(state.inmuebleActual.id, contratoActual.id, pagoActual.id, datosActualizados);

        editPagoMessage.textContent = "";
        pagoActual = null;

        mostrarVista("pagos");
        await cargarPagos();

    } catch (error) {

        console.error("Error al guardar el pago:", error);

        editPagoMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});