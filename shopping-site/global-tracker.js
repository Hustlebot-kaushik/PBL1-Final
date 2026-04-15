// global-tracker.js
// using window.createFrictionTracker loaded synchronously

// Get or create session ID
let sessionId = sessionStorage.getItem('friction_session_id');
if (!sessionId) {
  sessionId = 'sess_' + Math.random().toString(36).substring(2, 15);
  sessionStorage.setItem('friction_session_id', sessionId);
}

// Determine user type (using localStorage as a proxy for logged in)
const userType = localStorage.getItem('user_type') || 'guest';

// Create floating UI widget for live prediction visualization
const widget = document.createElement('div');
widget.id = 'friction-prediction-widget';
widget.innerHTML = `
  <div style="font-family: 'Poppins', sans-serif; position: fixed; bottom: 20px; right: 20px; background: rgba(255, 255, 255, 0.95); backdrop-filter: blur(10px); border: 1px solid #e0e0e0; padding: 12px 18px; border-radius: 12px; box-shadow: 0 8px 24px rgba(0,0,0,0.12); z-index: 9999; font-size: 14px; transition: all 0.3s cubic-bezier(0.25, 0.8, 0.25, 1); min-width: 250px; max-width: 320px;">
    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 5px;">
        <strong style="color: #333;">Live AI Friction</strong>
        <span id="friction-indicator" style="height: 10px; width: 10px; border-radius: 50%; background-color: #4CAF50; display: inline-block;"></span>
    </div>
    <div id="friction-score" style="color: #4CAF50; font-weight: 600; font-size: 16px; margin-bottom: 4px;">Detecting...</div>
    <div id="friction-narrative" style="color: #666; font-size: 12px; line-height: 1.3;">AI is analyzing session...</div>
  </div>
`;
document.body.appendChild(widget);

const scoreSpan = document.getElementById('friction-score');
const indicator = document.getElementById('friction-indicator');
const narrativeSpan = document.getElementById('friction-narrative');

// Use local backend by default; allow manual override via localStorage when needed.
const localApi = "http://127.0.0.1:5050/api/track";
const apiUrl = localStorage.getItem('friction_api_url') || localApi;

// Initialize the tracker
window.frictionApi = createFrictionTracker({
  apiUrl: apiUrl, 
  sessionId: sessionId,
  userId: localStorage.getItem('rewear_username') || userType,
  onPrediction: (data, statusCode) => {
    if (data && data.prediction) {
      let level = data.prediction.friction_level;
      let narrative = data.prediction.narrative || '';
      narrativeSpan.innerText = narrative;
      if (level === 'High') {
         scoreSpan.innerText = 'High Friction Detected';
         scoreSpan.style.color = '#F44336';
         indicator.style.backgroundColor = '#F44336';
      } else if (level === 'Low') {
         scoreSpan.innerText = 'Smooth Experience';
         scoreSpan.style.color = '#4CAF50';
         indicator.style.backgroundColor = '#4CAF50';
      } else {
         scoreSpan.innerText = 'Moderate Friction';
         scoreSpan.style.color = '#FF9800';
         indicator.style.backgroundColor = '#FF9800';
      }
    } else {
      scoreSpan.innerText = 'Data Sent...';
      scoreSpan.style.color = '#52796f';
      indicator.style.backgroundColor = '#52796f';
    }
    
    // Add brief animation for user feedback
    widget.style.transform = 'translateY(-5px)';
    widget.style.boxShadow = '0 12px 28px rgba(0,0,0,0.15)';
    setTimeout(() => {
      widget.style.transform = 'translateY(0)';
      widget.style.boxShadow = '0 8px 24px rgba(0,0,0,0.12)';
    }, 300);
  }
});

// Setup Global Event Listeners for automatic friction tracking
document.addEventListener('click', (e) => {
  if (widget.contains(e.target)) return;
  // Track ALL clicks on the page per user request
  window.frictionApi.trackClick();
});

window.addEventListener('popstate', () => {
    window.frictionApi.trackBackClick();
});

window.addEventListener('error', (e) => {
    window.frictionApi.trackError();
});

// Initial flush after a second to register the page load context
setTimeout(() => {
    // page_view already emitted inside init
}, 1000);

// Specific Amazon-like Feature Tracking
document.addEventListener('DOMContentLoaded', () => {
    const searchForm = document.getElementById('search-form');
    if (searchForm) {
        searchForm.addEventListener('submit', (e) => {
            e.preventDefault(); // Prevent page reload for demo
            window.frictionApi.trackSearch();
            
            // Optional visual feedback for search
            const searchInput = document.getElementById('search-input');
            const query = searchInput.value;
            console.log("Search tracked for:", query);
            
            // Temporary flash effect to show it registered
            const btn = searchForm.querySelector('.search-btn');
            const originalBg = btn.style.background;
            btn.style.background = '#4CAF50';
            setTimeout(() => {
                btn.style.background = originalBg;
                window.location.href = `shop.html?search=${encodeURIComponent(query)}`;
            }, 300);
        });
    }

    const checkoutBtn = document.getElementById('checkout-btn');
    if (checkoutBtn) {
        checkoutBtn.addEventListener('click', () => {
            window.frictionApi.trackCheckout();
            console.log("Checkout tracked.");
        });
    }

    // Intercept dead links to look advanced
    document.addEventListener('click', (e) => {
        let target = e.target.closest('a');
        if (target && target.getAttribute('href') === '#') {
            e.preventDefault();
            
            // Track the friction of someone clicking an unavailable link
            window.frictionApi.trackClick(); 
            
            alert('This feature is currently under construction for our advanced release. Check back soon!');
        }
        
        let cartIconClicked = e.target.closest('#cart-icon');
        if (cartIconClicked && !document.getElementById('cart-modal')) {
             window.location.href = 'shop.html';
        }
    });

    // Dynamic Auth Button Toggling
    const authBtns = document.querySelectorAll('a[href="index.html"].btn');
    if (localStorage.getItem('rewear_logged_in') === 'true') {
        const username = localStorage.getItem('rewear_username') || 'User';
        authBtns.forEach(btn => {
            btn.innerHTML = `<span style="font-weight: 400;">Hi, ${username}</span> &nbsp;|&nbsp; Sign Out`;
            btn.addEventListener('click', (e) => {
                e.preventDefault();

                // ---- Per-user cart: save this user's cart before logout ----
                const currentUsername = localStorage.getItem('rewear_username');
                if (currentUsername) {
                    const currentCart = localStorage.getItem('rewear_cart') || '[]';
                    localStorage.setItem('rewear_cart_' + currentUsername, currentCart);
                }
                localStorage.setItem('rewear_cart', '[]'); // clear shared cart
                // -----------------------------------------------------------

                localStorage.removeItem('rewear_logged_in');
                localStorage.removeItem('user_type');
                localStorage.removeItem('rewear_username');
                // Drop tracking session
                sessionStorage.removeItem('friction_session_id');
                window.frictionApi.trackClick();
                alert('You have successfully signed out!');
                window.location.href = 'homepage.html';
            });
        });
    }

    // Generic form interceptor for standard pages (Contact Us, etc)
    const genericForms = document.querySelectorAll('form:not(#search-form):not(#login-form):not(#signup-form):not(#forgotForm):not(#checkout-form)');
    genericForms.forEach(form => {
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            window.frictionApi.trackClick();
            alert('Your request has been submitted successfully! (Demo mode)');
            form.reset();
        });
    });
});
