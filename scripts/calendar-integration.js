// Integración con Google Calendar
const CALENDAR_CONFIG = {
    apiKey: 'TU_API_KEY',
    calendarId: 'TU_CALENDAR_ID',
    clientId: 'TU_CLIENT_ID'
};

// Función para sincronizar con Google Calendar
async function sincronizarConGoogleCalendar(cita) {
    try {
        const event = {
            'summary': `Cita: ${cita.servicio} - ${cita.cliente}`,
            'description': `Servicio: ${cita.servicio}\nCliente: ${cita.cliente}\nTeléfono: ${cita.telefono}`,
            'start': {
                'dateTime': `${cita.fecha}T${cita.hora}:00`,
                'timeZone': 'America/Mexico_City'
            },
            'end': {
                'dateTime': `${cita.fecha}T${obtenerHoraFin(cita.hora)}:00`,
                'timeZone': 'America/Mexico_City'
            },
            'reminders': {
                'useDefault': false,
                'overrides': [
                    {'method': 'popup', 'minutes': 30}
                ]
            }
        };

        await gapi.client.calendar.events.insert({
            'calendarId': CALENDAR_CONFIG.calendarId,
            'resource': event
        });

        console.log('Cita sincronizada con Google Calendar');
    } catch (error) {
        console.error('Error al sincronizar con Google Calendar:', error);
    }
}

// Panel de control del barbero
function actualizarPanelBarbero() {
    const panelBarbero = document.getElementById('panel-admin');
    if (!panelBarbero) return;

    const citasHoy = obtenerCitasDelDia();
    
    panelBarbero.innerHTML = `
        <div class="admin-dashboard">
            <div class="proxima-cita">
                <h3>Próximo Cliente</h3>
                ${generarProximaCitaHTML(citasHoy)}
            </div>
            <div class="citas-pendientes">
                <h3>Lista de Espera</h3>
                ${generarListaEsperaHTML(citasHoy)}
            </div>
            <div class="calendario-mini">
                <div id="calendar"></div>
            </div>
        </div>
    `;

    // Inicializar calendario mini
    inicializarCalendarioMini();
} 