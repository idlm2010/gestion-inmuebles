import "../styles/gastos-recurrentes.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import { obtenerContactos } from "../services/contactos.js";
import {
    obtenerGastosRecurrentes,
    crearGastoRecurrente,
    actualizarGastoRecurrente,
    eliminarGastoRecurrente
} from "../services/gastosRecurrentes.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    formatearMoneda,
    crearBotonAccion,
    poblarSelectPartes,
    nombreParte,
    poblarSelectContactos,
    nombreContacto
} from "../utils/formato.js";

const recurrentesList = document.getElementById("recurrentes-list");
const addRecurrenteBtn = document.getElementById("add-recurrente-btn");

const addRecurrenteForm = document.getElementById("add-recurrente-form");
const addRecurrenteMessage = document.getElementById("add-recurrente-message");
const addRecurrenteCancelBtn = document.getElementById("add-recurrente-cancel-btn");

const editRecurrenteForm = document.getElementById("edit-recurrente-form");
const editRecurrenteMessage = document.getElementById("edit-recurrente-message");
const editRecurrenteCancelBtn = document.getElementById("edit-recurrente-cancel-btn");

let recurrenteActual = null;
let contactosActuales = [];


function leerDatosRecurrenteForm(prefix) {
    return {
        tipo: valorTexto(`${prefix}-tipo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        periodicidad: valorTexto(`${prefix}-periodicidad`),
        importe_previsto: valorNumero(`${prefix}-importe-previsto`),
        fecha_proxima: valorFecha(`${prefix}-fecha-proxima`),
        parte_id: valorTexto(`${prefix}-parte`),
        contacto_id: valorTexto(`${prefix}-contacto`),
        activo: document.getElementById(`${prefix}-activo`).checked,
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioRecurrente(prefix, gr) {
    document.getElementById(`${prefix}-tipo`).value = gr.tipo ?? "IBI";
    document.getElementById(`${prefix}-descripcion`).value = gr.descripcion ?? "";
    document.getElementById(`${prefix}-periodicidad`).value = gr.periodicidad ?? "Mensual";
    document.getElementById(`${prefix}-importe-previsto`).value = gr.importe_previsto ?? "";
    document.getElementById(`${prefix}-fecha-proxima`).value = fechaAValorInput(gr.fecha_proxima);
    poblarSelectPartes(`${prefix}-parte`, state.partesActuales, gr.parte_id ?? "");
    poblarSelectContactos(`${prefix}-contacto`, contactosActuales, gr.contacto_id ?? "");
    document.getElementById(`${prefix}-activo`).checked = gr.activo !== false;
    document.getElementById(`${prefix}-observaciones`).value = gr.observaciones ?? "";
}

function crearFilaRecurrente(gr) {

    const fila = document.createElement("article");
    fila.className = "recurrente-row";

    const cabecera = document.createElement("div");
    cabecera.className = "recurrente-header";

    const tipo = document.createElement("span");
    tipo.className = "recurrente-tipo";
    tipo.textContent = gr.tipo ?? "";

    const periodicidad = document.createElement("span");
    periodicidad.className = "recurrente-periodicidad";
    periodicidad.textContent = gr.periodicidad ?? "";

    cabecera.appendChild(tipo);
    cabecera.appendChild(periodicidad);
    fila.appendChild(cabecera);

    if (gr.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "recurrente-descripcion";
        descripcion.textContent = gr.descripcion;
        fila.appendChild(descripcion);
    }

    const meta = [
        gr.fecha_proxima ? `Próximo: ${formatearFecha(gr.fecha_proxima)}` : null,
        gr.importe_previsto !== undefined && gr.importe_previsto !== null
            ? `Importe previsto: ${formatearMoneda(gr.importe_previsto)}`
            : null,
        gr.activo === false ? "Inactivo" : null
    ].filter(Boolean).join(" · ");

    if (meta) {
        const metaEl = document.createElement("p");
        metaEl.className = "recurrente-meta";
        metaEl.textContent = meta;
        fila.appendChild(metaEl);
    }

    const nombreDeParte = nombreParte(gr.parte_id, state.partesActuales);
    const nombreDeContacto = nombreContacto(gr.contacto_id, contactosActuales);

    const relaciones = [
        nombreDeParte ? `Parte: ${nombreDeParte}` : null,
        nombreDeContacto ? `Contacto: ${nombreDeContacto}` : null
    ].filter(Boolean).join(" · ");

    if (relaciones) {
        const relacionesEl = document.createElement("p");
        relacionesEl.className = "recurrente-meta";
        relacionesEl.textContent = relaciones;
        fila.appendChild(relacionesEl);
    }

    if (gr.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "recurrente-observaciones";
        observaciones.textContent = gr.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(gr)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(gr)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(recurrentes) {

    recurrentesList.innerHTML = "";

    if (recurrentes.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay gastos recurrentes definidos.";
        recurrentesList.appendChild(vacio);
        return;
    }

    for (const gr of recurrentes) {
        recurrentesList.appendChild(crearFilaRecurrente(gr));
    }
}

export async function cargarGastosRecurrentes(propertyId) {

    recurrentesList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando gastos recurrentes...";
    recurrentesList.appendChild(cargando);

    const user = usuarioActual();

    try {
        contactosActuales = user ? await obtenerContactos(user.uid) : [];
    } catch (error) {
        console.error("Error al cargar los contactos:", error);
        contactosActuales = [];
    }

    try {

        const recurrentes = await obtenerGastosRecurrentes(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(recurrentes);
        }

    } catch (error) {

        console.error("Error al cargar los gastos recurrentes:", error);

        recurrentesList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los gastos recurrentes.";
        recurrentesList.appendChild(errorMsg);
    }
}

function abrirEdicion(gr) {
    recurrenteActual = gr;
    rellenarFormularioRecurrente("edit-recurrente", gr);
    editRecurrenteMessage.textContent = "";
    mostrarVista("edit-recurrente");
}

async function eliminar(gr) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar el gasto recurrente "${gr.descripcion ?? gr.tipo ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarGastoRecurrente(state.inmuebleActual.id, gr.id);
        await cargarGastosRecurrentes(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar el gasto recurrente:", error);
        alert("No se ha podido eliminar el gasto recurrente.");
    }
}

addRecurrenteBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addRecurrenteForm.reset();
    poblarSelectPartes("recurrente-parte", state.partesActuales, "");
    poblarSelectContactos("recurrente-contacto", contactosActuales, "");
    addRecurrenteMessage.textContent = "";
    mostrarVista("add-recurrente");
});

addRecurrenteCancelBtn.addEventListener("click", () => {
    addRecurrenteMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addRecurrenteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addRecurrenteMessage.textContent = "Guardando...";

    const datos = leerDatosRecurrenteForm("recurrente");

    try {

        await crearGastoRecurrente(state.inmuebleActual.id, datos);

        addRecurrenteMessage.textContent = "";
        addRecurrenteForm.reset();

        mostrarVista("property");
        await cargarGastosRecurrentes(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el gasto recurrente:", error);

        addRecurrenteMessage.textContent =
            "No se ha podido guardar el gasto recurrente.";
    }
});

editRecurrenteCancelBtn.addEventListener("click", () => {
    recurrenteActual = null;
    editRecurrenteMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editRecurrenteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !recurrenteActual) {
        return;
    }

    editRecurrenteMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosRecurrenteForm("edit-recurrente");

    try {

        await actualizarGastoRecurrente(state.inmuebleActual.id, recurrenteActual.id, datosActualizados);

        editRecurrenteMessage.textContent = "";
        recurrenteActual = null;

        mostrarVista("property");
        await cargarGastosRecurrentes(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el gasto recurrente:", error);

        editRecurrenteMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});