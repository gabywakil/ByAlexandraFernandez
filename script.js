// ============================================
// VARIABLES GLOBALES Y ESTADO
// ============================================

let cart = [];
const INSTAGRAM_USERNAME = 'byalexandrafernandez'; // Cambiar por el usuario real

// ============================================
// INICIALIZACIÓN
// ============================================

document.addEventListener('DOMContentLoaded', function() {
    initializeApp();
});

function initializeApp() {
    // Navegación con scroll
    handleNavScroll();
    
    // Smooth scroll para enlaces internos
    setupSmoothScroll();
    
    // Inicializar productos
    setupProductCards();
    
    // Configurar carrito
    setupCart();
    
    // Configurar checkout
    setupCheckout();
}

// ============================================
// NAVEGACIÓN
// ============================================

function handleNavScroll() {
    const nav = document.getElementById('navbar');
    
    window.addEventListener('scroll', function() {
        if (window.scrollY > 100) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

function setupSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function(e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            
            if (targetId === '#carrito') {
                openCart();
            } else {
                const target = document.querySelector(targetId);
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                }
            }
        });
    });
}

// ============================================
// PRODUCTOS - SETUP
// ============================================

function setupProductCards() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Selector de talla
        const sizeButtons = card.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                // Remover activo de todos
                card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
                // Agregar activo al seleccionado
                this.classList.add('active');
            });
        });
        
        // Controles de cantidad
        const qtyMinus = card.querySelector('.qty-minus');
        const qtyPlus = card.querySelector('.qty-plus');
        const qtyInput = card.querySelector('.qty-input');
        
        qtyMinus.addEventListener('click', function() {
            let value = parseInt(qtyInput.value);
            if (value > 1) {
                qtyInput.value = value - 1;
            }
        });
        
        qtyPlus.addEventListener('click', function() {
            let value = parseInt(qtyInput.value);
            if (value < 10) {
                qtyInput.value = value + 1;
            }
        });
        
        // Botón agregar al carrito
        const addButton = card.querySelector('.btn-add-cart');
        addButton.addEventListener('click', function() {
            addToCart(card);
        });
    });
}

// ============================================
// AGREGAR AL CARRITO
// ============================================

function addToCart(card) {
    // Obtener datos del producto
    const productId = card.getAttribute('data-product');
    const productName = card.querySelector('.product-name').textContent;
    const productType = card.querySelector('.product-type').textContent;
    const productPrice = parseInt(card.querySelector('.product-price').getAttribute('data-price'));
    const productImage = card.querySelector('.product-image').src;
    
    // Obtener talla seleccionada
    const selectedSize = card.querySelector('.size-btn.active');
    if (!selectedSize) {
        alert('Por favor selecciona una talla');
        return;
    }
    const size = selectedSize.getAttribute('data-size');
    
    // Obtener cantidad
    const quantity = parseInt(card.querySelector('.qty-input').value);
    
    // Crear item del carrito
    const cartItem = {
        id: `${productId}-${size}`,
        productId: productId,
        name: productName,
        type: productType,
        price: productPrice,
        size: size,
        quantity: quantity,
        image: productImage
    };
    
    // Verificar si ya existe en el carrito
    const existingIndex = cart.findIndex(item => item.id === cartItem.id);
    
    if (existingIndex !== -1) {
        // Si existe, actualizar cantidad
        cart[existingIndex].quantity += quantity;
    } else {
        // Si no existe, agregar nuevo
        cart.push(cartItem);
    }
    
    // Actualizar UI
    updateCartBadge();
    renderCart();
    
    // Feedback visual
    showAddedToCartMessage(addButton);
}

function showAddedToCartMessage(button) {
    const originalText = button.textContent;
    button.textContent = '✓ Agregado';
    button.style.backgroundColor = '#4CAF50';
    
    setTimeout(() => {
        button.textContent = originalText;
        button.style.backgroundColor = '';
    }, 1500);
}

// ============================================
// CARRITO - UI
// ============================================

function setupCart() {
    const cartModal = document.getElementById('cartModal');
    const cartOverlay = document.getElementById('cartOverlay');
    const cartClose = document.getElementById('cartClose');
    const btnCheckout = document.getElementById('btnCheckout');
    
    // Abrir carrito desde nav
    document.querySelector('.nav-cart').addEventListener('click', function(e) {
        e.preventDefault();
        openCart();
    });
    
    // Cerrar carrito
    cartOverlay.addEventListener('click', closeCart);
    cartClose.addEventListener('click', closeCart);
    
    // Ir a checkout
    btnCheckout.addEventListener('click', function() {
        closeCart();
        openCheckout();
    });
}

function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCart();
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCart() {
    const cartBody = document.getElementById('cartBody');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        cartBody.innerHTML = '';
        cartBody.appendChild(cartEmpty);
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    
    // Limpiar body
    cartBody.innerHTML = '';
    
    // Renderizar items
    cart.forEach((item, index) => {
        const itemElement = createCartItemElement(item, index);
        cartBody.appendChild(itemElement);
    });
    
    // Actualizar total
    const total = calculateTotal();
    cartTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
}

