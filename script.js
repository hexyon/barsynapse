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

function searchApps() {
    const input = document.getElementById('search-input');
    const filter = input.value.toLowerCase();
    const websites = document.querySelectorAll('.website');
    let visibleCount = 0;
    
    websites.forEach(website => {
        const name = website.getAttribute('data-name');
        if (name.indexOf(filter) > -1) {
            website.style.display = "";
            visibleCount++;
        } else {
            website.style.display = "none";
        }
    });
    
    document.getElementById('visible-count').textContent = visibleCount;
}

document.addEventListener('DOMContentLoaded', () => {
    showDescription(0);
});