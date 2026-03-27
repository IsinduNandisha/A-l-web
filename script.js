// State
let videos = JSON.parse(localStorage.getItem('al_portal_videos')) || [];
let currentSubject = 'all';
let isLoggedIn = localStorage.getItem('al_portal_auth') === 'true';
let currentTheme = localStorage.getItem('al_portal_theme') || 'dark';

// DOM Elements
const authOverlay = document.getElementById('authOverlay');
const appContainer = document.getElementById('appContainer');
const loginForm = document.getElementById('loginForm');
const verifyForm = document.getElementById('verifyForm');
const authTitle = document.getElementById('authTitle');
const authDesc = document.getElementById('authDesc');

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

// Form
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
    // ---- Auth Listeners ----
    loginForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const user = document.getElementById('username').value.trim();
        const pass = document.getElementById('password').value.trim();

        if (user && pass) {
            loginForm.classList.add('hidden');
            verifyForm.classList.remove('hidden');
            authTitle.textContent = 'ගිණුම තහවුරු කරන්න';
            authDesc.textContent = 'ඔබගේ දුරකථන අංකය ලබා දී ගිණුම තහවුරු (Verify) කරන්න.';
        }
    });

    verifyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const phone = document.getElementById('phone').value.trim();

        // Simple 10-digit validation
        if (phone.length === 10 && /^\d+$/.test(phone)) {
            localStorage.setItem('al_portal_auth', 'true');
            isLoggedIn = true;

            showToast('සාර්ථකව තහවුරු කෙරිණි (Verified successfully!)');
            checkAuth();
            renderVideos();
        } else {
            showToast('කරුණාකර නිවැරදි දුරකථන අංකයක් ඇතුළත් කරන්න', 'error');
        }
    });

    // ---- Theme Toggle ----
    themeToggleBtn.addEventListener('click', () => {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        localStorage.setItem('al_portal_theme', currentTheme);
        updateThemeIcon();
        showToast(currentTheme === 'light' ? 'Light Theme සක්‍රියයි' : 'Dark Theme සක්‍රියයි');
    });

    // ---- Logout ----
    logoutBtn.addEventListener('click', () => {
        if (confirm('ඔබට ගිණුමෙන් ඉවත් වීමට අවශ්‍යද? (Are you sure you want to logout?)')) {
            localStorage.removeItem('al_portal_auth');
            isLoggedIn = false;

            // Reset forms
            loginForm.reset();
            verifyForm.reset();
            verifyForm.classList.add('hidden');
            loginForm.classList.remove('hidden');
            authTitle.textContent = 'ඇතුල් වන්න (Login)';
            authDesc.textContent = 'කරුණාකර ඔබගේ විස්තර ලබා දෙන්න.';

            checkAuth();
            showToast('සාර්ථකව ඉවත් විය (Logged out)');
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
            showToast('කරුණාකර නිවැරදි YouTube ලින්ක් එකක් ලබා දෙන්න', 'error');
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
        showToast('වීඩියෝව සාර්ථකව එක් කරන ලදී (Video added!)');
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
                <p>මෙම විෂයට අදාළ වීඩියෝ කිසිවක් මෙතෙක් එක් කර නොමැත.</p>
                <p style="font-size:0.9rem; margin-top:0.5rem; opacity:0.7">නව වීඩියෝවක් එක් කිරීමට ඉහළ ඇති බොත්තම භාවිත කරන්න.</p>
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
                    <button class="delete-btn" onclick="deleteVideo('${video.id}', event)" title="ඉවත් කරන්න (Delete)">
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

    if (confirm('මෙම වීඩියෝව ඉවත් කිරීමට අවශ්‍ය බව ඔබට සහතිකද? (Delete video?)')) {
        videos = videos.filter(v => v.id !== id);
        saveVideos();
        renderVideos();
        showToast('වීඩියෝව ඉවත් කරන ලදී (Deleted)', 'error');
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
