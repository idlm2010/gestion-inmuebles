import "../styles/seguros.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import { obtenerContactos } from "../services/contactos.js";
import {
    obtenerSeguros,
    crearSeguro,
    actualizarSeguro,
    eliminarSeguro
} from "../services/seguros.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearMoneda,
    formatearRangoFechas,
    crearBotonAccion,
    poblarSelectContactos,
    nombreContacto
} from "../utils/formato.js";

const segurosList = document.getElementById("seguros-list");
const addSeguroBtn = document.getElementById("add-seguro-btn");

const addSeguroForm = document.getElementById("add-seguro-form");
const addSeguroMessage = document.getElementById("add-seguro-message");
const addSeguroCancelBtn = document.getElementById("add-seguro-cancel-btn");

const editSeguroForm = document.getElementById("edit-seguro-form");
const editSeguroMessage = document.getElementById("edit-seguro-message");
const editSeguroCancelBtn = document.getElementById("edit-seguro-cancel-btn");

let seguroActual = null;
let contactosActuales = [];


function leerDatosSeguroForm(prefix) {
    return {
        aseguradora: valorTexto(`${prefix}-aseguradora`),
        numero_poliza: valorTexto(`${prefix}-numero-poliza`),
        tipo: valorTexto(`${prefix}-tipo`),
        fecha_inicio: valorFecha(`${prefix}-fecha-inicio`),
        fecha_vencimiento: valorFecha(`${prefix}-fecha-vencimiento`),
        importe_anual: valorNumero(`${prefix}-importe-anual`),
        contacto_id: valorTexto(`${prefix}-contacto`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioSeguro(prefix, seguro) {
    document.getElementById(`${prefix}-aseguradora`).value = seguro.aseguradora ?? "";
    document.getElementById(`${prefix}-tipo`).value = seguro.tipo ?? "Hogar";
    document.getElementById(`${prefix}-numero-poliza`).value = seguro.numero_poliza ?? "";
    document.getElementById(`${prefix}-fecha-inicio`).value = fechaAValorInput(seguro.fecha_inicio);
    document.getElementById(`${prefix}-fecha-vencimiento`).value = fechaAValorInput(seguro.fecha_vencimiento);
    document.getElementById(`${prefix}-importe-anual`).value = seguro.importe_anual ?? "";
    poblarSelectContactos(`${prefix}-contacto`, contactosActuales, seguro.contacto_id ?? "");
    document.getElementById(`${prefix}-observaciones`).value = seguro.observaciones ?? "";
}

function crearFilaSeguro(seguro) {

    const fila = document.createElement("article");
    fila.className = "seguro-row";

    const cabecera = document.createElement("div");
    cabecera.className = "seguro-header";

    const aseguradora = document.createElement("span");
    aseguradora.className = "seguro-aseguradora";
    aseguradora.textContent = seguro.aseguradora ?? "";

    const tipo = document.createElement("span");
    tipo.className = "seguro-tipo";
    tipo.textContent = seguro.tipo ?? "";

    cabecera.appendChild(aseguradora);
    cabecera.appendChild(tipo);
    fila.appendChild(cabecera);

    if (seguro.numero_poliza) {
        const poliza = document.createElement("p");
        poliza.className = "seguro-meta";
        poliza.textContent = `Póliza: ${seguro.numero_poliza}`;
        fila.appendChild(poliza);
    }

    const vigencia = formatearRangoFechas(seguro.fecha_inicio, seguro.fecha_vencimiento);

    if (vigencia) {
        const vigenciaEl = document.createElement("p");
        vigenciaEl.className = "seguro-meta";
        vigenciaEl.textContent = `Vigencia: ${vigencia}`;
        fila.appendChild(vigenciaEl);
    }

    if (seguro.importe_anual !== undefined && seguro.importe_anual !== null) {
        const importe = document.createElement("p");
        importe.className = "seguro-meta";
        importe.textContent = `Importe anual: ${formatearMoneda(seguro.importe_anual)}`;
        fila.appendChild(importe);
    }

    const nombreDeContacto = nombreContacto(seguro.contacto_id, contactosActuales);

    if (nombreDeContacto) {
        const contactoInfo = document.createElement("p");
        contactoInfo.className = "seguro-meta";
        contactoInfo.textContent = `Contacto: ${nombreDeContacto}`;
        fila.appendChild(contactoInfo);
    }

    if (seguro.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "seguro-observaciones";
        observaciones.textContent = seguro.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(seguro)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(seguro)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(seguros) {

    segurosList.innerHTML = "";

    if (seguros.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay seguros registrados.";
        segurosList.appendChild(vacio);
        return;
    }

    for (const seguro of seguros) {
        segurosList.appendChild(crearFilaSeguro(seguro));
    }
}

export async function cargarSeguros(propertyId) {

    segurosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando seguros...";
    segurosList.appendChild(cargando);

    const user = usuarioActual();

    try {
        contactosActuales = user ? await obtenerContactos(user.uid) : [];
    } catch (error) {
        console.error("Error al cargar los contactos:", error);
        contactosActuales = [];
    }

    try {

        const seguros = await obtenerSeguros(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(seguros);
        }

    } catch (error) {

        console.error("Error al cargar los seguros:", error);

        segurosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los seguros.";
        segurosList.appendChild(errorMsg);
    }
}

function abrirEdicion(seguro) {
    seguroActual = seguro;
    rellenarFormularioSeguro("edit-seguro", seguro);
    editSeguroMessage.textContent = "";
    mostrarVista("edit-seguro");
}

async function eliminar(seguro) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar el seguro de "${seguro.aseguradora ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarSeguro(state.inmuebleActual.id, seguro.id);
        await cargarSeguros(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar el seguro:", error);
        alert("No se ha podido eliminar el seguro.");
    }
}

addSeguroBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addSeguroForm.reset();
    poblarSelectContactos("seguro-contacto", contactosActuales, "");
    addSeguroMessage.textContent = "";
    mostrarVista("add-seguro");
});

addSeguroCancelBtn.addEventListener("click", () => {
    addSeguroMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addSeguroForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addSeguroMessage.textContent = "Guardando...";

    const datos = leerDatosSeguroForm("seguro");

    try {

        await crearSeguro(state.inmuebleActual.id, datos);

        addSeguroMessage.textContent = "";
        addSeguroForm.reset();

        mostrarVista("property");
        await cargarSeguros(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el seguro:", error);

        addSeguroMessage.textContent =
            "No se ha podido guardar el seguro.";
    }
});

editSeguroCancelBtn.addEventListener("click", () => {
    seguroActual = null;
    editSeguroMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editSeguroForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !seguroActual) {
        return;
    }

    editSeguroMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosSeguroForm("edit-seguro");

    try {

        await actualizarSeguro(state.inmuebleActual.id, seguroActual.id, datosActualizados);

        editSeguroMessage.textContent = "";
        seguroActual = null;

        mostrarVista("property");
        await cargarSeguros(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el seguro:", error);

        editSeguroMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});