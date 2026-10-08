export function formatearDireccion(inmueble) {

    let linea = [inmueble.direccion, inmueble.numero]
        .filter(Boolean)
        .join(", ");

    const pisoPuerta = [inmueble.piso, inmueble.puerta]
        .filter(Boolean)
        .join(" ");

    if (pisoPuerta) {
        linea = [linea, pisoPuerta].filter(Boolean).join(", ");
    }

    return linea || null;
}

export function formatearUbicacion(inmueble) {

    const ubicacion = [inmueble.codigo_postal, inmueble.localidad, inmueble.provincia]
        .filter(Boolean)
        .join(" · ");

    return ubicacion || null;
}

export function formatearMoneda(valor) {

    if (valor === undefined || valor === null || valor === "") {
        return null;
    }

    return new Intl.NumberFormat("es-ES", {
        style: "currency",
        currency: "EUR"
    }).format(valor);
}

export function aFecha(valor) {

    if (!valor) {
        return null;
    }

    if (typeof valor.toDate === "function") {
        return valor.toDate();
    }

    const fecha = new Date(valor);

    return isNaN(fecha) ? null : fecha;
}

export function formatearFecha(valor) {
    const fecha = aFecha(valor);
    return fecha ? fecha.toLocaleDateString("es-ES") : null;
}

export function fechaAValorInput(valor) {

    const fecha = aFecha(valor);

    if (!fecha) {
        return "";
    }

    const yyyy = fecha.getFullYear();
    const mm = String(fecha.getMonth() + 1).padStart(2, "0");
    const dd = String(fecha.getDate()).padStart(2, "0");

    return `${yyyy}-${mm}-${dd}`;
}

export function anadirFilaDato(contenedor, etiqueta, valor) {

    if (valor === null || valor === undefined || valor === "") {
        return;
    }

    const fila = document.createElement("div");
    fila.className = "detail-row";

    const label = document.createElement("span");
    label.className = "detail-label";
    label.textContent = etiqueta;

    const dato = document.createElement("span");
    dato.className = "detail-value";
    dato.textContent = valor;

    fila.appendChild(label);
    fila.appendChild(dato);
    contenedor.appendChild(fila);
}

export function valorTexto(id) {
    const valor = document.getElementById(id).value.trim();
    return valor === "" ? null : valor;
}

export function valorNumero(id) {
    const valor = document.getElementById(id).value;
    return valor === "" ? null : Number(valor);
}

export function valorFecha(id) {
    const valor = document.getElementById(id).value;
    return valor === "" ? null : new Date(`${valor}T00:00:00`);
}

export function crearBotonAccion(texto, className, onClick) {
    const boton = document.createElement("button");
    boton.type = "button";
    if (className) {
        boton.className = className;
    }
    boton.textContent = texto;
    boton.addEventListener("click", onClick);
    return boton;
}

export function poblarSelectPartes(selectId, partes, valorSeleccionado) {

    const select = document.getElementById(selectId);
    select.innerHTML = "";

    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "Sin parte asociada";
    select.appendChild(opcionVacia);

    for (const parte of partes) {
        const opcion = document.createElement("option");
        opcion.value = parte.id;
        opcion.textContent = parte.nombre ?? "";
        select.appendChild(opcion);
    }

    select.value = valorSeleccionado ?? "";
}

export function nombreParte(parteId, partes) {

    if (!parteId) {
        return null;
    }

    const parte = partes.find((p) => p.id === parteId);

    return parte ? parte.nombre : null;
}

// Compartidas por el alta (propiedades.js) y la edición (ficha-inmueble.js) de INMUEBLE.

export function rellenarFormularioInmueble(prefix, inmueble) {
    document.getElementById(`${prefix}-nombre`).value = inmueble.nombre ?? "";
    document.getElementById(`${prefix}-tipo`).value = inmueble.tipo ?? "Piso";
    document.getElementById(`${prefix}-direccion`).value = inmueble.direccion ?? "";
    document.getElementById(`${prefix}-numero`).value = inmueble.numero ?? "";
    document.getElementById(`${prefix}-piso`).value = inmueble.piso ?? "";
    document.getElementById(`${prefix}-puerta`).value = inmueble.puerta ?? "";
    document.getElementById(`${prefix}-codigo-postal`).value = inmueble.codigo_postal ?? "";
    document.getElementById(`${prefix}-localidad`).value = inmueble.localidad ?? "";
    document.getElementById(`${prefix}-provincia`).value = inmueble.provincia ?? "";
    document.getElementById(`${prefix}-superficie`).value = inmueble.superficie ?? "";
    document.getElementById(`${prefix}-habitaciones`).value = inmueble.habitaciones ?? "";
    document.getElementById(`${prefix}-banos`).value = inmueble.banos ?? "";
    document.getElementById(`${prefix}-fecha-adquisicion`).value = fechaAValorInput(inmueble.fecha_adquisicion);
    document.getElementById(`${prefix}-valor-adquisicion`).value = inmueble.valor_adquisicion ?? "";
    document.getElementById(`${prefix}-valor-actual`).value = inmueble.valor_actual ?? "";
    document.getElementById(`${prefix}-observaciones`).value = inmueble.observaciones ?? "";
}

export function leerDatosInmuebleForm(prefix) {
    return {
        nombre: valorTexto(`${prefix}-nombre`),
        tipo: valorTexto(`${prefix}-tipo`),
        direccion: valorTexto(`${prefix}-direccion`),
        numero: valorTexto(`${prefix}-numero`),
        piso: valorTexto(`${prefix}-piso`),
        puerta: valorTexto(`${prefix}-puerta`),
        codigo_postal: valorTexto(`${prefix}-codigo-postal`),
        localidad: valorTexto(`${prefix}-localidad`),
        provincia: valorTexto(`${prefix}-provincia`),
        superficie: valorNumero(`${prefix}-superficie`),
        habitaciones: valorNumero(`${prefix}-habitaciones`),
        banos: valorNumero(`${prefix}-banos`),
        fecha_adquisicion: valorFecha(`${prefix}-fecha-adquisicion`),
        valor_adquisicion: valorNumero(`${prefix}-valor-adquisicion`),
        valor_actual: valorNumero(`${prefix}-valor-actual`),
        observaciones: valorTexto(`${prefix}-observaciones`)
    };
}
export function formatearRangoFechas(inicio, fin) {

    const inicioTexto = formatearFecha(inicio);
    const finTexto = formatearFecha(fin);

    if (inicioTexto && finTexto) {
        return `${inicioTexto} – ${finTexto}`;
    }

    if (inicioTexto) {
        return `Desde ${inicioTexto}`;
    }

    if (finTexto) {
        return `Hasta ${finTexto}`;
    }

    return null;
}

export function poblarSelectContactos(selectId, contactos, valorSeleccionado) {

    const select = document.getElementById(selectId);
    select.innerHTML = "";

    const opcionVacia = document.createElement("option");
    opcionVacia.value = "";
    opcionVacia.textContent = "Sin contacto asociado";
    select.appendChild(opcionVacia);

    for (const contacto of contactos) {
        const opcion = document.createElement("option");
        opcion.value = contacto.id;
        opcion.textContent = contacto.nombre ?? "";
        select.appendChild(opcion);
    }

    select.value = valorSeleccionado ?? "";
}

export function nombreContacto(contactoId, contactos) {

    if (!contactoId) {
        return null;
    }

    const contacto = contactos.find((c) => c.id === contactoId);

    return contacto ? contacto.nombre : null;
}