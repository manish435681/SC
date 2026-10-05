let goToSlide;

document.addEventListener('DOMContentLoaded', () => {
    // Change to 'let' so we can update them after filtering
    let slides = document.querySelectorAll('.slide');
    let totalSlides = slides.length;
    let currentIdx = 0;
    
    // UI Elements
    const counterEl = document.getElementById('counter');
    const railToc = document.getElementById('rail-toc');
    const progressBar = document.getElementById('progressBar');
    const menuToggle = document.getElementById('menu-toggle');
    const coverSlides = [];

    // ==========================================
    // 1. Build Dynamic Sidebar Index Function (Numbers Removed)
    // ==========================================
    function buildSidebar() {
        railToc.innerHTML = ''; // Clear existing buttons
        coverSlides.length = 0; // Clear array
        
        slides.forEach((slide, index) => {
            const sidebarTitle = slide.getAttribute('data-sidebar');
            if (sidebarTitle) {
                coverSlides.push({ index, title: sidebarTitle });
                
                const btn = document.createElement('button');
                btn.className = 'rail-item';
                btn.dataset.targetIndex = index;
                
                // Only render the label, omitting the <span class="idx"> completely
                btn.innerHTML = `<span class="label">${sidebarTitle}</span>`;
                
                btn.addEventListener('click', () => {
                    changeSlide(index);
                    if (window.innerWidth <= 860) {
                        document.body.classList.remove('rail-toggled');
                    }
                });
                
                railToc.appendChild(btn);
            }
        });
    }

    // Build sidebar initially for "Load All"
    buildSidebar();

    // ==========================================
    // 2. Interactive Startup Prompt Logic (Bulletproof ID matching)
    // ==========================================
    // Checks for both "mod-" and "ngn-" prefixes to ensure it connects to your HTML
    const overlay = document.getElementById('mod-prompt-overlay') || document.getElementById('ngn-prompt-overlay');
    const inputField = document.getElementById('mod-input-field') || document.getElementById('ngn-input-field');
    const loadBtn = document.getElementById('mod-load-btn') || document.getElementById('ngn-load-btn');
    const loadAllBtn = document.getElementById('mod-load-all-btn') || document.getElementById('ngn-load-all-btn');

    function initializeLectureFilter(filterText) {
        if (filterText && filterText.trim() !== "") {
            const requestedNgns = filterText.split(',').map(n => n.trim().padStart(2, '0'));
            let currentNgnTag = "";
            
            slides.forEach((slide) => {
                const sidebarTitle = slide.getAttribute('data-sidebar');
                
                // 1. Identify the Thank You slide based on its attributes
                const isThankYouSlide = (sidebarTitle === 'End of Slides' || slide.getAttribute('data-title') === 'Thank You');

                // 2. Extract the number from titles like "SC-01"
                if (sidebarTitle && !isThankYouSlide) {
                    const match = sidebarTitle.match(/SC-(\d+)/i) || sidebarTitle.match(/\d+/);
                    if (match) {
                        const numStr = match[1] || match[0];
                        currentNgnTag = numStr.padStart(2, '0');
                    }
                }
                
                // 3. Remove the slide ONLY if it's unrequested AND not the Thank You slide
                if (!requestedNgns.includes(currentNgnTag) && !isThankYouSlide) {
                    slide.remove(); 
                }
            });

            // Re-calculate the remaining slides
            slides = document.querySelectorAll('.slide');
            totalSlides = slides.length;
            currentIdx = 0;

            // Rebuild sidebar and reset UI
            buildSidebar();
            slides.forEach(s => s.classList.remove('active'));
            if (slides.length > 0) slides[0].classList.add('active');
            updateUI();
        }
        
        // Hide the prompt box
        if (overlay) overlay.style.display = 'none';
    }

    // Button Listeners
    if (loadBtn) {
        loadBtn.addEventListener('click', () => {
            initializeLectureFilter(inputField.value);
        });
    }

    if (loadAllBtn) {
        loadAllBtn.addEventListener('click', () => {
            if (overlay) overlay.style.display = 'none';
        });
    }

    if (inputField) {
        inputField.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') {
                initializeLectureFilter(inputField.value);
            }
        });
    }








    

    // ==========================================
    // 5. Image Zoom / Lightbox Functionality
    // ==========================================
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    const closeBtn = document.querySelector('.lightbox-close');
    
    if (lightbox && lightboxImg) {
        // Catches both square and landscape image classes
        const zoomableImages = document.querySelectorAll('.switch-img img, .switch-img-landscape img');

        zoomableImages.forEach(img => {
            img.addEventListener('click', function() {
                lightbox.style.display = 'flex';
                // Small delay to allow display:flex to apply before adding opacity class
                setTimeout(() => {
                    lightbox.classList.add('active');
                }, 10);
                lightboxImg.src = this.src;
            });
        });

        // Function to close the lightbox
        function closeLightbox() {
            lightbox.classList.remove('active');
            setTimeout(() => {
                lightbox.style.display = 'none';
                lightboxImg.src = '';
            }, 300); // Matches the CSS transition time
        }

        // Close when clicking the 'X'
        if (closeBtn) closeBtn.addEventListener('click', closeLightbox);

        // Close when clicking anywhere on the dark background or the image itself
        lightbox.addEventListener('click', closeLightbox);

        // Close when pressing the 'Escape' key
        document.addEventListener('keydown', function(e) {
            if (e.key === 'Escape' && lightbox.classList.contains('active')) {
                closeLightbox();
            }
        });
    }

    // ==========================================
    // 2. Navigation & UI Updates
    // ==========================================
    function updateUI() {
        if (counterEl) {
            const current = String(currentIdx + 1).padStart(2, '0');
            const total = String(totalSlides).padStart(2, '0');
            counterEl.textContent = `${current}/${total} slides`;
        }
        
        if (progressBar) {
            const pct = ((currentIdx + 1) / totalSlides) * 100;
            progressBar.style.width = `${pct}%`;
        }

        // Highlight the correct Sidebar item based on current slide
        let activeCoverIndex = coverSlides[0] ? coverSlides[0].index : 0;
        for (let i = 0; i < coverSlides.length; i++) {
            if (currentIdx >= coverSlides[i].index) {
                activeCoverIndex = coverSlides[i].index;
            }
        }

        const tocItems = railToc.querySelectorAll('.rail-item');
        tocItems.forEach(item => {
            if (parseInt(item.dataset.targetIndex) === activeCoverIndex) {
                item.classList.add('current');
            } else {
                item.classList.remove('current');
            }
        });
    }

    goToSlide = function(index) {
        changeSlide(index);
    };

    function changeSlide(index) {
        if (index < 0 || index >= totalSlides) return;
        slides[currentIdx].classList.remove('active');
        currentIdx = index;
        slides[currentIdx].classList.add('active');
        updateUI();
    }

    if(slides.length > 0) {
        slides[currentIdx].classList.add('active');
        updateUI();
    }

    // ==========================================
    // 3. Dynamic Color Theming for MOD Badges
    // ==========================================
    const themes = [
        { bg: "#e8eef7", fg: "#1f4e8c" }
    ];

    document.querySelectorAll(".mod-badge").forEach(badge => {
        const randomTheme = themes[Math.floor(Math.random() * themes.length)];
        badge.style.background = randomTheme.bg;
        badge.style.color = randomTheme.fg;
    });

    // ==========================================
    // 4. Sidebar Mobile Toggle & Controls
    // ==========================================
    if (menuToggle) {
        menuToggle.addEventListener('click', () => {
            document.body.classList.toggle('rail-toggled');
        });
    }

    const deck = document.getElementById('deck');
    let touchstartX = 0;
    let touchstartY = 0;
    let touchendX = 0;
    let touchendY = 0;
    const swipeThreshold = 50; 
    const maxVerticalDeviation = 30; // Prevents triggering when scrolling vertically

    // Touch Swiping (Strict Horizontal)
    deck.addEventListener('touchstart', (e) => {
        touchstartX = e.changedTouches[0].screenX;
        touchstartY = e.changedTouches[0].screenY;
    }, { passive: true });

    deck.addEventListener('touchend', (e) => {
        touchendX = e.changedTouches[0].screenX;
        touchendY = e.changedTouches[0].screenY;
        
        const deltaX = touchendX - touchstartX;
        const deltaY = touchendY - touchstartY;

        const isHorizontalLongEnough = Math.abs(deltaX) >= swipeThreshold;
        const isStrictlyHorizontal = Math.abs(deltaY) <= maxVerticalDeviation;

        if (isHorizontalLongEnough && isStrictlyHorizontal) {
            if (deltaX < 0) {
                changeSlide(currentIdx + 1); // Swiped Left -> Next
            } else {
                changeSlide(currentIdx - 1); // Swiped Right -> Prev
            }
        }
    });






