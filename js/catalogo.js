// ============================================
// CATÁLOGO - FUNCIONALIDAD
// ============================================

let cart = [];

// Inicializar
document.addEventListener('DOMContentLoaded', function() {
    loadCart();
    initializeProducts();
    updateCartBadge();
});

// ============================================
// PRODUCTOS
// ============================================

function initializeProducts() {
    const productCards = document.querySelectorAll('.product-card');
    
    productCards.forEach(card => {
        // Selector de talla
        const sizeButtons = card.querySelectorAll('.size-btn');
        sizeButtons.forEach(btn => {
            btn.addEventListener('click', function() {
                card.querySelectorAll('.size-btn').forEach(b => b.classList.remove('active'));
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
    const productId = card.getAttribute('data-product');
    const productName = card.getAttribute('data-name');
    const productPrice = parseInt(card.getAttribute('data-price'));
    const productImage = card.querySelector('.product-image').src;
    
    // Verificar talla seleccionada
    const selectedSize = card.querySelector('.size-btn.active');
    if (!selectedSize) {
        alert('Por favor selecciona una talla');
        return;
    }
    const size = selectedSize.getAttribute('data-size');
    
    // Obtener cantidad
    const quantity = parseInt(card.querySelector('.qty-input').value);
    
    // Crear item
    const cartItem = {
        id: `${productId}-${size}`,
        productId: productId,
        name: productName,
        price: productPrice,
        size: size,
        quantity: quantity,
        image: productImage
    };
    
    // Verificar si ya existe
    const existingIndex = cart.findIndex(item => item.id === cartItem.id);
    
    if (existingIndex !== -1) {
        cart[existingIndex].quantity += quantity;
    } else {
        cart.push(cartItem);
    }
    
    // Guardar y actualizar UI
    saveCart();
    updateCartBadge();
    showAddedMessage(card.querySelector('.btn-add-cart'));
}

function showAddedMessage(button) {
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

function openCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.add('active');
    renderCart();
}

function closeCart() {
    const cartModal = document.getElementById('cartModal');
    cartModal.classList.remove('active');
}

function renderCart() {
    const cartBody = document.getElementById('cartBody');
    const cartEmpty = document.getElementById('cartEmpty');
    const cartFooter = document.getElementById('cartFooter');
    const cartTotal = document.getElementById('cartTotal');
    
    if (cart.length === 0) {
        cartEmpty.style.display = 'block';
        cartFooter.style.display = 'none';
        cartBody.innerHTML = '<div class="cart-empty"><p>Tu carrito está vacío</p></div>';
        return;
    }
    
    cartEmpty.style.display = 'none';
    cartFooter.style.display = 'block';
    
    // Renderizar items
    cartBody.innerHTML = '';
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
    saveCart();
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
// GUARDAR/CARGAR CARRITO
// ============================================

function saveCart() {
    // Guardar en memoria para pasar a checkout
    if (typeof(Storage) !== "undefined") {
        sessionStorage.setItem('altruismo_cart', JSON.stringify(cart));
    }
}

function loadCart() {
    if (typeof(Storage) !== "undefined") {
        const savedCart = sessionStorage.getItem('altruismo_cart');
        if (savedCart) {
            cart = JSON.parse(savedCart);
        }
    }
}