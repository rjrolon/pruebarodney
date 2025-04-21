document.addEventListener('DOMContentLoaded', () => {
    const formNuevaTarjeta = document.getElementById('form-nueva-tarjeta');
    const tablaTarjetasBody = document.getElementById('tabla-tarjetas').querySelector('tbody');
    const formNuevoPago = document.getElementById('form-nuevo-pago');
    const selectTarjetaPago = document.getElementById('tarjeta-pago');
    const fechaPagoInput = document.getElementById('fecha-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos').querySelector('tbody');
    const tablaResumenBody = document.getElementById('tabla-resumen').querySelector('tbody');
    const totalDeudaElement = document.getElementById('total-deuda');
    const botonExportar = document.getElementById('boton-exportar');
    let tarjetas = cargarTarjetas();
    actualizarTablaTarjetas();
    actualizarOpcionesTarjetaPago();
    actualizarTablaPagos();
    actualizarResumenMensual();

    // Establecer la fecha actual por defecto en el campo de fecha de pago
    const hoy = new Date();
    const anio = hoy.getFullYear();
    const mes = String(hoy.getMonth() + 1).padStart(2, '0');
    const dia = String(hoy.getDate()).padStart(2, '0');
    fechaPagoInput.value = `<span class="math-inline">\{anio\}\-</span>{mes}-${dia}`;

    formNuevaTarjeta.addEventListener('submit', function(event) {
        event.preventDefault();
        agregarNuevaTarjeta();
    });

    formNuevoPago.addEventListener('submit', function(event) {
        event.preventDefault();
        registrarNuevoPago();
    });

    botonExportar.addEventListener('click', function() {
        exportarResumenCSV();
    });

    function cargarTarjetas() {
        const tarjetasGuardadas = localStorage.getItem('tarjetas');
        const tarjetasPrecargadas = [
            { id: 'precargada-1', nombre: '007MC MasterCard Galicia', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-2', nombre: '007VISA VISA Galicia', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-3', nombre: '014MC MasterCard BaPro', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-4', nombre: '014VISA VISA BaPro', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-5', nombre: '015MC MasterCard ICBC', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-6', nombre: '015VISA VISA ICBC', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-7', nombre: '017VISA VISA BBVA', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-8', nombre: '029MC MasterCard Ciudad', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-9', nombre: '029VISA VISA Ciudad', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-10', nombre: '034MC MasterCard Patagonia', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-11', nombre: '034VISA VISA Patagonia', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-12', nombre: '044VISA VISA Hipotecario', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-13', nombre: '072AMEX Amex Santander', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-14', nombre: '072VISA VISA Santander', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-15', nombre: '094VISA VISA Corrientes', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-16', nombre: '285AMEX Amex Macro', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-17', nombre: '285VISA VISA Macro', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-18', nombre: '330VISA VISA Santa Fe', saldoInicial: 0, fechaVencimiento: '', pagos: [] },
            { id: 'precargada-19', nombre: '415AMEX Amex Reba', saldoInicial: 0, fechaVencimiento: '', pagos: [] }
        ];

        if (tarjetasGuardadas) {
            const tarjetasLocalStorage = JSON.parse(tarjetasGuardadas);
            // Filtramos las tarjetas precargadas para evitar duplicados por nombre
            const tarjetasUnicasPrecargadas = tarjetasPrecargadas.filter(precargada =>
                !tarjetasLocalStorage.some(local => local.nombre === precargada.nombre)
            );
            return [...tarjetasUnicasPrecargadas, ...tarjetasLocalStorage];
        } else {
            localStorage.setItem('tarjetas', JSON.stringify(tarjetasPrecargadas));
            return tarjetasPrecargadas;
        }
    }

    function guardarTarjetas() {
        localStorage.setItem('tarjetas', JSON.stringify(tarjetas));
    }

    function agregarNuevaTarjeta() {
        const nombre = document.getElementById('nombre-tarjeta').value.trim();
        const saldoInicial = parseFloat(document.getElementById('saldo-inicial').value);
        const fechaVencimiento = document.getElementById('fecha-vencimiento').value;

        if (nombre && !isNaN(saldoInicial)) {
            const nuevaTarjeta = {
                id: Date.now(),
                nombre: nombre,
                saldoInicial: saldoInicial,
                fechaVencimiento: fechaVencimiento,
                pagos: []
            };
            tarjetas.push(nuevaTarjeta);
            guardarTarjetas();
            actualizarTablaTarjetas();
            actualizarOpcionesTarjetaPago();
            actualizarResumenMensual();
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
            const celdaFechaVencimiento = fila.insertCell();
            const celdaDiasRestantes = fila.insertCell();
            const celdaAcciones = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaSaldoInicial.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`;
            celdaFechaVencimiento.textContent = tarjeta.fechaVencimiento || '-';

            const diasRestantes = calcularDiasRestantes(tarjeta.fechaVencimiento);
            celdaDiasRestantes.textContent = diasRestantes === null ? '-' : diasRestantes;

            const botonEliminar = document.createElement('button');
            botonEliminar.textContent = 'Eliminar';
            botonEliminar.classList.add('btn', 'btn-sm', 'btn-outline-danger');
            botonEliminar.addEventListener('click', function() {
                eliminarTarjeta(tarjeta.id);
            });
            celdaAcciones.appendChild(botonEliminar);
        });
    }

    function calcularDiasRestantes(fechaVencimiento) {
        if (!fechaVencimiento) {
