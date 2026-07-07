// ===========================================
// Toast (replaces blocking alert() calls)
// ===========================================

let toastTimeout = null;

function showToast(message, duration = 4000) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.textContent = message;
    toast.classList.add('show');
    if (toastTimeout) clearTimeout(toastTimeout);
    toastTimeout = setTimeout(() => {
        toast.classList.remove('show');
    }, duration);
}

// ===========================================
// List Item Expansion
// ===========================================

function initListItems() {
    const listItems = document.querySelectorAll('.list-item');

    listItems.forEach((item, index) => {
        // Click handler
        item.addEventListener('click', (e) => {
            if (e.target.closest('.detail-button')) return;
            const selection = window.getSelection();
            if (selection && selection.toString().length > 0) return;
            if (e.target.closest('.detail-description')) return;
            toggleListItem(item);
        });

        // Mousedown handler to allow text selection
        item.addEventListener('mousedown', (e) => {
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
            if (e.key === 'ArrowDown') {
                e.preventDefault();
                const next = item.nextElementSibling;
                if (next && next.classList.contains('list-item')) next.focus();
            }
            if (e.key === 'ArrowUp') {
                e.preventDefault();
                const prev = item.previousElementSibling;
                if (prev && prev.classList.contains('list-item')) prev.focus();
            }
        });
    });
}

function toggleListItem(item) {
    const isExpanded = item.classList.contains('expanded');

    document.querySelectorAll('.list-item.expanded').forEach(expandedItem => {
        if (expandedItem !== item) {
            expandedItem.classList.remove('expanded');
            expandedItem.setAttribute('aria-expanded', 'false');
        }
    });

    if (isExpanded) {
        item.classList.remove('expanded');
        item.setAttribute('aria-expanded', 'false');
    } else {
        item.classList.add('expanded');
        item.setAttribute('aria-expanded', 'true');
        setTimeout(() => {
            item.scrollIntoView({
    behavior: 'smooth',
    block: 'start'
});
        }, 100);
    }
}

function openAllWebsites() {
    const links = document.querySelectorAll('.detail-button');
    let blockedCount = 0;
    links.forEach(link => {
        const opened = window.open(link.href, '_blank', 'noopener,noreferrer');
        if (!opened) blockedCount++;
    });
    if (blockedCount > 0) {
        showToast('Your browser blocked some pop-ups. Allow pop-ups for this site to open every app at once.');
    }
}

function toggleLanguageMenu() {
    const dropdown = document.getElementById('language-dropdown');
    const button = document.querySelector('.language-button');
    const isExpanded = dropdown.classList.toggle('show');
    button.setAttribute('aria-expanded', isExpanded);
}

let currentLanguage = 'en';
let translations = {};

async function loadTranslation(langCode) {
    try {
        let response = await fetch(`languages/${langCode}.json`);
        if (!response.ok) response = await fetch(`/languages/${langCode}.json`);
        if (!response.ok) throw new Error(`Translation not found: ${langCode}`);
        return await response.json();
    } catch (error) {
        console.error('Error loading translation:', error);
        showToast(`Couldn't load that language right now. Staying on the current language.`);
        return null;
    }
}

