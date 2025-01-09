// Elementos del DOM
const modal = document.getElementById('modalReserva');
const closeModal = document.querySelector('.close-modal');
const formReserva = document.getElementById('formReserva');
const horasSelect = document.getElementById('hora');
const fechaInput = document.getElementById('fecha');

// Configuración de los barberos
const BARBEROS = {
    '50670469306': {
        nombre: 'Daniel',
        rol: 'Barbero Principal',
        horario: {
            'Domingo-Jueves': { inicio: 8, fin: 14, minutoInicio: 30, minutoFin: 30 }
        }
    }
};

// Horarios especiales (almuerzo y salida)
const HORARIOS_ESPECIALES = {
    'almuerzo': { hora: 11, minutos: 30 },
    'salida': { hora: 17, minutos: 30 }
};

// Función para verificar si es hora especial
function esHoraEspecial(hora, minutos) {
    return (hora === HORARIOS_ESPECIALES.almuerzo.hora && minutos === HORARIOS_ESPECIALES.almuerzo.minutos) || 
           (hora === HORARIOS_ESPECIALES.salida.hora && minutos === HORARIOS_ESPECIALES.salida.minutos);
}

// Funciones para el modal
function abrirReserva(servicio = '') {
    if (modal) {
        modal.style.display = 'block';
        if (servicio && document.getElementById('servicio')) {
            document.getElementById('servicio').value = servicio;
        }
    }
}

function cerrarModal() {
    if (modal) {
        modal.style.display = 'none';
        if (formReserva) {
            formReserva.reset();
        }
    }
}

// Función para generar horas disponibles
function generarHorasDisponibles(fecha) {
    const horaSelect = document.getElementById('hora');
    if (!horaSelect) return;

    horaSelect.innerHTML = '<option value="">Selecciona una hora</option>';
    
    if (!fecha) return;

    const fechaSeleccionada = new Date(fecha);
    
    // Verificar si es un día laborable
    if (!disponibilidadManager.esDiaLaborable(fechaSeleccionada)) {
        alert(disponibilidadManager.getMensajeDiaNoLaborable(fechaSeleccionada));
        return;
    }

    // Obtener horarios base usando el método correcto
    const horariosBase = disponibilidadManager.obtenerHorariosBase();

    // Generar opciones de hora
    horariosBase.forEach(async (hora) => {
        // Saltar hora de almuerzo
        if (disponibilidadManager.esHoraAlmuerzo(hora)) return;

        const disponible = await disponibilidadManager.verificarDisponibilidad(fecha, hora);
        if (disponible) {
            const [h, m] = hora.split(':');
            const hora12 = h > 12 ? h - 12 : h;
            const periodo = h >= 12 ? 'PM' : 'AM';
            
            const opcion = document.createElement('option');
            opcion.value = hora;
            opcion.textContent = `${hora12}:${m} ${periodo}`;
            horaSelect.appendChild(opcion);
        }
    });

    // Si no hay horas disponibles
    if (horaSelect.options.length === 1) {
        const opcionNoDisponible = document.createElement('option');
        opcionNoDisponible.disabled = true;
        opcionNoDisponible.textContent = 'No hay horas disponibles para este día';
        horaSelect.appendChild(opcionNoDisponible);
    }
}

// Función para formatear teléfono
function formatearTelefono(event) {
    let input = event.target;
    let value = input.value.replace(/\D/g, '');
    
    if (value.length > 8) {
        value = value.slice(0, 8);
    }
    
    if (value.length > 4) {
        value = value.slice(0, 4) + '-' + value.slice(4);
    }
    
    input.value = value;
}

// Función para obtener teléfono completo
function obtenerTelefonoCompleto() {
    const countryCode = document.getElementById('country-code').value;
    const telefono = document.getElementById('telefono').value.replace(/\D/g, '');
    return `+${countryCode}${telefono}`;
}

