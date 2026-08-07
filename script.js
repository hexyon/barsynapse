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
            item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
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


let currentLanguage = 'en';
let translations = {};
let defaultEnglishState = null;

// Captures the page's original English text before any translation runs,
// so switching back to English never needs to fetch a languages/en.json file.
function captureDefaultEnglishState() {
    const state = {
        lang: 'en',
        direction: 'ltr',
        header: {
            toggleTheme: document.querySelector('.toggle-switch')?.title || '',
            launchAllButton: document.querySelector('.visit-all-icon-button')?.getAttribute('aria-label') || ''
        },
        apps: [],
        categories: {},
        footer: {}
    };

    document.querySelectorAll('.list-item').forEach((item) => {
        const index = parseInt(item.getAttribute('data-index'));
        state.apps[index] = {
            name: item.querySelector('.list-title')?.textContent || '',
            subtitle: item.querySelector('.list-subtitle')?.textContent || '',
            description: item.querySelector('.detail-description')?.textContent || '',
            visit: item.querySelector('.detail-button')?.textContent.trim() || ''
        };

        const category = item.getAttribute('data-category');
        const header = item.closest('.list-section')?.querySelector('.list-section-header');
        if (category && header && !state.categories[category]) {
            state.categories[category] = header.textContent;
        }
    });

    const footerSections = document.querySelectorAll('.footer-section');
    state.footer.aboutTitle = footerSections[0]?.querySelector('.footer-title')?.textContent || '';
    state.footer.aboutText = footerSections[0]?.querySelector('p:not(.footer-title)')?.textContent || '';
    state.footer.createdWithTitle = footerSections[1]?.querySelector('.footer-title')?.textContent || '';
    state.footer.developerTitle = footerSections[2]?.querySelector('.footer-title')?.textContent || '';
    state.footer.copyright = document.querySelector('.copyright p')?.textContent || '';

    return state;
}

async function loadTranslation(langCode) {
    if (langCode === 'en') {
        return defaultEnglishState;
    }
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


async function changeLanguage(langCode) {
    const trans = await loadTranslation(langCode);
    if (trans) {
        translations[langCode] = trans;
        currentLanguage = langCode;
        applyTranslation(trans);
        updateLanguageToggleUI(langCode);
        try {
            localStorage.setItem('language-preference', langCode);
        } catch (error) {
            console.warn('Could not persist language preference:', error);
        }
    }
}

function toggleLanguage() {
    const newLang = currentLanguage === 'en' ? 'tr' : 'en';
    changeLanguage(newLang);
}

function updateLanguageToggleUI(langCode) {
    const btn = document.getElementById('language-toggle-btn');
    if (!btn) return;
    btn.textContent = langCode.toUpperCase();
    btn.setAttribute('aria-label', langCode === 'en' ? 'Switch to Turkish' : 'Switch to English');
    if (langCode === 'tr') {
        btn.classList.add('turkish-language-button');
    } else {
        btn.classList.remove('turkish-language-button');
    }
}


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


document.addEventListener('DOMContentLoaded', () => {
    defaultEnglishState = captureDefaultEnglishState();
    loadThemePreference();
    loadLanguagePreference();
    initListItems();
});
