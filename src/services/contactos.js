import {
    addDoc,
    collection,
    deleteDoc,
    doc,
    getDocs,
    orderBy,
    query,
    updateDoc
} from "firebase/firestore";

import { db } from "../firebase.js";

export async function obtenerContactos(uid) {

    const contactosQuery = query(
        collection(db, "users", uid, "contactos"),
        orderBy("nombre")
    );

    const snapshot = await getDocs(contactosQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearContacto(uid, datos) {
    return addDoc(collection(db, "users", uid, "contactos"), datos);
}

export function actualizarContacto(uid, contactoId, datos) {
    return updateDoc(doc(db, "users", uid, "contactos", contactoId), datos);
}

export function eliminarContacto(uid, contactoId) {
    return deleteDoc(doc(db, "users", uid, "contactos", contactoId));
}