// Función para agregar cita al calendario
function agregarCitaACalendario(citaData) {
    const fechaInicio = `${citaData.fecha}T${citaData.hora}:00`;
    const fechaFin = calcularHoraFin(fechaInicio);
    
    const evento = {
        text: `Cita de ${citaData.cliente}`,
        details: `Servicio: ${citaData.servicio}\nTeléfono: ${citaData.telefono}`,
        dates: `${fechaInicio}/${fechaFin}`,
        location: 'Barbería'
    };

    const url = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(evento.text)}&details=${encodeURIComponent(evento.details)}&dates=${evento.dates.replace(/[-:]/g, '')}&location=${encodeURIComponent(evento.location)}`;

    window.open(url, '_blank');
}

// Función para calcular hora fin
function calcularHoraFin(fechaInicio) {
    const fecha = new Date(fechaInicio);
    fecha.setMinutes(fecha.getMinutes() + 30);
    return fecha.toISOString().replace('.000', '');
}

// Función para mostrar citas activas
function mostrarCitasActivas() {
    const citas = JSON.parse(localStorage.getItem('citasBarber') || '[]')
        .filter(cita => cita.estado === 'activa');

    const contenedor = document.getElementById('calendario-citas');
    if (!contenedor) return;

    if (citas.length === 0) {
        contenedor.style.display = 'none';
        return;
    }

    contenedor.style.display = 'block';
    contenedor.innerHTML = `
        <h3>Mis Citas Programadas</h3>
        <div class="calendario-grid">
            ${citas.map(cita => `
                <div class="cita-card ${cita.estado}">
                    <h4>${cita.servicio}</h4>
                    <p><strong>Fecha:</strong> ${formatearFecha(cita.fecha)}</p>
                    <p><strong>Hora:</strong> ${cita.hora}</p>
                    <p><strong>Barbero:</strong> ${cita.barbero}</p>
                    <div class="cita-acciones">
                        <button onclick="cancelarCita(${cita.id})">Cancelar</button>
                        <button onclick="recordarCita(${cita.id})">Recordatorio</button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

// Función para formatear fecha
function formatearFecha(fecha) {
    return new Date(fecha).toLocaleDateString('es-ES', {
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}

// Función para cancelar cita
async function cancelarCita(citaId) {
    if (!confirm('¿Estás seguro de que deseas cancelar esta cita?')) return;

    const citas = JSON.parse(localStorage.getItem('citasBarber') || '[]');
    const citaIndex = citas.findIndex(cita => cita.id === citaId);

    if (citaIndex !== -1) {
        const citaCancelada = citas[citaIndex];
        citaCancelada.estado = 'cancelada';
        
        localStorage.setItem('citasBarber', JSON.stringify(citas));

        const mensaje = `Hola, soy ${citaCancelada.cliente}, lamento informar que no podré asistir a mi cita programada:

📅 Fecha: ${citaCancelada.fecha}
⏰ Hora: ${citaCancelada.hora}
✂️ Servicio: ${citaCancelada.servicio}
👤 Cliente: ${citaCancelada.cliente}

Disculpe las molestias.`;

        const numeroBarbero = '50670469306';
        const whatsappUrl = `https://wa.me/${numeroBarbero}?text=${encodeURIComponent(mensaje)}`;
        
        window.open(whatsappUrl, '_blank');
        mostrarCitasActivas();
    }
}

// Función para recordar cita
function recordarCita(citaId) {
    const citas = JSON.parse(localStorage.getItem('citasBarber') || '[]');
    const cita = citas.find(c => c.id === citaId);
    
    if (cita) {
        const mensaje = `¡Hola ${cita.cliente}! 
        
Te recordamos tu cita:
📅 Fecha: ${cita.fecha}
⏰ Hora: ${cita.hora}
✂️ Servicio: ${cita.servicio}
👤 Barbero: ${cita.barbero}

Te esperamos! 🙂`;

        // Enviar recordatorio por WhatsApp
        const numeroCliente = cita.telefono.replace(/[^0-9]/g, '');
        const whatsappUrl = `https://wa.me/${numeroCliente}?text=${encodeURIComponent(mensaje)}`;
        window.open(whatsappUrl, '_blank');
    }
}

