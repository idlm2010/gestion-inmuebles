import "../styles/bitacora.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import { obtenerContactos } from "../services/contactos.js";
import {
    obtenerBitacora,
    crearEntradaBitacora,
    actualizarEntradaBitacora,
    eliminarEntradaBitacora
} from "../services/bitacora.js";
import {
    valorTexto,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    crearBotonAccion,
    poblarSelectPartes,
    nombreParte,
    poblarSelectContactos,
    nombreContacto
} from "../utils/formato.js";

const bitacoraList = document.getElementById("bitacora-list");
const addBitacoraBtn = document.getElementById("add-bitacora-btn");

const addBitacoraForm = document.getElementById("add-bitacora-form");
const addBitacoraMessage = document.getElementById("add-bitacora-message");
const addBitacoraCancelBtn = document.getElementById("add-bitacora-cancel-btn");

const editBitacoraForm = document.getElementById("edit-bitacora-form");
const editBitacoraMessage = document.getElementById("edit-bitacora-message");
const editBitacoraCancelBtn = document.getElementById("edit-bitacora-cancel-btn");

let entradaActual = null;
let contactosActuales = [];


function leerDatosEntradaForm(prefix) {
    return {
        titulo: valorTexto(`${prefix}-titulo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        tipo: valorTexto(`${prefix}-tipo`),
        fecha: valorFecha(`${prefix}-fecha`),
        parte_id: valorTexto(`${prefix}-parte`),
        contacto_id: valorTexto(`${prefix}-contacto`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioEntrada(prefix, entrada) {
    document.getElementById(`${prefix}-titulo`).value = entrada.titulo ?? "";
    document.getElementById(`${prefix}-descripcion`).value = entrada.descripcion ?? "";
    document.getElementById(`${prefix}-tipo`).value = entrada.tipo ?? "Informativa";
    document.getElementById(`${prefix}-fecha`).value = fechaAValorInput(entrada.fecha);
    poblarSelectPartes(`${prefix}-parte`, state.partesActuales, entrada.parte_id ?? "");
    poblarSelectContactos(`${prefix}-contacto`, contactosActuales, entrada.contacto_id ?? "");
    document.getElementById(`${prefix}-observaciones`).value = entrada.observaciones ?? "";
}

function crearFilaEntrada(entrada) {

    const fila = document.createElement("article");
    fila.className = "bitacora-row";

    const cabecera = document.createElement("div");
    cabecera.className = "bitacora-header";

    const titulo = document.createElement("span");
    titulo.className = "bitacora-titulo";
    titulo.textContent = entrada.titulo ?? "";

    const fecha = document.createElement("span");
    fecha.className = "bitacora-fecha";
    fecha.textContent = formatearFecha(entrada.fecha) ?? "";

    cabecera.appendChild(titulo);
    cabecera.appendChild(fecha);
    fila.appendChild(cabecera);

    if (entrada.tipo) {
        const tipo = document.createElement("p");
        tipo.className = "bitacora-meta";
        tipo.textContent = entrada.tipo;
        fila.appendChild(tipo);
    }

    if (entrada.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "bitacora-descripcion";
        descripcion.textContent = entrada.descripcion;
        fila.appendChild(descripcion);
    }

    const nombreDeParte = nombreParte(entrada.parte_id, state.partesActuales);
    const nombreDeContacto = nombreContacto(entrada.contacto_id, contactosActuales);

    const relaciones = [
        nombreDeParte ? `Parte: ${nombreDeParte}` : null,
        nombreDeContacto ? `Contacto: ${nombreDeContacto}` : null
    ].filter(Boolean).join(" · ");

    if (relaciones) {
        const relacionesEl = document.createElement("p");
        relacionesEl.className = "bitacora-meta";
        relacionesEl.textContent = relaciones;
        fila.appendChild(relacionesEl);
    }

    if (entrada.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "bitacora-observaciones";
        observaciones.textContent = entrada.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(entrada)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(entrada)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(entradas) {

    bitacoraList.innerHTML = "";

    if (entradas.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay entradas en la bitácora.";
        bitacoraList.appendChild(vacio);
        return;
    }

    for (const entrada of entradas) {
        bitacoraList.appendChild(crearFilaEntrada(entrada));
    }
}

export async function cargarBitacora(propertyId) {

    bitacoraList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando bitácora...";
    bitacoraList.appendChild(cargando);

    const user = usuarioActual();

    try {
        contactosActuales = user ? await obtenerContactos(user.uid) : [];
    } catch (error) {
        console.error("Error al cargar los contactos:", error);
        contactosActuales = [];
    }

    try {

        const entradas = await obtenerBitacora(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(entradas);
        }

    } catch (error) {

        console.error("Error al cargar la bitácora:", error);

        bitacoraList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se ha podido cargar la bitácora.";
        bitacoraList.appendChild(errorMsg);
    }
}

function abrirEdicion(entrada) {
    entradaActual = entrada;
    rellenarFormularioEntrada("edit-bitacora", entrada);
    editBitacoraMessage.textContent = "";
    mostrarVista("edit-bitacora");
}

async function eliminar(entrada) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la entrada "${entrada.titulo ?? ""}" de la bitácora?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarEntradaBitacora(state.inmuebleActual.id, entrada.id);
        await cargarBitacora(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar la entrada:", error);
        alert("No se ha podido eliminar la entrada.");
    }
}

addBitacoraBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addBitacoraForm.reset();
    poblarSelectPartes("bitacora-parte", state.partesActuales, "");
    poblarSelectContactos("bitacora-contacto", contactosActuales, "");
    addBitacoraMessage.textContent = "";
    mostrarVista("add-bitacora");
});

addBitacoraCancelBtn.addEventListener("click", () => {
    addBitacoraMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addBitacoraForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addBitacoraMessage.textContent = "Guardando...";

    const datos = leerDatosEntradaForm("bitacora");

    try {

        await crearEntradaBitacora(state.inmuebleActual.id, datos);

        addBitacoraMessage.textContent = "";
        addBitacoraForm.reset();

        mostrarVista("property");
        await cargarBitacora(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la entrada:", error);

        addBitacoraMessage.textContent =
            "No se ha podido guardar la entrada.";
    }
});

editBitacoraCancelBtn.addEventListener("click", () => {
    entradaActual = null;
    editBitacoraMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editBitacoraForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !entradaActual) {
        return;
    }

    editBitacoraMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosEntradaForm("edit-bitacora");

    try {

        await actualizarEntradaBitacora(state.inmuebleActual.id, entradaActual.id, datosActualizados);

        editBitacoraMessage.textContent = "";
        entradaActual = null;

        mostrarVista("property");
        await cargarBitacora(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la entrada:", error);

        editBitacoraMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});