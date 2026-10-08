import "./styles/base.css";

import "./views/login.js";
import "./views/registro.js";
import "./views/propiedades.js";
import "./views/ficha-inmueble.js";
import "./views/partes.js";
import "./views/gastos.js";
import "./views/incidencias.js";
import "./views/actuaciones.js";
import "./views/bitacora.js";
import "./views/seguros.js";
import "./views/hipotecas.js";
import "./views/contratos-alquiler.js";
import "./views/pagos-alquiler.js";
import "./views/propietarios.js";
import "./views/gastos-recurrentes.js";
import "./views/compras.js";
import "./views/contactos.js";
import "./views/alertas.js";
import "./views/compartir-inmueble.js";

import { mostrarVista } from "./state.js";

mostrarVista("login");