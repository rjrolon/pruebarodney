document.addEventListener('DOMContentLoaded', () => {
    const formNuevaTarjeta = document.getElementById('form-nueva-tarjeta');
    const tablaTarjetasBody = document.getElementById('tabla-tarjetas').querySelector('tbody');
    const formNuevoPago = document.getElementById('form-nuevo-pago');
    const selectTarjetaPago = document.getElementById('tarjeta-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos').querySelector('tbody');
    let tarjetas = cargarTarjetas();
    actualizarTablaTarjetas();
    actualizarOpcionesTarjetaPago();
    actualizarTablaPagos();

    formNuevaTarjeta.addEventListener('submit', function(event) {
        event.preventDefault();
        agregarNuevaTarjeta();
    });

    formNuevoPago.addEventListener('submit', function(event) {
        event.preventDefault();
        registrarNuevoPago();
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
                id: Date.now(),
                nombre: nombre,
                saldoInicial: saldoInicial,
                fechaCorte: fechaCorte,
                pagos: []
            };
            tarjetas.push(nuevaTarjeta);
            guardarTarjetas();
            actualizarTablaTarjetas();
            actualizarOpcionesTarjetaPago();
            formNuevaTarjeta.reset();
        } else {
            alert('Por favor, ingresa un nombre y un saldo inicial válido para la tarjeta.');
        }
    }

    function actualizarTablaTarjetas() {
        tablaTarjetasBody.innerHTML = '';
        tarjetas.forEach(tarjeta => {
            const fila = tablaTarjetasBody.insertRow();
            const celdaNombre = fila.insertCell();
            const celdaSaldoInicial = fila.insertCell();
            const celdaFechaCorte = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaSaldoInicial.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`;
            celdaFechaCorte.textContent = tarjeta.fechaCorte || '-';
        });
    }

    function actualizarOpcionesTarjetaPago() {
        selectTarjetaPago.innerHTML = '<option value="">Seleccionar Tarjeta</option>'; // Limpiamos las opciones y agregamos una por defecto
        tarjetas.forEach(tarjeta => {
            const opcion = document.createElement('option');
            opcion.value = tarjeta.id;
            opcion.textContent = tarjeta.nombre;
            selectTarjetaPago.appendChild(opcion);
        });
    }

    function registrarNuevoPago() {
        const tarjetaId = parseInt(selectTarjetaPago.value);
        const fechaPago = document.getElementById('fecha-pago').value;
        const montoPago = parseFloat(document.getElementById('monto-pago').value);

        if (tarjetaId && !isNaN(montoPago) && montoPago > 0) {
            const tarjeta = tarjetas.find(t => t.id === tarjetaId);
            if (tarjeta) {
                const nuevoPago = {
                    fecha: fechaPago,
                    monto: montoPago
                };
                tarjeta.pagos.push(nuevoPago);
                guardarTarjetas();
                actualizarTablaPagos();
                formNuevoPago.reset();
            } else {
                alert('La tarjeta seleccionada no es válida.');
            }
        } else {
            alert('Por favor, selecciona una tarjeta e ingresa un monto de pago válido.');
        }
    }

    function actualizarTablaPagos() {
        tablaPagosBody.innerHTML = ''; // Limpiamos la tabla de pagos
        tarjetas.forEach(tarjeta => {
            if (tarjeta.pagos && tarjeta.pagos.length > 0) {
                tarjeta.pagos.forEach(pago => {
                    const fila = tablaPagosBody.insertRow();
                    const celdaTarjeta = fila.insertCell();
                    const celdaFechaPago = fila.insertCell();
                    const celdaMontoPago = fila.insertCell();

                    celdaTarjeta.textContent = tarjeta.nombre;
                    celdaFechaPago.textContent = pago.fecha;
                    celdaMontoPago.textContent = `$${pago.monto.toFixed(2)}`;
                });
            }
        });
    }
});
