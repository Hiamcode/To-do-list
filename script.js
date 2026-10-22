
const entradaUsuario = document.getElementById("Item");
const lista = document.getElementById("Lista");
const agregar = document.getElementById("Agregar");
const reset = document.getElementById("Reset");
const totalTareas = document.getElementById("TotalTareas");
const totalTareasPendientes = document.getElementById("TotalTareasPendientes");
const totalTareasCompletadas = document.getElementById("TotalTareasCompletadas");
const mensajeDiv = document.getElementById("Mensajes");

let arregloTareas = [];
let tareaArrastrada = null;
let temporizadorMensaje;
let temporizadorOcultar;

// CARGAR TAREAS GUARDADAS

const tareasGuardadas = localStorage.getItem("tareas");

if (tareasGuardadas) {
    try {
        arregloTareas = JSON.parse(tareasGuardadas);
    } catch (error) {
        arregloTareas = [];
        localStorage.removeItem("tareas");
    }
}

mostrarTareas(arregloTareas);
actualizarContador();

// EVENTOS PRINCIPALES

agregar.addEventListener("click", agregarTarea);

entradaUsuario.addEventListener("keydown", function (event) {
    if (event.key === "Enter") {
        agregarTarea();
    }
});

reset.addEventListener("click", resetLista);

totalTareas.addEventListener("click", filtroTodasTareas);

totalTareasPendientes.addEventListener("click", filtroTareasPendientes);

totalTareasCompletadas.addEventListener("click", filtroTareasCompletadas);

// AGREGAR TAREAS

function agregarTarea() {
    const textoIngresado = entradaUsuario.value.trim();

    if (validarVacio(textoIngresado)) {
        mostrarMensaje("Por favor ingrese una tarea");
        return;
    }

    if (validarDuplicado(textoIngresado)) {
        mostrarMensaje("La tarea ya existe");
        return;
    }

    const nuevaTarea = {
        texto: textoIngresado,
        completada: false
    };

    arregloTareas.push(nuevaTarea);

    guardarTareas();

    mostrarTareas(arregloTareas);
    limpiarEntrada();
    actualizarContador();
}

// VALIDACIONES

function validarVacio(textoIngresado) {
    return textoIngresado === "";
}

function validarDuplicado(textoIngresado, tareaActual = null) {
    for (let i = 0; i < arregloTareas.length; i++) {
        if (arregloTareas[i] === tareaActual) {
            continue;
        }

        if (
            textoIngresado.toLowerCase() ===
            arregloTareas[i].texto.toLowerCase()
        ) {
            return true;
        }
    }

    return false;
}

// GUARDAR EN LOCALSTORAGE

function guardarTareas() {
    localStorage.setItem("tareas", JSON.stringify(arregloTareas));
}

// CREAR ELEMENTOS HTML PARA CADA TAREA

function crearElementos(nuevaTarea) {
    const spanTexto = document.createElement("span");
    const tarea = document.createElement("li");
    const btnEliminar = document.createElement("button");
    const estado = document.createElement("input");
    const btnEditar = document.createElement("button");
    const acciones = document.createElement("div");

    spanTexto.textContent = nuevaTarea.texto;

    btnEliminar.textContent = "Eliminar";
    btnEditar.textContent = "Editar";

    estado.type = "checkbox";
    estado.checked = nuevaTarea.completada;

    if (nuevaTarea.completada) {
        spanTexto.style.textDecoration = "line-through";
    }

    tarea.appendChild(estado);
    tarea.appendChild(spanTexto);
    tarea.appendChild(acciones);

    acciones.appendChild(btnEditar);
    acciones.appendChild(btnEliminar);

    lista.appendChild(tarea);

    return {
        btnEliminar,
        estado,
        spanTexto,
        btnEditar,
        nuevaTarea,
        tarea
    };
}

// MOSTRAR TAREAS

