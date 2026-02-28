// CONFIG: cambia esto por el usuario real de Instagram (sin @)
const INSTAGRAM_USERNAME = "TU_USUARIO_AQUI";

const money = (n) => new Intl.NumberFormat("es-CO", {
  style: "currency", currency: "COP", maximumFractionDigits: 0
}).format(n);

const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
const setCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));

function productById(id) {
  const list = window.__PRODUCTS__ || [];
  return list.find(p => p.id === id);
}

function subtotalCart(cart) {
  return cart.reduce((acc, it) => {
    const p = productById(it.id);
    if (!p) return acc;
    return acc + p.price * (it.qty || 1);
  }, 0);
}

function renderCart() {
  const cartList = document.getElementById("cartList");
  const cart = getCart();

  if (cart.length === 0) {
    cartList.innerHTML = `
      <div class="empty">
        <p class="muted">Tu carrito está vacío.</p>
      </div>
    `;
    document.getElementById("subtotal").textContent = money(0);
    document.getElementById("total").textContent = money(0);
    return;
  }

  cartList.innerHTML = "";
  cart.forEach((it, idx) => {
    const p = productById(it.id);
    if (!p) return;

    const row = document.createElement("div");
    row.className = "item";
    row.innerHTML = `
      <div class="item__img" style="background-image:url('${p.image}')"></div>
      <div>
        <p class="item__title">${p.name}</p>
        <p class="item__meta">Talla: <strong>${it.size}</strong> · ${money(p.price)}</p>
      </div>
      <div class="item__right">
        <div class="stepper" aria-label="Cantidad">
          <button type="button" data-dec="${idx}">−</button>
          <span>${it.qty}</span>
          <button type="button" data-inc="${idx}">+</button>
        </div>
        <button class="trash" type="button" data-del="${idx}">Quitar</button>
      </div>
    `;
    cartList.appendChild(row);
  });

  const sub = subtotalCart(cart);
  document.getElementById("subtotal").textContent = money(sub);
  document.getElementById("total").textContent = money(sub); // sin shipping calculado
}

function updateQty(index, delta) {
  const cart = getCart();
  if (!cart[index]) return;
  cart[index].qty = Math.max(1, (cart[index].qty || 1) + delta);
  setCart(cart);
  renderCart();
}

function deleteItem(index) {
  const cart = getCart();
  cart.splice(index, 1);
  setCart(cart);
  renderCart();
}

function clearCart() {
  setCart([]);
  renderCart();
}

function buildMessage(formData) {
  const cart = getCart();
  const sub = subtotalCart(cart);

  const lines = [];
  lines.push("Hola ✨ Quiero realizar este pedido:");
  lines.push("");
  lines.push("🧾 Pedido:");

  cart.forEach((it) => {
    const p = productById(it.id);
    if (!p) return;
    lines.push(`- ${p.name} | Talla: ${it.size} | Cant: ${it.qty} | ${money(p.price * it.qty)}`);
  });

  lines.push("");
  lines.push(`Total: ${money(sub)}`);
  lines.push("");
  lines.push("👤 Datos:");
  lines.push(`Nombre: ${formData.nombre} ${formData.apellido}`);
  lines.push(`Método de pago: ${formData.pago}`);
  lines.push(`Entrega: ${formData.entrega}`);

  if (formData.entrega === "delivery") {
    lines.push(`Dirección: ${formData.direccion || "(no indicada)"}`);
  }

  lines.push("");
  lines.push("Gracias 🙌");

  return lines.join("\n");
}

function openInstagramDM(message) {
  const encoded = encodeURIComponent(message);

  // Opción 1 (mejor en app móvil): ig.me
  const igme = `https://ig.me/m/${INSTAGRAM_USERNAME}?text=${encoded}`;

  // Opción 2 (web fallback): direct/new
  const webDm = `https://www.instagram.com/direct/new/?username=${INSTAGRAM_USERNAME}`;

  // Intento abrir ig.me con texto.
  // Si no funciona en tu dispositivo, abre el webDm y pegas el mensaje manualmente.
  window.location.href = igme;

  // Fallback suave:
  setTimeout(() => {
    // Si se quedó en la misma página, abre el fallback:
    window.open(webDm, "_blank");
  }, 800);
}

// Events
document.addEventListener("click", (e) => {
  const inc = e.target.closest("[data-inc]");
  const dec = e.target.closest("[data-dec]");
  const del = e.target.closest("[data-del]");

  if (inc) updateQty(parseInt(inc.getAttribute("data-inc"), 10), +1);
  if (dec) updateQty(parseInt(dec.getAttribute("data-dec"), 10), -1);
  if (del) deleteItem(parseInt(del.getAttribute("data-del"), 10));
});

document.getElementById("clearCartBtn").addEventListener("click", clearCart);

// Pickup / Delivery toggle
const shipButtons = document.querySelectorAll("[data-ship]");
const entregaInput = document.querySelector("input[name='entrega']");
const addressField = document.getElementById("addressField");

shipButtons.forEach(btn => {
  btn.addEventListener("click", () => {
    shipButtons.forEach(b => b.classList.remove("is-active"));
    btn.classList.add("is-active");
    const mode = btn.getAttribute("data-ship");
    entregaInput.value = mode;
    addressField.style.display = mode === "delivery" ? "block" : "none";
    if (mode !== "delivery") {
      const dir = document.querySelector("input[name='direccion']");
      if (dir) dir.value = "";
    }
  });
});

// Submit checkout
document.getElementById("checkoutForm").addEventListener("submit", (e) => {
  e.preventDefault();

  const cart = getCart();
  if (cart.length === 0) {
    alert("Tu carrito está vacío.");
    return;
  }

  const fd = new FormData(e.target);
  const data = Object.fromEntries(fd.entries());

  if (data.entrega === "delivery" && (!data.direccion || data.direccion.trim().length < 6)) {
    alert("Por favor escribe una dirección válida para delivery.");
    return;
  }

  if (!INSTAGRAM_USERNAME || INSTAGRAM_USERNAME === "TU_USUARIO_AQUI") {
    alert("Configura INSTAGRAM_USERNAME en carrito.js con el usuario real de la marca.");
    return;
  }

  const message = buildMessage(data);
  openInstagramDM(message);
});

renderCart();