// ==========================================
// Dynamic Color Theming for Safety Circular Badges (Dynamic Safe)
// ==========================================
(function() {
    const themes = [
        { bg: "#DCE6EC", fg: "#1E3A5F" }, // Deep Navy
        { bg: "#FCE8D5", fg: "#96521A" }, // Deep Amber
        { bg: "#D8EAE1", fg: "#1F5938" }, // Deep Forest Green
        { bg: "#FADBD8", fg: "#8B261E" }, // Deep Crimson
        { bg: "#E5E1F4", fg: "#3F3275" }, // Deep Purple
        { bg: "#D5E8F7", fg: "#1B4F72" }  // Deep Ocean Blue
    ];

    function applyThemes() {
        document.querySelectorAll(".sc-badge").forEach(badge => {
            // Prevent applying multiple times to the same badge if already themed
            if (!badge.dataset.themed) {
                const randomTheme = themes[Math.floor(Math.random() * themes.length)];
                badge.style.background = randomTheme.bg;
                badge.style.color = randomTheme.fg;
                badge.dataset.themed = "true";
            }
        });
    }

    // Run on initial load
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', applyThemes);
    } else {
        applyThemes();
    }

    // Watch for dynamically loaded slides/elements
    const observer = new MutationObserver((mutations) => {
        applyThemes();
    });

    observer.observe(document.body, {
        childList: true,
        subtree: true
    });
})();








