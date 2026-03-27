// State
let videos = JSON.parse(localStorage.getItem('al_portal_videos')) || [];
let appUsers = JSON.parse(localStorage.getItem('al_users')) || [];
let currentSubject = 'all';
let isLoggedIn = localStorage.getItem('al_portal_auth') === 'true';
let currentTheme = localStorage.getItem('al_portal_theme') || 'dark';
let tempLoginUser = null; // Used during the 2-step verification

// DOM Elements
const authOverlay = document.getElementById('authOverlay');
const appContainer = document.getElementById('appContainer');

// Forms & Auth
const loginForm = document.getElementById('loginForm');
const registerForm = document.getElementById('registerForm');
const verifyForm = document.getElementById('verifyForm');
const forgotForm = document.getElementById('forgotForm');
const authTitle = document.getElementById('authTitle');
const authDesc = document.getElementById('authDesc');

const showRegisterBtn = document.getElementById('showRegisterBtn');
const showLoginBtn = document.getElementById('showLoginBtn');
const backToLoginBtn = document.getElementById('backToLoginBtn');
const showForgotBtn = document.getElementById('showForgotBtn');
const backToLoginFromForgotBtn = document.getElementById('backToLoginFromForgotBtn');

const themeToggleBtn = document.getElementById('themeToggleBtn');
const logoutBtn = document.getElementById('logoutBtn');

const videoGrid = document.getElementById('videoGrid');
const navLinks = document.querySelectorAll('.nav-links li');
const pageTitle = document.getElementById('page-title');

// Modals
const addModal = document.getElementById('addModal');
const playerModal = document.getElementById('playerModal');
const openModalBtn = document.getElementById('openModalBtn');
const closeAddModalBtn = document.getElementById('closeModalBtn');
const closePlayerBtn = document.getElementById('closePlayerBtn');

// Add Video Form Inputs
const addVideoForm = document.getElementById('addVideoForm');
const videoSubject = document.getElementById('videoSubject');
const videoTitle = document.getElementById('videoTitle');
const videoUrl = document.getElementById('videoUrl');

// Player
const youtubePlayer = document.getElementById('youtubePlayer');
const playerTitle = document.getElementById('playerTitle');

// Subject Configurations
const subjectsInfo = {
    all: { name: 'සියලුම පාඩම්', badge: 'All', key: 'all' },
    geography: { name: 'භූගෝල විද්‍යාව', badge: 'Geography', key: 'geography' },
    media: { name: 'සන්නිවේදනය', badge: 'Media', key: 'media' },
    sinhala: { name: 'සිංහල', badge: 'Sinhala', key: 'sinhala' }
};

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    initTheme();
    checkAuth();
    if (isLoggedIn) {
        renderVideos();
    }
    setupEventListeners();
});

// Theme Initialization
function initTheme() {
    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();
}

// Authentication Check
function checkAuth() {
    if (isLoggedIn) {
        authOverlay.classList.add('hidden');
        setTimeout(() => {
            authOverlay.style.display = 'none';
            appContainer.style.display = 'flex';
        }, 500);
    } else {
        appContainer.style.display = 'none';
        authOverlay.style.display = 'flex';
        authOverlay.classList.remove('hidden');
    }
}

