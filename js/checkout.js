// ============================================
// CHECKOUT - FUNCIONALIDAD
// ============================================

const INSTAGRAM_USERNAME = 'byalexandrafernandez'; // Cambiar por el usuario real
let cart = [];

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    renderOrderSummary();
    setupDeliveryToggle();
    setupForm();
});

// ============================================
// CARGAR CARRITO
// ============================================

function loadCart() {
    if (typeof(Storage) !== "undefined") {
        const savedCart = sessionStorage.getItem('altruismo_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
    
    // Si el carrito está vacío, redirigir al catálogo
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        window.location.href = 'catalogo.html';
    }
}

// ============================================
// RENDERIZAR RESUMEN
// ============================================

function renderOrderSummary() {
    const orderSummary = document.getElementById('orderSummary');
    const orderTotal = document.getElementById('orderTotal');
    
    // Limpiar resumen
    orderSummary.innerHTML = '';
    
    // Renderizar cada item
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-name">${item.quantity}x ${item.name} (${item.size})</span>
            <span class="summary-item-price">$${(item.price * item.quantity).toLocaleString('es-CO')}</span>
        `;
        orderSummary.appendChild(itemDiv);
    });
    
    // Calcular y mostrar total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
}

// ============================================
// TOGGLE DELIVERY/PICKUP
// ============================================

function setupDeliveryToggle() {
    const deliveryRadios = document.querySelectorAll('input[name="delivery"]');
    const addressField = document.getElementById('addressField');
    const addressInput = document.getElementById('address');
    
    deliveryRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            if (this.value === 'delivery') {
                addressField.style.display = 'block';
                addressInput.required = true;
            } else {
                addressField.style.display = 'none';
                addressInput.required = false;
            }
        });
    });
}

// ============================================
// FORMULARIO
// ============================================

function setupForm() {
    const form = document.getElementById('checkoutForm');
    
    form.addEventListener('submit', function(e) {
        e.preventDefault();
        sendToInstagram();
    });
}

// ============================================
// ENVIAR A INSTAGRAM
// ============================================

function sendToInstagram() {
    // Obtener datos del formulario
    const firstName = document.getElementById('firstName').value;
    const lastName = document.getElementById('lastName').value;
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const address = document.getElementById('address').value;
    
    // Validar datos
    if (!firstName || !lastName) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }
    
    if (delivery === 'delivery' && !address) {
        alert('Por favor ingresa tu dirección de entrega');
        return;
    }
    
    // Construir mensaje
    let message = `Hola! 👋 Quiero realizar el siguiente pedido:\n\n`;
    message += `📦 PEDIDO - COLECCIÓN ALTRUISMO S/S 2026\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;
    
    // Productos
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name}\n`;
        message += `  Talla: ${item.size}\n`;
        message += `  Precio: $${(item.price * item.quantity).toLocaleString('es-CO')} COP\n\n`;
    });
    
    // Total
    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 TOTAL: $${total.toLocaleString('es-CO')} COP\n\n`;
    
    // Datos del cliente
    message += `👤 DATOS DEL CLIENTE\n`;
    message += `Nombre: ${firstName} ${lastName}\n\n`;
    
    // Método de pago
    const paymentText = {
        'efectivo': '💵 Efectivo',
        'transferencia': '🏦 Transferencia bancaria',
        'tarjeta': '💳 Tarjeta de crédito/débito'
    };
    message += `💳 Método de pago: ${paymentText[payment]}\n\n`;
    
    // Método de entrega
    if (delivery === 'delivery') {
        message += `🚚 ENVÍO A DOMICILIO\n`;
        message += `Dirección: ${address}\n`;
    } else {
        message += `🏬 RECOGER EN TIENDA\n`;
        message += `(Disponible en 24 horas)\n`;
    }
    
    message += `\n¡Gracias! 🌟`;
    
    // Codificar mensaje
    const encodedMessage = encodeURIComponent(message);
    
    // Generar URL de Instagram
    const instagramURL = `https://ig.me/m/${INSTAGRAM_USERNAME}?text=${encodedMessage}`;
    
    // Abrir Instagram
    window.open(instagramURL, '_blank');
    
    // Opcional: Limpiar carrito
    // sessionStorage.removeItem('altruismo_cart');
    // setTimeout(() => {
    //     window.location.href = 'index.html';
    // }, 2000);
}