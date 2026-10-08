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

export async function obtenerSeguros(propertyId) {

    const segurosQuery = query(
        collection(db, "properties", propertyId, "seguros"),
        orderBy("fecha_vencimiento")
    );

    const snapshot = await getDocs(segurosQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearSeguro(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "seguros"), datos);
}

export function actualizarSeguro(propertyId, seguroId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "seguros", seguroId), datos);
}

export function eliminarSeguro(propertyId, seguroId) {
    return deleteDoc(doc(db, "properties", propertyId, "seguros", seguroId));
}