import "../styles/contactos.css";

import { mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import {
    obtenerContactos,
    crearContacto,
    actualizarContacto,
    eliminarContacto
} from "../services/contactos.js";
import { valorTexto, crearBotonAccion } from "../utils/formato.js";

const contactosBtn = document.getElementById("contactos-btn");
const backToPropertiesFromContactosBtn = document.getElementById("back-to-properties-from-contactos-btn");
const contactosList = document.getElementById("contactos-list");
const addContactoBtn = document.getElementById("add-contacto-btn");

const addContactoForm = document.getElementById("add-contacto-form");
const addContactoMessage = document.getElementById("add-contacto-message");
const addContactoCancelBtn = document.getElementById("add-contacto-cancel-btn");

const editContactoForm = document.getElementById("edit-contacto-form");
const editContactoMessage = document.getElementById("edit-contacto-message");
const editContactoCancelBtn = document.getElementById("edit-contacto-cancel-btn");

let contactoActual = null;


function leerDatosContactoForm(prefix) {
    return {
        nombre: valorTexto(`${prefix}-nombre`),
        tipo: valorTexto(`${prefix}-tipo`),
        persona_contacto: valorTexto(`${prefix}-persona-contacto`),
        telefono: valorTexto(`${prefix}-telefono`),
        email: valorTexto(`${prefix}-email`),
        web: valorTexto(`${prefix}-web`),
        direccion: valorTexto(`${prefix}-direccion`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}

function rellenarFormularioContacto(prefix, contacto) {
    document.getElementById(`${prefix}-nombre`).value = contacto.nombre ?? "";
    document.getElementById(`${prefix}-tipo`).value = contacto.tipo ?? "Profesional";
    document.getElementById(`${prefix}-persona-contacto`).value = contacto.persona_contacto ?? "";
    document.getElementById(`${prefix}-telefono`).value = contacto.telefono ?? "";
    document.getElementById(`${prefix}-email`).value = contacto.email ?? "";
    document.getElementById(`${prefix}-web`).value = contacto.web ?? "";
    document.getElementById(`${prefix}-direccion`).value = contacto.direccion ?? "";
    document.getElementById(`${prefix}-observaciones`).value = contacto.observaciones ?? "";
}

function crearFilaContacto(contacto) {

    const fila = document.createElement("article");
    fila.className = "contacto-row";

    const cabecera = document.createElement("div");
    cabecera.className = "contacto-header";

    const nombre = document.createElement("span");
    nombre.className = "contacto-nombre";
    nombre.textContent = contacto.nombre ?? "";

    const tipo = document.createElement("span");
    tipo.className = "contacto-tipo";
    tipo.textContent = contacto.tipo ?? "";

    cabecera.appendChild(nombre);
    cabecera.appendChild(tipo);
    fila.appendChild(cabecera);

    if (contacto.persona_contacto) {
        const persona = document.createElement("p");
        persona.className = "contacto-meta";
        persona.textContent = `Contacto: ${contacto.persona_contacto}`;
        fila.appendChild(persona);
    }

    const canales = [contacto.telefono, contacto.email, contacto.web]
        .filter(Boolean)
        .join(" · ");

    if (canales) {
        const canalesEl = document.createElement("p");
        canalesEl.className = "contacto-meta";
        canalesEl.textContent = canales;
        fila.appendChild(canalesEl);
    }

    if (contacto.direccion) {
        const direccion = document.createElement("p");
        direccion.className = "contacto-meta";
        direccion.textContent = contacto.direccion;
        fila.appendChild(direccion);
    }

    if (contacto.observaciones) {
        const observaciones = document.createElement("p");
        observaciones.className = "contacto-observaciones";
        observaciones.textContent = contacto.observaciones;
        fila.appendChild(observaciones);
    }

    const acciones = document.createElement("div");
    acciones.className = "row-actions";

    acciones.appendChild(crearBotonAccion("Editar", null, () => abrirEdicion(contacto)));
    acciones.appendChild(crearBotonAccion("Eliminar", "delete-btn", () => eliminar(contacto)));

    fila.appendChild(acciones);

    return fila;
}

function renderizar(contactos) {

    contactosList.innerHTML = "";

    if (contactos.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no tienes contactos guardados.";
        contactosList.appendChild(vacio);
        return;
    }

    for (const contacto of contactos) {
        contactosList.appendChild(crearFilaContacto(contacto));
    }
}

async function cargarContactos() {

    const user = usuarioActual();

    if (!user) {
        return;
    }

    contactosList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando contactos...";
    contactosList.appendChild(cargando);

    try {

        const contactos = await obtenerContactos(user.uid);
        renderizar(contactos);

    } catch (error) {

        console.error("Error al cargar los contactos:", error);

        contactosList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los contactos.";
        contactosList.appendChild(errorMsg);
    }
}

function abrirEdicion(contacto) {
    contactoActual = contacto;
    rellenarFormularioContacto("edit-contacto", contacto);
    editContactoMessage.textContent = "";
    mostrarVista("edit-contacto");
}

async function eliminar(contacto) {

    const user = usuarioActual();

    if (!user) {
        return;
    }

    const confirmado = confirm(`¿Eliminar el contacto "${contacto.nombre ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarContacto(user.uid, contacto.id);
        await cargarContactos();
    } catch (error) {
        console.error("Error al eliminar el contacto:", error);
        alert("No se ha podido eliminar el contacto.");
    }
}

contactosBtn.addEventListener("click", () => {
    mostrarVista("contactos");
    cargarContactos();
});

backToPropertiesFromContactosBtn.addEventListener("click", () => {
    mostrarVista("properties");
});

addContactoBtn.addEventListener("click", () => {
    addContactoForm.reset();
    addContactoMessage.textContent = "";
    mostrarVista("add-contacto");
});

addContactoCancelBtn.addEventListener("click", () => {
    addContactoMessage.textContent = "";
    mostrarVista("contactos");
});

addContactoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const user = usuarioActual();

    if (!user) {
        return;
    }

    addContactoMessage.textContent = "Guardando...";

    const datos = leerDatosContactoForm("contacto");

    try {

        await crearContacto(user.uid, datos);

        addContactoMessage.textContent = "";
        addContactoForm.reset();

        mostrarVista("contactos");
        await cargarContactos();

    } catch (error) {

        console.error("Error al guardar el contacto:", error);

        addContactoMessage.textContent =
            "No se ha podido guardar el contacto.";
    }
});

editContactoCancelBtn.addEventListener("click", () => {
    contactoActual = null;
    editContactoMessage.textContent = "";
    mostrarVista("contactos");
});

editContactoForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const user = usuarioActual();

    if (!user || !contactoActual) {
        return;
    }

    editContactoMessage.textContent = "Guardando...";

    const datosActualizados = leerDatosContactoForm("edit-contacto");

    try {

        await actualizarContacto(user.uid, contactoActual.id, datosActualizados);

        editContactoMessage.textContent = "";
        contactoActual = null;

        mostrarVista("contactos");
        await cargarContactos();

    } catch (error) {

        console.error("Error al guardar el contacto:", error);

        editContactoMessage.textContent =
            "No se han podido guardar los cambios.";
    }
});