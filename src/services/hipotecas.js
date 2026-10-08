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

export async function obtenerHipotecas(propertyId) {

    const hipotecasQuery = query(
        collection(db, "properties", propertyId, "hipotecas"),
        orderBy("fecha_inicio", "desc")
    );

    const snapshot = await getDocs(hipotecasQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearHipoteca(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "hipotecas"), datos);
}

export function actualizarHipoteca(propertyId, hipotecaId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "hipotecas", hipotecaId), datos);
}

export function eliminarHipoteca(propertyId, hipotecaId) {
    return deleteDoc(doc(db, "properties", propertyId, "hipotecas", hipotecaId));
}