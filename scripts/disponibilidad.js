// Estructura de datos para los cupos
const DURACION_SERVICIO = 30; // minutos
let cuposDisponibles = {};

// Función para inicializar los cupos del día
function inicializarCuposDia(fecha, barberoId) {
    const dia = new Date(fecha).toISOString().split('T')[0];
    if (!cuposDisponibles[dia]) {
        cuposDisponibles[dia] = {};
    }
    if (!cuposDisponibles[dia][barberoId]) {
        cuposDisponibles[dia][barberoId] = generarCuposDelDia(fecha, barberoId);
    }
    return cuposDisponibles[dia][barberoId];
}

// Función para generar los cupos disponibles del día
function generarCuposDelDia(fecha, barberoId) {
    const horarioBarbero = BARBEROS[barberoId].horario['Domingo-Jueves'];
    const cupos = [];
    
    for (let hora = horarioBarbero.inicio; hora < horarioBarbero.fin; hora++) {
        for (let minutos = 0; minutos < 60; minutos += DURACION_SERVICIO) {
            // Saltar hora de almuerzo y salida
            if (!esHoraEspecial(hora, minutos)) {
                cupos.push({
                    hora: `${hora.toString().padStart(2, '0')}:${minutos.toString().padStart(2, '0')}`,
                    disponible: true,
                    cliente: null
                });
            }
        }
    }
    
    return cupos;
}

// Función para mostrar próximos cupos disponibles
function mostrarProximosCupos(barberoId, fecha) {
    const cuposDia = inicializarCuposDia(fecha, barberoId);
    const cuposDisponiblesHoy = cuposDia.filter(cupo => cupo.disponible);
    
    const contenedorCupos = document.getElementById('cupos-disponibles');
    if (!contenedorCupos) return;

    contenedorCupos.innerHTML = `
        <h4>Próximos horarios disponibles</h4>
        <div class="cupos-grid">
            ${cuposDisponiblesHoy.map(cupo => `
                <div class="cupo-item ${cupo.disponible ? 'disponible' : 'ocupado'}">
                    <span class="hora">${cupo.hora}</span>
                    ${cupo.cliente ? `<span class="cliente">${cupo.cliente}</span>` : ''}
                </div>
            `).join('')}
        </div>
    `;
}

// Panel del barbero
function mostrarPanelBarbero(barberoId) {
    const hoy = new Date();
    const proximosCupos = [];
    
    // Obtener próximos 7 días de cupos
    for (let i = 0; i < 7; i++) {
        const fecha = new Date(hoy);
        fecha.setDate(fecha.getDate() + i);
        const cuposDia = inicializarCuposDia(fecha, barberoId);
        
        cuposDia.forEach(cupo => {
            if (!cupo.disponible) {
                proximosCupos.push({
                    fecha: fecha.toISOString().split('T')[0],
                    hora: cupo.hora,
                    cliente: cupo.cliente
                });
            }
        });
    }

    const panelBarbero = document.getElementById('panel-barbero');
    if (!panelBarbero) return;

    panelBarbero.innerHTML = `
        <h3>Panel de Control - ${BARBEROS[barberoId].nombre}</h3>
        <div class="proximas-citas">
            <h4>Próximas Citas</h4>
            ${proximosCupos.map(cita => `
                <div class="cita-item">
                    <div class="cita-info">
                        <span class="fecha">${formatearFecha(cita.fecha)}</span>
                        <span class="hora">${cita.hora}</span>
                        <span class="cliente">${cita.cliente}</span>
                    </div>
                    <div class="cita-acciones">
                        <button onclick="marcarCompletada('${cita.fecha}', '${cita.hora}', '${barberoId}')">
                            Completada
                        </button>
                        <button onclick="cancelarCita('${cita.fecha}', '${cita.hora}', '${barberoId}')">
                            Cancelar
                        </button>
                    </div>
                </div>
            `).join('')}
        </div>
    `;
}

class DisponibilidadManager {
    constructor() {
        this.citasGuardadas = JSON.parse(localStorage.getItem('citasBarber') || '[]');
        this.diasNoLaborables = [5, 6]; // 5 = Viernes, 6 = Sábado
        this.horasAlmuerzo = ['12:00', '12:30'];
    }

    esDiaLaborable(fecha) {
        const dia = new Date(fecha).getDay();
        return !this.diasNoLaborables.includes(dia);
    }

    getMensajeDiaNoLaborable(fecha) {
        const dia = new Date(fecha).getDay();
        switch (dia) {
            case 5: return 'No atendemos los viernes';
            case 6: return 'No atendemos los sábados';
            default: return 'Este día no es laborable';
        }
    }

    obtenerHorariosBase() {
        return ['09:00', '09:30', '10:00', '10:30', '11:00', '11:30', 
                '13:00', '13:30', '14:00', '14:30', '15:00', '15:30', 
                '16:00', '16:30', '17:00'];
    }

    esHoraAlmuerzo(hora) {
        return this.horasAlmuerzo.includes(hora);
    }

    async verificarDisponibilidad(fecha, hora) {
        return !this.citasGuardadas.some(cita => 
            cita.fecha === fecha && 
            cita.hora === hora && 
            cita.estado !== 'cancelada'
        );
    }
}

// Crear instancia global
window.disponibilidadManager = new DisponibilidadManager();