// Game of Life Implementation
const canvas = document.getElementById('game-of-life');
const ctx = canvas.getContext('2d');

let width, height, cellSize, cols, rows;
let grid, nextGrid;

function initGameOfLife() {
    width = canvas.width = window.innerWidth;
    height = canvas.height = window.innerHeight;
    cellSize = 30;
    cols = Math.floor(width / cellSize);
    rows = Math.floor(height / cellSize);

    grid = createArray(cols, rows);
    nextGrid = createArray(cols, rows);

    // Random initialization
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            grid[i][j] = Math.random() > 0.85 ? 1 : 0;
        }
    }
}

function createArray(cols, rows) {
    let arr = new Array(cols);
    for (let i = 0; i < cols; i++) {
        arr[i] = new Array(rows);
    }
    return arr;
}

function countNeighbors(x, y) {
    let sum = 0;
    for (let i = -1; i <= 1; i++) {
        for (let j = -1; j <= 1; j++) {
            let col = (x + i + cols) % cols;
            let row = (y + j + rows) % rows;
            sum += grid[col][row];
        }
    }
    sum -= grid[x][y];
    return sum;
}

function updateGrid() {
    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            let state = grid[i][j];
            let neighbors = countNeighbors(i, j);

            if (state === 0 && neighbors === 3) {
                nextGrid[i][j] = 1;
            } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
                nextGrid[i][j] = 0;
            } else {
                nextGrid[i][j] = state;
            }
        }
    }

    let temp = grid;
    grid = nextGrid;
    nextGrid = temp;
}

function drawGrid() {
    ctx.fillStyle = document.body.classList.contains('music-theme') ? '#f5f5f5' : '#000802';
    ctx.fillRect(0, 0, width, height);

    for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
            if (grid[i][j] === 1) {
                ctx.fillStyle = document.body.classList.contains('music-theme') ? 'rgba(45, 45, 45, 0.3)' : 'rgba(80, 250, 123, 0.3)';
                ctx.fillRect(i * cellSize, j * cellSize, cellSize - 1, cellSize - 1);
            }
        }
    }
}

function animate() {
    updateGrid();
    drawGrid();
    setTimeout(() => requestAnimationFrame(animate), 100);
}

initGameOfLife();
animate();

window.addEventListener('resize', initGameOfLife);

// Attach event listener for all collapsible sections
document.addEventListener('DOMContentLoaded', function() {
    attachCollapsibleListeners();
});

function attachCollapsibleListeners() {
    const headers = document.querySelectorAll('.collapsible-header');
    headers.forEach(header => {
        header.addEventListener('click', function() {
            const targetId = this.getAttribute('data-target') || this.id.replace('-toggle', '-details');
            const content = document.getElementById(targetId) || document.getElementById('about-me-details');
            const icon = this.querySelector('.toggle-icon');

            if (content.classList.contains('expanded')) {
                content.classList.remove('expanded');
                icon.textContent = '+';
            } else {
                content.classList.add('expanded');
                icon.textContent = '−';
            }
        });
    });
}

function attachAboutToggle() {
    // This is now handled by attachCollapsibleListeners
    attachCollapsibleListeners();
}

// Content for tech theme
const techContent = {
    headerTitle: "hello world; echo from Divya!",
    headerTagline: "alias rachejazz OR h3ck",
    mainContent: document.getElementById('main-content').innerHTML
};

// Content for music theme
const musicContent = {
    headerTitle: "Welcome Explorer.",
    headerTagline: "Work In Progress",
    mainContent: `
        <section>
            <h3>Hey! you're found the hidden world of Almanac! Here we dont talk but speak, we dont hear, we listen and we dont look but see. This is Work in Progress section so come by later?</h3>
        </section>
    `
};

let isMusicTheme = false;

function toggleTheme() {
    const body = document.body;
    const button = document.querySelector('.theme-toggle');
    const headerTitle = document.getElementById('header-title');
    const headerTagline = document.getElementById('header-tagline');
    const mainContent = document.getElementById('main-content');

    // Add rotation animation
    button.classList.add('rotating');
    setTimeout(() => {
        button.classList.remove('rotating');
    }, 600);

    isMusicTheme = !isMusicTheme;

    if (isMusicTheme) {
        body.classList.add('music-theme');
        button.textContent = '🦇';
        headerTitle.textContent = musicContent.headerTitle;
        headerTagline.textContent = musicContent.headerTagline;
        mainContent.innerHTML = musicContent.mainContent;
    } else {
        body.classList.remove('music-theme');
        button.textContent = '🍃';
        headerTitle.textContent = techContent.headerTitle;
        headerTagline.textContent = techContent.headerTagline;
        mainContent.innerHTML = techContent.mainContent;
        // Re-attach the event listeners after replacing innerHTML
        attachCollapsibleListeners();
    }
}