function mostrarTareas(tareas) {
    lista.innerHTML = "";

    for (let i = 0; i < tareas.length; i++) {
        const elementos = crearElementos(tareas[i]);
        registroEventos(elementos);
    }
}

// REGISTRAR EVENTOS DE CADA TAREA

function registroEventos(elementos) {
    elementos.btnEliminar.addEventListener("click", function () {
        eliminarTarea(elementos);
    });

    elementos.estado.addEventListener("change", function () {
        cambioDeEstado(elementos);
    });

    elementos.btnEditar.addEventListener("click", function () {
        editarTarea(elementos);
    });

    elementos.tarea.draggable = true;

    elementos.tarea.addEventListener("dragstart", function () {
        tareaArrastrada = elementos.nuevaTarea;
    });

    elementos.tarea.addEventListener("dragover", function (evento) {
        evento.preventDefault();
    });

    elementos.tarea.addEventListener("drop", function (evento) {
        evento.preventDefault();
        actualizarDragAndDrop(elementos);
    });
}

// ELIMINAR TAREAS

function eliminarTarea(elementos) {
    const indice = arregloTareas.indexOf(elementos.nuevaTarea);

    if (indice === -1) {
        return;
    }

    arregloTareas.splice(indice, 1);

    guardarTareas();
    elementos.tarea.remove();

    actualizarContador();
}

// CAMBIAR ESTADO DE UNA TAREA

function cambioDeEstado(elementos) {
    elementos.nuevaTarea.completada = elementos.estado.checked;

    elementos.spanTexto.style.textDecoration =
        elementos.nuevaTarea.completada ? "line-through" : "none";

    guardarTareas();
    actualizarContador();
}

// EDITAR TAREAS

function editarTarea(elementos) {
    const inputEditar = document.createElement("input");
    const inputGuardar = document.createElement("button");

    inputEditar.value = elementos.nuevaTarea.texto;
    inputGuardar.textContent = "Guardar";

    elementos.spanTexto.replaceWith(inputEditar);
    elementos.btnEditar.replaceWith(inputGuardar);

    inputEditar.focus();
    inputEditar.select();

    function guardarCambios() {
        const guardarEdicion = inputEditar.value.trim();

        if (validarVacio(guardarEdicion)) {
            mostrarMensaje("Por favor ingrese una tarea");
            inputEditar.focus();
            return;
        }

        if (validarDuplicado(guardarEdicion, elementos.nuevaTarea)) {
            mostrarMensaje("La tarea ya existe");
            inputEditar.focus();
            return;
        }

        elementos.nuevaTarea.texto = guardarEdicion;
        elementos.spanTexto.textContent = guardarEdicion;

        guardarTareas();

        inputEditar.replaceWith(elementos.spanTexto);
        inputGuardar.replaceWith(elementos.btnEditar);
    }

    function cancelarEdicion() {
        inputEditar.replaceWith(elementos.spanTexto);
        inputGuardar.replaceWith(elementos.btnEditar);
    }

    inputGuardar.addEventListener("click", guardarCambios);

    inputEditar.addEventListener("keydown", function (event) {
        if (event.key === "Enter") {
            guardarCambios();
        }

        if (event.key === "Escape") {
            cancelarEdicion();
        }
    });
}

// ACTUALIZAR CONTADORES

function actualizarContador() {
    const total = arregloTareas.length;

    const pendientes = arregloTareas.filter(
        tarea => !tarea.completada
    ).length;

    const completadas = arregloTareas.filter(
        tarea => tarea.completada
    ).length;

    document.getElementById("TotalTareasCount").textContent = total;

    document.getElementById("TotalTareasPendientesCount").textContent =
        pendientes;

    document.getElementById("TotalTareasCompletadasCount").textContent =
        completadas;
}

// FILTROS

function filtroTodasTareas() {
    mostrarTareas(arregloTareas);
}

