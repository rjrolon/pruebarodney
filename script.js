document.addEventListener('DOMContentLoaded', () => {
    const formNuevaTarjeta = document.getElementById('form-nueva-tarjeta');
    const tablaTarjetasBody = document.getElementById('tabla-tarjetas').querySelector('tbody');
    const formNuevoPago = document.getElementById('form-nuevo-pago');
    const selectTarjetaPago = document.getElementById('tarjeta-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos').querySelector('tbody');
    const tablaResumenBody = document.getElementById('tabla-resumen').querySelector('tbody');
    const totalDeudaElement = document.getElementById('total-deuda');
    const botonExportar = document.getElementById('boton-exportar');
    let tarjetas = cargarTarjetas();
    actualizarTablaTarjetas();
    actualizarOpcionesTarjetaPago();
    actualizarTablaPagos();
    actualizarResumenMensual();

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
        return tarjetasGuardadas ? JSON.parse(tarjetasGuardadas) : [];
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
            return null;
        }
        const fechaVencimientoDate = new Date(fechaVencimiento);
        const hoy = new Date();
        const diferenciaTiempo = fechaVencimientoDate.getTime() - hoy.getTime();
        const diferenciaDias = Math.ceil(diferenciaTiempo / (1000 * 3600 * 24));
        return diferenciaDias >= 0 ? diferenciaDias : 'Vencida';
    }

    function eliminarTarjeta(tarjetaId) {
        if (confirm('¿Estás seguro de que quieres eliminar esta tarjeta y todos sus pagos?')) {
            tarjetas = tarjetas.filter(tarjeta => tarjeta.id !== tarjetaId);
            guardarTarjetas();
            actualizarTablaTarjetas();
            actualizarOpcionesTarjetaPago();
            actualizarTablaPagos();
            actualizarResumenMensual();
        }
    }

    function actualizarOpcionesTarjetaPago() {
        selectTarjetaPago.innerHTML = '<option value="">Seleccionar Tarjeta</option>';
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
                    monto: montoPago,
                    id: Date.now()
                };
                tarjeta.pagos.push(nuevoPago);
                guardarTarjetas();
                actualizarTablaPagos();
                actualizarResumenMensual();
                formNuevoPago.reset();
            } else {
                alert('La tarjeta seleccionada no es válida.');
            }
        } else {
            alert('Por favor, selecciona una tarjeta e ingresa un monto de pago válido.');
        }
    }

    function actualizarTablaPagos() {
        tablaPagosBody.innerHTML = '';
        tarjetas.forEach(tarjeta => {
            if (tarjeta.pagos && tarjeta.pagos.length > 0) {
                tarjeta.pagos.forEach(pago => {
                    const fila = tablaPagosBody.insertRow();
                    const celdaTarjeta = fila.insertCell();
                    const celdaFechaPago = fila.insertCell();
                    const celdaMontoPago = fila.insertCell();
                    const celdaAccionesPago = fila.insertCell();

                    celdaTarjeta.textContent = tarjeta.nombre;
                    celdaFechaPago.textContent = pago.fecha;
                    celdaMontoPago.textContent = `$${pago.monto.toFixed(2)}`;

                    const botonDeshacer = document.createElement('button');
                    botonDeshacer.textContent = 'Deshacer';
                    botonDeshacer.classList.add('btn', 'btn-sm', 'btn-outline-danger');
                    botonDeshacer.addEventListener('click', function() {
                        deshacerPago(tarjeta.id, pago.id);
                    });
                    celdaAccionesPago.appendChild(botonDeshacer);
                });
            }
        });
    }

    function deshacerPago(tarjetaId, pagoId) {
        const tarjeta = tarjetas.find(t => t.id === tarjetaId);
        if (tarjeta) {
            tarjeta.pagos = tarjeta.pagos.filter(pago => pago.id !== pagoId);
            guardarTarjetas();
            actualizarTablaPagos();
            actualizarResumenMensual();
        }
    }

    function actualizarResumenMensual() {
        tablaResumenBody.innerHTML = '';
        let totalDeuda = 0;
        const resumenData = [];

        tarjetas.forEach(tarjeta => {
            let totalPagado = tarjeta.pagos.reduce((sum, pago) => sum + pago.monto, 0);
            const saldoActual = tarjeta.saldoInicial - totalPagado;
            totalDeuda += saldoActual;

            const fila = tablaResumenBody.insertRow();
            const celdaNombre = fila.insertCell();
            const celdaSaldoInicial = fila.insertCell();
            const celdaTotalPagado = fila.insertCell();
            const celdaSaldoActual = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaSaldoInicial.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`;
            celdaTotalPagado.textContent = `$${totalPagado.toFixed(2)}`;
            celdaSaldoActual.textContent = `$${saldoActual.toFixed(2)}`;

            resumenData.push({
                Nombre: tarjeta.nombre,
                'Saldo Inicial': tarjeta.saldoInicial,
                'Total Pagado': totalPagado,
                'Saldo Actual': saldoActual
            });
        });

        totalDeudaElement.textContent = `$${totalDeuda.toFixed(2)}`;
        window.resumenDataParaExportar = resumenData;
    }

    function exportarResumenCSV() {
        if (!window.resumenDataParaExportar || window.resumenDataParaExportar.length === 0) {
            alert('No hay datos en el resumen para exportar.');
            return;
        }

        const data = window.resumenDataParaExportar;
        const csvRows = [];
        const headers = Object.keys(data[0]).join(',');
        csvRows.push(headers);

        data.forEach(row => {
            const values = Object.values(row).map(value => `"${value}"`).join(',');
            csvRows.push(values);
        });

        const csvString = csvRows.join('\n');
        const blob = new Blob([csvString], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = 'resumen_financiero.csv';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    }
});
