let board = [];
let openedSquares = [];
let flaggedSquares = [];
let bombCount = 0;
let squaresLeft = 0;

let bombProbability = 3;
let maxProbability = 15;

function minesweeperGameBootstrapper(rowCount, colCount) {
    let easy = {
        'rowCount': 9,
        'colCount': 9,
    };
    let medium = {
        'rowCount': 16,
        'colCount': 16,
    };
    let hard = {
        'rowCount': 16,
        'colCount': 30,
    };

    if (rowCount == null && colCount == null) {
        rowCount = easy.rowCount;
        colCount = easy.colCount;
    } else {
        generateBoard({'rowCount': rowCount, 'colCount': colCount});
    }
}

function generateBoard(boardMetadata) {
    squaresLeft = boardMetadata.colCount * boardMetadata.rowCount;
    board = [];

    for (let i = 0; i < boardMetadata.colCount; i++) {
        board[i] = new Array(boardMetadata.rowCount);
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j] = new BoardSquare(false, 0);
        }
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            if (Math.random() * maxProbability < bombProbability) {
                board[i][j].hasBomb = true;
                bombCount++;
            }
        }
    }

    for (let i = 0; i < boardMetadata.colCount; i++) {
        for (let j = 0; j < boardMetadata.rowCount; j++) {
            board[i][j].bombsAround = countBombsAround(i, j);
        }
    }

    openedSquares = [];
    flaggedSquares = [];
    console.log(board);
}

function countBombsAround(x, y) {
    let bombsAround = 0;
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],        [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(dir => {
        const newX = x + dir[0];
        const newY = y + dir[1];

        if (newX >= 0 && newX < board.length && newY >= 0 && newY < board[0].length) {
            if (board[newX][newY].hasBomb) {
                bombsAround++;
            }
        }
    });

    return bombsAround;
}

class BoardSquare {
    constructor(hasBomb, bombsAround) {
        this.hasBomb = hasBomb;
        this.bombsAround = bombsAround;
        this.opened = false;
        this.flagged = false;
    }
}

class Pair {
    constructor(x, y) {
        this.x = x;
        this.y = y;
    }
}

function startGame() {
    const difficulty = document.getElementById('difficulty').value;
    let rowCount, colCount;

    if (difficulty === 'easy') {
        rowCount = 9;
        colCount = 9;
    } else if (difficulty === 'medium') {
        rowCount = 16;
        colCount = 16;
    } else if (difficulty === 'hard') {
        rowCount = 16;
        colCount = 30;
    }

    bombProbability = document.getElementById('bombProbability').value;
    maxProbability = document.getElementById('maxProbability').value;

    minesweeperGameBootstrapper(rowCount, colCount);
    renderBoard();

    document.querySelector('.board-container').style.display = 'block';
    document.getElementById('resetButton').style.display = 'inline-block';
}

function renderBoard() {
    const gameBoard = document.getElementById('gameBoard');
    gameBoard.innerHTML = '';  // Clear the board
    gameBoard.style.gridTemplateColumns = `repeat(${board[0].length}, 40px)`;

    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            const square = document.createElement('div');
            square.setAttribute('data-row', i);
            square.setAttribute('data-col', j);

            if (board[i][j].opened) {
                square.classList.add('opened');
                if (board[i][j].hasBomb) {
                    square.classList.add('bomb');
                    square.textContent = '💣';
                } else if (board[i][j].bombsAround > 0) {
                    square.textContent = board[i][j].bombsAround;
                }
            } else if (board[i][j].flagged) {
                square.classList.add('flagged');
                square.textContent = '🚩';
            }

            square.addEventListener('click', () => discoverTile(i, j));
            square.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                flagTile(i, j);
                renderBoard();
            });

            gameBoard.appendChild(square);
        }
    }
}

function discoverTile(row, col) {
    if (board[row][col].opened || board[row][col].flagged) return;

    board[row][col].opened = true;
    openedSquares.push(new Pair(row, col));
    squaresLeft--;

    if (board[row][col].hasBomb) {
        alert("Game over! You hit a bomb.");
        revealBombs();
    } else if (board[row][col].bombsAround === 0) {
        openSurroundingTiles(row, col);
    }

    if (squaresLeft === bombCount) {
        alert("Congratulations! You've cleared the board!");
    }

    renderBoard();
}

function openSurroundingTiles(row, col) {
    const directions = [
        [-1, -1], [-1, 0], [-1, 1],
        [0, -1],        [0, 1],
        [1, -1], [1, 0], [1, 1]
    ];

    directions.forEach(dir => {
        const newRow = row + dir[0];
        const newCol = col + dir[1];

        if (newRow >= 0 && newRow < board.length && newCol >= 0 && newCol < board[0].length) {
            discoverTile(newRow, newCol);
        }
    });
}

function revealBombs() {
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[i].length; j++) {
            if (board[i][j].hasBomb) {
                board[i][j].opened = true;
            }
        }
    }
}

function flagTile(row, col) {
    if (!board[row][col].opened) {
        board[row][col].flagged = !board[row][col].flagged;
    }
}

function resetGame() {
    document.querySelector('.board-container').style.display = 'none';
    document.getElementById('resetButton').style.display = 'none';
}
