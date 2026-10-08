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

export async function obtenerPropietarios(propertyId) {

    const q = query(
        collection(db, "properties", propertyId, "propietarios"),
        orderBy("nombre")
    );

    const snapshot = await getDocs(q);

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearPropietario(propertyId, datos) {
    return addDoc(collection(db, "properties", propertyId, "propietarios"), datos);
}

export function actualizarPropietario(propertyId, id, datos) {
    return updateDoc(doc(db, "properties", propertyId, "propietarios", id), datos);
}

export function eliminarPropietario(propertyId, id) {
    return deleteDoc(doc(db, "properties", propertyId, "propietarios", id));
}