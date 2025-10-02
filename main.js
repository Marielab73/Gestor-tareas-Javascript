// SELECTORES DOM
const formularioTareas = document.getElementById('task-form');
const inputTarea = document.getElementById('task-input');
const listaTareas = document.getElementById('task-list');
const botonesFiltro = document.querySelectorAll('.filter-btn');
const btnCambiarEstado = document.getElementById('btn-cambiar-estado');
const btnEditar = document.getElementById('btn-editar');
const btnEliminar = document.getElementById('btn-eliminar');

// PERSISTENCIA
const STORAGE_KEY = 'tareas_gestor';

function guardarTareas() {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(tareas));
}

function cargarTareas() {
    const data = localStorage.getItem(STORAGE_KEY);
    if (data) {
        tareas = JSON.parse(data);
    } else {
        tareas = [
            {
                id: Date.now(),
                text: "Hacer la pre-entrega del proyecto",
                completed: false
            }
        ];
    }
}

// ESTADO INICIAL
cargarTareas();
let filtroActual = 'all';
let tareaSeleccionada = null;


// FUNCIONES
function renderizarTareas() {
    listaTareas.innerHTML = '';
    tareas.forEach(function(tarea) {
        const li = crearElementoTarea(tarea);
        listaTareas.appendChild(li);
    });
    
    if (filtroActual !== 'all') {
        aplicarFiltroVisual();
    }
}

function seleccionarTarea(tarea, checkbox, elementoLi) {
    const todosCheckboxes = document.querySelectorAll('#task-list input[type="checkbox"]');
    const todosLi = document.querySelectorAll('#task-list li');
    
    todosCheckboxes.forEach(function(cb) {
        cb.checked = false;
    });
    
    todosLi.forEach(function(li) {
        li.classList.remove('active'); 
    });

    checkbox.checked = true;
    elementoLi.classList.add('active'); 
    tareaSeleccionada = tarea;
    actualizarBotones();
}

function actualizarBotones() {
    if (tareaSeleccionada) {
        btnCambiarEstado.disabled = false;
        btnEditar.disabled = false;
        btnEliminar.disabled = false;
    } else {
        btnCambiarEstado.disabled = true;
        btnEditar.disabled = true;
        btnEliminar.disabled = true;
    }
}

function crearElementoTarea(tarea) {
    const li = document.createElement('li');
    li.classList.add('list-group-item', 'd-flex', 'align-items-center', 'justify-content-between');
    li.setAttribute('data-id', tarea.id);

    const contenedorPrincipal = document.createElement('div');
    contenedorPrincipal.classList.add('d-flex', 'align-items-center');

    const divCheck = document.createElement('div');
    divCheck.classList.add('form-check', 'me-3');
    
    const checkbox = document.createElement('input');
    checkbox.type = 'checkbox';
    checkbox.classList.add('form-check-input');
    checkbox.onclick = function() {
        seleccionarTarea(tarea, checkbox, li);
    };

    divCheck.appendChild(checkbox);

    const spanTexto = document.createElement('span');
    spanTexto.textContent = tarea.text;
    spanTexto.classList.add('small');
   
    if (tarea.completed) {
        spanTexto.classList.add('text-decoration-line-through', 'text-muted');
    } else {
        spanTexto.classList.add('text-dark');
    }

    contenedorPrincipal.appendChild(divCheck);
    contenedorPrincipal.appendChild(spanTexto);
    li.appendChild(contenedorPrincipal);

    return li;
}

function agregarTarea(texto) {
    const nuevaTarea = {
        id: Date.now(),
        text: texto, 
        completed: false
    };

    tareas.push(nuevaTarea);
    const nuevoElemento = crearElementoTarea(nuevaTarea);
    listaTareas.appendChild(nuevoElemento);
    establecerFiltro('all');
    guardarTareas();
}

