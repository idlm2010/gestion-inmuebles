import "../styles/actuaciones.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import { obtenerContactos } from "../services/contactos.js";
import {
    obtenerActuaciones,
    crearActuacion,
    actualizarActuacion,
    eliminarActuacion
} from "../services/actuaciones.js";
import {
    valorTexto,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    crearBotonAccion,
    poblarSelectContactos,
    nombreContacto
} from "../utils/formato.js";

const actuacionesTitle = document.getElementById("actuaciones-title");
const actuacionesList = document.getElementById("actuaciones-list");
const addActuacionBtn = document.getElementById("add-actuacion-btn");
const backToFichaFromActuacionesBtn = document.getElementById("back-to-ficha-from-actuaciones-btn");

const addActuacionForm = document.getElementById("add-actuacion-form");
const addActuacionMessage = document.getElementById("add-actuacion-message");
const addActuacionCancelBtn = document.getElementById("add-actuacion-cancel-btn");

const editActuacionForm = document.getElementById("edit-actuacion-form");
const editActuacionMessage = document.getElementById("edit-actuacion-message");
const editActuacionCancelBtn = document.getElementById("edit-actuacion-cancel-btn");

let incidenciaActual = null;
let contactosActuales = [];
let actuacionActual = null;


function leerDatosActuacionForm(prefix) {
    return {
        fecha: valorFecha(`${prefix}-fecha`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        contacto_id: valorTexto(`${prefix}-contacto`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioActuacion(prefix, actuacion) {
    document.getElementById(`${prefix}-fecha`).value = fechaAValorInput(actuacion.fecha);
    document.getElementById(`${prefix}-descripcion`).value = actuacion.descripcion ?? "";
    poblarSelectContactos(`${prefix}-contacto`, contactosActuales, actuacion.contacto_id ?? "");
    document.getElementById(`${prefix}-observaciones`).value = actuacion.observaciones ?? "";
}

function crearFilaActuacion(actuacion) {

    const fila = document.createElement("article");
    fila.className = "actuacion-row";

    const cabecera = document.createElement("div");
    cabecera.className = "actuacion-header";
    cabecera.textContent = formatearFecha(actuacion.fecha) ?? "";
    fila.appendChild(cabecera);

    if (actuacion.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "actuacion-descripcion";
        descripcion.textContent = actuacion.descripcion;
        fila.appendChild(descripcion);
    }

    const nombreDeContacto = nombreContacto(actuacion.contacto_id, contactosActuales);

    if (nombreDeContacto) {
        const contactoInfo = document.createElement("p");
        contactoInfo.className = "actuacion-meta";
        contactoInfo.textContent = `Contacto: ${nombreDeContacto}`;
        fila.appendChild(contactoInfo);
    }

    if (actuacion.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "actuacion-observaciones";
        observaciones.textContent = actuacion.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(actuacion)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(actuacion)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(actuaciones) {

    actuacionesList.innerHTML = "";

    if (actuaciones.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay actuaciones registradas.";
        actuacionesList.appendChild(vacio);
        return;
    }

    for (const actuacion of actuaciones) {
        actuacionesList.appendChild(crearFilaActuacion(actuacion));
    }
}

async function cargarActuaciones() {

    if (!state.inmuebleActual || !incidenciaActual) {
        return;
    }

    actuacionesList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando actuaciones...";
    actuacionesList.appendChild(cargando);

    try {

        const actuaciones = await obtenerActuaciones(state.inmuebleActual.id, incidenciaActual.id);
        renderizar(actuaciones);

    } catch (error) {

        console.error("Error al cargar las actuaciones:", error);

        actuacionesList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las actuaciones.";
        actuacionesList.appendChild(errorMsg);
    }
}

export async function abrirActuaciones(incidencia) {

    incidenciaActual = incidencia;

    actuacionesTitle.textContent = `Actuaciones: ${incidencia.titulo ?? ""}`;

    const puedeEditar = state.inmuebleActual && state.inmuebleActual.permiso === "Edición";
    addActuacionBtn.hidden = !puedeEditar;

    mostrarVista("actuaciones");

    const user = usuarioActual();

    try {
        contactosActuales = user ? await obtenerContactos(user.uid) : [];
    } catch (error) {
        console.error("Error al cargar los contactos:", error);
        contactosActuales = [];
    }

    await cargarActuaciones();
}

backToFichaFromActuacionesBtn.addEventListener("click", () => {
    incidenciaActual = null;
    mostrarVista("property");
});

function abrirEdicion(actuacion) {
    actuacionActual = actuacion;
    rellenarFormularioActuacion("edit-actuacion", actuacion);
    editActuacionMessage.textContent = "";
    mostrarVista("edit-actuacion");
}

async function eliminar(actuacion) {

    if (!state.inmuebleActual || !incidenciaActual) {
        return;
    }

    const confirmado = confirm("¿Eliminar esta actuación?");

    if (!confirmado) {
        return;
    }

    try {
        await eliminarActuacion(state.inmuebleActual.id, incidenciaActual.id, actuacion.id);
        await cargarActuaciones();
    } catch (error) {
        console.error("Error al eliminar la actuación:", error);
        alert("No se ha podido eliminar la actuación.");
    }
}

addActuacionBtn.addEventListener("click", () => {

    if (!state.inmuebleActual || !incidenciaActual) {
        return;
    }

    addActuacionForm.reset();
    poblarSelectContactos("actuacion-contacto", contactosActuales, "");
    addActuacionMessage.textContent = "";
    mostrarVista("add-actuacion");
});

addActuacionCancelBtn.addEventListener("click", () => {
    addActuacionMessage.textContent = "";
    mostrarVista("actuaciones");
});

addActuacionForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !incidenciaActual) {
        return;
    }

    addActuacionMessage.textContent = "Guardando...";

    const datos = leerDatosActuacionForm("actuacion");

    try {

        await crearActuacion(state.inmuebleActual.id, incidenciaActual.id, datos);

        addActuacionMessage.textContent = "";
        addActuacionForm.reset();

        mostrarVista("actuaciones");
        await cargarActuaciones();

    } catch (error) {

        console.error("Error al guardar la actuación:", error);

        addActuacionMessage.textContent =
            "No se ha podido guardar la actuación.";
    }
});

editActuacionCancelBtn.addEventListener("click", () => {
    actuacionActual = null;
    editActuacionMessage.textContent = "";
    mostrarVista("actuaciones");
});

editActuacionForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !incidenciaActual || !actuacionActual) {
        return;
    }

    editActuacionMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosActuacionForm("edit-actuacion");

    try {

        await actualizarActuacion(
            state.inmuebleActual.id,
            incidenciaActual.id,
            actuacionActual.id,
            datosActualizados
        );

        editActuacionMessage.textContent = "";
        actuacionActual = null;

        mostrarVista("actuaciones");
        await cargarActuaciones();

    } catch (error) {

        console.error("Error al guardar la actuación:", error);
                editActuacionMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});