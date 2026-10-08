import "../styles/partes.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerPartes,
    crearParte,
    actualizarParte,
    eliminarParte
} from "../services/partes.js";
import { valorTexto, crearBotonAccion } from "../utils/formato.js";

const partesList = document.getElementById("partes-list");
const addParteBtn = document.getElementById("add-parte-btn");

const addParteForm = document.getElementById("add-parte-form");
const addParteMessage = document.getElementById("add-parte-message");
const addParteCancelBtn = document.getElementById("add-parte-cancel-btn");

const editParteForm = document.getElementById("edit-parte-form");
const editParteMessage = document.getElementById("edit-parte-message");
const editParteCancelBtn = document.getElementById("edit-parte-cancel-btn");

let parteActual = null;


function leerDatosParteForm(prefix) {
    return {
        nombre: valorTexto(`${prefix}-nombre`),
        tipo: valorTexto(`${prefix}-tipo`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioParte(prefix, parte) {
    document.getElementById(`${prefix}-nombre`).value = parte.nombre ?? "";
    document.getElementById(`${prefix}-tipo`).value = parte.tipo ?? "Estancia";
    document.getElementById(`${prefix}-observaciones`).value = parte.observaciones ?? "";
}

function crearFilaParte(parte) {

    const fila = document.createElement("article");
    fila.className = "parte-row";

    const cabecera = document.createElement("div");
    cabecera.className = "parte-header";

    const nombre = document.createElement("span");
    nombre.className = "parte-nombre";
    nombre.textContent = parte.nombre ?? "";

    const tipo = document.createElement("span");
    tipo.className = "parte-tipo";
    tipo.textContent = parte.tipo ?? "";

    cabecera.appendChild(nombre);
    cabecera.appendChild(tipo);
    fila.appendChild(cabecera);

    if (parte.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "parte-observaciones";
        observaciones.textContent = parte.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(parte)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(parte)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(partes) {

    partesList.innerHTML = "";

    if (partes.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay partes definidas.";
        partesList.appendChild(vacio);
        return;
    }

    for (const parte of partes) {
        partesList.appendChild(crearFilaParte(parte));
    }
}

export async function cargarPartes(propertyId) {

    partesList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando partes...";
    partesList.appendChild(cargando);

    try {

        const partes = await obtenerPartes(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            state.partesActuales = partes;
            renderizar(partes);
        }

    } catch (error) {

        console.error("Error al cargar las partes:", error);

        state.partesActuales = [];
        partesList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las partes.";
        partesList.appendChild(errorMsg);
    }
}

function abrirEdicion(parte) {
    parteActual = parte;
    rellenarFormularioParte("edit-parte", parte);
    editParteMessage.textContent = "";
    mostrarVista("edit-parte");
}

async function eliminar(parte) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la parte "${parte.nombre ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarParte(state.inmuebleActual.id, parte.id);
        await cargarPartes(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar la parte:", error);
        alert("No se ha podido eliminar la parte.");
    }
}

addParteBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addParteForm.reset();
    addParteMessage.textContent = "";
    mostrarVista("add-parte");
});

addParteCancelBtn.addEventListener("click", () => {
    addParteMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addParteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addParteMessage.textContent = "Guardando...";

    const datos = leerDatosParteForm("parte");

    try {

        await crearParte(state.inmuebleActual.id, datos);

        addParteMessage.textContent = "";
        addParteForm.reset();

        mostrarVista("property");
        await cargarPartes(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la parte:", error);

        addParteMessage.textContent =
            "No se ha podido guardar la parte.";
    }
});

editParteCancelBtn.addEventListener("click", () => {
    parteActual = null;
    editParteMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editParteForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !parteActual) {
        return;
    }

    editParteMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosParteForm("edit-parte");

    try {

        await actualizarParte(state.inmuebleActual.id, parteActual.id, datosActualizados);

        editParteMessage.textContent = "";
        parteActual = null;

        mostrarVista("property");
        await cargarPartes(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la parte:", error);

        editParteMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});