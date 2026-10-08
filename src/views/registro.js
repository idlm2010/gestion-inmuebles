import { mostrarVista } from "../state.js";
import { crearCuenta } from "../services/auth.js";
import { obtenerMisInmuebles } from "../services/inmuebles.js";
import { reclamarInvitaciones } from "../services/compartirInmueble.js";
import { mostrarConInmuebles } from "./propiedades.js";

const goToRegisterBtn = document.getElementById("go-to-register-btn");
const backToLoginBtn = document.getElementById("back-to-login-btn");

const registerForm = document.getElementById("register-form");
const registerMessage = document.getElementById("register-message");

goToRegisterBtn.addEventListener("click", () => {
    registerForm.reset();
    registerMessage.textContent = "";
    mostrarVista("register");
});

backToLoginBtn.addEventListener("click", () => {
    mostrarVista("login");
});

registerForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = document.getElementById("register-email").value.trim();
    const password = document.getElementById("register-password").value;
    const passwordRepeat = document.getElementById("register-password-repeat").value;

    if (password !== passwordRepeat) {
        registerMessage.textContent = "Las contraseñas no coinciden.";
        return;
    }

    registerMessage.textContent = "Creando cuenta...";

    try {

        const userCredential = await crearCuenta(email, password);

        await reclamarInvitaciones(userCredential.user);

        const misInmuebles = await obtenerMisInmuebles(userCredential.user.uid);

        registerMessage.textContent = "";
        registerForm.reset();

        mostrarConInmuebles(misInmuebles);

    } catch (error) {

        console.error("Error al crear la cuenta:", error);

        if (error.code === "auth/email-already-in-use") {
            registerMessage.textContent = "Ya existe una cuenta con ese email. Inicia sesión en su lugar.";
        } else if (error.code === "auth/weak-password") {
            registerMessage.textContent = "La contraseña debe tener al menos 6 caracteres.";
        } else {
            registerMessage.textContent = "No se ha podido crear la cuenta.";
        }
    }
});