// Función principal para enviar reserva
window.enviarReserva = async function(event) {
    event.preventDefault();
    
    try {
        const citaData = {
            id: Date.now(),
            cliente: document.getElementById('nombre').value,
            telefono: obtenerTelefonoCompleto(),
            servicio: document.getElementById('servicio').value,
            fecha: document.getElementById('fecha').value,
            hora: document.getElementById('hora').value,
            barbero: document.getElementById('barbero').options[document.getElementById('barbero').selectedIndex].text,
            estado: 'activa'
        };

        // Verificar disponibilidad
        const disponibilidadManager = new DisponibilidadManager();
        if (!disponibilidadManager.verificarDisponibilidad(citaData.fecha, citaData.hora)) {
            alert('Lo sentimos, este horario ya no está disponible. Por favor, selecciona otro.');
            return;
        }

        // Guardar en localStorage
        const citas = JSON.parse(localStorage.getItem('citasBarber') || '[]');
        citas.push(citaData);
        localStorage.setItem('citasBarber', JSON.stringify(citas));

        // Cerrar modal y actualizar vista
        cerrarModal();
        mostrarCitasActivas();

        // Mensaje para WhatsApp
        const mensaje = `¡Hola! Confirmo mi cita:
📅 Fecha: ${citaData.fecha}
⏰ Hora: ${citaData.hora}
✂️ Servicio: ${citaData.servicio}
👤 Cliente: ${citaData.cliente}`;

        const numeroBarbero = '50670469306';
        const whatsappUrl = `https://wa.me/${numeroBarbero}?text=${encodeURIComponent(mensaje)}`;

        // Mostrar confirmación y opciones
        if (confirm('¡Cita reservada con éxito! ¿Deseas agregar la cita a tu calendario?')) {
            agregarCitaACalendario(citaData);
            
            // Esperar un momento antes de abrir WhatsApp
            setTimeout(() => {
                if (confirm('¿Deseas enviar la confirmación por WhatsApp?')) {
                    window.open(whatsappUrl, '_blank');
                }
            }, 1000);
        } else {
            // Si no quiere agregar al calendario, preguntar por WhatsApp directamente
            if (confirm('¿Deseas enviar la confirmación por WhatsApp?')) {
                window.open(whatsappUrl, '_blank');
            }
        }

    } catch (error) {
        console.error('Error:', error);
        alert('Hubo un error al procesar la cita. Por favor, intenta de nuevo.');
    }
};

// Función para reservar servicio
function reservarServicio(servicio) {
    // Verificar si el modal existe
    const modal = document.getElementById('modalReserva');
    if (!modal) return;

    // Abrir el modal
    modal.style.display = 'block';

    // Seleccionar el servicio en el formulario
    const servicioSelect = document.getElementById('servicio');
    if (servicioSelect) {
        servicioSelect.value = servicio;
    }

    // Limpiar otros campos del formulario
    const formReserva = document.getElementById('formReserva');
    if (formReserva) {
        const inputs = formReserva.querySelectorAll('input:not([type="hidden"]), select:not(#servicio)');
        inputs.forEach(input => {
            if (input.type !== 'submit') {
                input.value = '';
            }
        });
    }

    // Enfocar el campo de nombre
    const nombreInput = document.getElementById('nombre');
    if (nombreInput) {
        nombreInput.focus();
    }
}

// Event Listeners
document.addEventListener('DOMContentLoaded', function onDocumentLoad() {
    // Verificar si el elemento existe antes de usar classList
    const elemento = document.querySelector('.tu-selector');
    if (elemento) {
        elemento.classList.add('tu-clase');
    }

    mostrarCitasActivas();
    
    // Event listener para el teléfono
    const telefonoInput = document.getElementById('telefono');
    if (telefonoInput) {
        telefonoInput.addEventListener('input', formatearTelefono);
    }

    // Event listener para la fecha
    if (fechaInput) {
        fechaInput.addEventListener('change', function() {
            generarHorasDisponibles(this.value);
        });
    }

    // Event listener para cerrar modal
    if (closeModal) {
        closeModal.addEventListener('click', cerrarModal);
    }
});

document.addEventListener('DOMContentLoaded', function() {
    const telefonoInput = document.getElementById('telefono');
    const countrySelect = document.getElementById('country-code');

    if (telefonoInput && countrySelect) {
        // Objeto con patrones por país
        const patronesTelefono = {
            '506': { // Costa Rica
                pattern: '[0-9]{4}-[0-9]{4}',
                format: (value) => {
                    value = value.replace(/\D/g, '');
                    if (value.length > 8) value = value.slice(0, 8);
                    if (value.length > 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                    }
                    return value;
                }
            },
            '503': { // El Salvador
                pattern: '[0-9]{4}-[0-9]{4}',
                format: (value) => {
                    value = value.replace(/\D/g, '');
                    if (value.length > 8) value = value.slice(0, 8);
                    if (value.length > 4) {
                        value = value.slice(0, 4) + '-' + value.slice(4);
                    }
                    return value;
                }
            },
            // Patrones similares para otros países...
        };

        // Actualizar patrón cuando cambie el país
        countrySelect.addEventListener('change', function() {
            const patron = patronesTelefono[this.value];
            if (patron) {
                telefonoInput.pattern = patron.pattern;
                telefonoInput.value = patron.format(telefonoInput.value);
            }
        });

        // Formatear mientras se escribe
        telefonoInput.addEventListener('input', function() {
            const patron = patronesTelefono[countrySelect.value];
            if (patron) {
                this.value = patron.format(this.value);
            }
        });
    }
});