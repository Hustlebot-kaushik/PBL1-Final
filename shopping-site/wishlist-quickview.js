// wishlist-quickview.js
// Handles Wishlist (localStorage-based) and Product Quick View Modal

(function () {

  // ============ WISHLIST ============
  let wishlist = JSON.parse(localStorage.getItem('rewear_wishlist')) || [];

  function isInWishlist(productId) {
    return wishlist.some(item => item.id === productId);
  }

  function saveAndUpdateNav() {
    localStorage.setItem('rewear_wishlist', JSON.stringify(wishlist));
    // Update the nav count badge on homepage/shop
    const badge = document.getElementById('nav-wl-count');
    if (badge) {
      const count = wishlist.length;
      badge.textContent = count;
      badge.style.display = count > 0 ? 'inline-block' : 'none';
    }
  }

  function toggleWishlist(productId) {
    const product = (typeof products !== 'undefined') ? products.find(p => p.id === productId) : null;
    if (isInWishlist(productId)) {
      wishlist = wishlist.filter(item => item.id !== productId);
    } else if (product) {
      wishlist.push(product);
    }
    saveAndUpdateNav();
    updateWishlistButtons();
    if (window.frictionApi) window.frictionApi.trackClick();
  }

  function updateWishlistButtons() {
    document.querySelectorAll('.wishlist-btn[data-id]').forEach(btn => {
      const id = parseInt(btn.getAttribute('data-id'));
      if (isInWishlist(id)) {
        btn.classList.add('wishlisted');
        btn.title = 'Remove from Wishlist';
      } else {
        btn.classList.remove('wishlisted');
        btn.title = 'Add to Wishlist';
      }
    });
  }

  // ============ QUICK VIEW MODAL ============
  function createModal() {
    if (document.getElementById('quick-view-modal')) return;
    const modal = document.createElement('div');
    modal.id = 'quick-view-modal';
    modal.innerHTML = `
      <div class="qv-backdrop"></div>
      <div class="qv-card">
        <button class="qv-close" id="qv-close-btn" title="Close">✕</button>
        <div class="qv-body">
          <div class="qv-image-wrap">
            <img id="qv-img" src="" alt="">
          </div>
          <div class="qv-info">
            <span class="qv-badge" id="qv-badge">Featured</span>
            <span class="qv-category" id="qv-category"></span>
            <h2 class="qv-title" id="qv-title"></h2>
            <div class="qv-price-row">
              <span class="qv-price" id="qv-price"></span>
              <span class="qv-old-price" id="qv-old-price"></span>
            </div>
            <p class="qv-desc" id="qv-desc"></p>
            <div id="qv-size-wrap"></div>
            <div class="qv-actions">
              <button class="btn-primary qv-buy-btn" id="qv-buy-btn">⚡ Buy Now</button>
              <button class="qv-cart-btn" id="qv-cart-btn">🛒 Add to Cart</button>
              <button class="qv-wish-btn" id="qv-wish-btn">♡ Save</button>
            </div>
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);

    document.getElementById('qv-close-btn').addEventListener('click', closeModal);
    modal.querySelector('.qv-backdrop').addEventListener('click', closeModal);
  }

  function openModal(productId) {
    const product = (typeof products !== 'undefined') ? products.find(p => p.id === productId) : null;
    if (!product) return;

    const modal = document.getElementById('quick-view-modal');
    if (!modal) return;

    document.getElementById('qv-img').src = product.image;
    document.getElementById('qv-img').alt = product.title;
    document.getElementById('qv-title').textContent = product.title;
    document.getElementById('qv-category').textContent = product.category;
    document.getElementById('qv-price').textContent = `₹${product.price.toFixed(2)}`;
    document.getElementById('qv-old-price').textContent = `₹${(product.price * 1.3).toFixed(2)}`;
    document.getElementById('qv-desc').textContent = product.description;

    const badge = document.getElementById('qv-badge');
    badge.style.display = product.featured ? 'inline-block' : 'none';

    // Size selector
    const sizeWrap = document.getElementById('qv-size-wrap');
    sizeWrap.innerHTML = (typeof getSizeDropdown === 'function') ? getSizeDropdown(product) : '';

    // Wishlist button state
    const wishBtn = document.getElementById('qv-wish-btn');
    const inWl = isInWishlist(productId);
    wishBtn.textContent = inWl ? '♥ Saved' : '♡ Save';
    wishBtn.classList.toggle('wishlisted', inWl);

    // Bind action buttons
    document.getElementById('qv-buy-btn').onclick = () => {
      const sizeDrop = sizeWrap.querySelector('.size-selector');
      const size = sizeDrop ? sizeDrop.value : null;
      if (typeof addToCart === 'function') addToCart(productId, size);
      closeModal();
      if (localStorage.getItem('rewear_logged_in') !== 'true') {
        alert('Please log in to checkout!');
        window.location.href = 'index.html';
      } else {
        window.location.href = 'checkout.html';
      }
    };

    document.getElementById('qv-cart-btn').onclick = () => {
      const sizeDrop = sizeWrap.querySelector('.size-selector');
      const size = sizeDrop ? sizeDrop.value : null;
      if (typeof addToCart === 'function') addToCart(productId, size);
      const btn = document.getElementById('qv-cart-btn');
      btn.textContent = '✓ Added!';
      setTimeout(() => { btn.textContent = '🛒 Add to Cart'; }, 1200);
    };

    document.getElementById('qv-wish-btn').onclick = () => {
      toggleWishlist(productId);
      const inWl2 = isInWishlist(productId);
      wishBtn.textContent = inWl2 ? '♥ Saved' : '♡ Save';
      wishBtn.classList.toggle('wishlisted', inWl2);
    };

    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
  }

  function closeModal() {
    const modal = document.getElementById('quick-view-modal');
    if (modal) modal.classList.remove('active');
    document.body.style.overflow = '';
  }

  // ============ CSS INJECTION ============
  function injectCSS() {
    const style = document.createElement('style');
    style.id = 'wishlist-qv-styles';
    style.textContent = `
      /* ===== WISHLIST BTN ===== */
      .wishlist-btn {
        background: none;
        border: 1.5px solid #ddd;
        border-radius: 50%;
        width: 36px; height: 36px;
        cursor: pointer;
        font-size: 17px;
        display: inline-flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        flex-shrink: 0;
        color: #aaa;
        padding: 0;
      }
      .wishlist-btn svg { width: 18px; height: 18px; fill: #aaa; transition: fill 0.2s; }
      .wishlist-btn:hover, .wishlist-btn.wishlisted { color: #e53935; border-color: #e53935; background: #fff0f0; transform: scale(1.12); }
      .wishlist-btn:hover svg, .wishlist-btn.wishlisted svg { fill: #e53935; }

      /* ===== QUICK-VIEW ACTION BTN ===== */
      .quick-view-btn {
        background: rgba(255,255,255,0.93);
        border: none;
        border-radius: 50%;
        width: 36px; height: 36px;
        cursor: pointer;
        font-size: 15px;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.2s;
        box-shadow: 0 2px 6px rgba(0,0,0,0.12);
      }
      .quick-view-btn:hover { transform: scale(1.15); background: white; }

      /* ===== QUICK VIEW MODAL ===== */
      #quick-view-modal {
        display: none;
        position: fixed;
        inset: 0;
        z-index: 10000;
        align-items: center;
        justify-content: center;
      }
      #quick-view-modal.active { display: flex; }

      .qv-backdrop {
        position: absolute;
        inset: 0;
        background: rgba(0,0,0,0.6);
        backdrop-filter: blur(5px);
        animation: qvFadeIn 0.25s ease;
      }

      .qv-card {
        position: relative;
        background: #fff;
        border-radius: 22px;
        max-width: 860px;
        width: 94%;
        max-height: 92vh;
        overflow-y: auto;
        box-shadow: 0 40px 100px rgba(0,0,0,0.3);
        animation: qvSlideUp 0.3s cubic-bezier(0.25,0.8,0.25,1);
        z-index: 1;
      }

      .qv-close {
        position: absolute;
        top: 14px; right: 16px;
        background: #f4f4f4;
        border: none;
        border-radius: 50%;
        width: 38px; height: 38px;
        font-size: 16px;
        cursor: pointer;
        z-index: 2;
        transition: background 0.2s, transform 0.2s;
        font-weight: 600;
      }
      .qv-close:hover { background: #e0e0e0; transform: rotate(90deg); }

      .qv-body {
        display: grid;
        grid-template-columns: 1fr 1fr;
        min-height: 440px;
      }

      .qv-image-wrap {
        background: #f8f8f8;
        border-radius: 22px 0 0 22px;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 36px 28px;
        overflow: hidden;
      }
      .qv-image-wrap img {
        max-width: 100%;
        max-height: 360px;
        object-fit: contain;
        transition: transform 0.4s;
      }
      .qv-image-wrap img:hover { transform: scale(1.05); }

      .qv-info {
        padding: 42px 36px 36px;
        display: flex;
        flex-direction: column;
        gap: 10px;
      }

      .qv-badge {
        background: linear-gradient(135deg, #f57c00, #ff9800);
        color: white;
        font-size: 10px;
        font-weight: 700;
        padding: 4px 12px;
        border-radius: 20px;
        width: fit-content;
        text-transform: uppercase;
        letter-spacing: 1px;
      }

      .qv-category {
        font-size: 11px;
        color: #2a9d8f;
        font-weight: 700;
        text-transform: uppercase;
        letter-spacing: 1.5px;
      }

      .qv-title {
        font-family: 'Playfair Display', serif;
        font-size: 1.55rem;
        color: #1a1a2e;
        line-height: 1.3;
        margin: 0;
      }

      .qv-price-row {
        display: flex;
        align-items: baseline;
        gap: 12px;
        margin: 4px 0;
      }
      .qv-price { font-size: 1.55rem; font-weight: 700; color: #2a9d8f; }
      .qv-old-price { font-size: 1rem; color: #bbb; text-decoration: line-through; }

      .qv-desc {
        font-size: 0.9rem;
        color: #666;
        line-height: 1.7;
        margin: 0;
      }

      #qv-size-wrap select {
        width: 100%;
        padding: 8px 12px;
        border: 1.5px solid #e0e0e0;
        border-radius: 8px;
        font-size: 0.9rem;
        outline: none;
        transition: border-color 0.2s;
        cursor: pointer;
      }
      #qv-size-wrap select:focus { border-color: #2a9d8f; }

      .qv-actions {
        display: flex;
        gap: 8px;
        flex-wrap: wrap;
        margin-top: 6px;
      }

      .qv-buy-btn {
        flex: 1.5;
        padding: 12px 18px;
        border: none;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 700;
        font-size: 0.95rem;
        letter-spacing: 0.3px;
      }

      .qv-cart-btn {
        flex: 1;
        padding: 12px 14px;
        border: 2px solid #2a9d8f;
        border-radius: 10px;
        cursor: pointer;
        font-weight: 600;
        color: #2a9d8f;
        background: transparent;
        font-size: 0.9rem;
        transition: all 0.2s;
      }
      .qv-cart-btn:hover { background: #2a9d8f; color: white; }

      .qv-wish-btn {
        padding: 12px 14px;
        border: 1.5px solid #ddd;
        border-radius: 10px;
        cursor: pointer;
        background: transparent;
        font-size: 0.9rem;
        color: #999;
        transition: all 0.2s;
        white-space: nowrap;
      }
      .qv-wish-btn:hover, .qv-wish-btn.wishlisted { color: #e53935; border-color: #e53935; background: #fff0f0; }

      @keyframes qvFadeIn { from { opacity:0; } to { opacity:1; } }
      @keyframes qvSlideUp { from { transform: translateY(40px); opacity:0; } to { transform: translateY(0); opacity:1; } }

      @media (max-width: 640px) {
        .qv-body { grid-template-columns: 1fr; }
        .qv-image-wrap { border-radius: 22px 22px 0 0; min-height: 220px; padding: 24px; }
        .qv-info { padding: 24px 20px 28px; }
        .qv-title { font-size: 1.25rem; }
      }
    `;
    document.head.appendChild(style);
  }

  // ============ EVENT DELEGATION ============
  function setupEvents() {
    document.addEventListener('click', function (e) {
      // Quick view button
      const qvBtn = e.target.closest('.quick-view-btn');
      if (qvBtn) {
        const id = parseInt(qvBtn.getAttribute('data-id'));
        openModal(id);
        return;
      }

      // Wishlist button
      const wlBtn = e.target.closest('.wishlist-btn[data-id]');
      if (wlBtn) {
        const id = parseInt(wlBtn.getAttribute('data-id'));
        toggleWishlist(id);
        return;
      }
    });

    // Close on Escape key
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeModal();
    });
  }

  // ============ INIT ============
  document.addEventListener('DOMContentLoaded', function () {
    injectCSS();
    createModal();
    setupEvents();
    setTimeout(updateWishlistButtons, 600);

    // Watch for product cards being added to the DOM
    const watchTarget = document.getElementById('featured-products') || document.getElementById('products-grid');
    if (watchTarget) {
      const mo = new MutationObserver(() => setTimeout(updateWishlistButtons, 150));
      mo.observe(watchTarget, { childList: true });
    }
  });

})();
