// LeetCode Live Stats Integration
function initLeetCodeStats() {
    const leetCodeSection = document.querySelector('.leetcode-stats');
    if (!leetCodeSection) {
        console.log('LeetCode section not found, waiting...');
        // Try again after a short delay
        setTimeout(initLeetCodeStats, 1000);
        return;
    }

    console.log('Initializing LeetCode stats...');
    // Add refresh button
    addRefreshButton();

    // Load cached data first
    loadCachedLeetCodeData();

    // Fetch fresh data
    fetchLeetCodeData();
}

// Add refresh button to LeetCode section
function addRefreshButton() {
    const leetCodeHeader = document.querySelector('.leetcode-header');
    if (!leetCodeHeader) return;

    // Check if refresh button already exists to prevent duplicates
    const existingButton = document.getElementById('leetcode-refresh');
    if (existingButton) return;

    const refreshButton = document.createElement('button');
    refreshButton.id = 'leetcode-refresh';
    refreshButton.className = 'leetcode-refresh-btn';
    refreshButton.innerHTML = '<i class="fas fa-sync-alt" aria-hidden="true"></i>';
    refreshButton.setAttribute('aria-label', 'Refresh LeetCode stats');
    refreshButton.setAttribute('title', 'Refresh LeetCode stats');

    refreshButton.addEventListener('click', () => {
        fetchLeetCodeData(true);
    });

    leetCodeHeader.appendChild(refreshButton);
}

// Fetch LeetCode data from API
async function fetchLeetCodeData(forceRefresh = false) {
    const username = 'MeghanaYerramsetti';
    const cacheKey = 'leetcode_data';
    const lastFetchKey = 'leetcode_last_fetch';

    // Check if we should use cached data (not older than 1 hour)
    const lastFetch = localStorage.getItem(lastFetchKey);
    const now = Date.now();
    const cacheValid = lastFetch && (now - lastFetch) < 3600000; // 1 hour

    if (!forceRefresh && cacheValid) {
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const data = JSON.parse(cachedData);
            updateLeetCodeUI(data);
            return;
        }
    }

    // Show loading state
    showLeetCodeLoading();

    try {
        // Using a reliable LeetCode API service
        const response = await fetch(`https://leetcode-stats-api.herokuapp.com/${username}`);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();

        // Cache the data
        localStorage.setItem(cacheKey, JSON.stringify(data));
        localStorage.setItem(lastFetchKey, now.toString());

        // Update UI with fresh data
        updateLeetCodeUI(data);

        // Show success message
        updateAriaLive('LeetCode stats updated successfully');

    } catch (error) {
        console.error('Error fetching LeetCode data:', error);

        // Try to use cached data as fallback
        const cachedData = localStorage.getItem(cacheKey);
        if (cachedData) {
            const data = JSON.parse(cachedData);
            updateLeetCodeUI(data);
            updateAriaLive('Using cached LeetCode data');
        } else {
            showLeetCodeError();
            updateAriaLive('Error loading LeetCode stats. Please try again later.');
        }
    }
}

// Load cached LeetCode data
function loadCachedLeetCodeData() {
    const cachedData = localStorage.getItem('leetcode_data');
    if (cachedData) {
        try {
            const data = JSON.parse(cachedData);
            updateLeetCodeUI(data);
        } catch (error) {
            console.error('Error parsing cached LeetCode data:', error);
        }
    }
}

// Update LeetCode UI with data
function updateLeetCodeUI(data) {
    // Update total solved count
    const totalNumber = document.querySelector('.total-number');
    const totalLabel = document.querySelector('.total-label');

    if (totalNumber && data.totalSolved !== undefined) {
        animateCounter(totalNumber, parseInt(totalNumber.textContent) || 0, data.totalSolved, 1000);
    }

    // Update progress bars
    updateProgressBar('.easy', data.easySolved, data.totalEasy);
    updateProgressBar('.medium', data.mediumSolved, data.totalMedium);
    updateProgressBar('.hard', data.hardSolved, data.totalHard);

    // Update solved counts in progress info
    updateSolvedCount('.easy', data.easySolved, data.totalEasy);
    updateSolvedCount('.medium', data.mediumSolved, data.totalMedium);
    updateSolvedCount('.hard', data.hardSolved, data.totalHard);

    // Add last updated timestamp
    addLastUpdatedTimestamp();

    // Hide loading/error states
    hideLeetCodeLoading();
    hideLeetCodeError();
}

