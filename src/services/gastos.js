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

export async function obtenerGastos(propertyId) {

    const gastosQuery = query(
        collection(db, "properties", propertyId, "gastos"),
        orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(gastosQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearGasto(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "gastos"), datos);
}

export function actualizarGasto(propertyId, gastoId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "gastos", gastoId), datos);
}

export function eliminarGasto(propertyId, gastoId) {
    return deleteDoc(doc(db, "properties", propertyId, "gastos", gastoId));
}