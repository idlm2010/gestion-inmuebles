import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";

import { auth } from "../firebase.js";

export function iniciarSesion(email, password) {
    return signInWithEmailAndPassword(auth, email, password);
}

export function crearCuenta(email, password) {
    return createUserWithEmailAndPassword(auth, email, password);
}

export function cerrarSesion() {
    return signOut(auth);
}

export function usuarioActual() {
    return auth.currentUser;
}

// Al abrir o recargar la página, Firebase tarda un instante en recuperar
// la sesión guardada en el navegador. Esta función espera a ese primer
// aviso y devuelve el usuario (o null si no hay sesión). Después deja de
// escuchar, para no interferir con el flujo normal de login y registro.
export function esperarSesionInicial() {
    return new Promise((resolve) => {
        const dejarDeEscuchar = onAuthStateChanged(auth, (user) => {
            dejarDeEscuchar();
            resolve(user);
        });
    });
}
// Envía el correo para elegir una contraseña nueva. El correo llega en español.
// Si el dominio de la app no está autorizado en Firebase, el correo se envía
// igualmente, solo que sin el enlace final para volver a la aplicación.
export async function enviarRecuperacionContrasena(email) {

    auth.languageCode = "es";

    const urlDeVuelta = window.location.origin + import.meta.env.BASE_URL;

    try {
        await sendPasswordResetEmail(auth, email, { url: urlDeVuelta });
    } catch (error) {

        if (error.code === "auth/unauthorized-continue-uri") {
            await sendPasswordResetEmail(auth, email);
            return;
        }

        throw error;
    }
}