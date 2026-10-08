import "../styles/incidencias.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerIncidencias,
    crearIncidencia,
    actualizarIncidencia,
    eliminarIncidencia
} from "../services/incidencias.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    formatearMoneda,
    crearBotonAccion,
    poblarSelectPartes,
    nombreParte
} from "../utils/formato.js";
import { abrirActuaciones } from "./actuaciones.js";

const incidenciasList = document.getElementById("incidencias-list");
const addIncidenciaBtn = document.getElementById("add-incidencia-btn");

const addIncidenciaForm = document.getElementById("add-incidencia-form");
const addIncidenciaMessage = document.getElementById("add-incidencia-message");
const addIncidenciaCancelBtn = document.getElementById("add-incidencia-cancel-btn");

const editIncidenciaForm = document.getElementById("edit-incidencia-form");
const editIncidenciaMessage = document.getElementById("edit-incidencia-message");
const editIncidenciaCancelBtn = document.getElementById("edit-incidencia-cancel-btn");

let incidenciaActual = null;


function leerDatosIncidenciaForm(prefix) {
    return {
        parte_id: valorTexto(`${prefix}-parte`),
        fecha_apertura: valorFecha(`${prefix}-fecha-apertura`),
        fecha_resolucion: valorFecha(`${prefix}-fecha-resolucion`),
        titulo: valorTexto(`${prefix}-titulo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        tipo: valorTexto(`${prefix}-tipo`),
        prioridad: valorTexto(`${prefix}-prioridad`),
        estado: valorTexto(`${prefix}-estado`),
        importe_estimado: valorNumero(`${prefix}-importe-estimado`),
        importe_final: valorNumero(`${prefix}-importe-final`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioIncidencia(prefix, incidencia) {
    document.getElementById(`${prefix}-titulo`).value = incidencia.titulo ?? "";
    document.getElementById(`${prefix}-descripcion`).value = incidencia.descripcion ?? "";
    document.getElementById(`${prefix}-tipo`).value = incidencia.tipo ?? "Avería";
    document.getElementById(`${prefix}-prioridad`).value = incidencia.prioridad ?? "Media";
    document.getElementById(`${prefix}-estado`).value = incidencia.estado ?? "Abierta";
    poblarSelectPartes(`${prefix}-parte`, state.partesActuales, incidencia.parte_id ?? "");
    document.getElementById(`${prefix}-fecha-apertura`).value = fechaAValorInput(incidencia.fecha_apertura);
    document.getElementById(`${prefix}-fecha-resolucion`).value = fechaAValorInput(incidencia.fecha_resolucion);
    document.getElementById(`${prefix}-importe-estimado`).value = incidencia.importe_estimado ?? "";
    document.getElementById(`${prefix}-importe-final`).value = incidencia.importe_final ?? "";
    document.getElementById(`${prefix}-observaciones`).value = incidencia.observaciones ?? "";
}

function crearBadgeEstado(estado) {

    const badge = document.createElement("span");
    badge.className = "badge";

    const clasePorEstado = {
        "Abierta": "badge-abierta",
        "En curso": "badge-en-curso",
        "Resuelta": "badge-resuelta",
        "Cerrada": "badge-cerrada"
    };

    badge.classList.add(clasePorEstado[estado] ?? "badge-cerrada");
    badge.textContent = estado ?? "";

    return badge;
}

function crearFilaIncidencia(incidencia) {

    const fila = document.createElement("article");
    fila.className = "incidencia-row";

    const cabecera = document.createElement("div");
    cabecera.className = "incidencia-header";

    const titulo = document.createElement("span");
    titulo.className = "incidencia-titulo";
    titulo.textContent = incidencia.titulo ?? "";

    cabecera.appendChild(titulo);
    cabecera.appendChild(crearBadgeEstado(incidencia.estado));
    fila.appendChild(cabecera);

    const meta = [incidencia.tipo, incidencia.prioridad, formatearFecha(incidencia.fecha_apertura)]
        .filter(Boolean)
        .join(" · ");

    if (meta) {
        const metaEl = document.createElement("p");
        metaEl.className = "incidencia-meta";
        metaEl.textContent = meta;
        fila.appendChild(metaEl);
    }

    const nombreDeParte = nombreParte(incidencia.parte_id, state.partesActuales);

    if (nombreDeParte) {
        const parteInfo = document.createElement("p");
        parteInfo.className = "incidencia-meta";
        parteInfo.textContent = `Parte: ${nombreDeParte}`;
        fila.appendChild(parteInfo);
    }

    if (incidencia.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "incidencia-descripcion";
        descripcion.textContent = incidencia.descripcion;
        fila.appendChild(descripcion);
    }

    const importes = [];

    if (incidencia.importe_estimado !== undefined && incidencia.importe_estimado !== null) {
        importes.push(`Estimado: ${formatearMoneda(incidencia.importe_estimado)}`);
    }

    if (incidencia.importe_final !== undefined && incidencia.importe_final !== null) {
        importes.push(`Final: ${formatearMoneda(incidencia.importe_final)}`);
    }

    if (importes.length > 0) {
        const importesEl = document.createElement("p");
        importesEl.className = "incidencia-meta";
        importesEl.textContent = importes.join(" · ");
        fila.appendChild(importesEl);
    }

    if (incidencia.fecha_resolucion) {
        const resolucion = document.createElement("p");
        resolucion.className = "incidencia-meta";
        resolucion.textContent = `Resuelta: ${formatearFecha(incidencia.fecha_resolucion)}`;
        fila.appendChild(resolucion);
    }

    if (incidencia.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "incidencia-observaciones";
        observaciones.textContent = incidencia.observaciones;
        fila.appendChild(observaciones);
    }

    const acciones = document.createElement("div");
    acciones.className = "row-actions";

    acciones.appendChild(crearBotonAccion("Actuaciones", null, () => abrirActuaciones(incidencia)));

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {
        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(incidencia)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(incidencia)));
    }

    fila.appendChild(acciones);

    return fila;
}

function renderizar(incidencias) {

    incidenciasList.innerHTML = "";

    if (incidencias.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay incidencias registradas.";
        incidenciasList.appendChild(vacio);
        return;
    }

    for (const incidencia of incidencias) {
        incidenciasList.appendChild(crearFilaIncidencia(incidencia));
    }
}

export async function cargarIncidencias(propertyId) {

    incidenciasList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando incidencias...";
    incidenciasList.appendChild(cargando);

    try {

        const incidencias = await obtenerIncidencias(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(incidencias);
        }

    } catch (error) {

        console.error("Error al cargar las incidencias:", error);

        incidenciasList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las incidencias.";
        incidenciasList.appendChild(errorMsg);
    }
}

function abrirEdicion(incidencia) {
    incidenciaActual = incidencia;
    rellenarFormularioIncidencia("edit-incidencia", incidencia);
    editIncidenciaMessage.textContent = "";
    mostrarVista("edit-incidencia");
}

async function eliminar(incidencia) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la incidencia "${incidencia.titulo ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarIncidencia(state.inmuebleActual.id, incidencia.id);
        await cargarIncidencias(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar la incidencia:", error);
        alert("No se ha podido eliminar la incidencia.");
    }
}

addIncidenciaBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addIncidenciaForm.reset();
    poblarSelectPartes("incidencia-parte", state.partesActuales, "");
    addIncidenciaMessage.textContent = "";
    mostrarVista("add-incidencia");
});

addIncidenciaCancelBtn.addEventListener("click", () => {
    addIncidenciaMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addIncidenciaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addIncidenciaMessage.textContent = "Guardando...";

    const datos = leerDatosIncidenciaForm("incidencia");

    try {

        await crearIncidencia(state.inmuebleActual.id, datos);

        addIncidenciaMessage.textContent = "";
        addIncidenciaForm.reset();

        mostrarVista("property");
        await cargarIncidencias(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la incidencia:", error);

        addIncidenciaMessage.textContent =
            "No se ha podido guardar la incidencia.";
    }
});

editIncidenciaCancelBtn.addEventListener("click", () => {
    incidenciaActual = null;
    editIncidenciaMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editIncidenciaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !incidenciaActual) {
        return;
    }

    editIncidenciaMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosIncidenciaForm("edit-incidencia");

    try {

        await actualizarIncidencia(state.inmuebleActual.id, incidenciaActual.id, datosActualizados);

        editIncidenciaMessage.textContent = "";
        incidenciaActual = null;

        mostrarVista("property");
        await cargarIncidencias(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la incidencia:", error);

        editIncidenciaMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});