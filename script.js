// ============================================
// List Item Expansion
// ============================================

function initListItems() {
    const listItems = document.querySelectorAll('.list-item');

    listItems.forEach((item, index) => {
        // Click handler
        item.addEventListener('click', (e) => {
            // Don't toggle if clicking the visit button
            if (e.target.closest('.detail-button')) {
                return;
            }
            
            // Don't toggle if user is selecting text
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) {
                return;
            }
            
            // Don't toggle if clicking directly on the description text area
            if (e.target.closest('.detail-description')) {
                return;
            }
            
            toggleListItem(item);
        });

        // Mousedown handler to allow text selection
        item.addEventListener('mousedown', (e) => {
            // Allow text selection in description area
            if (e.target.closest('.detail-description')) {
                e.stopPropagation();
            }
        });

        // Keyboard handler
        item.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleListItem(item);
            }
            // Arrow key navigation
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = item.nextElementSibling;
                if (next && next.classList.contains('list-item')) {
                    next.focus();
                }
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = item.previousElementSibling;
                if (prev && prev.classList.contains('list-item')) {
                    prev.focus();
                }
            }
        });
    });
}

function toggleListItem(item) {
    const isExpanded = item.classList.contains('expanded');

    // Close all other items
    document.querySelectorAll('.list-item.expanded').forEach(expandedItem => {
        if (expandedItem !== item) {
            expandedItem.classList.remove('expanded');
        }
    });

    // Toggle current item
    if (isExpanded) {
        item.classList.remove('expanded');
    } else {
        item.classList.add('expanded');
        // Smooth scroll to item if needed
        setTimeout(() => {
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 100);
    }
}

let currentIndex = 0;

function showDescription(index) {
    const descriptions = document.querySelectorAll('.description-content');
    descriptions.forEach(desc => {
        desc.classList.remove('active');
        desc.removeAttribute('aria-current');
    });
    descriptions[index].classList.add('active');
    descriptions[index].setAttribute('aria-current', 'page');
    currentIndex = index;
    updateNavInfo();
}

function updateNavInfo() {
    const current = document.getElementById('current-index');
    const totalElem = document.getElementById('total-count');
    const prevBtn = document.getElementById('prev-btn');
    const nextBtn = document.getElementById('next-btn');
    const descriptions = document.querySelectorAll('.description-content');
    totalElem.textContent = descriptions.length;
    current.textContent = currentIndex + 1;
    prevBtn.disabled = currentIndex === 0;
    nextBtn.disabled = currentIndex === descriptions.length - 1;

    // Update ARIA attributes
    prevBtn.setAttribute('aria-disabled', currentIndex === 0);
    nextBtn.setAttribute('aria-disabled', currentIndex === descriptions.length - 1);
}

document.getElementById('prev-btn').addEventListener('click', () => {
    if (currentIndex > 0) {
        showDescription(currentIndex - 1);
    }
});

document.getElementById('next-btn').addEventListener('click', () => {
    const total = document.querySelectorAll('.description-content').length;
    if (currentIndex < total - 1) {
        showDescription(currentIndex + 1);
    }
});

function toggleView(viewType) {
    const appGrid = document.getElementById('app-grid');
    appGrid.className = viewType + '-view';
}

function openAllWebsites() {
    const websites = document.querySelectorAll('.website');
    websites.forEach(website => {
        if (website.style.display !== 'none') {
            const link = website.querySelector('a.visit-button').href;
            window.open(link, '_blank');
        }
    });
}

function toggleLanguageMenu() {
    const dropdown = document.getElementById('language-dropdown');
    const button = document.querySelector('.language-button');
    const isExpanded = dropdown.classList.toggle('show');
    button.setAttribute('aria-expanded', isExpanded);
}

let currentLanguage = 'en';
let translations = {};

// Load translation file
async function loadTranslation(langCode) {
    try {
        // Try relative path first
        let response = await fetch(`languages/${langCode}.json`);

        // If that fails, try absolute path from root
        if (!response.ok) {
            response = await fetch(`/languages/${langCode}.json`);
        }

        if (!response.ok) {
            throw new Error(`Translation not found: ${langCode}`);
        }

        return await response.json();
    } catch (error) {
        console.error('Error loading translation:', error);
        alert(`Unable to load ${langCode} translation. Please make sure you're running this from a web server, or the translation files are in the correct location.`);
        return null;
    }
}

// Apply translations to the page
function applyTranslation(trans) {
    // Update document language and direction
    document.documentElement.lang = trans.lang;
    document.body.dir = trans.direction;

    // Update header
    document.querySelector('.toggle-switch').title = trans.header.toggleTheme;
    document.querySelectorAll('.header-button span')[0].textContent = trans.header.appsButton;
    document.querySelectorAll('.header-button span')[1].textContent = trans.header.launchAllButton;
    document.querySelector('.language-button span').textContent = trans.header.languageButton;

    // Update section title (preserve heart icon)
    const sectionTitleText = document.querySelector('.section-title-text');
    if (sectionTitleText) {
        sectionTitleText.textContent = trans.sectionTitle;
    }

    // Update apps (Grid View)
    const websites = document.querySelectorAll('.website');
    websites.forEach((website, index) => {
        if (trans.apps[index]) {
            const app = trans.apps[index];
            website.querySelector('.site-name').textContent = app.name;
            website.querySelector('.badge').textContent = app.badge;
            
            // Update visit button - remove extra text, keep only icon and translated "Visit"
            const visitBtn = website.querySelector('.visit-button');
            if (visitBtn) {
                visitBtn.innerHTML = `<i class="fas fa-external-link-alt" aria-hidden="true"></i> ${app.visit}`;
            }
        }
    });

    // Update descriptions (Carousel View)
    const descriptions = document.querySelectorAll('.description-content');
    descriptions.forEach((desc, index) => {
        if (trans.apps[index]) {
            const app = trans.apps[index];
            desc.querySelector('.description-title').textContent = app.name;
            desc.querySelector('.description-badge').textContent = app.badge;
            desc.querySelector('.description-text').textContent = app.description;
            
            // Update visit button - remove extra text, keep only icon and translated "Visit"
            const visitBtn = desc.querySelector('.visit-button');
            if (visitBtn) {
                visitBtn.innerHTML = `<i class="fas fa-external-link-alt" aria-hidden="true"></i> ${app.visit}`;
            }
        }
    });

    // Update list view elements (for list design)
    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach((item) => {
        const index = parseInt(item.getAttribute('data-index'));
        if (trans.apps[index]) {
            const app = trans.apps[index];

            // Update list title
            const listTitle = item.querySelector('.list-title');
            if (listTitle) {
                listTitle.textContent = app.name;
            }

            // Update list subtitle
            const listSubtitle = item.querySelector('.list-subtitle');
            if (listSubtitle && app.subtitle) {
                listSubtitle.textContent = app.subtitle;
            }

            // Update detail description
            const detailDesc = item.querySelector('.detail-description');
            if (detailDesc) {
                detailDesc.textContent = app.description;
            }

            // Update detail button - remove extra text, keep only SVG and translated "Visit"
            const detailButton = item.querySelector('.detail-button');
            if (detailButton) {
                const svg = detailButton.querySelector('svg');
                if (svg) {
                    detailButton.innerHTML = '';
                    detailButton.appendChild(svg);
                    detailButton.appendChild(document.createTextNode(app.visit));
                }
            }
        }
    });

    // Update category headers (list section headers)
    if (trans.categories) {
        const listSections = document.querySelectorAll('.list-section');
        listSections.forEach((section) => {
            const header = section.querySelector('.list-section-header');
            const firstItem = section.querySelector('.list-item');
            if (header && firstItem) {
                const category = firstItem.getAttribute('data-category');
                if (category && trans.categories[category]) {
                    header.textContent = trans.categories[category];
                }
            }
        });
    }

    // Update footer
    const footerSections = document.querySelectorAll('.footer-section');
    footerSections[0].querySelector('.footer-title').textContent = trans.footer.aboutTitle;
    footerSections[0].querySelector('p:not(.footer-title)').textContent = trans.footer.aboutText;
    footerSections[1].querySelector('.footer-title').textContent = trans.footer.createdWithTitle;
    footerSections[2].querySelector('.footer-title').textContent = trans.footer.developerTitle;
    document.querySelector('.copyright p').textContent = trans.footer.copyright;

    // Apply RTL/LTR specific styling
    if (trans.direction === 'rtl') {
        document.body.classList.add('rtl-mode');
    } else {
        document.body.classList.remove('rtl-mode');
    }
}

// Update active language in dropdown
function updateActiveLanguage(langCode) {
    // Remove active class from all language options
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
    });

    // Add active class to selected language
    const languageMap = {
        'ar': 'Arabic',
        'he': 'Hebrew',
        'ku': 'Kurdish',
        'tr': 'Turkish',
        'hy': 'Armenian',
        'ka': 'Georgian'
    };

    if (langCode !== 'en' && languageMap[langCode]) {
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.textContent.trim() === languageMap[langCode]) {
                option.classList.add('active');
            }
        });
    }
}

