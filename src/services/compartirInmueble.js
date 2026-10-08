import {
    collection,
    collectionGroup,
    deleteDoc,
    doc,
    getDoc,
    getDocs,
    query,
    setDoc,
    updateDoc,
    where
} from "firebase/firestore";

import { db } from "../firebase.js";

export async function obtenerColaboradores(propertyId) {

    const snapshot = await getDocs(collection(db, "properties", propertyId, "usuarios"));

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function actualizarPermisoColaborador(propertyId, uid, permiso) {
    return updateDoc(doc(db, "properties", propertyId, "usuarios", uid), { permiso });
}

export function eliminarColaborador(propertyId, uid) {
    return deleteDoc(doc(db, "properties", propertyId, "usuarios", uid));
}

export async function obtenerInvitaciones(propertyId) {

    const snapshot = await getDocs(collection(db, "properties", propertyId, "invitaciones"));

    return snapshot.docs.map((d) => ({ id: d.id, ...d.data() }));
}

export function crearInvitacion(propertyId, email, rol, permiso, creadoPor) {

    const emailId = email.trim().toLowerCase();

    return setDoc(doc(db, "properties", propertyId, "invitaciones", emailId), {
        email: emailId,
        rol,
        permiso,
        creado_por: creadoPor,
        fecha_creacion: new Date()
    });
}

export function eliminarInvitacion(propertyId, email) {
    const emailId = email.trim().toLowerCase();
    return deleteDoc(doc(db, "properties", propertyId, "invitaciones", emailId));
}

export async function reclamarInvitaciones(user) {

    if (!user.email) {
        return;
    }

    const emailLower = user.email.trim().toLowerCase();

    const invitacionesQuery = query(
        collectionGroup(db, "invitaciones"),
        where("email", "==", emailLower)
    );

    let snapshot;

    try {
        snapshot = await getDocs(invitacionesQuery);
    } catch (error) {
        console.error("Reclamar invitación: fallo al buscar invitaciones pendientes:", error);
        return;
    }

    for (const invitacionDoc of snapshot.docs) {

        const propertyRef = invitacionDoc.ref.parent.parent;

        if (!propertyRef) {
            continue;
        }

        const datos = invitacionDoc.data();
        const usuarioRef = doc(db, "properties", propertyRef.id, "usuarios", user.uid);

        let yaTieneAcceso = false;

        try {
            const usuarioExistente = await getDoc(usuarioRef);
            yaTieneAcceso = usuarioExistente.exists();
        } catch (error) {
            console.error("Reclamar invitación: fallo al comprobar si ya tienes acceso:", error);
            continue;
        }

        if (!yaTieneAcceso) {

            try {
                await setDoc(usuarioRef, {
                    usuario_id: user.uid,
                    rol: datos.rol,
                    permiso: datos.permiso,
                    observaciones: ""
                });
            } catch (error) {
                // No se borra la invitación: así se puede reintentar en el próximo inicio de sesión.
                console.error("Reclamar invitación: fallo al crear tu acceso:", error);
                continue;
            }
        }

        try {
            await deleteDoc(invitacionDoc.ref);
        } catch (error) {
            console.error("Reclamar invitación: fallo al borrar la invitación:", error);
        }
    }
}