function filtroTareasPendientes() {
    const tareasPendientes = arregloTareas.filter(
        tarea => !tarea.completada
    );

    mostrarTareas(tareasPendientes);
}

function filtroTareasCompletadas() {
    const tareasCompletadas = arregloTareas.filter(
        tarea => tarea.completada
    );

    mostrarTareas(tareasCompletadas);
}

// CONFIRMACIÓN DEL BOTÓN RESET

function resetLista() {
    mostrarConfirmacionReset(mensajeDiv);
}

function mostrarConfirmacionReset(mensajeDiv) {
    clearTimeout(temporizadorMensaje);
    clearTimeout(temporizadorOcultar);

    mensajeDiv.innerHTML = "";
    mensajeDiv.textContent = "¿Está seguro de resetear la lista? ";

    const btnConfirmar = document.createElement("button");
    const btnCancelar = document.createElement("button");

    btnConfirmar.textContent = "Confirmar";
    btnCancelar.textContent = "Cancelar";

    mensajeDiv.appendChild(btnConfirmar);
    mensajeDiv.appendChild(btnCancelar);

    mensajeDiv.style.display = "block";
    mensajeDiv.style.opacity = "0";
    mensajeDiv.offsetWidth;

    requestAnimationFrame(function () {
        mensajeDiv.style.opacity = "1";
    });

    btnConfirmar.addEventListener("click", function () {
        confirmarReset(mensajeDiv);
    });

    btnCancelar.addEventListener("click", function () {
        cancelarReset(mensajeDiv);
    });
}

function confirmarReset(mensajeDiv) {
    arregloTareas = [];

    localStorage.removeItem("tareas");

    mostrarTareas(arregloTareas);
    actualizarContador();

    cerrarConfirmacionReset(mensajeDiv);
}

function cancelarReset(mensajeDiv) {
    cerrarConfirmacionReset(mensajeDiv);
}

function cerrarConfirmacionReset(mensajeDiv) {
    mensajeDiv.style.opacity = "0";

    clearTimeout(temporizadorOcultar);

    temporizadorOcultar = setTimeout(function () {
        mensajeDiv.style.display = "none";
        mensajeDiv.innerHTML = "";
    }, 500);
}

// ARRASTRAR Y REORDENAR TAREAS

function actualizarDragAndDrop(elementos) {
    if (!tareaArrastrada) {
        return;
    }

    const indiceOrigen = arregloTareas.indexOf(tareaArrastrada);
    const indiceDestino = arregloTareas.indexOf(elementos.nuevaTarea);

    if (
        indiceOrigen === -1 ||
        indiceDestino === -1 ||
        indiceOrigen === indiceDestino
    ) {
        tareaArrastrada = null;
        return;
    }

    const tareaMovida = arregloTareas.splice(indiceOrigen, 1)[0];

    arregloTareas.splice(indiceDestino, 0, tareaMovida);

    guardarTareas();
    mostrarTareas(arregloTareas);

    tareaArrastrada = null;
}

// LIMPIAR CAMPO DE ENTRADA

function limpiarEntrada() {
    entradaUsuario.value = "";
    entradaUsuario.focus();
}

// MENSAJES TEMPORALES

function mostrarMensaje(texto) {
    clearTimeout(temporizadorMensaje);
    clearTimeout(temporizadorOcultar);

    mensajeDiv.innerHTML = "";
    mensajeDiv.textContent = texto;

    mensajeDiv.style.display = "block";
    mensajeDiv.style.opacity = "0";
    mensajeDiv.offsetWidth;

    requestAnimationFrame(function () {
        mensajeDiv.style.opacity = "1";
    });

    temporizadorMensaje = setTimeout(function () {
        mensajeDiv.style.opacity = "0";

        temporizadorOcultar = setTimeout(function () {
            mensajeDiv.style.display = "none";
            mensajeDiv.innerHTML = "";
        }, 500);
    }, 3000);
}
