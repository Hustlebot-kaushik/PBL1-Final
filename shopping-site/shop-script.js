
function getSizeDropdown(product) {
  if (product.category === 'Accessories') return '';
  const imgPath = product.image || '';
  const isShoe = imgPath.includes('mens-shoes') || imgPath.includes('womens-shoes');
  if (isShoe) {
    return `<div style="margin: 10px 0;">
      <select class="size-selector" style="padding: 6px; width: 100%; border: 1px solid #ddd; border-radius: 4px; outline: none;">
        <option value="UK6">UK 6</option>
        <option value="UK7" selected>UK 7</option>
        <option value="UK8">UK 8</option>
        <option value="UK9">UK 9</option>
        <option value="UK10">UK 10</option>
        <option value="UK11">UK 11</option>
      </select></div>`;
  }
  return `<div style="margin: 10px 0;">
    <select class="size-selector" style="padding: 6px; width: 100%; border: 1px solid #ddd; border-radius: 4px; outline: none;">
      <option value="S">Size: S</option>
      <option value="M" selected>Size: M</option>
      <option value="L">Size: L</option>
      <option value="XL">Size: XL</option>
    </select></div>`;
}

// Shopping cart functionality
let cart = JSON.parse(localStorage.getItem('rewear_cart')) || [];
cart.forEach(item => { if (!item.cartId) item.cartId = item.size ? `${item.id}-${item.size}` : `${item.id}`; });
let filteredProducts = [...products];

// URL params
const urlParams = new URLSearchParams(window.location.search);
const searchParam = urlParams.get('search');
const categoryParam = urlParams.get('category');

// DOM
const productsGrid = document.getElementById('products-grid');
const cartIcon = document.getElementById('cart-icon');
const cartModal = document.getElementById('cart-modal');
const closeCart = document.getElementById('close-cart');
const overlay = document.getElementById('overlay');
const cartItems = document.getElementById('cart-items');
const emptyCart = document.getElementById('empty-cart');
const cartTotal = document.getElementById('cart-total');
const totalAmount = document.getElementById('total-amount');
const checkoutBtn = document.getElementById('checkout-btn');
const cartCount = document.getElementById('cart-count');
const filterBtns = document.querySelectorAll('.filter-btn');

// INIT
function initShop() {
  productsGrid.innerHTML = `<div class="loader">Loading products...</div>`;

  if (searchParam) {
    filteredProducts = products.filter(p =>
      p.title.toLowerCase().includes(searchParam.toLowerCase())
    );
  } else if (categoryParam && categoryParam !== 'All') {
    filteredProducts = products.filter(p => p.category === categoryParam);
  }

  renderProducts();
  updateCartCount();
  renderCartItems();
  setupEventListeners();
  setCurrentYear();
}

