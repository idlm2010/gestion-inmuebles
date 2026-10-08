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

export async function obtenerBitacora(propertyId) {

    const bitacoraQuery = query(
        collection(db, "properties", propertyId, "bitacora"),
        orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(bitacoraQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearEntradaBitacora(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "bitacora"), datos);
}

export function actualizarEntradaBitacora(propertyId, entradaId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "bitacora", entradaId), datos);
}

export function eliminarEntradaBitacora(propertyId, entradaId) {
    return deleteDoc(doc(db, "properties", propertyId, "bitacora", entradaId));
}