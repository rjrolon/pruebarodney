document.addEventListener('DOMContentLoaded', () => {
    const formNuevaTarjeta = document.getElementById('form-nueva-tarjeta');
    const tablaTarjetasBody = document.getElementById('tabla-tarjetas').querySelector('tbody');
    let tarjetas = cargarTarjetas();
    actualizarTablaTarjetas();

    formNuevaTarjeta.addEventListener('submit', function(event) {
        event.preventDefault();
        agregarNuevaTarjeta();
    });

    function cargarTarjetas() {
        const tarjetasGuardadas = localStorage.getItem('tarjetas');
        return tarjetasGuardadas ? JSON.parse(tarjetasGuardadas) : [];
    }

    function guardarTarjetas() {
        localStorage.setItem('tarjetas', JSON.stringify(tarjetas));
    }

    function agregarNuevaTarjeta() {
        const nombre = document.getElementById('nombre-tarjeta').value.trim();
        const saldoInicial = parseFloat(document.getElementById('saldo-inicial').value);
        const fechaCorte = document.getElementById('fecha-corte').value;

        if (nombre && !isNaN(saldoInicial)) {
            const nuevaTarjeta = {
                id: Date.now(), // Generamos un ID único para cada tarjeta
                nombre: nombre,
                saldoInicial: saldoInicial,
                fechaCorte: fechaCorte,
                pagos: [] // Inicializamos un array para los pagos de esta tarjeta
            };
            tarjetas.push(nuevaTarjeta);
            guardarTarjetas();
            actualizarTablaTarjetas();
            formNuevaTarjeta.reset(); // Limpiamos el formulario
        } else {
            alert('Por favor, ingresa un nombre y un saldo inicial válido para la tarjeta.');
        }
    }

    function actualizarTablaTarjetas() {
        tablaTarjetasBody.innerHTML = ''; // Limpiamos la tabla
        tarjetas.forEach(tarjeta => {
            const fila = tablaTarjetasBody.insertRow();
            const celdaNombre = fila.insertCell();
            const celdaSaldoInicial = fila.insertCell();
            const celdaFechaCorte = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaSaldoInicial.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`;
            celdaFechaCorte.textContent = tarjeta.fechaCorte || '-'; // Muestra '-' si no hay fecha de corte

            // Aquí podríamos agregar botones para editar o eliminar la tarjeta si lo deseas
        });
    }
});
