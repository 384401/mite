// --- 遊戲設定 ---
const cardsData = [
    { name: 'cat1', img: 'images/cat1.png' },
    { name: 'cat2', img: 'images/cat2.png' },
    { name: 'cat3', img: 'images/cat3.png' },
    { name: 'cat5', img: 'images/cat5.png' },
    { name: 'cat6', img: 'images/cat6.png' },
    { name: 'cat9', img: 'images/cat9.png' },
];

const cardBackImg = 'images/back.png';

// --- HTML 元素引用 ---
const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// --- 彈窗元素引用 ---
const modal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

// --- 遊戲狀態變數 ---
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
let totalPairs = cardsData.length;
let timerInterval;
let milliseconds = 0;

// --- 遊戲初始化 ---
function initGame() {
    cards = [...cardsData, ...cardsData];
    shuffle(cards);
    renderBoard();
    resetGameState();
    displayLeaderboard();
}

// --- 洗牌函式 ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 渲染遊戲盤 ---
function renderBoard() {
    gameBoard.innerHTML = '';
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name;

        const frontFace = document.createElement('div');
        frontFace.classList.add('card-front');
        const frontImg = document.createElement('img');
        frontImg.src = card.img;
        frontFace.appendChild(frontImg);

        const backFace = document.createElement('div');
        backFace.classList.add('card-back');
        const backImg = document.createElement('img');
        backImg.src = cardBackImg;
        backFace.appendChild(backImg);

        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);
        cardElement.addEventListener('click', flipCard);
        gameBoard.appendChild(cardElement);
    });
}

// --- 翻牌邏輯 ---
function flipCard() {
    if (lockBoard) return;
    if (this === firstCard) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        startTimer();
        return;
    }

    secondCard = this;
    checkForMatch();
}

// --- 檢查是否配對 ---
function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    if (isMatch) {
        disableCards();
    } else {
        unflipCards();
    }
}

// --- 配對成功 ---
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;

    if (matchedPairs === totalPairs) {
        gameOver();
    }
    resetBoard();
}

// --- 配對失敗 ---
function unflipCards() {
    lockBoard = true;
    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard();
    }, 500);
}

// --- 重設翻牌狀態 ---
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// --- 重設遊戲狀態 ---
function resetGameState() {
    stopTimer();
    milliseconds = 0;
    timerElement.textContent = '00:00:00';
    matchedPairs = 0;
}

// --- 計時器函式 ---
function startTimer() {
    if (timerInterval) return;
    timerInterval = setInterval(() => {
        milliseconds += 10;
        let min = Math.floor(milliseconds / 60000);
        let sec = Math.floor((milliseconds % 60000) / 1000);
        let ms = Math.floor((milliseconds % 1000) / 10);

        let minStr = min.toString().padStart(2, '0');
        let secStr = sec.toString().padStart(2, '0');
        let msStr = ms.toString().padStart(2, '0');

        timerElement.textContent = `${minStr}:${secStr}:${msStr}`;
    }, 10);
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// --- 遊戲結束 ---
function gameOver() {
    stopTimer();
    const finalTime = timerElement.textContent;
    
    confetti({
        particleCount: 150,
        spread: 70,
        origin: { y: 0.6 }
    });

    // 改用自訂彈窗
    setTimeout(() => {
        modalMessage.textContent = `你花了 ${finalTime} 完成遊戲！`;
        modal.style.display = 'flex';
        saveScore(finalTime);
        displayLeaderboard();
    }, 500);
}

// --- 保存分數 ---
function saveScore(score) {
    let leaderboard = JSON.parse(localStorage.getItem('catLeaderboard')) || [];
    leaderboard.push(score);
    leaderboard.sort(); // 時間格式字串可以直接排序
    leaderboard = leaderboard.slice(0, 5);
    localStorage.setItem('catLeaderboard', JSON.stringify(leaderboard));
}

// --- 顯示排行榜 ---
function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('catLeaderboard')) || [];
    leaderboardList.innerHTML = '';
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>尚無記錄</li>';
    } else {
        leaderboard.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `第 ${index + 1} 名: ${score}`;
            leaderboardList.appendChild(li);
        });
    }
}

// --- 彈窗關閉按鈕 ---
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// --- 重新開始按鈕 ---
restartBtn.addEventListener('click', initGame);

// --- 啟動遊戲 ---
initGame();