import {
    createUserWithEmailAndPassword,
    signInWithEmailAndPassword,
    signOut
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