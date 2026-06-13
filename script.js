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
    headerTitle: "Welcome to my Musical Journey! ♪",
    headerTagline: "Exploring melodies, harmonies, and the beautiful language of music",
    mainContent: `
        <section>
            <h1>About My Music</h1>
            <h3>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</h3>
            <blockquote>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.</blockquote>
            <h3>Nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore.</h3>
        </section>

        <hr>

        <section>
            <h1>My Musical Projects</h1>
            <ul>
                <li>
                    <strong>Symphony in Digital Dreams</strong><br>
                    Lorem ipsum dolor sit amet, consectetur adipiscing elit. Mauris vel turpis vitae massa.<br>
                    <em><a href="#">Listen Now</a></em>
                </li>
                <li>
                    <strong>Acoustic Wanderings</strong><br>
                    Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua quis nostrud.<br>
                    <em><a href="#">Listen Now</a></em>
                </li>
                <li>
                    <strong>Electronic Echoes</strong><br>
                    Ut enim ad minim veniam exercitation ullamco laboris nisi ut aliquip ex ea commodo.<br>
                    <em><a href="#">Listen Now</a></em>
                </li>
                <li>
                    <strong>Piano Reflections</strong><br>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.<br>
                    <em><a href="#">Listen Now</a></em>
                </li>
                <li>
                    <strong>Vocal Harmonies Collection</strong><br>
                    Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit.<br>
                    <em><a href="#">Listen Now</a></em>
                </li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Musical Influences</h1>
            <ul>
                <li>
                    <strong>Classical Masters</strong><br>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit. Sed do eiusmod tempor incididunt.<br>
                    <em><a href="#">Explore More</a></em>
                </li>
                <li>
                    <strong>Contemporary Jazz Artists</strong><br>
                    Ut labore et dolore magna aliqua. Quis nostrud exercitation ullamco laboris nisi aliquip.<br>
                    <em><a href="#">Explore More</a></em>
                </li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Music I Love</h1>
            <ul>
                <li>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore.</li>
                <li>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo.</li>
                <li>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</li>
                <li>Excepteur sint occaecat cupidatat non proident sunt in culpa qui officia deserunt mollit anim.</li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Current Projects</h1>
            <ul>
                <li>
                    <strong>Album Recording - "Midnight Melodies"</strong><br>
                    (SEPTEMBER 2023 - PRESENT)<br>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor incididunt ut labore.
                </li>
                <li>
                    <strong>Collaborative Music Project</strong><br>
                    (JANUARY 2024 - PRESENT)<br>
                    Ut enim ad minim veniam quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea.
                </li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Past Performances</h1>
            <ul>
                <li>
                    <strong>Summer Concert Series</strong><br>
                    (JUNE 2023 - AUGUST 2023)<br>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod.
                </li>
                <li>
                    <strong>Acoustic Sessions</strong><br>
                    (MARCH 2023 - MAY 2023)<br>
                    Ut enim ad minim veniam quis nostrud exercitation ullamco.
                </li>
                <li>
                    <strong>Music Festival Appearance</strong><br>
                    (DECEMBER 2022)<br>
                    Duis aute irure dolor in reprehenderit in voluptate velit.
                </li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Community Involvement</h1>
            <ul>
                <li>
                    <strong>Music Education Initiative</strong><br>
                    (MARCH 2023 - PRESENT)<br>
                    Lorem ipsum dolor sit amet consectetur adipiscing elit sed do eiusmod tempor.
                </li>
                <li>
                    <strong>Local Music Workshop Instructor</strong><br>
                    (JANUARY 2023 - PRESENT)<br>
                    Ut enim ad minim veniam quis nostrud exercitation ullamco laboris.
                </li>
                <li>
                    <strong>Charity Concert Organizer</strong><br>
                    (NOVEMBER 2022)<br>
                    Duis aute irure dolor in reprehenderit in voluptate velit esse cillum.
                </li>
            </ul>
        </section>

        <hr>

        <section>
            <h1>Featured Performances</h1>
            <ul>
                <li>
                    <strong>Live at the Jazz Club</strong><br>
                    (OCTOBER 2023) LIVE<br>
                    <em><a href="#">Watch Recording</a></em>
                </li>
                <li>
                    <strong>Acoustic Evening Sessions</strong><br>
                    (AUGUST 2023) LIVE<br>
                    <em><a href="#">Watch Recording</a></em>
                </li>
                <li>
                    <strong>Electronic Music Showcase</strong><br>
                    (JUNE 2023) LIVE<br>
                    <em><a href="#">Watch Recording</a></em>
                </li>
            </ul>
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

