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
    
    // Update apps
    const websites = document.querySelectorAll('.website');
    websites.forEach((website, index) => {
        if (trans.apps[index]) {
            const app = trans.apps[index];
            website.querySelector('.site-name').textContent = app.name;
            website.querySelector('.badge').textContent = app.badge;
            website.querySelector('.visit-button').childNodes[2].textContent = ` ${app.visit}`;
        }
    });
    
    // Update descriptions
    const descriptions = document.querySelectorAll('.description-content');
    descriptions.forEach((desc, index) => {
        if (trans.apps[index]) {
            const app = trans.apps[index];
            desc.querySelector('.description-title').textContent = app.name;
            desc.querySelector('.description-badge').textContent = app.badge;
            desc.querySelector('.description-text').textContent = app.description;
            desc.querySelector('.visit-button').childNodes[2].textContent = ` ${app.visit}`;
        }
    });
    
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
window.addEventListener('click', function(event) {
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

// Theme switching functionality
function toggleTheme() {
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
    
    // Update toggle button title and ARIA attributes
    const toggleButton = document.querySelector('.toggle-switch');
    const isDark = newTheme === 'dark';
    toggleButton.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggleButton.setAttribute('aria-pressed', isDark);
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme-preference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Set initial toggle button title and ARIA attributes
    const toggleButton = document.querySelector('.toggle-switch');
    if (toggleButton) {
        const isDark = theme === 'dark';
        toggleButton.title = isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode';
        toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        toggleButton.setAttribute('aria-pressed', isDark);
    }
}

// Load saved language preference
async function loadLanguagePreference() {
    const savedLang = localStorage.getItem('language-preference');
    if (savedLang && savedLang !== 'en') {
        await changeLanguage(savedLang);
    }
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

document.addEventListener('DOMContentLoaded', () => {
    preloadFooterImages();
    loadThemePreference();
    loadLanguagePreference();
    loadFooterLanguagePreference();
    showDescription(0);
    initKeyboardNavigation();
});
