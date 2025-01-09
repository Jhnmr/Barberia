class WhatsAppManager {
    constructor() {
        this.numeroBarber = 'TU_NUMERO_WHATSAPP';
    }

    enviarConfirmacion(cita) {
        const mensaje = this.generarMensajeConfirmacion(cita);
        const url = `https://wa.me/${this.numeroBarber}?text=${encodeURIComponent(mensaje)}`;
        window.open(url, '_blank');
    }

    enviarRecordatorio(cita) {
        const horasParaCita = this.calcularHorasParaCita(cita.fecha, cita.hora);
        
        if (horasParaCita <= 24) {
            const mensaje = this.generarMensajeRecordatorio(cita);
            // Usar WhatsApp Business API para envío automático
            this.enviarMensajeAutomatico(cita.telefono, mensaje);
        }
    }

    generarMensajeConfirmacion(cita) {
        return `¡Hola ${cita.cliente}! Tu cita está confirmada:
        
📅 Fecha: ${formatearFecha(cita.fecha)}
⏰ Hora: ${cita.hora}
✂️ Servicio: ${cita.servicio}
👤 Barbero: ${cita.barbero}

Para cancelar o reprogramar, responde a este mensaje.
Te esperamos! 🙂`;
    }
} 