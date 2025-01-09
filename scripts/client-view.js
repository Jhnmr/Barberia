// Sistema de visualización para clientes
class CitasClienteView {
    constructor() {
        this.citaActual = null;
        this.recordatoriosActivos = false;
    }

    mostrarDisponibilidad(fecha) {
        const horariosDisponibles = obtenerHorariosDisponibles(fecha);
        const contenedor = document.getElementById('disponibilidad-horarios');
        
        if (!contenedor) return;

        contenedor.innerHTML = `
            <div class="horarios-grid">
                ${horariosDisponibles.map(horario => `
                    <div class="horario-slot ${horario.disponible ? 'disponible' : 'ocupado'}"
                         onclick="${horario.disponible ? `reservarHorario('${horario.hora}')` : ''}"
                         data-hora="${horario.hora}">
                        <span class="hora">${horario.hora}</span>
                        <span class="estado">${horario.disponible ? 'Disponible' : 'Ocupado'}</span>
                        ${horario.disponible ? '<span class="indicador">Seleccionar</span>' : ''}
                    </div>
                `).join('')}
            </div>
            <div class="leyenda">
                <span class="disponible-icon"></span> Horarios disponibles
                <span class="ocupado-icon"></span> Horarios ocupados
            </div>
        `;
    }

    mostrarConfirmacion(datosReserva) {
        return `
            <div class="confirmacion-reserva">
                <h3>¡Tu cita está confirmada!</h3>
                <div class="detalles-cita">
                    <p><strong>Fecha:</strong> ${formatearFecha(datosReserva.fecha)}</p>
                    <p><strong>Hora:</strong> ${datosReserva.hora}</p>
                    <p><strong>Servicio:</strong> ${datosReserva.servicio}</p>
                    <p><strong>Barbero:</strong> ${datosReserva.barbero}</p>
                </div>
                <div class="acciones-cita">
                    <button onclick="agregarACalendario('${JSON.stringify(datosReserva)}')">
                        Añadir a mi calendario
                    </button>
                    <button onclick="activarRecordatorios()">
                        Activar recordatorios
                    </button>
                </div>
            </div>
        `;
    }
} 