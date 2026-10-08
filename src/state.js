export const state = {
    misInmuebles: [],
    inmuebleActual: null,
    partesActuales: []
};

export function mostrarVista(vista) {
    document.querySelectorAll("[data-view]").forEach((seccion) => {
        seccion.hidden = seccion.dataset.view !== vista;
    });
}