// Setup Event Listeners
function setupEventListeners() {
    // ---- Auth View Toggles ----
    function showLoginForm() {
        loginForm.classList.remove('hidden');
        registerForm.classList.add('hidden');
        verifyForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        authTitle.textContent = 'Welcome Back';
        authDesc.textContent = 'Please enter your details to login.';
    }

    function showRegisterForm() {
        loginForm.classList.add('hidden');
        registerForm.classList.remove('hidden');
        verifyForm.classList.add('hidden');
        forgotForm.classList.add('hidden');
        authTitle.textContent = 'Create Account';
        authDesc.textContent = 'Sign up to access the study portal.';
    }

    function showVerifyForm() {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        verifyForm.classList.remove('hidden');
        forgotForm.classList.add('hidden');
        authTitle.textContent = 'Verify Account';
        authDesc.textContent = 'Please verify your phone number to continue.';
    }

    function showForgotForm() {
        loginForm.classList.add('hidden');
        registerForm.classList.add('hidden');
        verifyForm.classList.add('hidden');
        forgotForm.classList.remove('hidden');
        authTitle.textContent = 'Reset Password';
        authDesc.textContent = 'Enter your details to create a new password.';
    }

    showRegisterBtn.addEventListener('click', showRegisterForm);
    showLoginBtn.addEventListener('click', showLoginForm);
    backToLoginBtn.addEventListener('click', showLoginForm);
    showForgotBtn.addEventListener('click', showForgotForm);
    backToLoginFromForgotBtn.addEventListener('click', showLoginForm);

    // ---- Register Submit ----
    registerForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('regUsername').value.trim();
        const phone = document.getElementById('regPhone').value.trim();
        const pass = document.getElementById('regPassword').value.trim();

        if (appUsers.find(u => u.username === user)) {
            showToast('Username already exists!', 'error');
            return;
        }

        appUsers.push({ username: user, phone: phone, password: pass });
        localStorage.setItem('al_users', JSON.stringify(appUsers));
        
        showToast('Registration successful! You can now login.');
        registerForm.reset();
        showLoginForm();
    });

    // ---- Login Submit ----
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        const foundUser = appUsers.find(u => u.username === user && u.password === pass);

        if (foundUser) {
            tempLoginUser = foundUser;
            showVerifyForm();
        } else {
            showToast('Invalid username or password.', 'error');
        }
    });

    // ---- Verify Submit ----
    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone').value.trim();

        if (tempLoginUser && tempLoginUser.phone === phone) {
            localStorage.setItem('al_portal_auth', 'true');
            isLoggedIn = true;
            
            showToast('Verified & Logged in successfully!');
            checkAuth();
            renderVideos();
        } else {
            showToast('Incorrect phone number for this account.', 'error');
        }
    });

    // ---- Forgot Password Submit ----
    forgotForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('forgotUsername').value.trim();
        const phone = document.getElementById('forgotPhone').value.trim();
        const newPass = document.getElementById('forgotNewPassword').value.trim();

        const userIndex = appUsers.findIndex(u => u.username === user && u.phone === phone);

        if (userIndex !== -1) {
            appUsers[userIndex].password = newPass;
            localStorage.setItem('al_users', JSON.stringify(appUsers));
            
            showToast('Password reset successfully! Please login.');
            forgotForm.reset();
            showLoginForm();
        } else {
            showToast('No matching details found.', 'error');
        }
    });

    // ---- Theme Toggle ----
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('al_portal_theme', currentTheme);
        updateThemeIcon();
        showToast(currentTheme === 'light' ? 'Light Theme Activated' : 'Dark Theme Activated');
    });

    // ---- Logout ----
    logoutBtn.addEventListener('click', () => {
        if (confirm('Are you sure you want to logout?')) {
            localStorage.removeItem('al_portal_auth');
            isLoggedIn = false;
            tempLoginUser = null;
            
            // Reset forms
            loginForm.reset();
            verifyForm.reset();
            registerForm.reset();
            
            showLoginForm();
            checkAuth();
            showToast('Logged out successfully');
        }
    });

    // ---- Navigation ----
    navLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            navLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');
            currentSubject = link.dataset.subject;
            
            const info = subjectsInfo[currentSubject];
            pageTitle.innerHTML = `${info.name} <span class="badge">${info.badge}</span>`;
            
            renderVideos();
        });
    });

    // ---- Modal Actions ----
    openModalBtn.addEventListener('click', () => {
        addModal.classList.add('active');
        if (currentSubject !== 'all') {
            videoSubject.value = currentSubject;
        } else {
            videoSubject.value = "";
        }
    });

    closeAddModalBtn.addEventListener('click', () => {
        addModal.classList.remove('active');
        addVideoForm.reset();
    });

    closePlayerBtn.addEventListener('click', () => {
        playerModal.classList.remove('active');
        youtubePlayer.src = ''; // Stop playing when closed
    });

    // Close on overlay click
    window.addEventListener('click', (e) => {
        if (e.target === addModal) {
            addModal.classList.remove('active');
            addVideoForm.reset();
        }
        if (e.target === playerModal) {
            playerModal.classList.remove('active');
            youtubePlayer.src = '';
        }
    });

    // ---- Form Submit (Add Video) ----
    addVideoForm.addEventListener('submit', (e) => {
        e.preventDefault();

        const subject = videoSubject.value;
        const title = videoTitle.value;
        const url = videoUrl.value;

        const videoId = extractYouTubeID(url);

        if (!videoId) {
            showToast('Please enter a valid YouTube link', 'error');
            return;
        }

        const newVideo = {
            id: Date.now().toString(),
            subject,
            title,
            videoId,
            dateAdded: new Date().toISOString()
        };

        videos.push(newVideo);
        saveVideos();
        renderVideos();

        addModal.classList.remove('active');
        addVideoForm.reset();
        showToast('Video successfully added!');
    });
}