// Change language without page reload
async function changeLanguage(langCode) {
    console.log('Language changed to:', langCode);

    // Close dropdown
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) {
        dropdown.classList.remove('show');
    }

    // Load and apply translation
    const trans = await loadTranslation(langCode);
    if (trans) {
        translations[langCode] = trans;
        currentLanguage = langCode;
        applyTranslation(trans);

        // Update active language indicator
        updateActiveLanguage(langCode);

        // Save language preference
        localStorage.setItem('language-preference', langCode);
    }
}

// Close dropdown when clicking outside
window.addEventListener('click', function (event) {
    if (!event.target.matches('.language-button') && !event.target.closest('.language-button')) {
        const dropdown = document.getElementById('language-dropdown');
        const button = document.querySelector('.language-button');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            if (button) {
                button.setAttribute('aria-expanded', 'false');
            }
        }
    }
});

// Settings Panel Functions
function toggleSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    const button = document.querySelector('.settings-button');

    const isActive = panel.classList.contains('active');

    if (isActive) {
        closeSettingsPanel();
    } else {
        panel.classList.add('active');
        overlay.classList.add('active');
        if (button) {
            button.setAttribute('aria-expanded', 'true');
        }
        // Prevent body scroll and compensate for scrollbar width
        const scrollbarWidth = window.innerWidth - document.documentElement.clientWidth;
        document.body.style.overflow = 'hidden';
        document.body.style.paddingRight = scrollbarWidth + 'px';
    }
}

