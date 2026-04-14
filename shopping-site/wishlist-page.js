// wishlist-page.js
// Renders the wishlist page and handles cart interactions from wishlist

(function () {
  let wishlist = JSON.parse(localStorage.getItem('rewear_wishlist')) || [];
  let cart = JSON.parse(localStorage.getItem('rewear_cart')) || [];
  cart.forEach(item => { if (!item.cartId) item.cartId = item.size ? `${item.id}-${item.size}` : `${item.id}`; });

  function saveWishlist() { localStorage.setItem('rewear_wishlist', JSON.stringify(wishlist)); }
  function saveCart() { localStorage.setItem('rewear_cart', JSON.stringify(cart)); }

  function removeFromWishlist(productId) {
    wishlist = wishlist.filter(p => p.id !== productId);
    saveWishlist();
    renderWishlist();
  }

  function addToCart(productId, size) {
    const product = wishlist.find(p => p.id === productId) || (typeof products !== 'undefined' ? products.find(p => p.id === productId) : null);
    if (!product) return;
    const cartId = size ? `${productId}-${size}` : `${productId}`;
    const existing = cart.find(i => i.cartId === cartId);
    if (existing) { existing.quantity += 1; }
    else { cart.push({ ...product, cartId, size, quantity: 1 }); }
    saveCart();
    updateCartCount();
    renderCartItems();
  }

  function updateCartCount() {
    const el = document.getElementById('cart-count');
    if (el) el.textContent = cart.reduce((t, i) => t + i.quantity, 0);
  }

  function renderCartItems() {
    const container = document.getElementById('cart-items');
    const emptyEl = document.getElementById('empty-cart');
    const totalEl = document.getElementById('cart-total');
    const checkoutEl = document.getElementById('checkout-btn');
    const totalAmountEl = document.getElementById('total-amount');
    if (!container) return;

    container.innerHTML = '';
    if (cart.length === 0) {
      if (emptyEl) emptyEl.style.display = 'block';
      if (totalEl) totalEl.style.display = 'none';
      if (checkoutEl) checkoutEl.style.display = 'none';
      return;
    }
    if (emptyEl) emptyEl.style.display = 'none';
    if (totalEl) totalEl.style.display = 'flex';
    if (checkoutEl) checkoutEl.style.display = 'block';

    let total = 0;
    cart.forEach(item => {
      total += item.price * item.quantity;
      const div = document.createElement('div');
      div.className = 'cart-item';
      div.innerHTML = `
        <div class="cart-item-image"><img src="${item.image}" alt="${item.title}"></div>
        <div class="cart-item-details">
          <div class="cart-item-title">${item.title} ${item.size ? `(Size: ${item.size})` : ''}</div>
          <div class="cart-item-price">₹${item.price.toFixed(2)}</div>
          <div class="cart-item-actions">
            <button class="quantity-btn minus" data-cartid="${item.cartId}">-</button>
            <span class="item-quantity">${item.quantity}</span>
            <button class="quantity-btn plus" data-cartid="${item.cartId}">+</button>
            <button class="remove-item" data-cartid="${item.cartId}">Remove</button>
          </div>
        </div>`;
      container.appendChild(div);
    });
    if (totalAmountEl) totalAmountEl.textContent = `₹${total.toFixed(2)}`;

    container.querySelectorAll('.quantity-btn.minus').forEach(b => b.addEventListener('click', () => { adjustQuantity(b.dataset.cartid, -1); }));
    container.querySelectorAll('.quantity-btn.plus').forEach(b => b.addEventListener('click', () => { adjustQuantity(b.dataset.cartid, 1); }));
    container.querySelectorAll('.remove-item').forEach(b => b.addEventListener('click', () => { removeFromCart(b.dataset.cartid); }));
  }

  function adjustQuantity(cartId, delta) {
    const item = cart.find(i => i.cartId === cartId);
    if (!item) return;
    item.quantity += delta;
    if (item.quantity <= 0) { removeFromCart(cartId); return; }
    saveCart(); updateCartCount(); renderCartItems();
  }

  function removeFromCart(cartId) {
    cart = cart.filter(i => i.cartId !== cartId);
    saveCart(); updateCartCount(); renderCartItems();
  }

  function renderWishlist() {
    const grid = document.getElementById('wishlist-grid');
    const heroCount = document.getElementById('wl-hero-count');
    const navCount = document.getElementById('nav-wl-count');
    if (!grid) return;

    // Update counts
    const count = wishlist.length;
    if (heroCount) heroCount.textContent = `${count} item${count !== 1 ? 's' : ''} saved`;
    if (navCount) {
      navCount.textContent = count;
      navCount.style.display = count > 0 ? 'inline-block' : 'none';
    }

    if (count === 0) {
      grid.innerHTML = `
        <div class="empty-wishlist" style="grid-column:1/-1;text-align:center;padding:80px 20px;">
          <div style="font-size:5rem;opacity:0.2;margin-bottom:20px;">♡</div>
          <h2 style="font-family:'Playfair Display',serif;color:#333;margin-bottom:10px;">Your wishlist is empty</h2>
          <p style="color:#888;margin-bottom:28px;">Browse our store and heart the products you love.</p>
          <a href="shop.html" class="btn btn-primary" style="text-decoration:none;display:inline-block;">Browse Shop</a>
        </div>`;
      return;
    }

    grid.innerHTML = '';
    wishlist.forEach(product => {
      const card = document.createElement('div');
      card.className = 'product-card';

      const imgPath = (product.image || '');
      const isShoe = imgPath.includes('mens-shoes') || imgPath.includes('womens-shoes');
      const isAccessory = product.category === 'Accessories';

      let sizeHtml = '';
      if (!isAccessory) {
        if (isShoe) {
          sizeHtml = `<select class="size-selector wl-size" data-id="${product.id}" style="padding:6px;width:100%;border:1px solid #ddd;border-radius:6px;margin:10px 0;outline:none;">
            <option value="UK6">UK 6</option><option value="UK7" selected>UK 7</option>
            <option value="UK8">UK 8</option><option value="UK9">UK 9</option>
            <option value="UK10">UK 10</option><option value="UK11">UK 11</option>
          </select>`;
        } else {
          sizeHtml = `<select class="size-selector wl-size" data-id="${product.id}" style="padding:6px;width:100%;border:1px solid #ddd;border-radius:6px;margin:10px 0;outline:none;">
            <option value="S">Size: S</option><option value="M" selected>Size: M</option>
            <option value="L">Size: L</option><option value="XL">Size: XL</option>
          </select>`;
        }
      }

      card.innerHTML = `
        <div class="product-image">
          <img src="${product.image}" alt="${product.title}">
          ${product.featured ? '<span class="badge">Featured</span>' : ''}
        </div>
        <div class="product-info">
          <h3 class="product-title">${product.title}</h3>
          <p class="product-category">${product.category}</p>
          <div class="price-row">
            <span class="product-price">₹${product.price.toFixed(2)}</span>
            <span class="old-price">₹${(product.price * 1.3).toFixed(2)}</span>
          </div>
          ${sizeHtml}
          <div class="wl-actions">
            <button class="wl-cart-btn" data-id="${product.id}">🛒 Add to Cart</button>
            <button class="wl-remove-btn" data-id="${product.id}">✕ Remove from Wishlist</button>
          </div>
        </div>`;

      // Add to cart
      card.querySelector('.wl-cart-btn').addEventListener('click', function () {
        const sizeDrop = card.querySelector('.wl-size');
        const size = sizeDrop ? sizeDrop.value : null;
        addToCart(product.id, size);
        this.textContent = '✓ Added!';
        setTimeout(() => { this.textContent = '🛒 Add to Cart'; }, 1200);
        // Open cart
        document.getElementById('cart-modal').classList.add('active');
        document.getElementById('overlay').classList.add('active');
      });

      // Remove from wishlist
      card.querySelector('.wl-remove-btn').addEventListener('click', function () {
        removeFromWishlist(product.id);
      });

      grid.appendChild(card);
    });
  }

  // Cart modal open/close
  function setupCartModal() {
    const ci = document.getElementById('cart-icon');
    const cl = document.getElementById('close-cart');
    const ov = document.getElementById('overlay');
    const co = document.getElementById('cart-modal');
    if (ci) ci.addEventListener('click', () => { co.classList.add('active'); ov.classList.add('active'); });
    if (cl) cl.addEventListener('click', () => { co.classList.remove('active'); ov.classList.remove('active'); });
    if (ov) ov.addEventListener('click', () => { co.classList.remove('active'); ov.classList.remove('active'); });
    if (document.getElementById('checkout-btn')) {
      document.getElementById('checkout-btn').addEventListener('click', () => {
        if (localStorage.getItem('rewear_logged_in') !== 'true') {
          alert('Please log in to checkout!'); window.location.href = 'index.html';
        } else { window.location.href = 'checkout.html'; }
      });
    }
  }

  // Search redirect
  function setupSearch() {
    const sf = document.getElementById('search-form');
    if (sf) sf.addEventListener('submit', e => {
      e.preventDefault();
      const q = document.getElementById('search-input').value;
      window.location.href = `shop.html?search=${encodeURIComponent(q)}`;
    });
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderWishlist();
    updateCartCount();
    renderCartItems();
    setupCartModal();
    setupSearch();
    document.getElementById('year').textContent = new Date().getFullYear();

    // Auth button
    if (localStorage.getItem('rewear_logged_in') === 'true') {
      const authBtn = document.getElementById('auth-btn');
      const username = localStorage.getItem('rewear_username') || 'User';
      if (authBtn) {
        authBtn.innerHTML = `Hi, ${username} | Sign Out`;
        authBtn.addEventListener('click', e => {
          e.preventDefault();
          localStorage.removeItem('rewear_logged_in');
          localStorage.removeItem('rewear_username');
          localStorage.removeItem('user_type');
          sessionStorage.removeItem('friction_session_id');
          window.location.href = 'homepage.html';
        });
      }
    }
  });
})();
