import {
    collection,
    collectionGroup,
    doc,
    getDoc,
    getDocs,
    query,
    updateDoc,
    where,
    writeBatch
} from "firebase/firestore";

import { auth, db } from "../firebase.js";

export async function obtenerMisInmuebles(uid) {

    const usuariosQuery = query(
        collectionGroup(db, "usuarios"),
        where("usuario_id", "==", uid)
    );

    const usuariosSnapshot = await getDocs(usuariosQuery);

    const misInmuebles = [];

    for (const usuarioDoc of usuariosSnapshot.docs) {

        const propertyRef = usuarioDoc.ref.parent.parent;

        if (!propertyRef) {
            continue;
        }

        const propertySnapshot = await getDoc(propertyRef);

        if (!propertySnapshot.exists()) {
            continue;
        }

        misInmuebles.push({
            id: propertySnapshot.id,
            ...propertySnapshot.data(),
            rol: usuarioDoc.data().rol,
            permiso: usuarioDoc.data().permiso
        });
    }

    return misInmuebles;
}

export async function crearInmueble(uid, datosInmueble) {

    const propertyRef = doc(collection(db, "properties"));
    const usuarioRef = doc(db, "properties", propertyRef.id, "usuarios", uid);

    const batch = writeBatch(db);

    batch.set(propertyRef, datosInmueble);

    batch.set(usuarioRef, {
        usuario_id: uid,
        email: auth.currentUser?.email?.trim().toLowerCase() ?? null,
        rol: "Propietario",
        permiso: "Edición",
        observaciones: ""
    });

    await batch.commit();

    return {
        id: propertyRef.id,
        ...datosInmueble,
        rol: "Propietario",
        permiso: "Edición"
    };
}

export function actualizarInmueble(propertyId, datosActualizados) {
    return updateDoc(doc(db, "properties", propertyId), datosActualizados);
}