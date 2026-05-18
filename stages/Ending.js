const PANELS = [
    SPRITE_PANEL1,
    SPRITE_PANEL2,
    SPRITE_PANEL3,
    SPRITE_PANEL4,
    SPRITE_PANEL5, 
    SPRITE_LAST
];


const FRAME_DELAY   = 2800;
const FADE_DURATION = 600;
const LOOP          = false;

const panelBg      = document.getElementById('panelBg');
const panelCounter = document.getElementById('panelCounter');

let currentFrame = 0;

const bgMusic = new Audio(SPRITE_BACKGROUND);
bgMusic.loop = true;
bgMusic.volume = 1;

function playEndingMusic() {
    bgMusic.play().catch(function() {
        document.addEventListener('click', playEndingMusic, { once: true });
    });
}

window.addEventListener('load', playEndingMusic);


function setFrame(index) {
    panelBg.style.backgroundImage = "url('" + PANELS[index] + "')";
    panelCounter.textContent = (index + 1) + ' / ' + PANELS.length;
}

function advancePanel() {
    const nextFrame = currentFrame + 1;
    if (nextFrame >= PANELS.length) {
        if (!LOOP) return;
    }
    panelBg.classList.add('fading');
    setTimeout(function() {
        currentFrame = nextFrame >= PANELS.length ? 0 : nextFrame;
        setFrame(currentFrame);
        panelBg.classList.remove('fading');
    }, FADE_DURATION);
}

// Panels start immediately
setFrame(0);
setInterval(advancePanel, FRAME_DELAY + FADE_DURATION);