function closeSettingsPanel() {
    const panel = document.getElementById('settings-panel');
    const overlay = document.getElementById('settings-overlay');
    const button = document.querySelector('.settings-button');

    panel.classList.remove('active');
    overlay.classList.remove('active');
    if (button) {
        button.setAttribute('aria-expanded', 'false');
    }
    // Restore body scroll and remove padding
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

// Close settings panel when pressing Escape key
document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const panel = document.getElementById('settings-panel');
        if (panel && panel.classList.contains('active')) {
            closeSettingsPanel();
        }
    }
});

// Theme switching functionality
function toggleTheme(event) {
    // Prevent event from bubbling up
    if (event) {
        event.stopPropagation();
    }

    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
    }

    // Save preference to localStorage
    localStorage.setItem('theme-preference', newTheme);

    // Update ARIA attributes - specifically target the theme toggle button
    const toggleButton = document.querySelector('.setting-item:first-child .toggle-switch');
    const isDark = newTheme === 'dark';
    if (toggleButton) {
        toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        toggleButton.setAttribute('aria-pressed', isDark);
    }
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme-preference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;

    const theme = savedTheme || (prefersDark ? 'dark' : 'light');

    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }

    // Set initial ARIA attributes - specifically target the theme toggle button
    const toggleButton = document.querySelector('.setting-item:first-child .toggle-switch');
    if (toggleButton) {
        const isDark = theme === 'dark';
        toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        toggleButton.setAttribute('aria-pressed', isDark);
    }
}

