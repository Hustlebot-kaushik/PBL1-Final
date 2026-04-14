
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

// Products array is now loaded globally via products.js

// Shopping cart functionality
let cart = JSON.parse(localStorage.getItem('rewear_cart')) || [];
cart.forEach(item => { if (!item.cartId) item.cartId = item.size ? `${item.id}-${item.size}` : `${item.id}`; });

// DOM Elements
const featuredProductsGrid = document.getElementById('featured-products');
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
const newsletterForm = document.getElementById('newsletter-form');

// Initialize the homepage
function initHomepage() {
  renderFeaturedProducts();
  updateCartCount();
  renderCartItems(); // CRITICAL: Sync cart items modal UI on load
  setupEventListeners();
  setCurrentYear();
}

// Render featured products to the page
function renderFeaturedProducts() {
  featuredProductsGrid.innerHTML = '';
  
  const featuredProducts = products.filter(product => product.featured);
  
  featuredProducts.forEach(product => {
    const productCard = document.createElement('div');
    productCard.className = 'product-card';
    productCard.innerHTML = `
      <div class="product-image">
        <img src="${product.image}" alt="${product.title}">
      </div>
      <div class="product-info">
        <h3 class="product-title">${product.title}</h3>
        <p class="product-category">${product.category}</p>
        <p class="product-price">₹${product.price.toFixed(2)}</p>
        <p>${product.description}</p>
        ${getSizeDropdown(product)}<div class="product-actions" style="display: flex; gap: 10px;">
          <button class="btn-primary btn-buy-now" data-id="${product.id}" style="padding: 8px 16px; font-size: 0.9rem; flex: 1;">Buy Now</button>
          <button class="add-to-cart" data-id="${product.id}" style="flex: 1;">Add to Cart</button>
          <button class="wishlist-btn" data-id="${product.id}" title="Add to Wishlist">♡</button>
          <button class="quick-view-btn" data-id="${product.id}" title="Quick View" style="background:#f5f5f5;border:none;border-radius:50%;width:36px;height:36px;cursor:pointer;font-size:15px;flex-shrink:0;">👁️</button>
        </div>
      </div>
    `;
    featuredProductsGrid.appendChild(productCard);
  });
}

// Setup event listeners
function setupEventListeners() {
  // Add to cart and Buy Now buttons
  document.addEventListener('click', function(e) {
    if (e.target.classList.contains('add-to-cart')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const card = e.target.closest('.product-info') || e.target.closest('.product-card');
      const sizeDrop = card ? card.querySelector('.size-selector') : null;
      const size = sizeDrop ? sizeDrop.value : null;
      addToCart(productId, size);
    }
    if (e.target.classList.contains('btn-buy-now')) {
      const productId = parseInt(e.target.getAttribute('data-id'));
      const card = e.target.closest('.product-info') || e.target.closest('.product-card');
      const sizeDrop = card ? card.querySelector('.size-selector') : null;
      const size = sizeDrop ? sizeDrop.value : null;
      addToCart(productId, size); // Ensure it's in the cart
      if (localStorage.getItem('rewear_logged_in') !== 'true') {
        alert("Please log in to checkout!");
        window.location.href = 'index.html';
      } else {
        window.location.href = 'checkout.html';
      }
    }
  });

  // Cart icon click
  cartIcon.addEventListener('click', openCart);

  // Close cart
  closeCart.addEventListener('click', closeCartModal);
  overlay.addEventListener('click', closeCartModal);

  // Checkout button
  checkoutBtn.addEventListener('click', function() {
    if (cart.length === 0) {
      alert('Your cart is empty!');
      return;
    }

    if (window.frictionApi) {
      window.frictionApi.trackCheckout();
      window.frictionApi.flushNow();
    }
    
    // Force authentication block for friction
    const isLoggedIn = localStorage.getItem('rewear_logged_in');
    if (!isLoggedIn) {
        alert('Please log in to checkout!');
        window.location.href = 'index.html';
        return; 
    }

    window.location.href = 'checkout.html';
  });

  // Newsletter form
  newsletterForm.addEventListener('submit', function(e) {
    e.preventDefault();
    const email = this.querySelector('input[type="email"]').value;
    alert(`Thank you for subscribing with ${email}! You'll hear from us soon.`);
    this.reset();
  });

  // Smooth scrolling for anchor links
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href');
      if (targetId === '#') return;
      
      const targetElement = document.querySelector(targetId);
      if (targetElement) {
        window.scrollTo({
          top: targetElement.offsetTop - 100,
          behavior: 'smooth'
        });
      }
    });
  });
}

