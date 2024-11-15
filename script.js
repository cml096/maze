const canvas = document.getElementById('mazeCanvas');
const ctx = canvas.getContext('2d');
const cellSize = 20;
const cols = canvas.width / cellSize;
const rows = canvas.height / cellSize;
const grid = [];

for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
        grid.push({
            x, y,
            walls: { top: true, right: true, bottom: true, left: true },
            visited: false
        });
    }
}

function getIndex(x, y) {
    if (x < 0 || y < 0 || x >= cols || y >= rows) return -1;
    return x + y * cols;
}

function getNeighbors(cell) {
    const neighbors = [];
    const directions = [
        { x: 0, y: -1, direction: 'top' },
        { x: 1, y: 0, direction: 'right' },
        { x: 0, y: 1, direction: 'bottom' },
        { x: -1, y: 0, direction: 'left' }
    ];

    directions.forEach(({ x, y, direction }) => {
        const neighborIndex = getIndex(cell.x + x, cell.y + y);
        if (neighborIndex !== -1 && !grid[neighborIndex].visited) {
            neighbors.push({ cell: grid[neighborIndex], direction });
        }
    });

    return neighbors;
}

function removeWalls(current, next, direction) {
    const opposite = { top: 'bottom', right: 'left', bottom: 'top', left: 'right' };
    current.walls[direction] = false;
    next.walls[opposite[direction]] = false;
}

function generateMaze() {
    const stack = [];
    const start = grid[0];
    start.visited = true;
    stack.push(start);

    while (stack.length > 0) {
        const current = stack[stack.length - 1];
        const neighbors = getNeighbors(current);

        if (neighbors.length > 0) {
            const { cell: next, direction } = neighbors[Math.floor(Math.random() * neighbors.length)];
            removeWalls(current, next, direction);
            next.visited = true;
            stack.push(next);
        } else {
            stack.pop();
        }
    }
}

function drawMaze() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    grid.forEach(cell => {
        const x = cell.x * cellSize;
        const y = cell.y * cellSize;

        ctx.strokeStyle = '#000';
        ctx.lineWidth = 2;

        if (cell.walls.top) {
            ctx.beginPath();
            ctx.moveTo(x, y);
            ctx.lineTo(x + cellSize, y);
            ctx.stroke();
        }
        if (cell.walls.right) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y);
            ctx.lineTo(x + cellSize, y + cellSize);
            ctx.stroke();
        }
        if (cell.walls.bottom) {
            ctx.beginPath();
            ctx.moveTo(x + cellSize, y + cellSize);
            ctx.lineTo(x, y + cellSize);
            ctx.stroke();
        }
        if (cell.walls.left) {
            ctx.beginPath();
            ctx.moveTo(x, y + cellSize);
            ctx.lineTo(x, y);
            ctx.stroke();
        }
    });
}

generateMaze();
drawMaze();

let bfsQueue = [];
let solving = false;
let bfsSolved = false;

function solveMazeBFSStep() {
    if (bfsQueue.length === 0 || bfsSolved) {
        if (bfsQueue.length === 0 && !bfsSolved) {
            console.log('No path found');
        }
        return;
    }

    const current = bfsQueue.shift();

    if (current === grid[grid.length - 1]) {
        bfsSolved = true;
        reconstructPath(current);
        return;
    }

    const neighbors = getNeighbors(current).filter(({ cell, direction }) => {
        return !cell.visited && !current.walls[direction];
    });

    neighbors.forEach(({ cell }) => {
        cell.visited = true;
        cell.parent = current;
        bfsQueue.push(cell);
    });

    drawSolverProgress();

    if (!bfsSolved) {
        requestAnimationFrame(solveMazeBFSStep);
    }
}

function drawSolverProgress() {
    grid.forEach(cell => {
        if (cell.visited) {
            const x = cell.x * cellSize;
            const y = cell.y * cellSize;

            ctx.fillStyle = '#a3d2ca'; // Color for visited cells
            ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);
        }
    });

    ctx.fillStyle = '#4caf50'; // Start cell color
    ctx.fillRect(1, 1, cellSize - 2, cellSize - 2);

    ctx.fillStyle = '#f44336'; // End cell color
    ctx.fillRect(
        (grid[grid.length - 1].x * cellSize) + 1,
        (grid[grid.length - 1].y * cellSize) + 1,
        cellSize - 2,
        cellSize - 2
    );
}

function reconstructPath(endCell) {
    let current = endCell;

    while (current.parent) {
        const x = current.x * cellSize;
        const y = current.y * cellSize;

        ctx.fillStyle = '#ff5722'; // Path color
        ctx.fillRect(x + 1, y + 1, cellSize - 2, cellSize - 2);

        current = current.parent;
    }

    ctx.fillStyle = '#4caf50'; // Start cell color
    ctx.fillRect(1, 1, cellSize - 2, cellSize - 2);

    ctx.fillStyle = '#f44336'; // End cell color
    ctx.fillRect(
        (grid[grid.length - 1].x * cellSize) + 1,
        (grid[grid.length - 1].y * cellSize) + 1,
        cellSize - 2,
        cellSize - 2
    );

    console.log('DONE!');
}

// Start BFS animation
document.getElementById('solveBFSButton').addEventListener('click', () => {
    // Reset solving state
    grid.forEach(cell => {
        cell.visited = false;
        cell.parent = null;
    });

    // Initialize BFS
    bfsQueue = [grid[0]];
    grid[0].visited = true;
    solving = true;
    bfsSolved = false;

    requestAnimationFrame(solveMazeBFSStep);
});

let dfsStack = [];
let dfsSolved = false;

function solveMazeDFSStep() {
    if (dfsStack.length === 0 || dfsSolved) {
        if (dfsStack.length === 0 && !dfsSolved) {
            console.log('No path found');
        }
        return;
    }

    const current = dfsStack.pop();

    if (current === grid[grid.length - 1]) {
        dfsSolved = true;
        reconstructPath(current);
        return;
    }

    const neighbors = getNeighbors(current).filter(({ cell, direction }) => {
        return !cell.visited && !current.walls[direction];
    });

    neighbors.forEach(({ cell }) => {
        cell.visited = true;
        cell.parent = current;
        dfsStack.push(cell);
    });

    drawSolverProgress();

    if (!dfsSolved) {
        requestAnimationFrame(solveMazeDFSStep);
    }
}

// Start DFS animation
document.getElementById('solveDFSButton').addEventListener('click', () => {
    // Reset solving state
    grid.forEach(cell => {
        cell.visited = false;
        cell.parent = null;
    });

    // Initialize DFS
    dfsStack = [grid[0]];
    grid[0].visited = true;
    dfsSolved = false;

    requestAnimationFrame(solveMazeDFSStep);
});

function clearMaze() {
    // Reset all cells
    grid.forEach(cell => {
        cell.visited = false;
        cell.parent = null;
    });

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawMaze();

    console.log('Cleared!');
}

// Attach event listener to the clear button
document.getElementById('clearButton').addEventListener('click', clearMaze);
