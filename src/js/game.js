ipcRenderer.on('start:game', function (e, prop) {
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
        this.flagPlugged = this.mineNumbers;
        this.str = '';

        this.displayTime = this.displayTime.bind(this);
        // Create a board with the selected difficulty level
        this.createBoard(this.rows, this.cols, this.rowWidth, this.rowHeight);

        // Random positions of mines
        this.randomPosMine(this.mineNumbers, this.rows, this.cols);

        this.clickEvent = this.clickEvent.bind(this);
        this.tryAgain = this.tryAgain.bind(this);
        this.contextMenuEvent = this.contextMenuEvent.bind(this);
        this.replayEvent = this.replayEvent.bind(this);
        this.pauseEvent = this.pauseEvent.bind(this);

        this.eventInContent();

        this.replay.addEventListener('click', this.replayEvent);

        this.pause.addEventListener('click', this.pauseEvent);
        
    }

    eventInContent() {
        this.content.addEventListener('contextmenu', this.contextMenuEvent);
        this.content.addEventListener('click', this.clickEvent);
    }

    removeEventInContent() {
        this.content.removeEventListener('contextmenu', this.contextMenuEvent);
        this.content.removeEventListener('click', this.clickEvent);
    }

    contextMenuEvent(e) {
        var tiles = e.target;
        if (tiles.className === 'col') return;
        if (tiles.classList.contains('flag')) {
            this.flagPlugged++;
            this.countFlagLabel.innerHTML = this.flagPlugged;
            tiles.classList.remove('flag');
            tiles.classList.add('hidden');
            tiles.src = './src/img/hidden.jpg';
        } else {
            this.flagPlugged--;
            this.countFlagLabel.innerHTML = this.flagPlugged;
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
            this.gameOver();

        } else {
            this.reveal(row, col);
        }
    }

    replayEvent() {
        this.board.remove();
        startScreen.style.display = 'flex';
    }

    pauseEvent() {
        if (this.pause.id === 'pause') {
            this.pause.id = 'play';
            this.pause.src = './src/img/play.svg';
            this.removeEventInContent();
            clearInterval(this.id);
        } else {
            this.pause.id = 'pause';
            this.pause.src = './src/img/pause.svg';
            this.eventInContent();
            this.id = setInterval(this.displayTime, 1000);
        }
    }

    createBoard(rows, cols, rowWidth, rowHeight) {
        this.board = document.createElement('div');
        this.board.setAttribute('class', 'board');

        this.header = document.createElement('div');
        this.content = document.createElement('div');

        this.clockIcon = document.createElement('img');
        this.countTimeLabel = document.createElement('label');
        this.flagIcon = document.createElement('img');
        this.countFlagLabel = document.createElement('label');
        this.countTime = 0;

        this.replay = document.createElement('img');
        this.pause = document.createElement('img');

        // ----------------------------------->
        this.header.setAttribute('class', 'header');
        this.header.style.width = rowWidth + 4 + 'px';

        this.content.setAttribute('class', 'content');

        this.clockIcon.src = './src/img/clock-icon.svg';
        this.clockIcon.setAttribute('class', 'clock-icon');
        this.clockIcon.setAttribute('draggable', 'false');

        this.countTimeLabel.setAttribute('class', 'count-time');

        this.flagIcon.src = './src/img/flag-icon.svg';
        this.flagIcon.setAttribute('class', 'flag-icon');
        this.flagIcon.setAttribute('draggable', 'false');

        this.countFlagLabel.setAttribute('class', 'count-flag');
        this.countFlagLabel.innerHTML = this.flagPlugged + '';

        this.replay.src = './src/img/replay.svg';
        this.replay.setAttribute('class', 'replay');
        this.replay.setAttribute('draggable', 'false');

        this.pause.src = './src/img/pause.svg';
        this.pause.setAttribute('class', 'pause');
        this.pause.setAttribute('id', 'pause');
        this.pause.setAttribute('draggable', 'false');

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

        this.header.appendChild(this.clockIcon);
        this.header.appendChild(this.countTimeLabel);
        this.header.appendChild(this.flagIcon);
        this.header.appendChild(this.countFlagLabel);
        this.header.appendChild(this.replay);
        this.header.appendChild(this.pause);
        this.board.appendChild(this.header);
        this.board.appendChild(this.content);
        document.body.appendChild(this.board);

        this.displayTime();
        this.countTimePlay();
    }

    countTimePlay() {
        this.id = setInterval(this.displayTime, 1000);
    }

    displayTime() {
        if (this.countTime == 9999) {
            this.gameOver();
        }
        this.countTime = this.countTime < 100 && this.countTime < 10 ? "00" + this.countTime
            : this.countTime < 100 && this.countTime >= 10 ? "0" + this.countTime : this.countTime;
        this.countTimeLabel.innerHTML = '' + this.countTime;
        this.countTime++;
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
        try {
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
        catch (err) {
            console.log('Thấy chưa lỗi rồi');
        }
    }

    getMineCount(i, j) {
        try {
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
        catch (err) {
            console.log('Đừng có click loạn lên như thế, lỗi đấy');
        }
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
        clearInterval(this.id);
        this.str = 'You Win!';
        this.replay.removeEventListener('click', this.replayEvent);
        this.pause.removeEventListener('click', this.pauseEvent);
        this.removeEventInContent();
        this.tryAgain();
    }

    gameOver() {
        clearInterval(this.id);
        this.str = 'You Lose!';
        this.replay.removeEventListener('click', this.replayEvent);
        this.pause.removeEventListener('click', this.pauseEvent);
        this.removeEventInContent();

        var tiles = document.querySelectorAll('.mine');
        var tilesLength = tiles.length;
        var i = 0;

        var id;
        switch (this.mineNumbers) {
            case 10:
                id = setInterval(appearGradually, 200);
                break;
            case 40:
                id = setInterval(appearGradually, 200);
                break;
            default:
                id = setInterval(appearGradually, 100);
                break;
        }

        switch (this.mineNumbers) {
            case 10:
                setTimeout(this.tryAgain, 2500);
                break;
            case 40:
                setTimeout(this.tryAgain, 8500);
                break;
            default:
                setTimeout(this.tryAgain, 10000);
                break;
        }

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
        var span1 = document.createElement('span');
        var span2 = document.createElement('span');
        var span3 = document.createElement('span');
        var span4 = document.createElement('span');

        againBtn.setAttribute('class', 'btn again-btn');
        againBtn.innerText = 'Try Again';

        notification.setAttribute('class', 'text-lb');
        notification.innerHTML = this.str;

        againBtn.appendChild(span1);
        againBtn.appendChild(span2);
        againBtn.appendChild(span3);
        againBtn.appendChild(span4);
        playAgain.appendChild(notification);
        playAgain.appendChild(againBtn);
        document.body.appendChild(playAgain);

        againBtn.addEventListener('click', () => {
            this.board.remove();
            playAgain.remove();
            startScreen.style.display = 'flex';
        });
    }
}