import "../styles/contratos-alquiler.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerContratos,
    crearContrato,
    actualizarContrato,
    eliminarContrato
} from "../services/contratosAlquiler.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearMoneda,
    formatearRangoFechas,
    crearBotonAccion
} from "../utils/formato.js";
import { abrirPagos } from "./pagos-alquiler.js";

const contratosList = document.getElementById("contratos-list");
const addContratoBtn = document.getElementById("add-contrato-btn");

const addContratoForm = document.getElementById("add-contrato-form");
const addContratoMessage = document.getElementById("add-contrato-message");
const addContratoCancelBtn = document.getElementById("add-contrato-cancel-btn");

const editContratoForm = document.getElementById("edit-contrato-form");
const editContratoMessage = document.getElementById("edit-contrato-message");
const editContratoCancelBtn = document.getElementById("edit-contrato-cancel-btn");

let contratoActual = null;


function leerDatosContratoForm(prefix) {
    return {
        tipo: valorTexto(`${prefix}-tipo`),
        estado: valorTexto(`${prefix}-estado`),
        fecha_inicio: valorFecha(`${prefix}-fecha-inicio`),
        fecha_fin: valorFecha(`${prefix}-fecha-fin`),
        importe_mensual: valorNumero(`${prefix}-importe-mensual`),
        fianza: valorNumero(`${prefix}-fianza`),
        dia_pago: valorNumero(`${prefix}-dia-pago`),
        actualizacion: valorTexto(`${prefix}-actualizacion`),
        importe_actualizado: valorNumero(`${prefix}-importe-actualizado`),
        nombre_arrendatario: valorTexto(`${prefix}-nombre-arrendatario`),
        apellidos_arrendatario: valorTexto(`${prefix}-apellidos-arrendatario`),
        telefono_arrendatario: valorTexto(`${prefix}-telefono-arrendatario`),
        email_arrendatario: valorTexto(`${prefix}-email-arrendatario`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioContrato(prefix, contrato) {
    document.getElementById(`${prefix}-tipo`).value = contrato.tipo ?? "Vivienda";
    document.getElementById(`${prefix}-estado`).value = contrato.estado ?? "Borrador";
    document.getElementById(`${prefix}-fecha-inicio`).value = fechaAValorInput(contrato.fecha_inicio);
    document.getElementById(`${prefix}-fecha-fin`).value = fechaAValorInput(contrato.fecha_fin);
    document.getElementById(`${prefix}-importe-mensual`).value = contrato.importe_mensual ?? "";
    document.getElementById(`${prefix}-fianza`).value = contrato.fianza ?? "";
    document.getElementById(`${prefix}-dia-pago`).value = contrato.dia_pago ?? "";
    document.getElementById(`${prefix}-actualizacion`).value = contrato.actualizacion ?? "";
    document.getElementById(`${prefix}-importe-actualizado`).value = contrato.importe_actualizado ?? "";
    document.getElementById(`${prefix}-nombre-arrendatario`).value = contrato.nombre_arrendatario ?? "";
    document.getElementById(`${prefix}-apellidos-arrendatario`).value = contrato.apellidos_arrendatario ?? "";
    document.getElementById(`${prefix}-telefono-arrendatario`).value = contrato.telefono_arrendatario ?? "";
    document.getElementById(`${prefix}-email-arrendatario`).value = contrato.email_arrendatario ?? "";
    document.getElementById(`${prefix}-observaciones`).value = contrato.observaciones ?? "";
}

function crearFilaContrato(contrato) {

    const fila = document.createElement("article");
    fila.className = "contrato-row";

    const cabecera = document.createElement("div");
    cabecera.className = "contrato-header";

    const tipoEstado = document.createElement("span");
    tipoEstado.className = "contrato-tipo-estado";
    tipoEstado.textContent = `${contrato.tipo ?? ""} · ${contrato.estado ?? ""}`;
    cabecera.appendChild(tipoEstado);
    fila.appendChild(cabecera);

    const arrendatario = [contrato.nombre_arrendatario, contrato.apellidos_arrendatario]
        .filter(Boolean)
        .join(" ");

    if (arrendatario) {
        const arrendatarioEl = document.createElement("p");
        arrendatarioEl.className = "contrato-meta";
        arrendatarioEl.textContent = `Arrendatario: ${arrendatario}`;
        fila.appendChild(arrendatarioEl);
    }

    const vigencia = formatearRangoFechas(contrato.fecha_inicio, contrato.fecha_fin);

    if (vigencia) {
        const vigenciaEl = document.createElement("p");
        vigenciaEl.className = "contrato-meta";
        vigenciaEl.textContent = `Vigencia: ${vigencia}`;
        fila.appendChild(vigenciaEl);
    }

    const importes = [];

    if (contrato.importe_mensual !== undefined && contrato.importe_mensual !== null) {
        importes.push(`${formatearMoneda(contrato.importe_mensual)}/mes`);
    }

    if (contrato.fianza !== undefined && contrato.fianza !== null) {
        importes.push(`Fianza: ${formatearMoneda(contrato.fianza)}`);
    }

    if (contrato.dia_pago !== undefined && contrato.dia_pago !== null) {
        importes.push(`Día de pago: ${contrato.dia_pago}`);
    }

    if (importes.length > 0) {
        const importesEl = document.createElement("p");
        importesEl.className = "contrato-meta";
        importesEl.textContent = importes.join(" · ");
        fila.appendChild(importesEl);
    }

    if (contrato.actualizacion || (contrato.importe_actualizado !== undefined && contrato.importe_actualizado !== null)) {
        const actualizacionPartes = [
            contrato.actualizacion,
            contrato.importe_actualizado !== undefined && contrato.importe_actualizado !== null
                ? `Importe actualizado: ${formatearMoneda(contrato.importe_actualizado)}`
                : null
        ].filter(Boolean).join(" · ");

        const actualizacionEl = document.createElement("p");
        actualizacionEl.className = "contrato-meta";
        actualizacionEl.textContent = actualizacionPartes;
        fila.appendChild(actualizacionEl);
    }

    const contactoArrendatario = [contrato.telefono_arrendatario, contrato.email_arrendatario]
        .filter(Boolean)
        .join(" · ");

    if (contactoArrendatario) {
        const contactoEl = document.createElement("p");
        contactoEl.className = "contrato-meta";
        contactoEl.textContent = contactoArrendatario;
        fila.appendChild(contactoEl);
    }

    if (contrato.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "contrato-observaciones";
        observaciones.textContent = contrato.observaciones;
        fila.appendChild(observaciones);
    }

    const acciones = document.createElement("div");
    acciones.className = "row-actions";

    acciones.appendChild(crearBotonAccion("Pagos", null, () => abrirPagos(contrato)));

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {
        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(contrato)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(contrato)));
    }

    fila.appendChild(acciones);

    return fila;
}

function renderizar(contratos) {

    contratosList.innerHTML = "";

    if (contratos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay contratos de alquiler registrados.";
        contratosList.appendChild(vacio);
        return;
    }

    for (const contrato of contratos) {
        contratosList.appendChild(crearFilaContrato(contrato));
    }
}

export async function cargarContratos(propertyId) {

    contratosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando contratos...";
    contratosList.appendChild(cargando);

    try {

        const contratos = await obtenerContratos(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(contratos);
        }

    } catch (error) {

        console.error("Error al cargar los contratos:", error);

        contratosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los contratos.";
        contratosList.appendChild(errorMsg);
    }
}

function abrirEdicion(contrato) {
    contratoActual = contrato;
    rellenarFormularioContrato("edit-contrato", contrato);
    editContratoMessage.textContent = "";
    mostrarVista("edit-contrato");
}

async function eliminar(contrato) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm("¿Eliminar este contrato de alquiler?");

    if (!confirmado) {
        return;
    }

    try {
        await eliminarContrato(state.inmuebleActual.id, contrato.id);
        await cargarContratos(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar el contrato:", error);
        alert("No se ha podido eliminar el contrato.");
    }
}

addContratoBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addContratoForm.reset();
    addContratoMessage.textContent = "";
    mostrarVista("add-contrato");
});

addContratoCancelBtn.addEventListener("click", () => {
    addContratoMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addContratoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addContratoMessage.textContent = "Guardando...";

    const datos = leerDatosContratoForm("contrato");

    try {

        await crearContrato(state.inmuebleActual.id, datos);

        addContratoMessage.textContent = "";
        addContratoForm.reset();

        mostrarVista("property");
        await cargarContratos(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el contrato:", error);

        addContratoMessage.textContent =
            "No se ha podido guardar el contrato.";
    }
});

editContratoCancelBtn.addEventListener("click", () => {
    contratoActual = null;
    editContratoMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editContratoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !contratoActual) {
        return;
    }

    editContratoMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosContratoForm("edit-contrato");

    try {

        await actualizarContrato(state.inmuebleActual.id, contratoActual.id, datosActualizados);

        editContratoMessage.textContent = "";
        contratoActual = null;

        mostrarVista("property");
        await cargarContratos(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el contrato:", error);

        editContratoMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});