function updateThemeIcon() {
    const icon = themeToggleBtn.querySelector('i');
    if (currentTheme === 'light') {
        icon.className = 'bx bx-moon';
        themeToggleBtn.querySelector('span').textContent = 'Dark Theme';
    } else {
        icon.className = 'bx bx-sun';
        themeToggleBtn.querySelector('span').textContent = 'Light Theme';
    }
}

// Extract YouTube Video ID
function extractYouTubeID(url) {
    const regExp = /(?:https?:\/\/)?(?:www\.)?(?:m\.)?(?:youtube\.com\/(?:[^\/\n\s]+\/\S+\/|(?:v|e(?:mbed)?)\/|\S*?[?&]v=|live\/|shorts\/)|youtu\.be\/)([a-zA-Z0-9_-]{11})/;
    const match = url.match(regExp);
    return (match && match[1]) ? match[1] : false;
}

// Render Videos
function renderVideos() {
    videoGrid.innerHTML = '';

    let filteredVideos = videos;
    if (currentSubject !== 'all') {
        filteredVideos = videos.filter(v => v.subject === currentSubject);
    }

    // Sort by date added (newest first)
    filteredVideos.sort((a, b) => new Date(b.dateAdded) - new Date(a.dateAdded));

    if (filteredVideos.length === 0) {
        videoGrid.innerHTML = `
            <div class="empty-state">
                <i class='bx bx-video-off'></i>
                <p>No videos have been added for this subject yet.</p>
                <p style="font-size:0.9rem; margin-top:0.5rem; opacity:0.7">Use the button above to add a new video.</p>
            </div>
        `;
        return;
    }

    filteredVideos.forEach(video => {
        const card = document.createElement('div');
        card.className = 'video-card glass-panel';

        const subjectClass = 'subject-' + video.subject;
        const subjectName = subjectsInfo[video.subject].name.split(' (')[0];

        const thumbnailImg = 'https://img.youtube.com/vi/' + video.videoId + '/hqdefault.jpg';

        card.innerHTML = `
            <div class="thumbnail-wrapper" onclick="playVideo('${video.id}')">
                <img src="${thumbnailImg}" alt="${video.title}" class="thumbnail">
                <div class="play-overlay">
                    <i class='bx bx-play-circle'></i>
                </div>
            </div>
            <div class="card-content">
                <span class="subject-badge ${subjectClass}">${subjectName}</span>
                <h3 class="video-title" onclick="playVideo('${video.id}')">${video.title}</h3>
                <div class="card-actions">
                    <button class="delete-btn" onclick="deleteVideo('${video.id}', event)" title="Delete Video">
                        <i class='bx bx-trash'></i>
                    </button>
                </div>
            </div>
        `;

        videoGrid.appendChild(card);
    });
}

// Play Video
window.playVideo = function (id) {
    const video = videos.find(v => v.id === id);
    if (!video) return;

    playerTitle.textContent = video.title;
    youtubePlayer.src = 'https://www.youtube.com/embed/' + video.videoId + '?autoplay=1';
    playerModal.classList.add('active');
};

// Delete Video
window.deleteVideo = function (id, event) {
    if (event) event.stopPropagation();

    if (confirm('Are you sure you want to delete this video?')) {
        videos = videos.filter(v => v.id !== id);
        saveVideos();
        renderVideos();
        showToast('Video deleted', 'error');
    }
};

// Save to LocalStorage
function saveVideos() {
    localStorage.setItem('al_portal_videos', JSON.stringify(videos));
}

// Toast Notification System
function showToast(message, type = 'success') {
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = 'toast';

    let icon = "<i class='bx bx-check-circle'></i>";
    if (type === 'error') {
        icon = "<i class='bx bx-error-circle' style='color: var(--danger-color)'></i>";
        toast.style.borderLeftColor = 'var(--danger-color)';
    }

    toast.innerHTML = icon + ' <span>' + message + '</span>';
    document.body.appendChild(toast);

    setTimeout(() => toast.classList.add('show'), 100);

    setTimeout(() => {
        toast.classList.remove('show');
        setTimeout(() => toast.remove(), 400);
    }, 3000);
}
