/**
 * Elegant Snowflake Effect
 * DOM-based snowflake animation with rotation and varied opacity
 */

// Snowflake animation function
function createSnowflake() {
    const snowflake = document.createElement('div');
    snowflake.classList.add('snowflake');
    snowflake.innerHTML = '❄';
    snowflake.style.position = 'fixed';
    snowflake.style.top = '-20px';
    snowflake.style.color = 'white';
    snowflake.style.pointerEvents = 'none';
    snowflake.style.textShadow = '0 0 3px rgba(255,255,255,0.8)';
    snowflake.style.left = Math.random() * 100 + '%';
    snowflake.style.opacity = Math.random() * 0.5 + 0.3;
    snowflake.style.fontSize = Math.random() * 12 + 10 + 'px';

    const animationDuration = Math.random() * 5 + 5;
    snowflake.style.animation = `fall ${animationDuration}s linear forwards`;

    document.body.appendChild(snowflake);

    // Remove snowflake after animation completes
    setTimeout(() => {
        snowflake.remove();
    }, animationDuration * 1000);
}

// Initialize snow effect when DOM is ready
function initSnow() {
    // Create snowflakes at random intervals
    setInterval(createSnowflake, 300);

    // Initialize with several snowflakes
    for (let i = 0; i < 15; i++) {
        setTimeout(createSnowflake, Math.random() * 2000);
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSnow);
} else {
    initSnow();
}
