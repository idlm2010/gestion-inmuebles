import "../styles/alertas.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import {
    obtenerAlertas,
    crearAlerta,
    actualizarAlerta,
    eliminarAlerta
} from "../services/alertas.js";
import {
    valorTexto,
    valorFecha,
    fechaAValorInput,
    formatearFecha,
    crearBotonAccion
} from "../utils/formato.js";

const alertasBtn = document.getElementById("alertas-btn");
const backToPropertiesFromAlertasBtn = document.getElementById("back-to-properties-from-alertas-btn");
const alertasList = document.getElementById("alertas-list");
const addAlertaBtn = document.getElementById("add-alerta-btn");

const addAlertaForm = document.getElementById("add-alerta-form");
const addAlertaMessage = document.getElementById("add-alerta-message");
const addAlertaCancelBtn = document.getElementById("add-alerta-cancel-btn");

const editAlertaForm = document.getElementById("edit-alerta-form");
const editAlertaMessage = document.getElementById("edit-alerta-message");
const editAlertaCancelBtn = document.getElementById("edit-alerta-cancel-btn");

let alertaActual = null;


function poblarSelectInmuebles(selectId, inmuebles, valorSeleccionado) {

    const select = document.getElementById(selectId);
    select.innerHTML = "";

    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "Sin inmueble asociado";
    select.appendChild(opcionVacia);

    for (const inmueble of inmuebles) {
        const opcion = document.createElement("option");
        opcion.value = inmueble.id;
        opcion.textContent = inmueble.nombre ?? "";
        select.appendChild(opcion);
    }

    select.value = valorSeleccionado ?? "";
}

function nombreInmueble(inmuebleId) {

    if (!inmuebleId) {
        return null;
    }

    const inmueble = state.misInmuebles.find((i) => i.id === inmuebleId);

    return inmueble ? inmueble.nombre : null;
}

function leerDatosAlertaForm(prefix) {
    return {
        inmueble_id: valorTexto(`${prefix}-inmueble`),
        tipo: valorTexto(`${prefix}-tipo`),
        titulo: valorTexto(`${prefix}-titulo`),
        descripcion: valorTexto(`${prefix}-descripcion`),
        fecha_alerta: valorFecha(`${prefix}-fecha-alerta`),
        estado: valorTexto(`${prefix}-estado`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioAlerta(prefix, alerta) {
    document.getElementById(`${prefix}-titulo`).value = alerta.titulo ?? "";
    document.getElementById(`${prefix}-fecha-alerta`).value = fechaAValorInput(alerta.fecha_alerta);
    document.getElementById(`${prefix}-estado`).value = alerta.estado ?? "Pendiente";
    document.getElementById(`${prefix}-tipo`).value = alerta.tipo ?? "";
    poblarSelectInmuebles(`${prefix}-inmueble`, state.misInmuebles, alerta.inmueble_id ?? "");
    document.getElementById(`${prefix}-descripcion`).value = alerta.descripcion ?? "";
    document.getElementById(`${prefix}-observaciones`).value = alerta.observaciones ?? "";
}

function crearFilaAlerta(alerta) {

    const fila = document.createElement("article");
    fila.className = "alerta-row";

    const cabecera = document.createElement("div");
    cabecera.className = "alerta-header";

    const titulo = document.createElement("span");
    titulo.className = "alerta-titulo";
    titulo.textContent = alerta.titulo ?? "";

    const estado = document.createElement("span");
    estado.className = "alerta-estado";
    estado.textContent = alerta.estado ?? "";

    cabecera.appendChild(titulo);
    cabecera.appendChild(estado);
    fila.appendChild(cabecera);

    const meta = [
        formatearFecha(alerta.fecha_alerta),
        alerta.tipo,
        nombreInmueble(alerta.inmueble_id)
    ].filter(Boolean).join(" · ");

    if (meta) {
        const metaEl = document.createElement("p");
        metaEl.className = "alerta-meta";
        metaEl.textContent = meta;
        fila.appendChild(metaEl);
    }

    if (alerta.descripcion) {
        const descripcion = document.createElement("p");
        descripcion.className = "alerta-descripcion";
        descripcion.textContent = alerta.descripcion;
        fila.appendChild(descripcion);
    }

    if (alerta.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "alerta-observaciones";
        observaciones.textContent = alerta.observaciones;
        fila.appendChild(observaciones);
    }

    const acciones = document.createElement("div");
    acciones.className = "row-actions";

    acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(alerta)));
    acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(alerta)));

    fila.appendChild(acciones);

    return fila;
}

function renderizar(alertas) {

    alertasList.innerHTML = "";

    if (alertas.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no tienes alertas creadas.";
        alertasList.appendChild(vacio);
        return;
    }

    for (const alerta of alertas) {
        alertasList.appendChild(crearFilaAlerta(alerta));
    }
}

async function cargarAlertas() {

    const user = usuarioActual();

    if (!user) {
        return;
    }

    alertasList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando alertas...";
    alertasList.appendChild(cargando);

    try {

        const alertas = await obtenerAlertas(user.uid);
        renderizar(alertas);

    } catch (error) {

        console.error("Error al cargar las alertas:", error);

        alertasList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las alertas.";
        alertasList.appendChild(errorMsg);
    }
}

function abrirEdicion(alerta) {
    alertaActual = alerta;
    rellenarFormularioAlerta("edit-alerta", alerta);
    editAlertaMessage.textContent = "";
    mostrarVista("edit-alerta");
}

async function eliminar(alerta) {

    const user = usuarioActual();

    if (!user) {
        return;
    }

    const confirmado = confirm(`¿Eliminar la alerta "${alerta.titulo ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarAlerta(user.uid, alerta.id);
        await cargarAlertas();
    } catch (error) {
        console.error("Error al eliminar la alerta:", error);
        alert("No se ha podido eliminar la alerta.");
    }
}

alertasBtn.addEventListener("click", () => {
    mostrarVista("alertas");
    cargarAlertas();
});

backToPropertiesFromAlertasBtn.addEventListener("click", () => {
    mostrarVista("properties");
});

addAlertaBtn.addEventListener("click", () => {
    addAlertaForm.reset();
    poblarSelectInmuebles("alerta-inmueble", state.misInmuebles, "");
    addAlertaMessage.textContent = "";
    mostrarVista("add-alerta");
});

addAlertaCancelBtn.addEventListener("click", () => {
    addAlertaMessage.textContent = "";
    mostrarVista("alertas");
});

addAlertaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const user = usuarioActual();

    if (!user) {
        return;
    }

    addAlertaMessage.textContent = "Guardando...";

    const datos = leerDatosAlertaForm("alerta");

    try {

        await crearAlerta(user.uid, datos);

        addAlertaMessage.textContent = "";
        addAlertaForm.reset();

        mostrarVista("alertas");
        await cargarAlertas();

    } catch (error) {

        console.error("Error al guardar la alerta:", error);

        addAlertaMessage.textContent =
            "No se ha podido guardar la alerta.";
    }
});

editAlertaCancelBtn.addEventListener("click", () => {
    alertaActual = null;
    editAlertaMessage.textContent = "";
    mostrarVista("alertas");
});

editAlertaForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const user = usuarioActual();

    if (!user || !alertaActual) {
        return;
    }

    editAlertaMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosAlertaForm("edit-alerta");

    try {

        await actualizarAlerta(user.uid, alertaActual.id, datosActualizados);

        editAlertaMessage.textContent = "";
        alertaActual = null;

        mostrarVista("alertas");
        await cargarAlertas();

    } catch (error) {

        console.error("Error al guardar la alerta:", error);

        editAlertaMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});