// --- Lightbox Click-to-Zoom Functionality ---
document.addEventListener('click', function (event) {
  // Check if the clicked element has the zoomable class
  if (event.target.classList.contains('zoomable-img')) {
    const lightbox = document.getElementById('lightbox');
    const lightboxImg = document.getElementById('lightbox-img');
    
    if (lightbox && lightboxImg) {
      lightbox.style.display = 'block';
      lightboxImg.src = event.target.src;
    }
  }
  
  // Close lightbox when clicking the close button or outside the image
  if (event.target.id === 'lightbox' || event.target.classList.contains('lightbox-close')) {
    const lightbox = document.getElementById('lightbox');
    if (lightbox) {
      lightbox.style.display = 'none';
    }
  }
});







    // 10% Edge Clicking for Navigation
    deck.addEventListener('click', (e) => {
        // Prevent slide navigation when clicking on images or buttons
        if (e.target.tagName.toLowerCase() === 'img' || e.target.closest('button') || e.target.closest('.rail-item')) {
            return;
        }

        const clickX = e.clientX;
        const screenWidth = window.innerWidth;

        // Triggers only if clicked in the far left 10% or far right 10% of the screen
        if (clickX < screenWidth * 0.10) {
            changeSlide(currentIdx - 1); // Clicked in the left 10%
        } else if (clickX > screenWidth * 0.90) {
            changeSlide(currentIdx + 1); // Clicked in the right 10%
        }
    });

    // Keyboard controls (Arrow keys + 'i' toggle)
    document.addEventListener('keydown', (e) => {
        if (e.key === 'ArrowRight' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'PageDown') {
            e.preventDefault(); changeSlide(currentIdx + 1);
        } else if (e.key === 'ArrowLeft' || e.key === 'ArrowUp' || e.key === 'PageUp') {
            e.preventDefault(); changeSlide(currentIdx - 1);
        } else if (e.key === 'Home') {
            e.preventDefault(); changeSlide(0);
        } else if (e.key === 'End') {
            e.preventDefault(); changeSlide(totalSlides - 1);
        } else if (e.key.toLowerCase() === 'i') {
            e.preventDefault(); 
            document.body.classList.toggle('rail-toggled'); // Toggles the index sidebar
        }
    });

    // Highlight cursor halo
    const cursorHalo = document.getElementById('cursor-halo');
    if (cursorHalo) {
        document.addEventListener('mousemove', (e) => {
            cursorHalo.style.setProperty('--mouse-x', `${e.clientX}px`);
            cursorHalo.style.setProperty('--mouse-y', `${e.clientY}px`);
        });
    }
});