function applyTranslation(trans) {
    document.documentElement.lang = trans.lang;
    document.body.dir = trans.direction;

    document.querySelector('.toggle-switch').title = trans.header.toggleTheme;
    document.querySelector('.language-button span').textContent = trans.header.languageButton;

    const visitAllIconButton = document.querySelector('.visit-all-icon-button');
    if (visitAllIconButton) {
        visitAllIconButton.setAttribute('aria-label', trans.header.launchAllButton);
        visitAllIconButton.setAttribute('title', trans.header.launchAllButton);
    }

    const listItems = document.querySelectorAll('.list-item');
    listItems.forEach((item) => {
        const index = parseInt(item.getAttribute('data-index'));
        if (trans.apps[index]) {
            const app = trans.apps[index];
            const listTitle = item.querySelector('.list-title');
            if (listTitle) listTitle.textContent = app.name;
            const listSubtitle = item.querySelector('.list-subtitle');
            if (listSubtitle && app.subtitle) listSubtitle.textContent = app.subtitle;
            const detailDesc = item.querySelector('.detail-description');
            if (detailDesc) detailDesc.textContent = app.description;
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

    if (trans.categories) {
        const listSections = document.querySelectorAll('.list-section');
        listSections.forEach((section) => {
            const header = section.querySelector('.list-section-header');
            const firstItem = section.querySelector('.list-item');
            if (header && firstItem) {
                const category = firstItem.getAttribute('data-category');
                if (category && trans.categories[category]) header.textContent = trans.categories[category];
            }
        });
    }

    const footerSections = document.querySelectorAll('.footer-section');
    footerSections[0].querySelector('.footer-title').textContent = trans.footer.aboutTitle;
    footerSections[0].querySelector('p:not(.footer-title)').textContent = trans.footer.aboutText;
    footerSections[1].querySelector('.footer-title').textContent = trans.footer.createdWithTitle;
    footerSections[2].querySelector('.footer-title').textContent = trans.footer.developerTitle;
    document.querySelector('.copyright p').textContent = trans.footer.copyright;

    if (trans.direction === 'rtl') {
        document.body.classList.add('rtl-mode');
    } else {
        document.body.classList.remove('rtl-mode');
    }
}

function updateActiveLanguage(langCode) {
    document.querySelectorAll('.language-option').forEach(option => {
        option.classList.remove('active');
    });

    const languageMap = {
        'ar': 'Arabic', 'he': 'Hebrew', 'ku': 'Kurdish',
        'tr': 'Turkish', 'hy': 'Armenian', 'ka': 'Georgian'
    };

    if (langCode !== 'en' && languageMap[langCode]) {
        document.querySelectorAll('.language-option').forEach(option => {
            if (option.textContent.trim() === languageMap[langCode]) {
                option.classList.add('active');
            }
        });
    }
}

async function changeLanguage(langCode) {
    const dropdown = document.getElementById('language-dropdown');
    if (dropdown) dropdown.classList.remove('show');
    const trans = await loadTranslation(langCode);
    if (trans) {
        translations[langCode] = trans;
        currentLanguage = langCode;
        applyTranslation(trans);
        updateActiveLanguage(langCode);
        try {
            localStorage.setItem('language-preference', langCode);
        } catch (error) {
            console.warn('Could not persist language preference:', error);
        }
    }
}

window.addEventListener('click', function (event) {
    if (!event.target.matches('.language-button') && !event.target.closest('.language-button')) {
        const dropdown = document.getElementById('language-dropdown');
        const button = document.querySelector('.language-button');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
            if (button) button.setAttribute('aria-expanded', 'false');
        }
    }
});

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
        if (button) button.setAttribute('aria-expanded', 'true');
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
    if (button) button.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
    document.body.style.paddingRight = '';
}

document.addEventListener('keydown', function (event) {
    if (event.key === 'Escape') {
        const panel = document.getElementById('settings-panel');
        if (panel && panel.classList.contains('active')) closeSettingsPanel();
    }
});

function toggleTheme(event) {
    if (event) event.stopPropagation();
    const html = document.documentElement;
    const currentTheme = html.getAttribute('data-theme');
    const newTheme = currentTheme === 'dark' ? 'light' : 'dark';

    if (newTheme === 'dark') {
        html.setAttribute('data-theme', 'dark');
    } else {
        html.removeAttribute('data-theme');
    }

    try {
        localStorage.setItem('theme-preference', newTheme);
    } catch (error) {
        console.warn('Could not persist theme preference:', error);
    }
    const toggleButton = document.querySelector('.toggle-switch');
    const isDark = newTheme === 'dark';
    toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
    toggleButton.setAttribute('aria-pressed', isDark);
    const thumbLabel = document.getElementById('switch-thumb-label');
    if (thumbLabel) thumbLabel.textContent = isDark ? 'D' : 'L';
}

function loadThemePreference() {
    let savedTheme = null;
    try {
        savedTheme = localStorage.getItem('theme-preference');
    } catch (error) {
        console.warn('Could not read theme preference:', error);
    }
    const theme = savedTheme || 'light';

    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');

    const toggleButton = document.querySelector('.toggle-switch');
    if (toggleButton) {
        const isDark = theme === 'dark';
        toggleButton.setAttribute('aria-label', isDark ? 'Switch to light mode' : 'Switch to dark mode');
        toggleButton.setAttribute('aria-pressed', isDark);
        const thumbLabel = document.getElementById('switch-thumb-label');
        if (thumbLabel) thumbLabel.textContent = isDark ? 'D' : 'L';
    }
}

async function loadLanguagePreference() {
    let savedLang = null;
    try {
        savedLang = localStorage.getItem('language-preference');
    } catch (error) {
        console.warn('Could not read language preference:', error);
    }
    if (savedLang && savedLang !== 'en') await changeLanguage(savedLang);
}

function initKeyboardNavigation() {
    const languageOptions = document.querySelectorAll('.language-option');
    languageOptions.forEach(option => {
        option.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                option.click();
            }
        });
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    loadLanguagePreference();
    initListItems();
    initKeyboardNavigation();
});
