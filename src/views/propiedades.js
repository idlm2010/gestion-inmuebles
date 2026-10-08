import "../styles/propiedades.css";

import { state, mostrarVista } from "../state.js";
import { crearInmueble } from "../services/inmuebles.js";
import { usuarioActual } from "../services/auth.js";
import {
    rellenarFormularioInmueble,
    leerDatosInmuebleForm
} from "../utils/formato.js";
import { abrirFicha } from "./ficha-inmueble.js";

const propertiesList = document.getElementById("properties-list");
const addPropertyBtn = document.getElementById("add-property-btn");

const addPropertyForm = document.getElementById("add-property-form");
const addPropertyMessage = document.getElementById("add-property-message");
const addCancelBtn = document.getElementById("add-cancel-btn");


function crearTarjetaInmueble(inmueble) {

    const tarjeta = document.createElement("article");
    tarjeta.className = "property-card";
    tarjeta.tabIndex = 0;

    const titulo = document.createElement("h3");
    titulo.textContent = `🏠 ${inmueble.nombre ?? ""}`;
    tarjeta.appendChild(titulo);

    const tipo = document.createElement("p");
    tipo.className = "property-type";
    tipo.textContent = inmueble.tipo ?? "";
    tarjeta.appendChild(tipo);

    const direccionTexto = [inmueble.direccion, inmueble.numero]
        .filter(Boolean)
        .join(", ");

    if (direccionTexto) {
        const direccion = document.createElement("p");
        direccion.textContent = direccionTexto;
        tarjeta.appendChild(direccion);
    }

    if (inmueble.localidad) {
        const localidad = document.createElement("p");
        localidad.textContent = inmueble.localidad;
        tarjeta.appendChild(localidad);
    }

    const rolPermiso = document.createElement("p");
    rolPermiso.className = "property-role";
    rolPermiso.textContent = `${inmueble.rol ?? ""} · ${inmueble.permiso ?? ""}`;
    tarjeta.appendChild(rolPermiso);

    tarjeta.addEventListener("click", () => abrirFicha(inmueble));

    tarjeta.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
            event.preventDefault();
            abrirFicha(inmueble);
        }
    });

    return tarjeta;
}

function renderizarLista() {

    propertiesList.innerHTML = "";

    if (state.misInmuebles.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no tienes inmuebles.";
        propertiesList.appendChild(vacio);
        return;
    }

    for (const inmueble of state.misInmuebles) {
        propertiesList.appendChild(crearTarjetaInmueble(inmueble));
    }
}

export function mostrarConInmuebles(misInmuebles) {
    state.misInmuebles = misInmuebles;
    renderizarLista();
    mostrarVista("properties");
}

export function mostrarLista() {
    mostrarVista("properties");
}

export function actualizarInmuebleEnLista(inmuebleActualizado) {

    const indice = state.misInmuebles.findIndex((i) => i.id === inmuebleActualizado.id);

    if (indice !== -1) {
        state.misInmuebles[indice] = { ...state.misInmuebles[indice], ...inmuebleActualizado };
    }

    renderizarLista();
}

addPropertyBtn.addEventListener("click", () => {
    rellenarFormularioInmueble("add", {});
    addPropertyMessage.textContent = "";
    mostrarVista("add-property");
});

addCancelBtn.addEventListener("click", () => {
    addPropertyMessage.textContent = "";
    mostrarVista("properties");
});

addPropertyForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const user = usuarioActual();

    if (!user) {
        return;
    }

    addPropertyMessage.textContent = "Creando inmueble...";

    const datosInmueble = leerDatosInmuebleForm("add");

    try {

        const nuevoInmueble = await crearInmueble(user.uid, datosInmueble);

        state.misInmuebles.push(nuevoInmueble);
        renderizarLista();

        addPropertyMessage.textContent = "";
        mostrarVista("properties");

    } catch (error) {

        console.error("Error al crear el inmueble:", error);

        addPropertyMessage.textContent =
            "No se ha podido crear el inmueble.";
    }
});