// Icon switching functionality
function toggleIcon(event) {
    // Prevent event from bubbling up
    if (event) {
        event.stopPropagation();
    }

    const heartIcon = document.querySelector('.section-heart-icon');
    const currentIcon = heartIcon.getAttribute('src');
    const newIcon = currentIcon.includes('heart-pixel.png') ? 'icons/bow-tie.png' : 'icons/heart-pixel.png';

    heartIcon.setAttribute('src', newIcon);

    // Update size based on icon type
    if (newIcon.includes('bow-tie.png')) {
        heartIcon.style.width = '96px';
        heartIcon.style.height = '96px';
        heartIcon.style.cursor = 'default'; // Not clickable

        // Remove all color animation classes when switching to bow-tie
        const colorClasses = ['color-red', 'color-pink', 'color-purple', 'color-blue', 'color-black', 'color-rainbow'];
        colorClasses.forEach(cls => heartIcon.classList.remove(cls));
    } else {
        heartIcon.style.width = '48px';
        heartIcon.style.height = '48px';
        heartIcon.style.cursor = 'pointer'; // Clickable

        // Add red color class when switching back to heart
        heartIcon.classList.add('color-red');
    }

    // Update alt text
    const altText = newIcon.includes('heart-pixel.png') ? '' : '';
    heartIcon.setAttribute('alt', altText);

    // Save preference to localStorage
    localStorage.setItem('icon-preference', newIcon);

    // Update ARIA attributes
    const toggleButton = document.getElementById('icon-toggle');
    const isBowTie = newIcon.includes('bow-tie.png');
    toggleButton.setAttribute('aria-label', isBowTie ? 'Switch to heart icon' : 'Switch to bow-tie icon');
    toggleButton.setAttribute('aria-pressed', isBowTie);
}

// Load saved icon preference
function loadIconPreference() {
    const savedIcon = localStorage.getItem('icon-preference');
    const heartIcon = document.querySelector('.section-heart-icon');

    if (savedIcon && heartIcon) {
        heartIcon.setAttribute('src', savedIcon);

        // Set size based on icon type
        if (savedIcon.includes('bow-tie.png')) {
            heartIcon.style.width = '96px';
            heartIcon.style.height = '96px';
            heartIcon.style.cursor = 'default'; // Not clickable
        } else {
            heartIcon.style.width = '48px';
            heartIcon.style.height = '48px';
            heartIcon.style.cursor = 'pointer'; // Clickable
        }

        // Set initial ARIA attributes
        const toggleButton = document.getElementById('icon-toggle');
        if (toggleButton) {
            const isBowTie = savedIcon.includes('bow-tie.png');
            toggleButton.setAttribute('aria-label', isBowTie ? 'Switch to heart icon' : 'Switch to bow-tie icon');
            toggleButton.setAttribute('aria-pressed', isBowTie);
        }
    } else if (heartIcon) {
        // No saved preference, default to heart with pointer cursor
        heartIcon.style.cursor = 'pointer';
    }

    // Show the icon after loading (prevents flash)
    if (heartIcon) {
        heartIcon.style.opacity = '1';
    }
}

// Load saved language preference
async function loadLanguagePreference() {
    const savedLang = localStorage.getItem('language-preference');
    if (savedLang && savedLang !== 'en') {
        await changeLanguage(savedLang);
    }
}

