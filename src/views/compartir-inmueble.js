import "../styles/compartir-inmueble.css";

import { state, mostrarVista } from "../state.js";
import { usuarioActual } from "../services/auth.js";
import {
    obtenerColaboradores,
    actualizarPermisoColaborador,
    eliminarColaborador,
    obtenerInvitaciones,
    crearInvitacion,
    eliminarInvitacion
} from "../services/compartirInmueble.js";
import { crearBotonAccion } from "../utils/formato.js";

const compartirBtn = document.getElementById("compartir-btn");
const compartirTitle = document.getElementById("compartir-title");
const backToFichaFromCompartirBtn = document.getElementById("back-to-ficha-from-compartir-btn");

const colaboradoresList = document.getElementById("colaboradores-list");
const invitacionesList = document.getElementById("invitaciones-list");

const invitarForm = document.getElementById("invitar-form");
const invitarMessage = document.getElementById("invitar-message");

let propertyIdActual = null;
let colaboradoresActuales = [];


function construirMensajeInvitacion(email, inmuebleNombre) {
    const url = window.location.origin + import.meta.env.BASE_URL;
    return `Te he invitado a "${inmuebleNombre}" en Gestión de Inmuebles.\n\n`
        + `Entra en ${url} con el email ${email}.\n`
        + `Si todavía no tienes cuenta, pulsa "¿No tienes cuenta? Crear una" y regístrate con ese mismo email. `
        + `Si ya tienes cuenta, simplemente inicia sesión.\n\n`
        + `En cuanto inicies sesión tendrás acceso automáticamente.`;
}

function crearFilaColaborador(colaborador) {

    const fila = document.createElement("article");
    fila.className = "colaborador-row";

    const esYo = colaborador.id === usuarioActual()?.uid;

    const cabecera = document.createElement("div");
    cabecera.className = "colaborador-header";

    const identidad = document.createElement("span");
    identidad.className = "colaborador-identidad";
    if (esYo) {
        const miEmail = usuarioActual()?.email;
        identidad.textContent = miEmail ? `Tú (${miEmail})` : "Tú";
    } else {
        identidad.textContent = colaborador.email ?? `Usuario ${colaborador.id.slice(0, 8)}…`;
    }

    const rolPermiso = document.createElement("span");
    rolPermiso.className = "colaborador-rol-permiso";
    rolPermiso.textContent = `${colaborador.rol ?? ""} · ${colaborador.permiso ?? ""}`;

    cabecera.appendChild(identidad);
    cabecera.appendChild(rolPermiso);
    fila.appendChild(cabecera);

    const esUnicoEditor = colaborador.permiso === "Edición"
        && colaboradoresActuales.filter((c) => c.permiso === "Edición").length === 1;

    if (esUnicoEditor) {

        const aviso = document.createElement("p");
        aviso.className = "colaborador-meta";
        aviso.textContent = "Único editor: no se puede quitar ni degradar.";
        fila.appendChild(aviso);

    } else {

        const acciones = document.createElement("div");
        acciones.className = "row-actions";

        const nuevoPermiso = colaborador.permiso === "Edición" ? "Lectura" : "Edición";

        acciones.appendChild(
            crearBotonAccion(`Cambiar a ${nuevoPermiso}`, null, () => cambiarPermiso(colaborador, nuevoPermiso))
        );

        acciones.appendChild(
            crearBotonAccion("Quitar acceso", "delete-btn", () => quitarAcceso(colaborador))
        );

        fila.appendChild(acciones);
    }

    return fila;
}

function renderizarColaboradores(colaboradores) {

    colaboradoresActuales = colaboradores;
    colaboradoresList.innerHTML = "";

    if (colaboradores.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "Todavía no hay nadie con acceso.";
        colaboradoresList.appendChild(vacio);
        return;
    }

    for (const colaborador of colaboradores) {
        colaboradoresList.appendChild(crearFilaColaborador(colaborador));
    }
}

async function cargarColaboradores() {

    if (!propertyIdActual) {
        return;
    }

    colaboradoresList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando colaboradores...";
    colaboradoresList.appendChild(cargando);

    try {

        const colaboradores = await obtenerColaboradores(propertyIdActual);
        renderizarColaboradores(colaboradores);

    } catch (error) {

        console.error("Error al cargar los colaboradores:", error);

        colaboradoresList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar los colaboradores.";
        colaboradoresList.appendChild(errorMsg);
    }
}

async function cambiarPermiso(colaborador, nuevoPermiso) {

    if (!propertyIdActual) {
        return;
    }

    try {
        await actualizarPermisoColaborador(propertyIdActual, colaborador.id, nuevoPermiso);
        await cargarColaboradores();
    } catch (error) {
        console.error("Error al cambiar el permiso:", error);
        alert("No se ha podido cambiar el permiso.");
    }
}

