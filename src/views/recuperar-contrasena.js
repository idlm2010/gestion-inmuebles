import { mostrarVista } from "../state.js";
import { enviarRecuperacionContrasena } from "../services/auth.js";

const goToRecoverBtn = document.getElementById("go-to-recover-btn");
const backToLoginFromRecoverBtn = document.getElementById("back-to-login-from-recover-btn");

const recoverForm = document.getElementById("recover-form");
const recoverEmail = document.getElementById("recover-email");
const recoverMessage = document.getElementById("recover-message");
const recoverSubmitBtn = document.getElementById("recover-submit-btn");

goToRecoverBtn.addEventListener("click", () => {

    // Si ya había escrito su email en el login, se aprovecha.
    const emailDelLogin = document.getElementById("email").value.trim();

    recoverForm.reset();
    recoverEmail.value = emailDelLogin;
    recoverMessage.textContent = "";
    recoverSubmitBtn.disabled = false;

    mostrarVista("recover");
});

backToLoginFromRecoverBtn.addEventListener("click", () => {
    mostrarVista("login");
});

recoverForm.addEventListener("submit", async (event) => {

    event.preventDefault();

    const email = recoverEmail.value.trim();

    recoverSubmitBtn.disabled = true;
    recoverMessage.textContent = "Enviando...";

    try {

        await enviarRecuperacionContrasena(email);

        // El mensaje es el mismo exista o no la cuenta, para no revelar
        // qué emails están registrados.
        recoverMessage.textContent =
            "Si existe una cuenta con ese email, recibirás un correo con el enlace. "
            + "Revisa también la carpeta de spam.";

    } catch (error) {

        console.error("Error al enviar la recuperación de contraseña:", error);

        if (error.code === "auth/invalid-email") {
            recoverMessage.textContent = "El email no es válido.";
        } else if (error.code === "auth/too-many-requests") {
            recoverMessage.textContent = "Demasiados intentos. Espera unos minutos y vuelve a probar.";
        } else {
            recoverMessage.textContent = "No se ha podido enviar el correo. Inténtalo de nuevo.";
        }

        recoverSubmitBtn.disabled = false;
    }
});