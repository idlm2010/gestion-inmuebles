import "../styles/ficha-inmueble.css";

import { state, mostrarVista } from "../state.js";
import { actualizarInmueble } from "../services/inmuebles.js";
import {
    formatearDireccion,
    formatearUbicacion,
    formatearMoneda,
    formatearFecha,
    anadirFilaDato,
    rellenarFormularioInmueble,
    leerDatosInmuebleForm
} from "../utils/formato.js";
import { actualizarInmuebleEnLista, mostrarLista } from "./propiedades.js";
import { cargarPartes } from "./partes.js";
import { cargarGastos } from "./gastos.js";
import { cargarIncidencias } from "./incidencias.js";
import { cargarBitacora } from "./bitacora.js";
import { cargarSeguros } from "./seguros.js";
import { cargarHipotecas } from "./hipotecas.js";
import { cargarContratos } from "./contratos-alquiler.js";
import { cargarPropietarios } from "./propietarios.js";
import { cargarGastosRecurrentes } from "./gastos-recurrentes.js";
import { cargarCompras } from "./compras.js";

const propertyTitle = document.getElementById("property-title");
const propertyDetails = document.getElementById("property-details");
const backToPropertiesBtn = document.getElementById("back-to-properties-btn");
const editPropertyBtn = document.getElementById("edit-property-btn");
const compartirBtn = document.getElementById("compartir-btn");

const editPropertyForm = document.getElementById("edit-property-form");
const editPropertyMessage = document.getElementById("edit-property-message");
const editCancelBtn = document.getElementById("edit-cancel-btn");

const addParteBtn = document.getElementById("add-parte-btn");
const addGastoBtn = document.getElementById("add-gasto-btn");
const addIncidenciaBtn = document.getElementById("add-incidencia-btn");
const addBitacoraBtn = document.getElementById("add-bitacora-btn");
const addSeguroBtn = document.getElementById("add-seguro-btn");
const addHipotecaBtn = document.getElementById("add-hipoteca-btn");
const addContratoBtn = document.getElementById("add-contrato-btn");
const addPropietarioBtn = document.getElementById("add-propietario-btn");
const addRecurrenteBtn = document.getElementById("add-recurrente-btn");
const addCompraBtn = document.getElementById("add-compra-btn");


export async function abrirFicha(inmueble) {

    state.inmuebleActual = inmueble;

    propertyTitle.textContent = `🏠 ${inmueble.nombre ?? ""}`;
    propertyDetails.innerHTML = "";

    anadirFilaDato(propertyDetails, "Tipo", inmueble.tipo);
    anadirFilaDato(propertyDetails, "Dirección", formatearDireccion(inmueble));
    anadirFilaDato(propertyDetails, "Ubicación", formatearUbicacion(inmueble));
    anadirFilaDato(propertyDetails, "Superficie", inmueble.superficie ? `${inmueble.superficie} m²` : null);
    anadirFilaDato(propertyDetails, "Habitaciones", inmueble.habitaciones);
    anadirFilaDato(propertyDetails, "Baños", inmueble.banos);
    anadirFilaDato(propertyDetails, "Fecha de adquisición", formatearFecha(inmueble.fecha_adquisicion));
    anadirFilaDato(propertyDetails, "Valor de adquisición", formatearMoneda(inmueble.valor_adquisicion));
    anadirFilaDato(propertyDetails, "Valor actual", formatearMoneda(inmueble.valor_actual));
    anadirFilaDato(propertyDetails, "Observaciones", inmueble.observaciones);
    anadirFilaDato(propertyDetails, "Tu acceso", `${inmueble.rol ?? ""} · ${inmueble.permiso ?? ""}`);

    const puedeEditar = inmueble.permiso === "Edición";
    editPropertyBtn.hidden = !puedeEditar;
    compartirBtn.hidden = !puedeEditar;
    addParteBtn.hidden = !puedeEditar;
    addGastoBtn.hidden = !puedeEditar;
    addIncidenciaBtn.hidden = !puedeEditar;
    addBitacoraBtn.hidden = !puedeEditar;
    addSeguroBtn.hidden = !puedeEditar;
    addHipotecaBtn.hidden = !puedeEditar;
    addContratoBtn.hidden = !puedeEditar;
    addPropietarioBtn.hidden = !puedeEditar;
    addRecurrenteBtn.hidden = !puedeEditar;
    addCompraBtn.hidden = !puedeEditar;

    mostrarVista("property");

    await cargarPartes(inmueble.id);

    await Promise.all([
        cargarGastos(inmueble.id),
        cargarIncidencias(inmueble.id),
        cargarBitacora(inmueble.id),
        cargarSeguros(inmueble.id),
        cargarHipotecas(inmueble.id),
        cargarContratos(inmueble.id),
        cargarPropietarios(inmueble.id),
        cargarGastosRecurrentes(inmueble.id),
        cargarCompras(inmueble.id)
    ]);
}

backToPropertiesBtn.addEventListener("click", () => {
    state.inmuebleActual = null;
    mostrarLista();
});

editPropertyBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    rellenarFormularioInmueble("edit", state.inmuebleActual);
    editPropertyMessage.textContent = "";
    mostrarVista("edit-property");
});

editCancelBtn.addEventListener("click", () => {
    editPropertyMessage.textContent = "";
    mostrarVista(state.inmuebleActual ? "property" : "properties");
});

editPropertyForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!state.inmuebleActual) {
        return;
    }

    editPropertyMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosInmuebleForm("edit");

    try {

        await actualizarInmueble(state.inmuebleActual.id, datosActualizados);

        state.inmuebleActual = { ...state.inmuebleActual, ...datosActualizados };
        actualizarInmuebleEnLista(state.inmuebleActual);

        editPropertyMessage.textContent = "";

        await abrirFicha(state.inmuebleActual);

    } catch (error) {

        console.error("Error al guardar el inmueble:", error);

        editPropertyMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});