// Add product to cart
function addToCart(productId, size = null) {
  const product = products.find(p => p.id === productId);
  const cartId = size ? `${productId}-${size}` : `${productId}`;
  const existingItem = cart.find(item => item.cartId === cartId);
  
  if (existingItem) {
    existingItem.quantity += 1;
  } else {
    cart.push({
      ...product,
      cartId: cartId,
      size: size,
      quantity: 1
    });
  }
  
  updateCart();
  
  // Show confirmation
  const btn = document.querySelector(`[data-id="${productId}"]`);
  const originalText = btn.textContent;
  btn.textContent = 'Added!';
  btn.disabled = true;
  
  setTimeout(() => {
    btn.textContent = originalText;
    btn.disabled = false;
  }, 1500);
}

// Update cart UI
function updateCart() {
  localStorage.setItem('rewear_cart', JSON.stringify(cart));
  // Sync to per-user key so cart is preserved across sessions
  const username = localStorage.getItem('rewear_username');
  if (username) localStorage.setItem('rewear_cart_' + username, JSON.stringify(cart));
  updateCartCount();
  renderCartItems();
}

// Update cart count badge
function updateCartCount() {
  const count = cart.reduce((total, item) => total + item.quantity, 0);
  cartCount.textContent = count;
}

// Render cart items
function renderCartItems() {
  cartItems.innerHTML = '';
  
  if (cart.length === 0) {
    emptyCart.style.display = 'block';
    cartTotal.style.display = 'none';
    checkoutBtn.style.display = 'none';
    return;
  }
  
  emptyCart.style.display = 'none';
  cartTotal.style.display = 'flex';
  checkoutBtn.style.display = 'block';
  
  let total = 0;
  
  cart.forEach(item => {
    const itemTotal = item.price * item.quantity;
    total += itemTotal;
    
    const cartItem = document.createElement('div');
    cartItem.className = 'cart-item';
    cartItem.innerHTML = `
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
    cartItems.appendChild(cartItem);
  });
  
  totalAmount.textContent = `₹${total.toFixed(2)}`;
  
  // Add event listeners for cart item actions
  document.querySelectorAll('.quantity-btn.minus').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-cartid');
      decreaseQuantity(id);
    });
  });
  
  document.querySelectorAll('.quantity-btn.plus').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-cartid');
      increaseQuantity(id);
    });
  });
  
  document.querySelectorAll('.remove-item').forEach(btn => {
    btn.addEventListener('click', function() {
      const id = this.getAttribute('data-cartid');
      removeFromCart(id);
    });
  });
}

// Increase item quantity
function increaseQuantity(cartId) {
  const item = cart.find(item => item.cartId === cartId);
  if (item) {
    item.quantity += 1;
    updateCart();
  }
}

// Decrease item quantity
function decreaseQuantity(cartId) {
  const item = cart.find(item => item.cartId === cartId);
  if (item) {
    if (item.quantity > 1) {
      item.quantity -= 1;
    } else {
      removeFromCart(cartId);
      return;
    }
    updateCart();
  }
}

// Remove item from cart
function removeFromCart(cartId) {
  cart = cart.filter(item => item.id !== productId);
  updateCart();
}

// Open cart modal
function openCart() {
  cartModal.classList.add('active');
  overlay.classList.add('active');
  document.body.style.overflow = 'hidden';
}

// Close cart modal
function closeCartModal() {
  cartModal.classList.remove('active');
  overlay.classList.remove('active');
  document.body.style.overflow = 'auto';
}

// Set current year in footer
function setCurrentYear() {
  document.getElementById('year').textContent = new Date().getFullYear();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', initHomepage);