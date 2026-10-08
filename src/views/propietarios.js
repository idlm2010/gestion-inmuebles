import "../styles/propietarios.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerPropietarios,
    crearPropietario,
    actualizarPropietario,
    eliminarPropietario
} from "../services/propietarios.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearRangoFechas,
    crearBotonAccion
} from "../utils/formato.js";

const propietariosList = document.getElementById("propietarios-list");
const addPropietarioBtn = document.getElementById("add-propietario-btn");

const addPropietarioForm = document.getElementById("add-propietario-form");
const addPropietarioMessage = document.getElementById("add-propietario-message");
const addPropietarioCancelBtn = document.getElementById("add-propietario-cancel-btn");

const editPropietarioForm = document.getElementById("edit-propietario-form");
const editPropietarioMessage = document.getElementById("edit-propietario-message");
const editPropietarioCancelBtn = document.getElementById("edit-propietario-cancel-btn");

let propietarioActual = null;


function leerDatosPropietarioForm(prefix) {
    return {
        nombre: valorTexto(`${prefix}-nombre`),
        apellidos: valorTexto(`${prefix}-apellidos`),
        porcentaje: valorNumero(`${prefix}-porcentaje`),
        fecha_inicio: valorFecha(`${prefix}-fecha-inicio`),
        fecha_fin: valorFecha(`${prefix}-fecha-fin`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioPropietario(prefix, propietario) {
    document.getElementById(`${prefix}-nombre`).value = propietario.nombre ?? "";
    document.getElementById(`${prefix}-apellidos`).value = propietario.apellidos ?? "";
    document.getElementById(`${prefix}-porcentaje`).value = propietario.porcentaje ?? "";
    document.getElementById(`${prefix}-fecha-inicio`).value = fechaAValorInput(propietario.fecha_inicio);
    document.getElementById(`${prefix}-fecha-fin`).value = fechaAValorInput(propietario.fecha_fin);
    document.getElementById(`${prefix}-observaciones`).value = propietario.observaciones ?? "";
}

function crearFilaPropietario(propietario) {

    const fila = document.createElement("article");
    fila.className = "propietario-row";

    const cabecera = document.createElement("div");
    cabecera.className = "propietario-header";

    const nombre = document.createElement("span");
    nombre.className = "propietario-nombre";
    nombre.textContent = [propietario.nombre, propietario.apellidos].filter(Boolean).join(" ");
    cabecera.appendChild(nombre);

    if (propietario.porcentaje !== undefined && propietario.porcentaje !== null) {
        const porcentaje = document.createElement("span");
        porcentaje.className = "propietario-porcentaje";
        porcentaje.textContent = `${propietario.porcentaje}%`;
        cabecera.appendChild(porcentaje);
    }

    fila.appendChild(cabecera);

    const vigencia = formatearRangoFechas(propietario.fecha_inicio, propietario.fecha_fin);

    if (vigencia) {
        const vigenciaEl = document.createElement("p");
        vigenciaEl.className = "propietario-meta";
        vigenciaEl.textContent = vigencia;
        fila.appendChild(vigenciaEl);
    }

    if (propietario.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "propietario-observaciones";
        observaciones.textContent = propietario.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(propietario)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(propietario)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(propietarios) {

    propietariosList.innerHTML = "";

    if (propietarios.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay propietarios registrados.";
        propietariosList.appendChild(vacio);
        return;
    }

    for (const propietario of propietarios) {
        propietariosList.appendChild(crearFilaPropietario(propietario));
    }
}

export async function cargarPropietarios(propertyId) {

    propietariosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando propietarios...";
    propietariosList.appendChild(cargando);

    try {

        const propietarios = await obtenerPropietarios(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(propietarios);
        }

    } catch (error) {

        console.error("Error al cargar los propietarios:", error);

        propietariosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los propietarios.";
        propietariosList.appendChild(errorMsg);
    }
}

function abrirEdicion(propietario) {
    propietarioActual = propietario;
    rellenarFormularioPropietario("edit-propietario", propietario);
    editPropietarioMessage.textContent = "";
    mostrarVista("edit-propietario");
}

async function eliminar(propietario) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(
        `¿Eliminar a "${[propietario.nombre, propietario.apellidos].filter(Boolean).join(" ")}" como propietario?`
    );

    if (!confirmado) {
        return;
    }

    try {
        await eliminarPropietario(state.inmuebleActual.id, propietario.id);
        await cargarPropietarios(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar el propietario:", error);
        alert("No se ha podido eliminar el propietario.");
    }
}

addPropietarioBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addPropietarioForm.reset();
    addPropietarioMessage.textContent = "";
    mostrarVista("add-propietario");
});

addPropietarioCancelBtn.addEventListener("click", () => {
    addPropietarioMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addPropietarioForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addPropietarioMessage.textContent = "Guardando...";

    const datos = leerDatosPropietarioForm("propietario");

    try {

        await crearPropietario(state.inmuebleActual.id, datos);

        addPropietarioMessage.textContent = "";
        addPropietarioForm.reset();

        mostrarVista("property");
        await cargarPropietarios(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el propietario:", error);

        addPropietarioMessage.textContent =
            "No se ha podido guardar el propietario.";
    }
});

editPropietarioCancelBtn.addEventListener("click", () => {
    propietarioActual = null;
    editPropietarioMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editPropietarioForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !propietarioActual) {
        return;
    }

    editPropietarioMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosPropietarioForm("edit-propietario");

    try {

        await actualizarPropietario(state.inmuebleActual.id, propietarioActual.id, datosActualizados);

        editPropietarioMessage.textContent = "";
        propietarioActual = null;

        mostrarVista("property");
        await cargarPropietarios(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el propietario:", error);

        editPropietarioMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});