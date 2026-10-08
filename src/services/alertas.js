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

export async function obtenerAlertas(uid) {

    const q = query(
        collection(db, "users", uid, "alertas"),
        orderBy("fecha_alerta")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearAlerta(uid, datos) {
    return addDoc(collection(db, "users", uid, "alertas"), datos);
}

export function actualizarAlerta(uid, id, datos) {
    return updateDoc(doc(db, "users", uid, "alertas", id), datos);
}

export function eliminarAlerta(uid, id) {
    return deleteDoc(doc(db, "users", uid, "alertas", id));
}