// Update progress bar
function updateProgressBar(difficultyClass, solved, total) {
    const progressItem = document.querySelector(`.progress-item .difficulty${difficultyClass}`);
    if (!progressItem) return;

    const percentage = total > 0 ? (solved / total) * 100 : 0;

    const progressBar = progressItem.closest('.progress-item').querySelector('.progress-bar');
    const progressFill = progressBar.querySelector('.progress-fill');

    if (progressFill) {
        // Animate progress bar
        progressFill.style.width = '0%';
        setTimeout(() => {
            progressFill.style.width = `${percentage}%`;
        }, 300);

        // Update ARIA attributes
        progressBar.setAttribute('aria-valuenow', Math.round(percentage));
    }
}

// Update solved count text
function updateSolvedCount(difficultyClass, solved, total) {
    const progressItem = document.querySelector(`.progress-item .difficulty${difficultyClass}`);
    if (!progressItem) return;

    const solvedText = progressItem.closest('.progress-item').querySelector('.solved');
    if (solvedText) {
        solvedText.textContent = `${solved} / ${total} Solved`;
    }
}

// Add last updated timestamp
function addLastUpdatedTimestamp() {
    let timestampElement = document.querySelector('.leetcode-timestamp');
    if (!timestampElement) {
        const leetCodeContent = document.querySelector('.leetcode-content');
        if (leetCodeContent) {
            timestampElement = document.createElement('div');
            timestampElement.className = 'leetcode-timestamp';
            timestampElement.style.fontSize = '0.8rem';
            timestampElement.style.color = 'var(--text-muted)';
            timestampElement.style.textAlign = 'center';
            timestampElement.style.marginTop = '1rem';
            leetCodeContent.appendChild(timestampElement);
        }
    }

    if (timestampElement) {
        const lastFetch = localStorage.getItem('leetcode_last_fetch');
        if (lastFetch) {
            const date = new Date(parseInt(lastFetch));
            timestampElement.textContent = `Last updated: ${date.toLocaleString()}`;
        }
    }
}

// Show loading state
function showLeetCodeLoading() {
    const leetCodeContent = document.querySelector('.leetcode-content');
    if (!leetCodeContent) return;

    // Add loading spinner
    let loadingElement = document.querySelector('.leetcode-loading');
    if (!loadingElement) {
        loadingElement = document.createElement('div');
        loadingElement.className = 'leetcode-loading';
        loadingElement.innerHTML = `
            <div style="text-align: center; padding: 2rem;">
                <i class="fas fa-spinner fa-spin" aria-hidden="true" style="font-size: 2rem; color: var(--primary-color);"></i>
                <p style="margin: 1rem 0 0 0; color: var(--text-muted);">Loading LeetCode stats...</p>
            </div>
        `;
        leetCodeContent.appendChild(loadingElement);
    }

    loadingElement.style.display = 'block';
}

// Hide loading state
function hideLeetCodeLoading() {
    const loadingElement = document.querySelector('.leetcode-loading');
    if (loadingElement) {
        loadingElement.style.display = 'none';
    }
}

// Show error state
function showLeetCodeError() {
    const leetCodeContent = document.querySelector('.leetcode-content');
    if (!leetCodeContent) return;

    let errorElement = document.querySelector('.leetcode-error');
    if (!errorElement) {
        errorElement = document.createElement('div');
        errorElement.className = 'leetcode-error';
        errorElement.innerHTML = `
            <div style="text-align: center; padding: 2rem; background: var(--card-bg); border-radius: 10px; border: 1px solid var(--hard-color);">
                <i class="fas fa-exclamation-triangle" aria-hidden="true" style="font-size: 2rem; color: var(--hard-color);"></i>
                <p style="margin: 1rem 0 0 0; color: var(--text-muted);">Unable to load LeetCode stats. Please try again later.</p>
            </div>
        `;
        leetCodeContent.appendChild(errorElement);
    }

    errorElement.style.display = 'block';
    hideLeetCodeLoading();
}

// Hide error state
function hideLeetCodeError() {
    const errorElement = document.querySelector('.leetcode-error');
    if (errorElement) {
        errorElement.style.display = 'none';
    }
}

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM loaded, initializing LeetCode stats...');
    initLeetCodeStats();
});