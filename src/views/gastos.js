import "../styles/gastos.css";

import { state, mostrarVista } from "../state.js";
import {
    obtenerGastos,
    crearGasto,
    actualizarGasto,
    eliminarGasto
} from "../services/gastos.js";
import {
    valorTexto,
    valorNumero,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    formatearMoneda,
    crearBotonAccion
} from "../utils/formato.js";

const gastosList = document.getElementById("gastos-list");
const addGastoBtn = document.getElementById("add-gasto-btn");

const addGastoForm = document.getElementById("add-gasto-form");
const addGastoMessage = document.getElementById("add-gasto-message");
const addGastoCancelBtn = document.getElementById("add-gasto-cancel-btn");

const editGastoForm = document.getElementById("edit-gasto-form");
const editGastoMessage = document.getElementById("edit-gasto-message");
const editGastoCancelBtn = document.getElementById("edit-gasto-cancel-btn");

let gastoActual = null;


function leerDatosGastoForm(prefix) {
    return {
        fecha: valorFecha(`${prefix}-fecha`),
        tipo: valorTexto(`${prefix}-tipo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        importe: valorNumero(`${prefix}-importe`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioGasto(prefix, gasto) {
    document.getElementById(`${prefix}-fecha`).value = fechaAValorInput(gasto.fecha);
    document.getElementById(`${prefix}-tipo`).value = gasto.tipo ?? "IBI";
    document.getElementById(`${prefix}-descripcion`).value = gasto.descripcion ?? "";
    document.getElementById(`${prefix}-importe`).value = gasto.importe ?? "";
    document.getElementById(`${prefix}-observaciones`).value = gasto.observaciones ?? "";
}

function crearFilaGasto(gasto) {

    const fila = document.createElement("article");
    fila.className = "gasto-row";

    const cabecera = document.createElement("div");
    cabecera.className = "gasto-header";

    const tipoFecha = document.createElement("span");
    tipoFecha.className = "gasto-tipo-fecha";
    tipoFecha.textContent = `${gasto.tipo ?? ""} · ${formatearFecha(gasto.fecha) ?? ""}`;

    const importe = document.createElement("span");
    importe.className = "gasto-importe";
    importe.textContent = formatearMoneda(gasto.importe) ?? "";

    cabecera.appendChild(tipoFecha);
    cabecera.appendChild(importe);
    fila.appendChild(cabecera);

    if (gasto.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "gasto-descripcion";
        descripcion.textContent = gasto.descripcion;
        fila.appendChild(descripcion);
    }

    if (gasto.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "gasto-observaciones";
        observaciones.textContent = gasto.observaciones;
        fila.appendChild(observaciones);
    }

    if (state.inmuebleActual && state.inmuebleActual.permiso === "Edición") {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(gasto)));
        acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(gasto)));

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizar(gastos) {

    gastosList.innerHTML = "";

    if (gastos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay gastos registrados.";
        gastosList.appendChild(vacio);
        return;
    }

    for (const gasto of gastos) {
        gastosList.appendChild(crearFilaGasto(gasto));
    }
}

export async function cargarGastos(propertyId) {

    gastosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando gastos...";
    gastosList.appendChild(cargando);

    try {

        const gastos = await obtenerGastos(propertyId);

        if (state.inmuebleActual && state.inmuebleActual.id === propertyId) {
            renderizar(gastos);
        }

    } catch (error) {

        console.error("Error al cargar los gastos:", error);

        gastosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los gastos.";
        gastosList.appendChild(errorMsg);
    }
}

function abrirEdicion(gasto) {
    gastoActual = gasto;
    rellenarFormularioGasto("edit-gasto", gasto);
    editGastoMessage.textContent = "";
    mostrarVista("edit-gasto");
}

async function eliminar(gasto) {

    if (!state.inmuebleActual) {
        return;
    }

    const confirmado = confirm(
        `¿Eliminar el gasto "${gasto.descripcion ?? gasto.tipo ?? ""}" de ${formatearMoneda(gasto.importe) ?? ""}?`
    );

    if (!confirmado) {
        return;
    }

    try {
        await eliminarGasto(state.inmuebleActual.id, gasto.id);
        await cargarGastos(state.inmuebleActual.id);
    } catch (error) {
        console.error("Error al eliminar el gasto:", error);
        alert("No se ha podido eliminar el gasto.");
    }
}

addGastoBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    addGastoForm.reset();
    addGastoMessage.textContent = "";
    mostrarVista("add-gasto");
});

addGastoCancelBtn.addEventListener("click", () => {
    addGastoMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

addGastoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    addGastoMessage.textContent = "Guardando...";

    const datos = leerDatosGastoForm("gasto");

    try {

        await crearGasto(state.inmuebleActual.id, datos);

        addGastoMessage.textContent = "";
        addGastoForm.reset();

        mostrarVista("property");
        await cargarGastos(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el gasto:", error);

        addGastoMessage.textContent =
            "No se ha podido guardar el gasto.";
    }
});

editGastoCancelBtn.addEventListener("click", () => {
    gastoActual = null;
    editGastoMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editGastoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual || !gastoActual) {
        return;
    }

    editGastoMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosGastoForm("edit-gasto");

    try {

        await actualizarGasto(state.inmuebleActual.id, gastoActual.id, datosActualizados);

        editGastoMessage.textContent = "";
        gastoActual = null;

        mostrarVista("property");
        await cargarGastos(state.inmuebleActual.id);

    } catch (error) {

        console.error("Error al guardar el gasto:", error);

        editGastoMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});