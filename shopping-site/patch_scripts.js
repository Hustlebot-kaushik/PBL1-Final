const fs = require('fs');

const files = ['script.js', 'shop-script.js'];

files.forEach(f => {
    if (!fs.existsSync(f)) return;
    let content = fs.readFileSync(f, 'utf8');

    // 1. Replace Checkout Button Logic
    const oldCheckout = `checkoutBtn.addEventListener('click', () => {
    if (localStorage.getItem('rewear_logged_in') !== 'true') {
      alert("Please log in to proceed to checkout!");
      // Redirect to friction/login page
      window.location.href = 'index.html';
      return;
    }
    alert('Thank you for your purchase! (This is a demo)');
    cart = [];
    localStorage.removeItem('rewear_cart');
    updateCartCount();
    renderCart();
    cartModal.classList.remove('active');
    overlay.classList.remove('active');
  });`;
    
    // Fallback if formatting varied slightly
    const flexibleCheckoutSearch = /checkoutBtn\.addEventListener\('click', \(\) => \{[\s\S]*?cartModal\.classList\.remove\('active'\);\s*overlay\.classList\.remove\('active'\);\s*\}\);/;

    const newCheckout = `checkoutBtn.addEventListener('click', () => {
    if (localStorage.getItem('rewear_logged_in') !== 'true') {
      alert("Please log in to proceed to checkout!");
      window.location.href = 'index.html';
      return;
    }
    window.location.href = 'checkout.html';
  });`;

    content = content.replace(flexibleCheckoutSearch, newCheckout);
    if (content.indexOf("window.location.href = 'checkout.html';") === -1 && f==='script.js') {
        console.log("Failed to match Checkout logic in", f);
    }

    // 2. Add "Buy Now" button to the product rendering HTML
    const oldHtml = `<button class="add-to-cart" data-id="\${product.id}">Add to Cart</button>
        <button class="wishlist-btn"><svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 512 512"><path d="M462.3 62.6C407.5 15.9 326 24.3 275.7 76.2L256 96.5l-19.7-20.3C186.1 24.3 104.5 15.9 49.7 62.6c-62.8 53.6-66.1 149.8-9.9 207.9l193.5 199.8c12.5 12.9 32.8 12.9 45.3 0l193.5-199.8c56.3-58.1 53-154.3-9.8-207.9z"/></svg></button>`;
    
    const flexibleHtmlSearch = /<button class="add-to-cart"[^>]*>Add to Cart<\/button>\s*<button class="wishlist-btn">[\s\S]*?<\/svg><\/button>/;

    const newHtml = `<button class="btn-buy-now" data-id="\${product.id}">Buy Now</button>
        <button class="add-to-cart" data-id="\${product.id}">Add to Cart</button>`;

    content = content.replace(flexibleHtmlSearch, newHtml);

    // 3. Add Buy Now Event Listeners safely alongside Add to Cart Listeners
    // In both files, Add to Cart logic hooks in a function commonly rendered, often inline inside render logic.
    // Let's add it right after "add-to-cart" listener mapping inside the render function loop OR globally attached.
    
    const buyNowListener = `
    document.querySelectorAll('.btn-buy-now').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const productId = parseInt(e.target.getAttribute('data-id'));
        const product = products.find(p => p.id === productId);
        if (product) {
          cart.push(product);
          localStorage.setItem('rewear_cart', JSON.stringify(cart));
          if (localStorage.getItem('rewear_logged_in') !== 'true') {
            alert("Please log in to proceed to checkout!");
            window.location.href = 'index.html';
          } else {
            window.location.href = 'checkout.html';
          }
        }
      });
    });
`;
    // We insert it right before the final closing brace of the render loop / setup. 
    // Usually right after querying `.add-to-cart`.
    const addToCartSearch = /document\.querySelectorAll\('\.add-to-cart'\)\.forEach\(btn => \{[\s\S]*?\}\);\s*\}\);/;
    
    const match = content.match(addToCartSearch);
    if(match) {
        content = content.replace(addToCartSearch, match[0] + "\n" + buyNowListener);
    } else {
        console.log("Failed to inject Buy Now hook in", f);
    }

    fs.writeFileSync(f, content, 'utf8');
});
