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

export async function obtenerPartes(propertyId) {

    const partesQuery = query(
        collection(db, "properties", propertyId, "partes"),
        orderBy("nombre")
    );

    const snapshot = await getDocs(partesQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearParte(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "partes"), datos);
}

export function actualizarParte(propertyId, parteId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "partes", parteId), datos);
}

export function eliminarParte(propertyId, parteId) {
    return deleteDoc(doc(db, "properties", propertyId, "partes", parteId));
}