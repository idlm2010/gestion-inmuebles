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

function rutaActuaciones(propertyId, incidenciaId) {
    return collection(db, "properties", propertyId, "incidencias", incidenciaId, "actuaciones");
}

export async function obtenerActuaciones(propertyId, incidenciaId) {

    const actuacionesQuery = query(
        rutaActuaciones(propertyId, incidenciaId),
        orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(actuacionesQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearActuacion(propertyId, incidenciaId, datos) {
    return addDoc(rutaActuaciones(propertyId, incidenciaId), datos);
}

export function actualizarActuacion(propertyId, incidenciaId, actuacionId, datos) {
    return updateDoc(
        doc(db, "properties", propertyId, "incidencias", incidenciaId, "actuaciones", actuacionId),
        datos
    );
}

export function eliminarActuacion(propertyId, incidenciaId, actuacionId) {
    return deleteDoc(
        doc(db, "properties", propertyId, "incidencias", incidenciaId, "actuaciones", actuacionId)
    );
}