let upPressed = false;
let downPressed = false;
let leftPressed = false;
let rightPressed = false;

const main = document.querySelector('main');
let enemyCount = 3;
let lives = 3;

// Player = 'P', Wall = '*', Enemy = 'E', Point = ' '
let maze = [
    ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*'],
    ['*', 'P', ' ', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', '*', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', '*', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', '*', '*'],
    ['*', ' ', ' ', '*', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', ' ', ' ', ' ', ' ', ' ', ' ', '*', ' ', '*'],
    ['*', ' ', '*', ' ', ' ', ' ', ' ', ' ', ' ', '*'],
    ['*', '*', '*', '*', '*', '*', '*', '*', '*', '*']
];

function addEnemy() {
    const x = Math.floor(Math.random() * maze.length)
    const y = Math.floor(Math.random() * maze[x].length)

    if (maze[y][x] == ' ') { maze[y][x] = 'E' }
    else { addEnemy() }
}

for (let i = 0; i < enemyCount; i++) { addEnemy() }

function generateMaze() {
    // Populates the maze
    maze.forEach((y) => {
        y.forEach((x) => {
            let block = document.createElement('div')
            block.classList = 'block'

            switch (x) {
                case '*':
                    block.classList.add('wall')
                    break;
                case 'P':
                    block.id = 'player';
                    break;
                case 'E':
                    block.classList.add('enemy');
                    break
                default:
                    block.classList.add('point')
            }
            main.appendChild(block)
        })
    })
}

generateMaze();

function setMovmentGlobals() {
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
}

// Player movement
function keyUp(event) {
    if (event.key === 'ArrowUp') {
        upPressed = false;
    } else if (event.key === 'ArrowDown') {
        downPressed = false;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = false;
    } else if (event.key === 'ArrowRight') {
        rightPressed = false;
    }
}

function keyDown(event) {
    setMovmentGlobals();
    if (event.key === 'ArrowUp') {
        upPressed = true;
    } else if (event.key === 'ArrowDown') {
        downPressed = true;
    } else if (event.key === 'ArrowLeft') {
        leftPressed = true;
    } else if (event.key === 'ArrowRight') {
        rightPressed = true;
    }
}

let player = document.querySelector('#player');
let playerTop = 0;
let playerLeft = 0;

function collision(bttm, left, right, top) {
    let btmL = document.elementFromPoint(left, bttm);
    let btmR = document.elementFromPoint(right, bttm);
    let topL = document.elementFromPoint(left, top);
    let topR = document.elementFromPoint(right, top);
    if (btmL.classList.contains('wall') == false && btmR.classList.contains('wall') == false && topL.classList.contains('wall') == false && topR.classList.contains('wall') == false) {
        return false;
    }
    else {
        return true;
    }
}

let movement = null;
let isRunning = false;

function move() {
    if (!isRunning) return false
    const position = player.getBoundingClientRect()
    let newBottom = position.bottom;
    let newLeft = position.left;
    let newRight = position.right;
    let newTop = position.top;

    if (downPressed) {
        newBottom += 1;
        if (!collision(newBottom, newLeft, newRight, newTop)) { playerTop++; }
        player.classList = 'down';
    }
    else if (upPressed) {
        newTop -= 1;
        if (!collision(newBottom, newLeft, newRight, newTop)) { playerTop--; }
        player.classList = 'up';
    }
    else if (leftPressed) {
        newLeft -= 1;
        if (!collision(newBottom, newLeft, newRight, newTop)) { playerLeft--; }
        player.classList = 'left';
    }
    else if (rightPressed) {
        newRight += 1;
        if (!collision(newBottom, newLeft, newRight, newTop)) { playerLeft++; }
        player.classList = 'right';
    }
    player.style.top = playerTop + 'px';
    player.style.left = playerLeft + 'px';
    checkPoint();
    movement = requestAnimationFrame(move);
}


const startBttn = document.querySelector('.start');
startBttn.addEventListener('click', startGame)
let score = 0;

function startGame() {
    isRunning = true;
    move();
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    startBttn.style.display = 'none';
    moveEnemies();
}

function checkPoint() {
    const points = document.querySelectorAll('.point');
    const position = player.getBoundingClientRect();
    let p = document.querySelector('.score p');
    for (let point of points) {
        let pos = point.getBoundingClientRect()
        if (
            position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) { point.classList.remove('point'); score++; p.innerHTML = score; }
    }

    if (points.length == 0) {
        gameOver();
    }

    const enemies = document.querySelectorAll('.enemy');
    for (let enemy of enemies) {
        let pos = enemy.getBoundingClientRect();
        if (
            position.right > pos.left &&
            position.left < pos.right &&
            position.bottom > pos.top &&
            position.top < pos.bottom
        ) { 
            if(lives != 1) {
                hit();
            }
            else {
                gameOver();
            }

         }

    }
}

let isGameOver = false;

function gameOver() {
    isGameOver = true;
    isRunning = false;
    text = document.querySelector('.start h1');
    text.innerHTML = 'Restart?';
    startBttn.style.display = 'flex';
    cancelAnimationFrame(movement);
    document.removeEventListener('keydown', keyDown);
    document.removeEventListener('keyup', keyUp);
    upPressed = false;
    downPressed = false;
    leftPressed = false;
    rightPressed = false;
    player.classList = 'dead';
    startBttn.removeEventListener('click', startGame);
    startBttn.addEventListener('click', reset);

    setTimeout(() => {
        let username = prompt('Enter Username')
        localStorage.setItem(username, score)
        populateLeaderboard();
    }, 2000)
}

function moveEnemies() {
    const enemies = document.querySelectorAll('.enemy');
    for (let enemy of enemies) {
        moveEnemy(enemy);
    }
}

function moveEnemy(enemy) {
    let enemyTop = 0;
    let enemyLeft = 0;
    let rand = Math.ceil(Math.random() * 4);

    let enemyMovement = setInterval(() => {
        const pos = enemy.getBoundingClientRect();

        let newBottom = pos.bottom;
        let newLeft = pos.left;
        let newRight = pos.right;
        let newTop = pos.top;

        if (rand === 1) newBottom += 1;
        if (rand === 2) newTop -= 1;
        if (rand === 3) newLeft -= 1;
        if (rand === 4) newRight += 1;

        if (!collision(newBottom, newLeft, newRight, newTop)) {
            if (rand === 1) enemyTop++;
            if (rand === 2) enemyTop--;
            if (rand === 3) enemyLeft--;
            if (rand === 4) enemyLeft++;

            enemy.style.top = enemyTop + 'px';
            enemy.style.left = enemyLeft + 'px';
        } else {
            rand = Math.ceil(Math.random() * 4);
        }

        if (isGameOver) { clearInterval(enemyMovement) }
    }, 10);
}

function reset() {
    main.innerHTML = '';
    generateMaze();
    playerTop = 0;
    playerLeft = 0;
    score = 0;
    lives = 3;
    populateLives();
    player = document.querySelector('#player');
    isGameOver = false;
    isRunning = true;
    move();
    document.addEventListener('keydown', keyDown);
    document.addEventListener('keyup', keyUp);
    startBttn.style.display = 'none';

    let p = document.querySelector('.score p');
    p.innerHTML = 0;

    moveEnemies();
}

const bttns = document.querySelectorAll('.controls button');
for (let i = 0; i < bttns.length; i++) {
    bttns[i].addEventListener('click', () => {
        setMovmentGlobals();
        switch (i) {
            case 0:
                leftPressed = true;
                break;
            case 1:
                upPressed = true;
                break;
            case 2:
                rightPressed = true;
                break;
            case 3:
                downPressed = true;
                break;
        }
    })
}

const clearStorage = document.querySelector('.clear');
clearStorage.addEventListener('click', () => { localStorage.clear(); })

function populateLeaderboard() {
    const ol = document.querySelector('.leaderboard ol');
    ol.innerHTML = ''
    let scores = [];

    for (let i = 0; i < localStorage.length; i++) {
        let key = localStorage.key(i);
        let value = localStorage.getItem(key);
        let saved = [key, value];
        scores.push(saved);
    }

    scores.sort((a, b) => b[1] - a[1]);

    num = 0;
    for (let s of scores) {
        if (num < 5) {
            const li = document.createElement('li');
            li.innerHTML = `${s[0]}..........${s[1]}`;
            ol.appendChild(li);
        }
        num++;
    }
}

populateLeaderboard();

function populateLives() {
    const ul = document.querySelector('.lives ul');
    ul.innerHTML = '';
    for(let i = 0; i < lives; i++) {
        const li = document.createElement('li');
        ul.appendChild(li)
    }
}

populateLives();

function hit() {
    lives--;
    isRunning = false;
    setMovmentGlobals();

    populateLives();

    player.classList = 'hit';

    setTimeout(()=>{
        isRunning = true;
        move();
        player.classList.remove('hit');
    }, 1500);
}