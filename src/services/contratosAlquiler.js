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

export async function obtenerContratos(propertyId) {

    const contratosQuery = query(
        collection(db, "properties", propertyId, "contratos_alquiler"),
        orderBy("fecha_inicio", "desc")
    );

    const snapshot = await getDocs(contratosQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearContrato(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "contratos_alquiler"), datos);
}

export function actualizarContrato(propertyId, contratoId, datos) {
    return updateDoc(doc(db, "properties", propertyId, "contratos_alquiler", contratoId), datos);
}

export function eliminarContrato(propertyId, contratoId) {
    return deleteDoc(doc(db, "properties", propertyId, "contratos_alquiler", contratoId));
}