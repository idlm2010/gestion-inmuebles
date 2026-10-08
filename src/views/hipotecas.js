import "../styles/hipotecas.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerHipotecas,
    crearHipoteca,
    actualizarHipoteca,
    eliminarHipoteca
} from "../services/hipotecas.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearMoneda,
    formatearRangoFechas,
    crearBotonAccion
} from "../utils/formato.js";

const hipotecasList = document.getElementById("hipotecas-list");
const addHipotecaBtn = document.getElementById("add-hipoteca-btn");

const addHipotecaForm = document.getElementById("add-hipoteca-form");
const addHipotecaMessage = document.getElementById("add-hipoteca-message");
const addHipotecaCancelBtn = document.getElementById("add-hipoteca-cancel-btn");

const editHipotecaForm = document.getElementById("edit-hipoteca-form");
const editHipotecaMessage = document.getElementById("edit-hipoteca-message");
const editHipotecaCancelBtn = document.getElementById("edit-hipoteca-cancel-btn");

let hipotecaActual = null;


function leerDatosHipotecaForm(prefix) {
    return {
        entidad: valorTexto(`${prefix}-entidad`),
        numero_hipoteca: valorTexto(`${prefix}-numero-hipoteca`),
        fecha_inicio: valorFecha(`${prefix}-fecha-inicio`),
        fecha_fin: valorFecha(`${prefix}-fecha-fin`),
        importe_inicial: valorNumero(`${prefix}-importe-inicial`),
        capital_pendiente: valorNumero(`${prefix}-capital-pendiente`),
        cuota_actual: valorNumero(`${prefix}-cuota-actual`),
        tipo_interes: valorTexto(`${prefix}-tipo-interes`),
        interes: valorNumero(`${prefix}-interes`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioHipoteca(prefix, hipoteca) {
    document.getElementById(`${prefix}-entidad`).value = hipoteca.entidad ?? "";
    document.getElementById(`${prefix}-numero-hipoteca`).value = hipoteca.numero_hipoteca ?? "";
    document.getElementById(`${prefix}-fecha-inicio`).value = fechaAValorInput(hipoteca.fecha_inicio);
    document.getElementById(`${prefix}-fecha-fin`).value = fechaAValorInput(hipoteca.fecha_fin);
    document.getElementById(`${prefix}-importe-inicial`).value = hipoteca.importe_inicial ?? "";
    document.getElementById(`${prefix}-capital-pendiente`).value = hipoteca.capital_pendiente ?? "";
    document.getElementById(`${prefix}-cuota-actual`).value = hipoteca.cuota_actual ?? "";
    document.getElementById(`${prefix}-tipo-interes`).value = hipoteca.tipo_interes ?? "Fijo";
    document.getElementById(`${prefix}-interes`).value = hipoteca.interes ?? "";
    document.getElementById(`${prefix}-observaciones`).value = hipoteca.observaciones ?? "";
}

function crearFilaHipoteca(hipoteca) {

    const fila = document.createElement("article");
    fila.className = "hipoteca-row";

    const cabecera = document.createElement("div");
    cabecera.className = "hipoteca-header";

    const entidad = document.createElement("span");
    entidad.className = "hipoteca-entidad";
    entidad.textContent = hipoteca.entidad ?? "";

    const tipo = document.createElement("span");
    tipo.className = "hipoteca-tipo";
    tipo.textContent = hipoteca.tipo_interes ?? "";

    cabecera.appendChild(entidad);
    cabecera.appendChild(tipo);
    fila.appendChild(cabecera);

    if (hipoteca.numero_hipoteca) {
        const numero = document.createElement("p");
        numero.className = "hipoteca-meta";
        numero.textContent = `Nº hipoteca: ${hipoteca.numero_hipoteca}`;
        fila.appendChild(numero);
    }

    const vigencia = formatearRangoFechas(hipoteca.fecha_inicio, hipoteca.fecha_fin);

    if (vigencia) {
        const vigenciaEl = document.createElement("p");
        vigenciaEl.className = "hipoteca-meta";
        vigenciaEl.textContent = `Vigencia: ${vigencia}`;
        fila.appendChild(vigenciaEl);
    }

    const importes = [];

    if (hipoteca.importe_inicial !== undefined && hipoteca.importe_inicial !== null) {
        importes.push(`Inicial: ${formatearMoneda(hipoteca.importe_inicial)}`);
    }

    if (hipoteca.capital_pendiente !== undefined && hipoteca.capital_pendiente !== null) {
        importes.push(`Pendiente: ${formatearMoneda(hipoteca.capital_pendiente)}`);
    }

    if (hipoteca.cuota_actual !== undefined && hipoteca.cuota_actual !== null) {
        importes.push(`Cuota: ${formatearMoneda(hipoteca.cuota_actual)}/mes`);
    }

    if (importes.length > 0) {
        const importesEl = document.createElement("p");
        importesEl.className = "hipoteca-meta";
        importesEl.textContent = importes.join(" · ");
        fila.appendChild(importesEl);
    }

    if (hipoteca.interes !== undefined && hipoteca.interes !== null) {
        const interes = document.createElement("p");
        interes.className = "hipoteca-meta";
        interes.textContent = `Interés: ${hipoteca.interes}%`;
        fila.appendChild(interes);
    }

    if (hipoteca.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "hipoteca-observaciones";
        observaciones.textContent = hipoteca.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(hipoteca)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(hipoteca)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(hipotecas) {

    hipotecasList.innerHTML = "";

    if (hipotecas.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay hipotecas registradas.";
        hipotecasList.appendChild(vacio);
        return;
    }

    for (const hipoteca of hipotecas) {
        hipotecasList.appendChild(crearFilaHipoteca(hipoteca));
    }
}

export async function cargarHipotecas(propertyId) {

    hipotecasList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando hipotecas...";
    hipotecasList.appendChild(cargando);

    try {

        const hipotecas = await obtenerHipotecas(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(hipotecas);
        }

    } catch (error) {

        console.error("Error al cargar las hipotecas:", error);

        hipotecasList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las hipotecas.";
        hipotecasList.appendChild(errorMsg);
    }
}

function abrirEdicion(hipoteca) {
    hipotecaActual = hipoteca;
    rellenarFormularioHipoteca("edit-hipoteca", hipoteca);
    editHipotecaMessage.textContent = "";
    mostrarVista("edit-hipoteca");
}

async function eliminar(hipoteca) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la hipoteca de "${hipoteca.entidad ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarHipoteca(state.inmuebleActual.id, hipoteca.id);
        await cargarHipotecas(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar la hipoteca:", error);
        alert("No se ha podido eliminar la hipoteca.");
    }
}

addHipotecaBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addHipotecaForm.reset();
    addHipotecaMessage.textContent = "";
    mostrarVista("add-hipoteca");
});

addHipotecaCancelBtn.addEventListener("click", () => {
    addHipotecaMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addHipotecaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addHipotecaMessage.textContent = "Guardando...";

    const datos = leerDatosHipotecaForm("hipoteca");

    try {

        await crearHipoteca(state.inmuebleActual.id, datos);

        addHipotecaMessage.textContent = "";
        addHipotecaForm.reset();

        mostrarVista("property");
        await cargarHipotecas(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la hipoteca:", error);

        addHipotecaMessage.textContent =
            "No se ha podido guardar la hipoteca.";
    }
});

editHipotecaCancelBtn.addEventListener("click", () => {
    hipotecaActual = null;
    editHipotecaMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editHipotecaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !hipotecaActual) {
        return;
    }

    editHipotecaMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosHipotecaForm("edit-hipoteca");

    try {

        await actualizarHipoteca(state.inmuebleActual.id, hipotecaActual.id, datosActualizados);

        editHipotecaMessage.textContent = "";
        hipotecaActual = null;

        mostrarVista("property");
        await cargarHipotecas(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar la hipoteca:", error);

        editHipotecaMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});