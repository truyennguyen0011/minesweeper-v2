ipcRenderer.on('start:game', function(e, prop) {
    // startScreen.style.visibility = 'hidden';
    startScreen.style.display = 'none';
    var g = new Game(prop);
});

class Game {
    constructor(prop) {
        this.rows = prop.rows;
        this.cols = prop.cols;
        this.rowWidth = prop.rowWidth;
        this.rowHeight = prop.rowHeight;
        this.mineNumbers = prop.mineNumbers;
        this.str = '';

        // Create a board with the selected difficulty level
        this.createBoard(this.rows, this.cols, this.rowWidth, this.rowHeight);

        // Random positions of mines
        this.randomPosMine(this.mineNumbers, this.rows, this.cols);

        this.clickEvent = this.clickEvent.bind(this);
        this.tryAgain = this.tryAgain.bind(this);

        this.content.addEventListener('contextmenu', this.contextMenuEvent);

        this.content.addEventListener('click', this.clickEvent);
    }

    contextMenuEvent(e) {
        var tiles = e.target;
        if (tiles.className === 'col') return;
        if (tiles.classList.contains('flag')) {
            tiles.classList.remove('flag');
            tiles.classList.add('hidden');
            tiles.src = './src/img/hidden.jpg';
        } else {
            tiles.classList.remove('hidden');
            tiles.classList.add('flag');
            tiles.src = './src/img/flag.jpg';
        }
    }

    clickEvent(e) {
        var tiles = e.target;
        if (tiles.classList.contains('flag')) return;
        if (tiles.className === 'col') return;
        var row = parseInt(tiles.dataset.row);
        var col = parseInt(tiles.dataset.col);

        if (tiles.classList.contains("mine")) {
            this.str = 'You Lose!';
            this.gameOver();
            switch (this.mineNumbers) {
                case 10:
                    setTimeout(this.tryAgain, 3000);
                    break;
                case 40:
                    setTimeout(this.tryAgain, 12000);
                    break;
                default:
                    setTimeout(this.tryAgain, 20000);
                    break;
            }
        } else {
            this.reveal(row, col);
        }
    }

    createBoard(rows, cols, rowWidth, rowHeight) {
        this.board = document.createElement('div');
        this.board.setAttribute('class', 'board');

        var header = document.createElement('div');
        this.content = document.createElement('div');
        
        var clockIcon = document.createElement('img');
        var countTime = document.createElement('label');

        header.setAttribute('class', 'header');
        header.style.width = rowWidth + 4 + 'px';
        
        this.content.setAttribute('class', 'content');

        clockIcon.src = './src/img/clock-icon.png';
        clockIcon.setAttribute('draggable', 'false');

        countTime.setAttribute('class', 'count-time');
        countTime.innerText = '000';

        for (let i = 0; i < rows; i++) {
            var row = document.createElement('div');
            row.setAttribute('class', 'row');
            row.style.width = rowWidth + 'px';
            row.style.height = rowHeight + 'px';
            for (let j = 0; j < cols; j++) {
                var col = document.createElement('img');
                col.setAttribute('class', 'col hidden');
                col.setAttribute('draggable', 'false');
                col.setAttribute('data-row', i);
                col.setAttribute('data-col', j);
                col.src = './src/img/hidden.jpg';
                col.style.width = rowWidth / cols + 'px';
                col.style.height = rowHeight + 'px';

                row.appendChild(col);
            }
            this.content.appendChild(row);
        }

        header.appendChild(clockIcon);
        header.appendChild(countTime);
        this.board.appendChild(header);
        this.board.appendChild(this.content);
        document.body.appendChild(this.board);
    }

    randomPosMine(numbers, rows, cols) {
        var x, y;
        var tiles;
        for (let i = 0; i < numbers; i++) {
            x = Math.floor(Math.random() * rows);
            y = Math.floor(Math.random() * cols);
            tiles = document.querySelectorAll(`[data-row="${x}"][data-col="${y}"]`);
            if (!tiles[0].classList.contains('mine')) {
                tiles[0].classList.add('mine');
            } else {
                i--;
            }
        }
    }

    reveal(row, col) {
        this.helper(row, col);
    }

    helper(i, j) {
        var colCount = this.countColOpen();
        if (colCount === ((this.rows * this.cols) - this.mineNumbers)) {
            this.gameWin();
        }

        if (i >= this.rows || j >= this.cols || i < 0 || j < 0) return;

        var tiles = document.querySelectorAll(`[data-row="${i}"][data-col="${j}"]`);
        var mineCount = this.getMineCount(i, j);

        if (!tiles[0].classList.contains("hidden") || tiles[0].classList.contains("mine")) return;

        tiles[0].classList.remove("hidden");

        if (mineCount > 0) {
            tiles[0].src = `./src/img/${mineCount}.jpg`;
            return;
        }

        tiles[0].src = './src/img/blank.png';

        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                this.helper(i + di, j + dj);
            }
        }
    }

    getMineCount(i, j) {
        let count = 0;

        for (let di = -1; di <= 1; di++) {
            for (let dj = -1; dj <= 1; dj++) {
                var ni = i + di;
                var nj = j + dj;
                if (ni >= this.rows || nj >= this.cols || nj < 0 || ni < 0) {
                    continue;
                } else {
                    var tiles = document.querySelectorAll(`[data-row="${ni}"][data-col="${nj}"]`);
                    if (tiles[0].classList.contains("mine")) {
                        count++;
                    }
                }
            }
        }
        return count;
    }
    
    countColOpen() {
        var count = 1;
        var cols = document.querySelectorAll('.col');

        cols.forEach(col => {
            if (col.className === 'col') {
                count++;
            }
        });
        return count;
    }

    gameWin() {
        this.str = 'You Win!';
        this.content.removeEventListener('contextmenu', this.contextMenuEvent);
        this.content.removeEventListener('click', this.clickEvent);

        this.tryAgain();
    }

    gameOver() {
        this.content.removeEventListener('contextmenu', this.contextMenuEvent);
        this.content.removeEventListener('click', this.clickEvent);

        var tiles = document.querySelectorAll('.mine');
        var tilesLength = tiles.length;
        var i = 0;

        var id = setInterval(appearGradually, 200);

        function appearGradually() {
            if (i >= tilesLength - 1) {
                clearInterval(id);
                id = 0;
            }
            tiles[i].classList.remove('hidden');
            tiles[i].src = './src/img/bomb.jpg';
            i++;
        }
    }

    tryAgain() {
        var playAgain = document.createElement('div');
        playAgain.setAttribute('class', 'play-again');

        var againBtn = document.createElement('a');
        var notification = document.createElement('label');

        againBtn.setAttribute('class', 'again-btn');
        againBtn.innerText = 'Try Again';

        notification.setAttribute('class', 'text-lb');
        notification.innerHTML = this.str;

        playAgain.appendChild(notification);
        playAgain.appendChild(againBtn);
        document.body.appendChild(playAgain);

        againBtn.addEventListener('click', () => {
            this.board.remove();
            playAgain.remove();
            // startScreen.style.visibility = 'visible';
            startScreen.style.display = 'flex';
        });
    }
}