// RENDER PRODUCTS
function renderProducts() {
  productsGrid.innerHTML = '';

  if (filteredProducts.length === 0) {
    productsGrid.innerHTML = `<div class="loader">No products found</div>`;
    return;
  }

  filteredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';

    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}">
        ${product.featured ? `<span class="badge">Featured</span>` : ""}
        <div class="quick-actions">
          <button class="quick-view-btn" data-id="${product.id}" title="Quick View">👁️</button>
          <button class="wishlist-btn" data-id="${product.id}" title="Add to Wishlist">♡</button>
        </div>
      </div>

      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-category">${product.category}</p>

        <div class="price-row">
          <span class="product-price">₹${product.price.toFixed(2)}</span>
          <span class="old-price">₹${(product.price * 1.3).toFixed(2)}</span>
        </div>
        ${getSizeDropdown(product)}<div class="product-actions" style="display: flex; gap: 10px;">
          <button class="btn-primary btn-buy-now" data-id="${product.id}" style="padding: 8px 16px; font-size: 0.9rem; flex: 1; text-align: center;">Buy Now</button>
          <button class="add-to-cart" data-id="${product.id}" style="flex: 1; text-align: center;">
            🛒 Add to Cart
          </button>
        </div>
      </div>
    `;

    productsGrid.appendChild(productCard);
  });
}

// EVENTS
function setupEventListeners() {
  document.addEventListener('click', function (e) {
    if (e.target.classList.contains('add-to-cart')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const card = e.target.closest('.product-info') || e.target.closest('.product-card');
      const sizeDrop = card ? card.querySelector('.size-selector') : null;
      const size = sizeDrop ? sizeDrop.value : null;
      addToCart(productId, size);

      const btn = e.target;
      const originalText = btn.innerHTML;
      btn.innerHTML = 'Added!';
      setTimeout(() => btn.innerHTML = originalText, 1000);
    }

    if (e.target.classList.contains('btn-buy-now')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const card = e.target.closest('.product-info') || e.target.closest('.product-card');
      const sizeDrop = card ? card.querySelector('.size-selector') : null;
      const size = sizeDrop ? sizeDrop.value : null;
      addToCart(productId, size);
      if (localStorage.getItem('rewear_logged_in') !== 'true') {
        alert("Please log in to checkout!");
        window.location.href = 'index.html';
      } else {
        window.location.href = 'checkout.html';
      }
    }
  });

  filterBtns.forEach(btn => {
    btn.addEventListener('click', function () {
      filterBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');

      const filter = this.textContent;
      filteredProducts = filter === 'All'
        ? [...products]
        : products.filter(p => p.category === filter);

      renderProducts();
    });
  });

  cartIcon.addEventListener('click', openCart);
  closeCart.addEventListener('click', closeCartModal);
  overlay.addEventListener('click', closeCartModal);

  if (checkoutBtn) {
    checkoutBtn.addEventListener('click', function() {
      if (cart.length === 0) return;
      if (localStorage.getItem('rewear_logged_in') !== 'true') {
        alert('Please log in to checkout!');
        window.location.href = 'index.html';
        return;
      }
      window.location.href = 'checkout.html';
    });
  }
}

// CART
function addToCart(productId, size = null) {
  const product = products.find(p => p.id === productId);
  const cartId = size ? `${productId}-${size}` : `${productId}`;
  const existing = cart.find(item => item.cartId === cartId);

  if (existing) {
    existing.quantity += 1;
  } else {
    cart.push({
      ...product,
      cartId: cartId,
      size: size,
      quantity: 1
    });
  }
  updateCart();
}

function updateCart() {
  localStorage.setItem('rewear_cart', JSON.stringify(cart));
  // Sync to per-user key so cart persists for this user across logins
  const username = localStorage.getItem('rewear_username');
  if (username) localStorage.setItem('rewear_cart_' + username, JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

function updateCartCount() {
  cartCount.textContent = cart.reduce((t, i) => t + i.quantity, 0);
}

function renderCartItems() {
  cartItems.innerHTML = '';

  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartTotal.style.display = 'none';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  emptyCart.style.display = 'none';
  cartTotal.style.display = 'flex';
  if (checkoutBtn) checkoutBtn.style.display = 'block';

  let total = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;

    const div = document.createElement('div');
    div.className = 'cart-item';
    div.innerHTML = `
      <div class="cart-item-image">
        <img src="${item.image}" alt="${item.title}">
      </div>
      <div class="cart-item-details">
        <div class="cart-item-title">${item.title} ${item.size ? `(Size: ${item.size})` : ''}</div>
        <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
        <div class="cart-item-actions">
          <button class="quantity-btn minus" data-cartid="${item.cartId}">-</button>
          <span class="item-quantity">${item.quantity}</span>
          <button class="quantity-btn plus" data-cartid="${item.cartId}">+</button>
          <button class="remove-item" data-cartid="${item.cartId}">Remove</button>
        </div>
      </div>
    `;
    cartItems.appendChild(div);
  });

  totalAmount.textContent = `₹${total.toFixed(2)}`;

  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', function() {
      decreaseQuantity(this.getAttribute('data-cartid'));
    });
  });

  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', function() {
      increaseQuantity(this.getAttribute('data-cartid'));
    });
  });

  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      removeFromCart(this.getAttribute('data-cartid'));
    });
  });
}

function increaseQuantity(cartId) {
  const item = cart.find(item => item.cartId === cartId);
  if (item) { item.quantity += 1; updateCart(); }
}

function decreaseQuantity(cartId) {
  const item = cart.find(item => item.cartId === cartId);
  if (item) {
    if (item.quantity > 1) { item.quantity -= 1; }
    else { removeFromCart(cartId); return; }
    updateCart();
  }
}

function removeFromCart(cartId) {
  cart = cart.filter(item => item.cartId !== cartId);
  updateCart();
}

// CART MODAL
function openCart() {
  cartModal.classList.add('active');
  overlay.classList.add('active');
}

function closeCartModal() {
  cartModal.classList.remove('active');
  overlay.classList.remove('active');
}

// FOOTER
function setCurrentYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

document.addEventListener('DOMContentLoaded', initShop);