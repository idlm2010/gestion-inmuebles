import { state, mostrarVista } from "../state.js";
import { iniciarSesion, cerrarSesion } from "../services/auth.js";
import { obtenerMisInmuebles } from "../services/inmuebles.js";
import { reclamarInvitaciones } from "../services/compartirInmueble.js";
import { mostrarConInmuebles } from "./propiedades.js";

const loginForm = document.getElementById("login-form");
const loginMessage = document.getElementById("login-message");
const logoutBtn = document.getElementById("logout-btn");

loginForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("email").value.trim();
    const password = document.getElementById("password").value;

    loginMessage.textContent = "Iniciando sesión...";

    try {

        const userCredential = await iniciarSesion(email, password);

        await reclamarInvitaciones(userCredential.user);

        const misInmuebles = await obtenerMisInmuebles(userCredential.user.uid);

        loginMessage.textContent = "";
        loginForm.reset();

        mostrarConInmuebles(misInmuebles);

    } catch (error) {

        console.error("Error de inicio de sesión:", error);

        loginMessage.textContent =
            "No se ha podido iniciar sesión o cargar los inmuebles.";
    }
});

logoutBtn.addEventListener("click", async () => {

    try {
        await cerrarSesion();
        state.misInmuebles = [];
        state.inmuebleActual = null;
        state.partesActuales = [];
        mostrarVista("login");
    } catch (error) {
        console.error("Error al cerrar sesión:", error);
    }
});