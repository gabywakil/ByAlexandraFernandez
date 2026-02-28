// ============================================
// CHECKOUT - FUNCIONALIDAD
// ============================================

const INSTAGRAM_USERNAME = 'byalexandrafernandez'; // Usuario sin @
let cart = [];

// ============================================
// INICIALIZAR
// ============================================

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
            <span class="summary-item-price">$${(item.price * item.quantity).toLocaleString('es-CO')}</span>
        `;
        orderSummary.appendChild(itemDiv);
    });
    
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

async function sendToInstagram() {

    // Obtener datos
    const firstName = document.getElementById('firstName').value.trim();
    const lastName = document.getElementById('lastName').value.trim();
    const payment = document.querySelector('input[name="payment"]:checked');
    const delivery = document.querySelector('input[name="delivery"]:checked');
    const address = document.getElementById('address').value.trim();

    // Validaciones
    if (!firstName || !lastName) {
        alert('Por favor completa todos los campos requeridos');
        return;
    }

    if (!payment) {
        alert('Selecciona un método de pago');
        return;
    }

    if (!delivery) {
        alert('Selecciona método de entrega');
        return;
    }

    if (delivery.value === 'delivery' && !address) {
        alert('Por favor ingresa tu dirección de entrega');
        return;
    }

    // ============================================
    // CONSTRUIR MENSAJE
    // ============================================

    let message = `Hola! 👋 Quiero realizar el siguiente pedido:\n\n`;
    message += `📦 PEDIDO - COLECCIÓN ALTRUISMO S/S 2026\n`;
    message += `━━━━━━━━━━━━━━━━━━━━\n\n`;

    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name}\n`;
        message += `  Talla: ${item.size}\n`;
        message += `  Precio: $${(item.price * item.quantity).toLocaleString('es-CO')} COP\n\n`;
    });

    const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

    message += `━━━━━━━━━━━━━━━━━━━━\n`;
    message += `💰 TOTAL: $${total.toLocaleString('es-CO')} COP\n\n`;

    message += `👤 DATOS DEL CLIENTE\n`;
    message += `Nombre: ${firstName} ${lastName}\n\n`;

    const paymentText = {
        'efectivo': '💵 Efectivo',
        'transferencia': '🏦 Transferencia bancaria',
        'tarjeta': '💳 Tarjeta de crédito/débito'
    };

    message += `💳 Método de pago: ${paymentText[payment.value]}\n\n`;

    if (delivery.value === 'delivery') {
        message += `🚚 ENVÍO A DOMICILIO\n`;
        message += `Dirección: ${address}\n`;
    } else {
        message += `🏬 RECOGER EN TIENDA\n`;
        message += `(Disponible en 24 horas)\n`;
    }

    message += `\n¡Gracias! 🌟`;

    // ============================================
    // COPIAR MENSAJE (FALLBACK SEGURO)
    // ============================================

    try {
        await navigator.clipboard.writeText(message);
    } catch (err) {
        const textarea = document.createElement("textarea");
        textarea.value = message;
        textarea.style.position = "absolute";
        textarea.style.left = "-9999px";
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
    }

    // ============================================
    // ABRIR INSTAGRAM
    // ============================================

    const encodedMessage = encodeURIComponent(message);
    const igmeURL = `https://ig.me/m/${byalexandrafernandez}?text=${encodedMessage}`;
    const fallbackURL = `https://www.instagram.com/direct/new/?username=${byalexandrafernandez}`;

    // Intentar abrir app
    window.location.href = igmeURL;

    // Si no abre correctamente, abrir fallback
    setTimeout(() => {
        window.open(fallbackURL, '_blank');
        alert('Si el mensaje no aparece automáticamente, ya está copiado ✅ Solo pégalo en el chat.');
    }, 1000);
}