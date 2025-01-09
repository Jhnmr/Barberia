document.addEventListener('DOMContentLoaded', function() {
    const galeriaGrid = document.querySelector('.gallery-grid');
    if (galeriaGrid) {
        const estilos = [
            { id: 1, nombre: "Estilo 1", imagen: "styles/assets/images/gallery/style1.jpeg" },
            { id: 2, nombre: "Estilo 2", imagen: "styles/assets/images/gallery/style2.jpeg" },
            { id: 3, nombre: "Estilo 3", imagen: "styles/assets/images/gallery/style3.jpeg" },
            { id: 4, nombre: "Estilo 4", imagen: "styles/assets/images/gallery/style4.jpeg" },
            { id: 5, nombre: "Estilo 5", imagen: "styles/assets/images/gallery/style5.jpeg" },
            { id: 6, nombre: "Estilo 6", imagen: "styles/assets/images/gallery/style6.jpeg" },
            { id: 7, nombre: "Estilo 7", imagen: "styles/assets/images/gallery/style7.jpeg" },
            { id: 8, nombre: "Estilo 8", imagen: "styles/assets/images/gallery/style8.jpeg" },
            { id: 9, nombre: "Estilo 9", imagen: "styles/assets/images/gallery/style9.jpeg" },
            { id: 10, nombre: "Estilo 10", imagen: "styles/assets/images/gallery/style10.jpeg" },
            { id: 11, nombre: "Estilo 11", imagen: "styles/assets/images/gallery/style11.jpeg" },
            { id: 12, nombre: "Estilo 12", imagen: "styles/assets/images/gallery/style12.jpeg" },
            { id: 13, nombre: "Estilo 13", imagen: "styles/assets/images/gallery/style13.jpeg" },
            { id: 14, nombre: "Estilo 14", imagen: "styles/assets/images/gallery/style14.jpeg" },
            { id: 15, nombre: "Estilo 15", imagen: "styles/assets/images/gallery/style15.jpeg" },
            { id: 16, nombre: "Estilo 16", imagen: "styles/assets/images/gallery/style16.jpeg" },
            { id: 17, nombre: "Estilo 17", imagen: "styles/assets/images/gallery/style17.jpeg" },
            { id: 18, nombre: "Estilo 18", imagen: "styles/assets/images/gallery/style18.jpeg" },
            { id: 19, nombre: "Estilo 19", imagen: "styles/assets/images/gallery/style19.jpeg" },
            { id: 20, nombre: "Estilo 20", imagen: "styles/assets/images/gallery/style20.jpeg" },
            { id: 21, nombre: "Estilo 21", imagen: "styles/assets/images/gallery/style21.jpeg" }
        ];

        galeriaGrid.innerHTML = estilos.map(estilo => `
            <div class="gallery-item">
                <img src="${estilo.imagen}" alt="${estilo.nombre}">
                <div class="gallery-overlay">
                    <h3>${estilo.nombre}</h3>
                    <button class="select-style" onclick="seleccionarEstilo('${estilo.nombre}')">
                        Reservar este estilo
                    </button>
                </div>
            </div>
        `).join('');
    }
});

// Función global para seleccionar estilo
function seleccionarEstilo(nombre) {
    localStorage.setItem('estiloSeleccionado', nombre);
    window.location.href = 'services.html?estilo=' + encodeURIComponent(nombre);
} 