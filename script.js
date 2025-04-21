function agregarNuevaTarjeta() {
        const nombre = document.getElementById('nombre-tarjeta').value.trim();
        const saldoInicial = parseFloat(document.getElementById('saldo-inicial').value);
        const fechaCorte = document.getElementById('fecha-corte').value;

        if (nombre && !isNaN(saldoInicial)) {
            const nuevaTarjeta = {
                id: Date.now(),
                nombre: nombre,
                saldoInicial: saldoInicial,
                fechaCorte: fechaCorte,
                pagos: []
            };
            tarjetas.push(nuevaTarjeta);
            guardarTarjetas();
            actualizarTablaTarjetas();
            actualizarOpcionesTarjetaPago(); // Asegúrate de que esta línea esté aquí
            actualizarResumenMensual();
            formNuevaTarjeta.reset();
        } else {
            alert('Por favor, ingresa un nombre y un saldo inicial válido para la tarjeta.');
        }
    }
