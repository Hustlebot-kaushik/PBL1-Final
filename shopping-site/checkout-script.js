document.addEventListener('DOMContentLoaded', () => {
    // Auth guard for checkout
    if (localStorage.getItem('rewear_logged_in') !== 'true') {
        alert("Authentication required. Redirecting to login...");
        window.location.href = 'index.html';
        return;
    }

    const cart = JSON.parse(localStorage.getItem('rewear_cart')) || [];
    
    if (cart.length === 0) {
        document.getElementById('checkout-items').innerHTML = "<p>Your cart is empty.</p>";
        // Disable checkout button if empty
        const btnPay = document.querySelector('.btn-pay');
        if (btnPay) {
            btnPay.disabled = true;
            btnPay.style.background = "#ccc";
            btnPay.style.cursor = "not-allowed";
        }
        return;
    }

    const itemsContainer = document.getElementById('checkout-items');
    let subtotal = 0;

    cart.forEach(item => {
        subtotal += item.price;
        const div = document.createElement('div');
        div.className = 'checkout-item';
        div.innerHTML = `
            <img src="${item.image}" alt="${item.title}">
            <div class="item-details">
                <div style="font-weight: 600;">${item.title} ${item.size ? `(Size: ${item.size})` : ''}</div>
                <div class="item-price">₹${item.price.toFixed(2)}</div>
            </div>
        `;
        itemsContainer.appendChild(div);
    });

    const taxes = subtotal * 0.08;
    const finalTotal = subtotal + taxes;

    document.getElementById('subtotal').innerText = `₹${subtotal.toFixed(2)}`;
    document.getElementById('taxes').innerText = `₹${taxes.toFixed(2)}`;
    document.getElementById('total').innerText = `₹${finalTotal.toFixed(2)}`;

    const form = document.getElementById('checkout-form');
    form.addEventListener('submit', (e) => {
        e.preventDefault();
        
        // Final secure checkout transaction
        if (window.frictionApi) {
            window.frictionApi.trackPurchase(finalTotal);
            window.frictionApi.flushNow();
        }

        // Delay the alert to ensure the browser dispatches the fetch request 
        // to the network before pausing the main thread.
        setTimeout(() => {
            alert('Transaction Successful! (Demo Mode) Thank you for shopping with Rewear.');
            localStorage.removeItem('rewear_cart');
            window.location.href = 'homepage.html';
        }, 500);
    });
});