function createCartItemElement(item, index) {
    const div = document.createElement('div');
    div.className = 'cart-item';
    
    div.innerHTML = `
        <img src="${item.image}" alt="${item.name}" class="cart-item-image">
        <div class="cart-item-info">
            <div>
                <h4 class="cart-item-name">${item.name}</h4>
                <p class="cart-item-details">Talla: ${item.size} • Cantidad: ${item.quantity}</p>
            </div>
            <div>
                <p class="cart-item-price">$${(item.price * item.quantity).toLocaleString('es-CO')} COP</p>
                <button class="cart-item-remove" onclick="removeFromCart(${index})">Eliminar</button>
            </div>
        </div>
    `;
    
    return div;
}

function removeFromCart(index) {
    cart.splice(index, 1);
    updateCartBadge();
    renderCart();
}

function updateCartBadge() {
    const badge = document.getElementById('cartBadge');
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    badge.textContent = totalItems;
}

function calculateTotal() {
    return cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
}

// ============================================
// CHECKOUT
// ============================================

function setupCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    const checkoutOverlay = document.getElementById('checkoutOverlay');
    const checkoutBack = document.getElementById('checkoutBack');
    const btnSendInstagram = document.getElementById('btnSendInstagram');
    
    // Cerrar checkout
    checkoutOverlay.addEventListener('click', closeCheckout);
    checkoutBack.addEventListener('click', closeCheckout);
    
    // Enviar a Instagram
    btnSendInstagram.addEventListener('click', sendToInstagram);
}

function openCheckout() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.add('active');
    document.body.style.overflow = 'hidden';
    renderCheckout();
}

function closeCheckout() {
    const checkoutModal = document.getElementById('checkoutModal');
    checkoutModal.classList.remove('active');
    document.body.style.overflow = '';
}

function renderCheckout() {
    const checkoutSummary = document.getElementById('checkoutSummary');
    const checkoutTotal = document.getElementById('checkoutTotal');
    
    // Limpiar resumen
    checkoutSummary.innerHTML = '';
    
    // Renderizar items
    cart.forEach(item => {
        const itemDiv = document.createElement('div');
        itemDiv.className = 'summary-item';
        itemDiv.innerHTML = `
            <span class="summary-item-name">${item.quantity}x ${item.name} (${item.size})</span>
            <span class="summary-item-price">$${(item.price * item.quantity).toLocaleString('es-CO')}</span>
        `;
        checkoutSummary.appendChild(itemDiv);
    });
    
    // Total
    const total = calculateTotal();
    checkoutTotal.textContent = `$${total.toLocaleString('es-CO')} COP`;
}

// ============================================
// ENVIAR A INSTAGRAM
// ============================================

function sendToInstagram() {
    if (cart.length === 0) {
        alert('Tu carrito está vacío');
        return;
    }
    
    // Obtener método de entrega
    const deliveryMethod = document.querySelector('input[name="delivery"]:checked').value;
    const deliveryText = deliveryMethod === 'domicilio' ? '🚚 Envío a domicilio' : '🏬 Recoger en tienda';
    
    // Obtener observaciones
    const notes = document.getElementById('orderNotes').value;
    
    // Construir mensaje
    let message = `Hola! 👋 Quiero realizar el siguiente pedido de la colección ALTRUISMO S/S 2026 de By Alexandra Fernández:\n\n`;
    
    // Agregar productos
    cart.forEach(item => {
        message += `• ${item.quantity}x ${item.name} – Talla ${item.size} – $${(item.price * item.quantity).toLocaleString('es-CO')} COP\n`;
    });
    
    // Total
    const total = calculateTotal();
    message += `\n💰 Total: $${total.toLocaleString('es-CO')} COP\n`;
    
    // Método de entrega
    message += `\n${deliveryText}\n`;
    
    // Observaciones
    if (notes.trim()) {
        message += `\n📝 Observaciones: ${notes}\n`;
    }
    
    message += `\n¡Gracias! 🌟`;
    
    // Codificar mensaje para URL
    const encodedMessage = encodeURIComponent(message);
    
    // Generar URL de Instagram
    const instagramURL = `https://ig.me/m/${INSTAGRAM_USERNAME}?text=${encodedMessage}`;
    
    // Abrir en nueva ventana
    window.open(instagramURL, '_blank');
    
    // Opcional: Limpiar carrito después de enviar
    // cart = [];
    // updateCartBadge();
    // closeCheckout();
}

// ============================================
// UTILIDADES
// ============================================

// Formatear precio
function formatPrice(price) {
    return `$${price.toLocaleString('es-CO')} COP`;
}

// Guardar carrito en localStorage (opcional)
function saveCart() {
    try {
        const cartData = JSON.stringify(cart);
        // No usar localStorage en artifacts de Claude.ai
        // localStorage.setItem('altruismo_cart', cartData);
    } catch (e) {
        console.log('No se pudo guardar el carrito');
    }
}

// Cargar carrito desde localStorage (opcional)
function loadCart() {
    try {
        // No usar localStorage en artifacts de Claude.ai
        // const cartData = localStorage.getItem('altruismo_cart');
        // if (cartData) {
        //     cart = JSON.parse(cartData);
        //     updateCartBadge();
        // }
    } catch (e) {
        console.log('No se pudo cargar el carrito');
    }
}
