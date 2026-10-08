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

function rutaPagos(propertyId, contratoId) {
    return collection(db, "properties", propertyId, "contratos_alquiler", contratoId, "pagos");
}

export async function obtenerPagos(propertyId, contratoId) {

    const pagosQuery = query(
        rutaPagos(propertyId, contratoId),
        orderBy("fecha_prevista", "desc")
    );

    const snapshot = await getDocs(pagosQuery);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearPago(propertyId, contratoId, datos) {
    return addDoc(rutaPagos(propertyId, contratoId), datos);
}

export function actualizarPago(propertyId, contratoId, pagoId, datos) {
    return updateDoc(
        doc(db, "properties", propertyId, "contratos_alquiler", contratoId, "pagos", pagoId),
        datos
    );
}

export function eliminarPago(propertyId, contratoId, pagoId) {
    return deleteDoc(
        doc(db, "properties", propertyId, "contratos_alquiler", contratoId, "pagos", pagoId)
    );
}