// ==========================================
// 1. CONFIGURACIÓN DE LA BASE DE DATOS
// ==========================================
// Creamos una base de datos llamada 'RestauranteDB'
const db = new Dexie("RestauranteDB");

// Definimos la tabla 'pedidos' y su llave primaria autoincrementable (id)
db.version(1).stores({
    pedidos: '++id, plato, bebida, extras, total, fechaffff'
});

// ==========================================
// 2. EVENTO DEL FORMULARIO
// ==========================================
document.getElementById('formularioRestaurante').addEventListener('submit', async function(event) {
    event.preventDefault();

    const PRECIOS = {
        pizza: 12.00,
        hamburguesa: 7.50,
        pequena: 1.00,
        mediana: 1.50,
        grande: 2.00,
        papas: 2.50,
        helado: 1.80,
        ensalada: 5.00,
        flan: 2.00
    };

    let cuentaDetalle = "<strong>🧾 DETALLE DE TU PEDIDO:</strong><br><hr>";
    let total = 0;

    // Capturar Plato
    const plato = document.getElementById('platoPrincipal').value;
    if (plato === 'pizza') {
        total += PRECIOS.pizza;
        cuentaDetalle += `• Pizza Familiar: $${PRECIOS.pizza.toFixed(2)}<br>`;
    } else if (plato === 'hamburguesa') {
        total += PRECIOS.hamburguesa;
        cuentaDetalle += `• Hamburguesa con Queso: $${PRECIOS.hamburguesa.toFixed(2)}<br>`;
    }
    else if (plato=='ensalada') {
      total += PRECIOS.ensalada;
        cuentaDetalle += `• Ensalada César: $${PRECIOS.ensalada.toFixed(2)}<br>`;  
    }

    // Capturar Bebida
    const bebidaSeleccionada = document.querySelector('input[name="tamanoBebida"]:checked').value;
    total += PRECIOS[bebidaSeleccionada];
    cuentaDetalle += `• Bebida (${bebidaSeleccionada}): $${PRECIOS[bebidaSeleccionada].toFixed(2)}<br>`;

    // Capturar Extras
    const quierePapas = document.getElementById('extraPapas').checked;
    const quiereHelado = document.getElementById('extraHelado').checked;
    const quiereFlan = document.getElementById('extraFlan').checked;
    let listaExtras = [];

    if (quierePapas) {
        total += PRECIOS.papas;
        listaExtras.push("Papas Fritas");
        cuentaDetalle += `• Extra Papas Fritas: $${PRECIOS.papas.toFixed(2)}<br>`;
    }
    if (quiereHelado) {
        total += PRECIOS.helado;
        listaExtras.push("Helado");
        cuentaDetalle += `• Extra Helado: $${PRECIOS.helado.toFixed(2)}<br>`;
    }
    if (quiereFlan) {
        total += PRECIOS.flan;
        listaExtras.push("Flan");
        cuentaDetalle += `• Extra Flan: $${PRECIOS.flan.toFixed(2)}<br>`;
    }
    
    cuentaDetalle += `<hr><strong>💰 TOTAL A PAGAR: $${total.toFixed(2)}</strong>`;

    // Mostrar el recibo en pantalla
    const areaRecibo = document.getElementById('reciboRespuesta');
    const rating = document.querySelector('.estrellas');
    areaRecibo.innerHTML = cuentaDetalle;
    areaRecibo.style.display = "block";
    if (rating) {
        rating.classList.add('visible');
    }

    // ==========================================
    // 3. GUARDAR LOS DATOS EN LA BASE DE DATOS
    // ==========================================
    try {
        await db.pedidos.add({
            plato: plato,
            bebida: bebidaSeleccionada,
            extras: listaExtras.join(", ") || "Ninguno",
            total: total,
            fecha: new Date().toLocaleString() // Guarda fecha y hora del sistema
        });
        
        // Alerta visual de éxito en la consola
        console.log("¡Pedido guardado con éxito en la base de datos!");
    } catch (error) {
        console.error("Error al guardar en la base de datos: ", error);
    }
});

// ==========================================
// 🆕 NUEVO: FUNCIONALIDAD DE ADMINISTRACIÓN
// ==========================================

// Función para leer la BD y pintar los pedidos en el HTML
async function actualizarHistorialPantalla() {
    const divHistorial = document.getElementById('tablaHistorial');
    
    // 1. Traer todos los datos guardados en un arreglo
    const todosLosPedidos = await db.pedidos.toArray();
    
    if (todosLosPedidos.length === 0) {
        divHistorial.innerHTML = "<p style='text-align:center; color:#6c757d;'>No hay pedidos registrados todavía.</p>";
        return;
    }

    // 2. Recorrer los pedidos y armar bloques de texto
    let htmlContenido = "";
    let gananciasTotales = 0;

    todosLosPedidos.forEach(function(pedido) {
        gananciasTotales += pedido.total;
        htmlContenido += `
            <div class="item-pedido">
                <strong>Pedido #${pedido.id}</strong> — 📅 ${pedido.fecha}<br>
                🍕 Plato: ${pedido.plato} | 🥤 Bebida: ${pedido.bebida}<br>
                🍟 Extras: ${pedido.extras}<br>
                💰 Subtotal: <strong>$${pedido.total.toFixed(2)}</strong>
            </div>
        `;
    });

    // Añadir resumen de caja arriba de los pedidos
    htmlContenido = `<strong>📈 Caja Total: $${gananciasTotales.toFixed(2)}</strong><br><hr>` + htmlContenido;
    divHistorial.innerHTML = htmlContenido;
}

// BOTÓN 1: Mostrar / Ocultar Historial
document.getElementById('btnVerHistorial').addEventListener('click', async function() {
    const divHistorial = document.getElementById('tablaHistorial');
    
    if (divHistorial.style.display === "none" || divHistorial.style.display === "") {
        await actualizarHistorialPantalla();
        divHistorial.style.display = "block"; // Lo muestra
    } else {
        divHistorial.style.display = "none";  // Lo oculta al presionar otra vez
    }
});

// BOTÓN 2: Vaciar toda la Base de Datos
document.getElementById('btnBorrarHistorial').addEventListener('click', async function() {
    const confirmar = confirm("⚠ ¿Estás seguro de que deseas eliminar TODOS los pedidos del historial?");
    
    if (confirmar) {
        await db.pedidos.clear(); // Comando para limpiar la base de datos por completo
        alert("Base de datos vaciada con éxito.");
        
        // Actualizar la pantalla de inmediato
        actualizarHistorialPantalla();
    }
});