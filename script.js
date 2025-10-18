var gk_isXlsx = false;
var gk_xlsxFileLookup = {};
var gk_fileData = {};

function filledCell(cell) {
    return cell !== '' && cell != null;
}

function loadFileData(filename) {
    if (gk_isXlsx && gk_xlsxFileLookup[filename]) {
        try {
            var workbook = XLSX.read(gk_fileData[filename], { type: 'base64' });
            var firstSheetName = workbook.SheetNames[0];
            var worksheet = workbook.Sheets[firstSheetName];

            // Convert sheet to JSON to filter blank rows
            var jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1, blankrows: false, defval: '' });
            // Filter out blank rows (rows where all cells are empty, null, or undefined)
            var filteredData = jsonData.filter(row => row.some(filledCell));

            // Heuristic to find the header row by ignoring rows with fewer filled cells than the next row
            var headerRowIndex = filteredData.findIndex((row, index) =>
                row.filter(filledCell).length >= filteredData[index + 1]?.filter(filledCell).length
            );
            // Fallback
            if (headerRowIndex === -1 || headerRowIndex > 25) {
                headerRowIndex = 0;
            }

            // Convert filtered JSON back to CSV
            var csv = XLSX.utils.aoa_to_sheet(filteredData.slice(headerRowIndex));
            csv = XLSX.utils.sheet_to_csv(csv, { header: 1 });
            return csv;
        } catch (e) {
            console.error(e);
            return "";
        }
    }
    return gk_fileData[filename] || "";
}

let currentIndex = 0;

function showDescription(index) {
    const descriptions = document.querySelectorAll('.description-content');
    descriptions.forEach(desc => desc.classList.remove('active'));
    descriptions[index].classList.add('active');
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
    dropdown.classList.toggle('show');
}

function changeLanguage(langCode) {
    console.log('Language changed to:', langCode);
    
    // Determine current path and construct new path
    const currentPath = window.location.pathname;
    const isInLanguageFolder = currentPath.includes('/languages/');
    
    let newPath;
    if (langCode === 'en') {
        // Return to main index.html
        if (isInLanguageFolder) {
            newPath = '../../index.html';
        } else {
            newPath = 'index.html';
        }
    } else {
        // Navigate to language-specific folder
        if (isInLanguageFolder) {
            // Already in a language folder, go to sibling folder
            newPath = `../${langCode}/index.html`;
        } else {
            // In root, go to language folder
            newPath = `languages/${langCode}/index.html`;
        }
    }
    
    // Navigate to the new page
    window.location.href = newPath;
}

// Close dropdown when clicking outside
window.addEventListener('click', function(event) {
    if (!event.target.matches('.language-button') && !event.target.closest('.language-button')) {
        const dropdown = document.getElementById('language-dropdown');
        if (dropdown && dropdown.classList.contains('show')) {
            dropdown.classList.remove('show');
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
    
    // Update toggle button title
    const toggleButton = document.querySelector('.toggle-switch');
    toggleButton.title = newTheme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
}

// Load saved theme preference
function loadThemePreference() {
    const savedTheme = localStorage.getItem('theme-preference');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    
    const theme = savedTheme || (prefersDark ? 'dark' : 'light');
    
    if (theme === 'dark') {
        document.documentElement.setAttribute('data-theme', 'dark');
    }
    
    // Set initial toggle button title
    const toggleButton = document.querySelector('.toggle-switch');
    if (toggleButton) {
        toggleButton.title = theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode';
    }
}

document.addEventListener('DOMContentLoaded', () => {
    loadThemePreference();
    showDescription(0);
});