async function quitarAcceso(colaborador) {

    if (!propertyIdActual) {
        return;
    }

    const confirmado = confirm("¿Quitar el acceso de este usuario al inmueble?");

    if (!confirmado) {
        return;
    }

    try {
        await eliminarColaborador(propertyIdActual, colaborador.id);
        await cargarColaboradores();
    } catch (error) {
        console.error("Error al quitar el acceso:", error);
        alert("No se ha podido quitar el acceso.");
    }
}

function crearFilaInvitacion(invitacion) {

    const fila = document.createElement("article");
    fila.className = "invitacion-row";

    const cabecera = document.createElement("div");
    cabecera.className = "invitacion-header";

    const email = document.createElement("span");
    email.className = "invitacion-email";
    email.textContent = invitacion.email ?? invitacion.id;

    const rolPermiso = document.createElement("span");
    rolPermiso.className = "invitacion-rol-permiso";
    rolPermiso.textContent = `${invitacion.rol ?? ""} · ${invitacion.permiso ?? ""}`;

    cabecera.appendChild(email);
    cabecera.appendChild(rolPermiso);
    fila.appendChild(cabecera);

    const acciones = document.createElement("div");
    acciones.className = "row-actions";

    acciones.appendChild(
        crearBotonAccion("Cancelar invitación", "delete-btn", () => cancelarInvitacion(invitacion))
    );

    fila.appendChild(acciones);

    return fila;
}

function renderizarInvitaciones(invitaciones) {

    invitacionesList.innerHTML = "";

    if (invitaciones.length === 0) {
        const vacio = document.createElement("p");
        vacio.className = "empty-message";
        vacio.textContent = "No hay invitaciones pendientes.";
        invitacionesList.appendChild(vacio);
        return;
    }

    for (const invitacion of invitaciones) {
        invitacionesList.appendChild(crearFilaInvitacion(invitacion));
    }
}

async function cargarInvitaciones() {

    if (!propertyIdActual) {
        return;
    }

    invitacionesList.innerHTML = "";
    const cargando = document.createElement("p");
    cargando.className = "empty-message";
    cargando.textContent = "Cargando invitaciones...";
    invitacionesList.appendChild(cargando);

    try {

        const invitaciones = await obtenerInvitaciones(propertyIdActual);
        renderizarInvitaciones(invitaciones);

    } catch (error) {

        console.error("Error al cargar las invitaciones:", error);

        invitacionesList.innerHTML = "";
        const errorMsg = document.createElement("p");
        errorMsg.className = "empty-message";
        errorMsg.textContent = "No se han podido cargar las invitaciones.";
        invitacionesList.appendChild(errorMsg);
    }
}

async function cancelarInvitacion(invitacion) {

    if (!propertyIdActual) {
        return;
    }

    const confirmado = confirm(`¿Cancelar la invitación a "${invitacion.email ?? ""}"?`);

    if (!confirmado) {
        return;
    }

    try {
        await eliminarInvitacion(propertyIdActual, invitacion.email ?? invitacion.id);
        await cargarInvitaciones();
    } catch (error) {
        console.error("Error al cancelar la invitación:", error);
        alert("No se ha podido cancelar la invitación.");
    }
}

export async function abrirCompartir(inmueble) {

    propertyIdActual = inmueble.id;
    compartirTitle.textContent = `Compartir: ${inmueble.nombre ?? ""}`;

    invitarForm.reset();
    invitarMessage.textContent = "";

    mostrarVista("compartir");

    await Promise.all([cargarColaboradores(), cargarInvitaciones()]);
}

compartirBtn.addEventListener("click", () => {

    if (!state.inmuebleActual) {
        return;
    }

    abrirCompartir(state.inmuebleActual);
});

backToFichaFromCompartirBtn.addEventListener("click", () => {
    mostrarVista("property");
});

invitarForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    if (!propertyIdActual) {
        return;
    }

    const user = usuarioActual();

    invitarMessage.textContent = "Enviando invitación...";

    const email = document.getElementById("invitar-email").value.trim();
    const rol = document.getElementById("invitar-rol").value;
    const permiso = document.getElementById("invitar-permiso").value;

    try {

        await crearInvitacion(propertyIdActual, email, rol, permiso, user?.uid ?? null);

        const inmuebleNombre = compartirTitle.textContent.replace(/^Compartir:\s*/, "");
        const mensaje = construirMensajeInvitacion(email, inmuebleNombre);

        let copiado = false;

        try {
            await navigator.clipboard.writeText(mensaje);
            copiado = true;
        } catch (error) {
            console.error("No se ha podido copiar al portapapeles:", error);
        }

        if (copiado) {
            invitarMessage.textContent = "Invitación guardada y mensaje copiado al portapapeles.";
        } else {
            invitarMessage.textContent = "Invitación guardada. Copia el mensaje del siguiente cuadro.";
            window.prompt("Copia este mensaje:", mensaje);
        }

        invitarForm.reset();

        await cargarInvitaciones();

    } catch (error) {

        console.error("Error al enviar la invitación:", error);

        invitarMessage.textContent =
            "No se ha podido enviar la invitación.";
    }
});