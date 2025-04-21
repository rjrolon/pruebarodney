document.addEventListener('DOMContentLoaded', () => {
    const formNuevaTarjeta = document.getElementById('form-nueva-tarjeta');
    const tablaTarjetas = document.getElementById('tabla-tarjetas');
    const tablaTarjetasBody = tablaTarjetas.querySelector('tbody');
    const formNuevoPago = document.getElementById('form-nuevo-pago');
    const selectTarjetaPago = document.getElementById('tarjeta-pago');
    const fechaPagoInput = document.getElementById('fecha-pago');
    const tablaPagosBody = document.getElementById('tabla-pagos').querySelector('tbody');
    const tablaResumenBody = document.getElementById('tabla-resumen').querySelector('tbody');
    const totalDeudaElement = document.getElementById('total-deuda');
    const botonExportar = document.getElementById('boton-exportar');
    const tarjetasPrecargadas = [
        { id: 'precargada-1', nombre: '007MC MasterCard Galicia', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-2', nombre: '007VISA VISA Galicia', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-3', nombre: '014MC MasterCard BaPro', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-4', nombre: '014VISA VISA BaPro', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-5', nombre: '015MC MasterCard ICBC', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-6', nombre: '015VISA VISA ICBC', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-7', nombre: '017VISA VISA BBVA', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-8', nombre: '029MC MasterCard Ciudad', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-9', nombre: '029VISA VISA Ciudad', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-10', nombre: '034MC MasterCard Patagonia', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-11', nombre: '034VISA VISA Patagonia', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-12', nombre: '044VISA VISA Hipotecario', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-13', nombre: '072AMEX Amex Santander', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-14', nombre: '072VISA VISA Santander', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-15', nombre: '094VISA VISA Corrientes', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-16', nombre: '285AMEX Amex Macro', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-17', nombre: '285VISA VISA Macro', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-18', nombre: '330VISA VISA Santa Fe', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 },
        { id: 'precargada-19', nombre: '415AMEX Amex Reba', saldoInicial: 0, fechaVencimiento: '', pagos: [], pagoMinimo: 0 }
    ];
    let tarjetas = cargarTarjetas(tarjetasPrecargadas);
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

    tablaTarjetasBody.addEventListener('dblclick', function(event) {
        const target = event.target;
        if (target.tagName === 'TD' && (target.cellIndex === 1 || target.cellIndex === 2 || target.cellIndex === 3)) { // Ahora el índice 1 es Pago Mínimo, 2 es Total, 3 es Fecha
            const fila = target.parentNode;
            const tarjetaId = fila.dataset.tarjetaId;
            const tarjeta = tarjetas.find(t => t.id == tarjetaId);

            if (tarjeta) {
                const columnaIndex = target.cellIndex;
                const valorActual = target.textContent.startsWith('$') ? target.textContent.substring(1) : target.textContent;
                let tipo = 'text';
                if (columnaIndex === 1 || columnaIndex === 2) { // Pago Mínimo o Total
                    tipo = 'number';
                } else if (columnaIndex === 3) { // Fecha de Vencimiento
                    tipo = 'date';
                }

                const input = document.createElement('input');
                input.type = tipo;
                input.value = valorActual === '-' ? '' : valorActual;
                input.classList.add('form-control', 'form-control-sm');

                target.innerHTML = '';
                target.appendChild(input);
                input.focus();

                input.addEventListener('blur', function() {
                    const nuevoValor = input.value.trim();
                    actualizarValorTarjeta(tarjetaId, columnaIndex, nuevoValor);
                });

                input.addEventListener('keypress', function(event) {
                    if (event.key === 'Enter') {
                        const nuevoValor = input.value.trim();
                        actualizarValorTarjeta(tarjetaId, columnaIndex, nuevoValor);
                    } else if (event.key === 'Escape') {
                        actualizarTablaTarjetas();
                    }
                });
            }
        }
    });

    function actualizarValorTarjeta(tarjetaId, columnaIndex, nuevoValor) {
        const tarjeta = tarjetas.find(t => t.id == tarjetaId);
        if (tarjeta) {
            if (columnaIndex === 1) {
                tarjeta.pagoMinimo = isNaN(parseFloat(nuevoValor)) ? tarjeta.pagoMinimo : parseFloat(nuevoValor);
            } else if (columnaIndex === 2) {
                tarjeta.saldoInicial = isNaN(parseFloat(nuevoValor)) ? tarjeta.saldoInicial : parseFloat(nuevoValor);
            } else if (columnaIndex === 3) {
                tarjeta.fechaVencimiento = nuevoValor;
            }
            guardarTarjetas();
            actualizarTablaTarjetas();
            actualizarResumenMensual();
        }
    }

    function cargarTarjetas(precargadas) {
        const tarjetasGuardadas = localStorage.getItem('tarjetas');
        let tarjetasExistentes = tarjetasGuardadas ? JSON.parse(tarjetasGuardadas) : [];

        // Aseguramos que las tarjetas existentes tengan la propiedad pagoMinimo
        tarjetasExistentes = tarjetasExistentes.map(tarjeta => ({
            ...tarjeta,
            pagoMinimo: tarjeta.pagoMinimo === undefined ? tarjeta.saldoInicial * 0.05 : tarjeta.pagoMinimo
        }));

        const tarjetasPrecargadasConPagoMinimo = precargadas.map(tarjeta => ({
            ...tarjeta,
            pagoMinimo: tarjeta.pagoMinimo === undefined ? tarjeta.saldoInicial * 0.05 : tarjeta.pagoMinimo
        }));

        const tarjetasUnicasPrecargadas = tarjetasPrecargadasConPagoMinimo.filter(precargada =>
            !tarjetasExistentes.some(local => local.nombre === precargada.nombre)
        );

        const tarjetasCombinadas = [...tarjetasUnicasPrecargadas, ...tarjetasExistentes];
        localStorage.setItem('tarjetas', JSON.stringify(tarjetasCombinadas));
        return tarjetasCombinadas;
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
                pagos: [],
                pagoMinimo: saldoInicial * 0.05 // Calcular pago mínimo al agregar
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
            fila.dataset.tarjetaId = tarjeta.id;
            const celdaNombre = fila.insertCell();
            const celdaPagoMinimo = fila.insertCell(); // Nueva celda para Pago Mínimo
            const celdaTotal = fila.insertCell();
            const celdaFechaVencimiento = fila.insertCell();
            const celdaDiasRestantes = fila.insertCell();
            const celdaAcciones = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaPagoMinimo.textContent = `$${tarjeta.pagoMinimo.toFixed(2)}`;
            celdaTotal.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`; // Muestra el saldo inicial como Total
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
        const tarjetaIdSeleccionada = selectTarjetaPago.value;
        const fechaPago = fechaPagoInput.value;
        const montoPago = parseFloat(document.getElementById('monto-pago').value);

        const tarjeta = tarjetas.find(t => t.id == tarjetaIdSeleccionada);

        if (tarjeta) {
            const nuevoPago = {
                fecha: fechaPago,
                monto: isNaN(montoPago) ? 0 : montoPago,
                id: Date.now()
            };
            tarjeta.pagos.push(nuevoPago);
            guardarTarjetas();
            actualizarTablaPagos();
            actualizarResumenMensual();
            formNuevoPago.reset();
        } else if (tarjetaIdSeleccionada) {
            alert('La tarjeta seleccionada no es válida.');
        } else {
            console.log("No se seleccionó ninguna tarjeta para el pago.");
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
        const tarjeta = tarjetas.find(t => t.id == tarjetaId);
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
            const celdaPagoMinimo = fila.insertCell(); // Nueva celda para Pago Mínimo
            const celdaTotal = fila.insertCell();
            const celdaTotalPagado = fila.insertCell();
            const celdaSaldoActual = fila.insertCell();

            celdaNombre.textContent = tarjeta.nombre;
            celdaPagoMinimo.textContent = `$${tarjeta.pagoMinimo.toFixed(2)}`;
            celdaTotal.textContent = `$${tarjeta.saldoInicial.toFixed(2)}`; // Muestra el saldo inicial como Total
            celdaTotalPagado.textContent = `$${totalPagado.toFixed(2)}`;
            celdaSaldoActual.textContent = `$${saldoActual.toFixed(2)}`;

            resumenData.push({
                Nombre: tarjeta.nombre,
                'Pago Mínimo': tarjeta.pagoMinimo,
                'Total': tarjeta.saldoInicial, // Usamos Saldo Inicial
                'Total Pagado': total
