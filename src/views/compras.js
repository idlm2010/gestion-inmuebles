import "../styles/compras.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import { obtenerContactos } from "../services/contactos.js";
import {
    obtenerCompras,
    crearCompra,
    actualizarCompra,
    eliminarCompra
} from "../services/compras.js";
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

const comprasList = document.getElementById("compras-list");
const addCompraBtn = document.getElementById("add-compra-btn");

const addCompraForm = document.getElementById("add-compra-form");
const addCompraMessage = document.getElementById("add-compra-message");
const addCompraCancelBtn = document.getElementById("add-compra-cancel-btn");

const editCompraForm = document.getElementById("edit-compra-form");
const editCompraMessage = document.getElementById("edit-compra-message");
const editCompraCancelBtn = document.getElementById("edit-compra-cancel-btn");

let compraActual = null;
let contactosActuales = [];


function leerDatosCompraForm(prefix) {
    return {
        fecha: valorFecha(`${prefix}-fecha`),
        tipo: valorTexto(`${prefix}-tipo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        importe: valorNumero(`${prefix}-importe`),
        parte_id: valorTexto(`${prefix}-parte`),
        contacto_id: valorTexto(`${prefix}-contacto`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioCompra(prefix, compra) {
    document.getElementById(`${prefix}-fecha`).value = fechaAValorInput(compra.fecha);
    document.getElementById(`${prefix}-tipo`).value = compra.tipo ?? "Electrodoméstico";
    document.getElementById(`${prefix}-descripcion`).value = compra.descripcion ?? "";
    document.getElementById(`${prefix}-importe`).value = compra.importe ?? "";
    poblarSelectPartes(`${prefix}-parte`, state.partesActuales, compra.parte_id ?? "");
    poblarSelectContactos(`${prefix}-contacto`, contactosActuales, compra.contacto_id ?? "");
    document.getElementById(`${prefix}-observaciones`).value = compra.observaciones ?? "";
}

function crearFilaCompra(compra) {

    const fila = document.createElement("article");
    fila.className = "compra-row";

    const cabecera = document.createElement("div");
    cabecera.className = "compra-header";

    const tipoFecha = document.createElement("span");
    tipoFecha.className = "compra-tipo-fecha";
    tipoFecha.textContent = `${compra.tipo ?? ""} · ${formatearFecha(compra.fecha) ?? ""}`;

    const importe = document.createElement("span");
    importe.className = "compra-importe";
    importe.textContent = formatearMoneda(compra.importe) ?? "";

    cabecera.appendChild(tipoFecha);
    cabecera.appendChild(importe);
    fila.appendChild(cabecera);

    if (compra.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "compra-descripcion";
        descripcion.textContent = compra.descripcion;
        fila.appendChild(descripcion);
    }

    const nombreDeParte = nombreParte(compra.parte_id, state.partesActuales);
    const nombreDeContacto = nombreContacto(compra.contacto_id, contactosActuales);

    const relaciones = [
        nombreDeParte ? `Parte: ${nombreDeParte}` : null,
        nombreDeContacto ? `Contacto: ${nombreDeContacto}` : null
    ].filter(Boolean).join(" · ");

    if (relaciones) {
        const relacionesEl = document.createElement("p");
        relacionesEl.className = "compra-meta";
        relacionesEl.textContent = relaciones;
        fila.appendChild(relacionesEl);
    }

    if (compra.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "compra-observaciones";
        observaciones.textContent = compra.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(compra)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(compra)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(compras) {

    comprasList.innerHTML = "";

    if (compras.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay compras registradas.";
        comprasList.appendChild(vacio);
        return;
    }

    for (const compra of compras) {
        comprasList.appendChild(crearFilaCompra(compra));
    }
}

export async function cargarCompras(propertyId) {

    comprasList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando compras...";
    comprasList.appendChild(cargando);

    const user = usuarioActual();

    try {
        contactosActuales = user ? await obtenerContactos(user.uid) : [];
    } catch (error) {
        console.error("Error al cargar los contactos:", error);
        contactosActuales = [];
    }

    try {

        const compras = await obtenerCompras(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(compras);
        }

    } catch (error) {

        console.error("Error al cargar las compras:", error);

        comprasList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las compras.";
        comprasList.appendChild(errorMsg);
    }
}

function abrirEdicion(compra) {
    compraActual = compra;
    rellenarFormularioCompra("edit-compra", compra);
    editCompraMessage.textContent = "";
    mostrarVista("edit-compra");
}

async function eliminar(compra) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la compra "${compra.descripcion ?? compra.tipo ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarCompra(state.inmuebleActual.id, compra.id);
        await cargarCompras(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar la compra:", error);
        alert("No se ha podido eliminar la compra.");
    }
}

addCompraBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addCompraForm.reset();
    poblarSelectPartes("compra-parte", state.partesActuales, "");
    poblarSelectContactos("compra-contacto", contactosActuales, "");
    addCompraMessage.textContent = "";
    mostrarVista("add-compra");
});

addCompraCancelBtn.addEventListener("click", () => {
    addCompraMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addCompraForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addCompraMessage.textContent = "Guardando...";

    const datos = leerDatosCompraForm("compra");

    try {

        await crearCompra(state.inmuebleActual.id, datos);

        addCompraMessage.textContent = "";
        addCompraForm.reset();

        mostrarVista("property");
        await cargarCompras(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la compra:", error);

        addCompraMessage.textContent =
            "No se ha podido guardar la compra.";
    }
});

editCompraCancelBtn.addEventListener("click", () => {
    compraActual = null;
    editCompraMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editCompraForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !compraActual) {
        return;
    }

    editCompraMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosCompraForm("edit-compra");

    try {

        await actualizarCompra(state.inmuebleActual.id, compraActual.id, datosActualizados);

        editCompraMessage.textContent = "";
        compraActual = null;

        mostrarVista("property");
        await cargarCompras(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la compra:", error);

        editCompraMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});