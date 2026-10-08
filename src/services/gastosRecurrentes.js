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

export async function obtenerGastosRecurrentes(propertyId) {

    const q = query(
        collection(db, "properties", propertyId, "gastos_recurrentes"),
        orderBy("fecha_proxima")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearGastoRecurrente(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "gastos_recurrentes"), datos);
}

export function actualizarGastoRecurrente(propertyId, id, datos) {
    return updateDoc(doc(db, "properties", propertyId, "gastos_recurrentes", id), datos);
}

export function eliminarGastoRecurrente(propertyId, id) {
    return deleteDoc(doc(db, "properties", propertyId, "gastos_recurrentes", id));
}