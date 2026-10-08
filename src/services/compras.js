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

export async function obtenerCompras(propertyId) {

    const q = query(
        collection(db, "properties", propertyId, "compras"),
        orderBy("fecha", "desc")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearCompra(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "compras"), datos);
}

export function actualizarCompra(propertyId, id, datos) {
    return updateDoc(doc(db, "properties", propertyId, "compras", id), datos);
}

export function eliminarCompra(propertyId, id) {
    return deleteDoc(doc(db, "properties", propertyId, "compras", id));
}