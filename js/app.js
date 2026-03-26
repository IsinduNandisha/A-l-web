// Helper function to extract YouTube Video ID from various URL formats
function getYouTubeId(url) {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return (match && match[2].length === 11) ? match[2] : null;
}

// Ensure CLASS_VIDEOS exists from data.js
const videos = typeof CLASS_VIDEOS !== 'undefined' ? CLASS_VIDEOS : [];

// Subject mapping for UI
const subjectMap = {
    'geography': { name: 'භූගෝල විද්‍යාව', class: 'badge-geography' },
    'media': { name: 'මාධ්‍යය', class: 'badge-media' },
    'sinhala': { name: 'සිංහල', class: 'badge-sinhala' }
};

// DOM Elements
const videoGrid = document.getElementById('videoGrid');
const filterBtns = document.querySelectorAll('.filter-btn');
const modal = document.getElementById('videoModal');
const closeModal = document.getElementById('closeModal');
const iframeContainer = document.getElementById('iframeContainer');
const modalTitle = document.getElementById('modalTitle');
const modalDate = document.getElementById('modalDate');
const modalBadge = document.getElementById('modalBadge');

// Initial Render
function renderVideos(filterSubject = 'all') {
    videoGrid.innerHTML = '';
    
    // Reverse array to show newest first
    const displayVideos = [...videos].reverse().filter(video => {
        if (filterSubject === 'all') return true;
        return video.subject === filterSubject;
    });

    if (displayVideos.length === 0) {
        videoGrid.innerHTML = `
            <div class="glass-panel" style="grid-column: 1 / -1; padding: 3rem; text-align: center; color: var(--text-secondary);">
                <i class="ph ph-video-camera-slash" style="font-size: 3rem; margin-bottom: 1rem;"></i>
                <p>දැනට වීඩියෝ කිසිවක් එක් කර නොමැත. (No videos added yet.)</p>
                <p style="font-size: 0.9rem; margin-top: 0.5rem; color: var(--accent);">
                    Developer: js/data.js ගොනුවට ගොස් නව වීඩියෝ link එක් කරන්න.
                </p>
            </div>
        `;
        return;
    }

    displayVideos.forEach((video, index) => {
        const videoId = getYouTubeId(video.url);
        const thumbnailUrl = videoId ? `https://img.youtube.com/vi/${videoId}/hqdefault.jpg` : 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?ixlib=rb-4.0.3&auto=format&fit=crop&w=1000&q=80';
        
        const subInfo = subjectMap[video.subject] || { name: video.subject, class: 'badge-geography' };

        const card = document.createElement('div');
        card.className = 'video-card glass-panel';
        card.style.animationDelay = `${index * 0.1}s`;
        card.innerHTML = `
            <div class="thumbnail-container">
                <img src="${thumbnailUrl}" alt="${video.title}" class="thumbnail" loading="lazy">
                <div class="play-icon-overlay">
                    <i class="ph-fill ph-play-circle"></i>
                </div>
            </div>
            <div class="card-content">
                <span class="subject-badge ${subInfo.class}">${subInfo.name}</span>
                <h3 class="card-title" title="${video.title}">${video.title}</h3>
                <div class="card-meta">
                    <i class="ph ph-calendar-blank"></i>
                    <span>${video.date}</span>
                </div>
            </div>
        `;
        
        card.addEventListener('click', () => openModal(video, videoId, subInfo));
        videoGrid.appendChild(card);
    });
}

// Modal Functions
function openModal(video, videoId, subInfo) {
    if (!videoId) {
        alert("Invalid YouTube Link. Please check data.js");
        return;
    }
    
    // Set Video
    iframeContainer.innerHTML = `<iframe src="https://www.youtube.com/embed/${videoId}?autoplay=1" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen></iframe>`;
    
    // Set Info
    modalTitle.textContent = video.title;
    modalDate.innerHTML = `<i class="ph ph-calendar-blank"></i> ${video.date}`;
    modalBadge.textContent = subInfo.name;
    modalBadge.className = `subject-badge ${subInfo.class}`;
    
    // Show Modal
    modal.classList.add('active');
    document.body.style.overflow = 'hidden'; // Prevent background scrolling
}

function closeVideoModal() {
    modal.classList.remove('active');
    document.body.style.overflow = '';
    // Stop video playback by removing iframe
    setTimeout(() => {
        iframeContainer.innerHTML = '';
    }, 300);
}

// Event Listeners
closeModal.addEventListener('click', closeVideoModal);

modal.addEventListener('click', (e) => {
    if (e.target === modal) {
        closeVideoModal();
    }
});

// ESC key to close modal
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modal.classList.contains('active')) {
        closeVideoModal();
    }
});

// Filtering Logic
filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
        // Remove active class from all
        filterBtns.forEach(b => b.classList.remove('active'));
        // Add to clicked
        btn.classList.add('active');
        // Filter
        const subject = btn.getAttribute('data-subject');
        renderVideos(subject);
    });
});

// Initialize App
document.addEventListener('DOMContentLoaded', () => {
    renderVideos('geography');
});
