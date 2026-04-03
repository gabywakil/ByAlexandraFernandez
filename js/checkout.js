// ============================================
// CHECKOUT - FUNCIONALIDAD
// By Alexandra Fernández
// ============================================

const WA_NUMBER = '584141886532'; // Ej: 573001234567 — sin + ni espacios
let cart = [];

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

    orderSummary.innerHTML = '';

    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-name">${item.quantity}x ${item.name} (${item.size})</span>
            <span class="summary-item-price">$${(item.price * item.quantity).toLocaleString('en-US')} USD</span>
        `;
        orderSummary.appendChild(itemDiv);
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    orderTotal.textContent = `$${total.toLocaleString('en-US')} USD`;
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
        sendToWhatsApp();
    });
}

// ============================================
// ENVIAR A WHATSAPP
// ============================================

function sendToWhatsApp() {
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked').value;
    const delivery = document.querySelector('input[name="delivery"]:checked').value;
    const address = document.getElementById('address').value.trim();

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

    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name}\n`;
        message += `  Talla: ${item.size}\n`;
        message += `  Precio: $${(item.price * item.quantity).toLocaleString('en-US')} USD\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 TOTAL: $${total.toLocaleString('en-US')} USD\n\n`;

    message += `👤 DATOS DEL CLIENTE\n`;
    message += `Nombre: ${firstName} ${lastName}\n\n`;

    const paymentText = {
        'efectivo': '💵 Efectivo',
        'transferencia': '🏦 Transferencia bancaria'
    };
    message += `💳 Método de pago: ${paymentText[payment]}\n\n`;

    if (delivery === 'delivery') {
        message += `🚚 ENVÍO A DOMICILIO\n`;
        message += `Dirección: ${address}\n`;
    } else {
        message += `🏬 RECOGER EN TIENDA\n`;
        message += `(Disponible en 24 horas)\n`;
    }

    message += `\n¡Gracias! 🌟`;

    const encodedMessage = encodeURIComponent(message);
    const waURL = `https://wa.me/${WA_NUMBER}?text=${encodedMessage}`;
    window.open(waURL, '_blank');
}
