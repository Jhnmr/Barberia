document.addEventListener('DOMContentLoaded', function() {
    // Obtener el estilo seleccionado de la URL
    const urlParams = new URLSearchParams(window.location.search);
    const estiloSeleccionado = urlParams.get('estilo');

    // Si hay un estilo seleccionado, preseleccionarlo en el formulario
    if (estiloSeleccionado) {
        const servicioSelect = document.getElementById('servicio');
        if (servicioSelect) {
            servicioSelect.value = 'Corte de Cabello';
        }

        // Agregar el estilo como referencia
        const referenciaInput = document.createElement('input');
        referenciaInput.type = 'hidden';
        referenciaInput.name = 'estilo_referencia';
        referenciaInput.value = estiloSeleccionado;
        document.getElementById('formReserva')?.appendChild(referenciaInput);

        // Mostrar mensaje de estilo seleccionado
        const mensajeEstilo = document.createElement('div');
        mensajeEstilo.className = 'estilo-seleccionado';
        mensajeEstilo.innerHTML = `<p>Estilo seleccionado como referencia: <strong>${estiloSeleccionado}</strong></p>`;
        document.querySelector('.services-hero .container')?.appendChild(mensajeEstilo);
    }
});

// Función global para reservar servicio
window.reservarServicio = function(servicio) {
    const modal = document.getElementById('modalReserva');
    const servicioSelect = document.getElementById('servicio');
    
    if (modal && servicioSelect) {
        modal.style.display = 'block';
        servicioSelect.value = servicio;
    }
}

// Asegurarse de que el modal esté incluido en la página
document.addEventListener('DOMContentLoaded', function() {
    // Verificar si el modal existe
    const modal = document.getElementById('modalReserva');
    if (!modal) {
        console.error('Modal no encontrado. Asegúrate de incluir el HTML del modal.');
    }

    // Cerrar modal con la X
    const closeModal = document.querySelector('.close-modal');
    if (closeModal) {
        closeModal.addEventListener('click', function() {
            document.getElementById('modalReserva').style.display = 'none';
        });
    }

    // Cerrar modal haciendo clic fuera
    window.addEventListener('click', function(event) {
        const modal = document.getElementById('modalReserva');
        if (event.target === modal) {
            modal.style.display = 'none';
        }
    });

    // Formatear teléfono mientras se escribe
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', function(e) {
            let value = e.target.value.replace(/\D/g, '');
            if (value.length > 8) value = value.slice(0, 8);
            if (value.length > 4) {
                value = value.slice(0, 4) + '-' + value.slice(4);
            }
            e.target.value = value;
        });
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const fechaInput = document.getElementById('fecha');
    const horaSelect = document.getElementById('hora');
    
    // Configurar fecha mínima (hoy)
    const hoy = new Date();
    const fechaMin = hoy.toISOString().split('T')[0];
    fechaInput.min = fechaMin;
    
    // Configurar fecha máxima (30 días después)
    const maxDate = new Date();
    maxDate.setDate(maxDate.getDate() + 30);
    fechaInput.max = maxDate.toISOString().split('T')[0];

    // Deshabilitar días no laborables en el calendario
    fechaInput.addEventListener('input', function(e) {
        const fechaSeleccionada = new Date(this.value);
        if (!disponibilidadManager.esDiaLaborable(fechaSeleccionada)) {
            alert(disponibilidadManager.getMensajeDiaNoLaborable(fechaSeleccionada));
            this.value = '';
            horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
            return;
        }
    });

    // Actualizar horas disponibles cuando se seleccione una fecha
    fechaInput.addEventListener('change', async function() {
        if (!this.value) return;

        const fechaSeleccionada = new Date(this.value);
        horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
        
        if (!disponibilidadManager.esDiaLaborable(fechaSeleccionada)) {
            return;
        }

        // Obtener horarios base
        const horariosBase = disponibilidadManager.obtenerHorariosBase();

        // Verificar disponibilidad para cada hora
        for (const hora of horariosBase) {
            // Saltar hora de almuerzo
            if (disponibilidadManager.esHoraAlmuerzo(hora)) continue;

            const disponible = await disponibilidadManager.verificarDisponibilidad(this.value, hora);
            if (disponible) {
                const [h, m] = hora.split(':');
                const hora12 = h > 12 ? h - 12 : h;
                const periodo = h >= 12 ? 'PM' : 'AM';
                const opcion = document.createElement('option');
                opcion.value = hora;
                opcion.textContent = `${hora12}:${m} ${periodo}`;
                horaSelect.appendChild(opcion);
            }
        }

        // Si no hay horas disponibles
        if (horaSelect.options.length === 1) {
            const opcionNoDisponible = document.createElement('option');
            opcionNoDisponible.disabled = true;
            opcionNoDisponible.textContent = 'No hay horas disponibles para este día';
            horaSelect.appendChild(opcionNoDisponible);
        }
    });

    // Agregar mensaje de hora de almuerzo
    const mensajeAlmuerzo = document.createElement('div');
    mensajeAlmuerzo.className = 'almuerzo-info';
    mensajeAlmuerzo.textContent = 'Hora de almuerzo: 11:30 AM - 1:00 PM';
    horaSelect.parentNode.appendChild(mensajeAlmuerzo);

    // Agregar mensaje de días no laborables
    const mensajeDias = document.createElement('div');
    mensajeDias.className = 'dias-info';
    mensajeDias.textContent = 'Atendemos de domingo a jueves';
    fechaInput.parentNode.appendChild(mensajeDias);
}); 