// Design switching functionality (DISABLED - grid design removed)
function toggleDesign(event) {
    // Prevent event from bubbling up
    if (event) {
        event.stopPropagation();
    }

    // Design toggle disabled - grid design has been removed
    console.log('Design toggle is disabled');
}

// Load saved design preference (DISABLED - grid design removed)
function loadDesignPreference() {
    // Design preference loading disabled - grid design has been removed
    // Clear any saved design preference
    localStorage.removeItem('design-preference');
}

// Add keyboard navigation for application cards
function initKeyboardNavigation() {
    const websites = document.querySelectorAll('.website');
    websites.forEach((website, index) => {
        website.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                showDescription(index);
            }
        });
    });

    // Add keyboard navigation for language menu items
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });

    // Add keyboard navigation for RTL toggle button
    const rtlToggle = document.querySelector('.rtl-toggle-circle');
    if (rtlToggle) {
        rtlToggle.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                toggleFooterLanguage();
            }
        });
    }
}

// Toggle footer language (USA <-> Israel flag)
let isRtlFooter = false;

// Preload both flag images to prevent flash
function preloadFooterImages() {
    const usaFlag = new Image();
    const israelFlag = new Image();
    usaFlag.src = 'images/FlagofUSA.png';
    israelFlag.src = 'images/FlagofIsrael.png';
}

function toggleFooterLanguage() {
    const footer = document.querySelector('footer');
    const toggleCircle = document.querySelector('.rtl-toggle-circle');

    isRtlFooter = !isRtlFooter;

    if (isRtlFooter) {
        footer.classList.add('rtl-footer');
        toggleCircle.classList.add('active');
    } else {
        footer.classList.remove('rtl-footer');
        toggleCircle.classList.remove('active');
    }

    // Save preference
    localStorage.setItem('footer-language-preference', isRtlFooter ? 'rtl' : 'ltr');
}

// Load footer language preference
function loadFooterLanguagePreference() {
    const savedFooterLang = localStorage.getItem('footer-language-preference');
    if (savedFooterLang === 'rtl') {
        const footer = document.querySelector('footer');
        const toggleCircle = document.querySelector('.rtl-toggle-circle');
        if (footer && toggleCircle) {
            isRtlFooter = true;
            footer.classList.add('rtl-footer');
            toggleCircle.classList.add('active');
        }
    }
}

// Interactive heart with rainbow toggle (rainbow includes black)
function initInteractiveHeart() {
    const heart = document.querySelector('.section-heart-icon');
    if (!heart) return;

    const colors = ['color-red', 'color-pink', 'color-purple', 'color-blue', 'color-black', 'color-rainbow'];
    let isRainbow = false;

    // Heart click handler - toggle between red and rainbow (only for heart, not bow-tie)
    heart.addEventListener('click', (e) => {
        // Only allow clicking if it's the heart icon, not bow-tie
        const currentIcon = heart.getAttribute('src');
        if (currentIcon && currentIcon.includes('bow-tie.png')) {
            return; // Don't do anything if it's the bow-tie
        }

        // Remove all color classes
        colors.forEach(color => heart.classList.remove(color));

        if (!isRainbow) {
            // Start rainbow animation (includes black)
            heart.classList.add('color-rainbow');
            isRainbow = true;
        } else {
            // Return to red
            heart.classList.add('color-red');
            isRainbow = false;
        }
    });

    // Always start with red color (default)
    function loadHeartColor() {
        colors.forEach(color => heart.classList.remove(color));
        heart.classList.add('color-red'); // Always default to red
        isRainbow = false;
    }

    loadHeartColor();
}

document.addEventListener('DOMContentLoaded', () => {
    preloadFooterImages();
    loadThemePreference();
    loadIconPreference();
    loadDesignPreference();
    loadLanguagePreference();
    loadFooterLanguagePreference();
    showDescription(0);
    initListItems();
    initKeyboardNavigation();
    initInteractiveHeart();
});
