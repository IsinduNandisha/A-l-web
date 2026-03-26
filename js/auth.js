// auth.js - Authentication Mock Logic utilizing localStorage

// State
let isLoginMode = true;
let currentUser = null;
const MOCK_OTP = "123456";

// DOM Elements
const authOverlay = document.getElementById('authOverlay');
const mainApp = document.getElementById('mainApp');
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const showRegisterBtn = document.getElementById('showRegister');
const showLoginBtn = document.getElementById('showLogin');
const authSubtitle = document.getElementById('authSubtitle');
const welcomeText = document.getElementById('welcomeText');
const btnLogout = document.getElementById('btnLogout');

// Register Elements
const btnSendOtp = document.getElementById('btnSendOtp');
const btnRegister = document.getElementById('btnRegister');
const otpSection = document.getElementById('otpSection');
const passSection = document.getElementById('passSection');
const regPhoneInput = document.getElementById('regPhone');
const regOtpInput = document.getElementById('regOtp');
const regPassInput = document.getElementById('regPassword');

// Login Elements
const loginPhoneInput = document.getElementById('loginPhone');
const loginPassInput = document.getElementById('loginPassword');

// Initialization
function initAuth() {
    // Check if user is already logged in
    const storedUser = localStorage.getItem('al_vault_user');
    if (storedUser) {
        currentUser = JSON.parse(storedUser);
        showApp();
    } else {
        showAuth();
    }
}

// UI Toggles
function showAuth() {
    authOverlay.classList.add('active');
    mainApp.style.display = 'none';
    document.body.style.overflow = 'hidden'; // Prevent scrolling
}

function showApp() {
    authOverlay.classList.remove('active');
    mainApp.style.display = 'block';
    document.body.style.overflow = '';
    
    // Update Welcome Text
    welcomeText.textContent = `Welcome, ${currentUser.phone}!`;
}

function toggleMode(toLogin) {
    isLoginMode = toLogin;
    if (isLoginMode) {
        loginForm.classList.add('active');
        registerForm.classList.remove('active');
        authSubtitle.textContent = 'Login to access your classes';
        
        // Reset Register Form
        resetRegisterForm();
    } else {
        loginForm.classList.remove('active');
        registerForm.classList.add('active');
        authSubtitle.textContent = 'Create an account to start learning';
        
        // Reset Login Form
        loginForm.reset();
    }
}

// Event Listeners for Toggles
showRegisterBtn.addEventListener('click', () => toggleMode(false));
showLoginBtn.addEventListener('click', () => toggleMode(true));

// Helper: Reset Register Form
function resetRegisterForm() {
    registerForm.reset();
    otpSection.style.display = 'none';
    passSection.style.display = 'none';
    btnSendOtp.style.display = 'block';
    btnRegister.style.display = 'none';
    regPhoneInput.disabled = false;
}

// Validate Phone Number
function isValidPhone(phone) {
    // Simple validation for demo: 10 digits
    const regex = /^[0-9]{10}$/;
    return regex.test(phone.trim());
}

// --- Registration Logic ---

btnSendOtp.addEventListener('click', (e) => {
    e.preventDefault();
    const phone = regPhoneInput.value.trim();
    
    if (!isValidPhone(phone)) {
        alert("Please enter a valid 10-digit phone number (e.g., 0712345678).");
        return;
    }

    // Check if user already exists
    const users = JSON.parse(localStorage.getItem('al_vault_users') || '{}');
    if (users[phone]) {
        alert("This phone number is already registered. Please log in.");
        toggleMode(true);
        loginPhoneInput.value = phone;
        return;
    }

    // Simulate OTP sent
    alert(`OTP sent successfully! For this demo, please use OTP: ${MOCK_OTP}`);
    
    // Show OTP and Password fields
    regPhoneInput.disabled = true;
    otpSection.style.display = 'block';
    passSection.style.display = 'block';
    btnSendOtp.style.display = 'none';
    btnRegister.style.display = 'block';
});

registerForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (isLoginMode) return; // safeguard

    const phone = regPhoneInput.value.trim();
    const otp = regOtpInput.value.trim();
    const password = regPassInput.value.trim();

    if (otp !== MOCK_OTP) {
        alert("Invalid OTP. Please try again.");
        return;
    }

    if (password.length < 6) {
        alert("Password must be at least 6 characters long.");
        return;
    }

    // Save User
    const users = JSON.parse(localStorage.getItem('al_vault_users') || '{}');
    users[phone] = { password: password };
    localStorage.setItem('al_vault_users', JSON.stringify(users));

    alert("Registration successful! You can now log in.");
    toggleMode(true);
    loginPhoneInput.value = phone;
});

// --- Login Logic ---

loginForm.addEventListener('submit', (e) => {
    e.preventDefault();
    if (!isLoginMode) return; // safeguard

    const phone = loginPhoneInput.value.trim();
    const password = loginPassInput.value.trim();

    const users = JSON.parse(localStorage.getItem('al_vault_users') || '{}');
    
    if (!users[phone]) {
        alert("Account not found. Please register first.");
        return;
    }

    if (users[phone].password !== password) {
        alert("Incorrect password. Please try again.");
        return;
    }

    // Login successful
    currentUser = { phone: phone };
    localStorage.setItem('al_vault_user', JSON.stringify(currentUser));
    
    // Clear form
    loginForm.reset();
    
    showApp();
});

// --- Logout Logic ---

btnLogout.addEventListener('click', () => {
    if (confirm("Are you sure you want to log out?")) {
        localStorage.removeItem('al_vault_user');
        currentUser = null;
        showAuth();
    }
});

// Run Init
document.addEventListener('DOMContentLoaded', initAuth);
