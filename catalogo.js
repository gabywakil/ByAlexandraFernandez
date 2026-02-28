const PRODUCTS = [
    {
      id: "p1",
      name: "Vestido Lino — Arena",
      price: 180000,
      image: "./assets/producto-1.jpg",
      sizes: ["XS", "S", "M", "L"]
    },
    {
      id: "p2",
      name: "Top Seda — Marfil",
      price: 120000,
      image: "./assets/producto-2.jpg",
      sizes: ["XS", "S", "M", "L"]
    },
    {
      id: "p3",
      name: "Falda Satin — Noche",
      price: 150000,
      image: "./assets/producto-3.jpg",
      sizes: ["S", "M", "L"]
    }
  ];
  
  // Helpers
  const money = (n) => new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    maximumFractionDigits: 0
  }).format(n);
  
  const getCart = () => JSON.parse(localStorage.getItem("cart") || "[]");
  const setCart = (cart) => localStorage.setItem("cart", JSON.stringify(cart));
  
  const cartCount = () => getCart().reduce((acc, it) => acc + (it.qty || 1), 0);
  
  function updateBadge() {
    document.getElementById("cartCount").textContent = cartCount();
  }
  
  function addToCart({ id, size, qty }) {
    const cart = getCart();
    const existing = cart.find(it => it.id === id && it.size === size);
  
    if (existing) existing.qty += qty;
    else cart.push({ id, size, qty });
  
    setCart(cart);
    updateBadge();
  }
  
  function render() {
    const grid = document.getElementById("productsGrid");
    grid.innerHTML = "";
  
    PRODUCTS.forEach(p => {
      const card = document.createElement("article");
      card.className = "product";
  
      card.innerHTML = `
        <div class="product__img" style="background-image:url('${p.image}')"></div>
        <div class="product__body">
          <div class="product__row">
            <h3 class="product__title">${p.name}</h3>
            <p class="product__price">${money(p.price)}</p>
          </div>
  
          <div class="controls">
            <div class="field">
              <label>Talla</label>
              <select class="select" id="size-${p.id}">
                ${p.sizes.map(s => `<option value="${s}">${s}</option>`).join("")}
              </select>
            </div>
  
            <div class="field">
              <label>Cantidad</label>
              <input class="qty" type="number" min="1" value="1" id="qty-${p.id}" />
            </div>
          </div>
  
          <div class="add">
            <button class="btn btn--primary w-full" data-add="${p.id}">Agregar al carrito</button>
          </div>
        </div>
      `;
  
      grid.appendChild(card);
    });
  
    grid.addEventListener("click", (e) => {
      const btn = e.target.closest("[data-add]");
      if (!btn) return;
  
      const id = btn.getAttribute("data-add");
      const size = document.getElementById(`size-${id}`).value;
      const qty = Math.max(1, parseInt(document.getElementById(`qty-${id}`).value || "1", 10));
  
      addToCart({ id, size, qty });
      btn.textContent = "Agregado ✓";
      setTimeout(() => (btn.textContent = "Agregar al carrito"), 900);
    });
  }
  
  updateBadge();
  render();
  
  // Export products to use in carrito.js (simple way)
  window.__PRODUCTS__ = PRODUCTS;