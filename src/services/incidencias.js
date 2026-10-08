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

export async function obtenerIncidencias(propertyId) {

    const incidenciasQuery = query(
        collection(db, "properties", propertyId, "incidencias"),
        orderBy("fecha_apertura", "desc")
    );

    const snapshot = await getDocs(incidenciasQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearIncidencia(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "incidencias"), datos);
}

export function actualizarIncidencia(propertyId, incidenciaId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "incidencias", incidenciaId), datos);
}

export function eliminarIncidencia(propertyId, incidenciaId) {
    return deleteDoc(doc(db, "properties", propertyId, "incidencias", incidenciaId));
}