function alternarTarea(idTarea) {
    const tarea = tareas.find(tarea => tarea.id === idTarea);
    if (tarea) {
        tarea.completed = !tarea.completed;
        
        const elemento = document.querySelector(`li[data-id="${idTarea}"]`);
        if (elemento) {
            const spanTexto = elemento.querySelector('span');
            if (tarea.completed) {
                spanTexto.classList.remove('text-dark');
                spanTexto.classList.add('text-decoration-line-through', 'text-muted');
            } else {
                spanTexto.classList.remove('text-decoration-line-through', 'text-muted');
                spanTexto.classList.add('text-dark');
            }
        }
        
        establecerFiltro('all');
        guardarTareas();
    }
}

function editarTarea(idTarea) {
    const tarea = tareas.find(t => t.id === idTarea);
    if (!tarea) return;

    const nuevoTexto = prompt('Editar tarea:', tarea.text);
    if (nuevoTexto && nuevoTexto.trim() !== '') {
        tarea.text = nuevoTexto.trim();
        
        const elemento = document.querySelector(`li[data-id="${idTarea}"]`);
        if (elemento) {
            const spanTexto = elemento.querySelector('span');
            spanTexto.textContent = tarea.text;
        }
        
        guardarTareas();
    }
}

function eliminarTarea(idTarea) {
    if (confirm('¿Estás seguro de que quieres eliminar esta tarea?')) {
        tareas = tareas.filter(tarea => tarea.id !== idTarea);
        
        const elementoAEliminar = document.querySelector(`li[data-id="${idTarea}"]`);
        if (elementoAEliminar) {
            elementoAEliminar.remove(); 
        }
        
        if (tareaSeleccionada && tareaSeleccionada.id === idTarea) {
            tareaSeleccionada = null;
        }
       
        actualizarBotones();
        guardarTareas();
    }
}

function establecerFiltro(filtro) {
    filtroActual = filtro;
    
    botonesFiltro.forEach(function(btn) {
        btn.classList.remove('active');
        if (btn.dataset.filter === filtro) {
            btn.classList.add('active');
        }
    });
    
    if (filtro === 'all') {
        const todosLosElementos = document.querySelectorAll('#task-list li');
        todosLosElementos.forEach(function(elemento) {
            elemento.classList.remove('d-none');
            elemento.classList.add('d-block');
        });
    } else {
        aplicarFiltroVisual();
    }
}

function aplicarFiltroVisual() {
    const todosLosElementos = document.querySelectorAll('#task-list li');
    
    todosLosElementos.forEach(function(elemento) {
        const idTarea = parseInt(elemento.getAttribute('data-id'));
        const tarea = tareas.find(t => t.id === idTarea);
        
        if (tarea) {
            let mostrar = false;
            
            if (filtroActual === 'pending') {
                mostrar = !tarea.completed;
            } else if (filtroActual === 'completed') {
                mostrar = tarea.completed;
            }
            
            if (mostrar) {
                elemento.classList.remove('d-none');
                elemento.classList.add('d-block');
            } else {
                elemento.classList.remove('d-block');
                elemento.classList.add('d-none');
            }
        }
    });
}

// EVENTOS
formularioTareas.addEventListener('submit', function(event) {
    event.preventDefault();
    const textoTarea = inputTarea.value.trim();

    if (textoTarea !== '') {
        agregarTarea(textoTarea);
        inputTarea.value = '';
    } else {
        alert('Por favor, escribe una tarea.');
    }
});

botonesFiltro.forEach(function(boton) {
    boton.addEventListener('click', function() {
        const filtro = this.dataset.filter;
        establecerFiltro(filtro);
    });
});

btnCambiarEstado.addEventListener('click', function() {
    if (tareaSeleccionada) {
        alternarTarea(tareaSeleccionada.id);
    }
});

btnEditar.addEventListener('click', function() {
    if (tareaSeleccionada) {
        editarTarea(tareaSeleccionada.id);
    }
});

btnEliminar.addEventListener('click', function() {
    if (tareaSeleccionada) {
        eliminarTarea(tareaSeleccionada.id);
    }
});

// INICIALIZACIÓN
renderizarTareas();
actualizarBotones();