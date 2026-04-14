// auth-script.js

// EmailJS configuration (replace with your actual IDs if using)
const SERVICE_ID = "service_7w96g3q";
const TEMPLATE_ID = "template_uuwzgje";
const PUBLIC_KEY = "AkHy73JVjSRk69Rv2";

// Initialize EmailJS
emailjs.init(PUBLIC_KEY);

const testimonials = [
    '"Clothes that feel new, with a soul that\'s renewed."',
    '"I found my favorite jeans again — thanks Rewear!"',
    '"Eco-friendly fashion made easy and affordable."',
    '"Wearing stories, not just clothes."',
];
let index = 0;

// Initialize testimonials rotation
function initTestimonials() {
    setInterval(() => {
        index = (index + 1) % testimonials.length;
        document.getElementById("testimonial-text").innerText = testimonials[index];
    }, 8000);
}

// Toggle between login and signup forms
function toggleForms() {
    const loginForm = document.getElementById("login-form");
    const signupForm = document.getElementById("signup-form");
    loginForm.style.display = loginForm.style.display === "none" ? "block" : "none";
    signupForm.style.display = signupForm.style.display === "none" ? "block" : "none";
}

// Show forgot password modal
function showForgotForm() {
    document.getElementById("forgot-modal").style.display = "flex";
}

// Hide forgot password modal
function hideForgotForm() {
    document.getElementById("forgot-modal").style.display = "none";
    document.getElementById("forgot-success").style.display = "none";
}

// Handle forgot password form submission
function handleForgotPassword() {
    document.getElementById("forgotForm").addEventListener("submit", function (e) {
        e.preventDefault();
        const email = this.user_email.value;
        const resetURL = `https://rewear.com/reset-password?email=${encodeURIComponent(email)}`;
        this.reset_link.value = resetURL;

        emailjs.sendForm(SERVICE_ID, TEMPLATE_ID, this)
            .then(() => {
                document.getElementById("forgot-success").style.display = "block";
                this.user_email.value = '';
            })
            .catch((error) => {
                console.error("Email sending failed:", error);
                alert("❌ Failed to send reset email. Please try again. (Check console for details)");
            });
    });
}

// Handle login form submission
function handleLogin() {
    document.getElementById("login-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const username = e.target.querySelector('input[placeholder="Username"]').value;
        const passwordInput = e.target.querySelector('input[placeholder="Password"]');
        const password = passwordInput ? passwordInput.value : '';

        const users = JSON.parse(localStorage.getItem('rewear_users') || '{}');
        if (!users[username] || users[username].password !== password) {
            alert("Invalid username or password!");
            return;
        }

        localStorage.setItem('user_type', 'registered');
        localStorage.setItem('rewear_logged_in', 'true');
        localStorage.setItem('rewear_username', username);

        // ---- Per-user cart: clear guest cart, load this user's saved cart ----
        const userCart = localStorage.getItem('rewear_cart_' + username);
        localStorage.setItem('rewear_cart', userCart || '[]');
        // --------------------------------------------------------------------

        // Reset session ID to explicitly separate guest vs confirmed users in friction tracking
        const newSessionId = 'session_auth_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('friction_session_id', newSessionId);

        if (window.frictionApi) window.frictionApi.flushNow();
        alert("Simulating successful login! Redirecting to Rewear Homepage.");
        window.location.href = "homepage.html";
    });
}

// Handle signup form submission
function handleSignup() {
    document.getElementById("signup-form").addEventListener("submit", function (e) {
        e.preventDefault();
        const username = e.target.querySelector('input[placeholder="Username"]').value;
        const passwordInput = e.target.querySelector('input[placeholder="Password"]');
        const password = passwordInput ? passwordInput.value : '';

        const users = JSON.parse(localStorage.getItem('rewear_users') || '{}');
        if (users[username]) {
            alert("Username already exists!");
            return;
        }

        users[username] = { password };
        localStorage.setItem('rewear_users', JSON.stringify(users));

        localStorage.setItem('user_type', 'registered');
        localStorage.setItem('rewear_logged_in', 'true');
        localStorage.setItem('rewear_username', username);

        // ---- Per-user cart: new signup starts with empty cart ----
        const userCart = localStorage.getItem('rewear_cart_' + username);
        localStorage.setItem('rewear_cart', userCart || '[]');
        // ----------------------------------------------------------

        // Reset session ID to explicitly separate guest vs confirmed users in friction tracking
        const newSessionId = 'session_auth_' + Math.random().toString(36).substring(2, 10);
        sessionStorage.setItem('friction_session_id', newSessionId);

        if (window.frictionApi) window.frictionApi.flushNow();
        alert("Simulating successful signup! Redirecting to Rewear Homepage.");
        window.location.href = "homepage.html";
    });
}

// Initialize all event listeners
function init() {
    initTestimonials();
    handleForgotPassword();
    handleLogin();
    handleSignup();
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', init);