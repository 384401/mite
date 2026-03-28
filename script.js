// 1. 基本設定
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwObOZmnIZZQjh7XVpnAetjewh8XYUzZn2OrhWbvWPlvcQTZbLEr-QECj7sZU8T8aIFDw/exec";

// 2. 元素引用
const nameInput = document.getElementById('player-name-input');
const submitScoreBtn = document.getElementById('submit-score-btn');
const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');
const modal = document.getElementById('custom-modal');
const modalMessage = document.getElementById('modal-message');
const modalCloseBtn = document.getElementById('modal-close-btn');

// --- 遊戲設定：大水庫 ---
const allCatImages = [
    'images/cat1.png', 'images/cat2.png', 'images/cat3.png', 
    'images/cat4.png', 'images/cat5.png', 'images/cat6.png',
    'images/cat7.png', 'images/cat8.png', 'images/cat9.png',
    'images/cat10.png', 'images/cat11.png', 'images/cat12.png',
    'images/cat113.png', 'images/cat14.png',// 🚩 你可以在這裡繼續增加無限多張圖片路徑
];

const cardBackImg = 'images/back.png';

// --- 遊戲狀態變數 ---
let cardsData = []; // 每次初始化會從大水庫抓取
let cards = [];
let hasFlippedCard = false;
let lockBoard = false;
let firstCard, secondCard;
let matchedPairs = 0;
let totalPairs = 0; // 改為動態計算
let timerInterval;
let milliseconds = 0;
let startTime;

// --- 遊戲初始化 ---
function initGame() {
    // 🚩 步驟 1：從大水庫隨機選出 6 張不同的圖片
    const selectedImages = shuffle([...allCatImages]).slice(0, 6);

    // 🚩 步驟 2：轉換成遊戲需要的格式
    cardsData = selectedImages.map(imgUrl => {
        // 從路徑抓出檔名當作 ID (例如 images/cat1.png -> cat1)
        const name = imgUrl.split('/').pop().split('.').shift();
        return { name: name, img: imgUrl };
    });

    totalPairs = cardsData.length;
    cards = [...cardsData, ...cardsData];
    shuffle(cards); 
    renderBoard();
    resetGameState();
    displayLeaderboard();
}

// --- 洗牌 (升級版：會回傳結果) ---
function shuffle(array) {
    if (!array) return [];
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
    return array; // 🚩 讓它可以被鏈接使用 (例如 shuffle().slice())
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
    if (this.classList.contains('flip')) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        startTimer();
    } else {
        secondCard = this;
        lockBoard = true; 
        checkForMatch();
    }
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
    setTimeout(() => {
        if (firstCard && secondCard) {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
        }
        resetBoard(); 
    }, 350); 
}

function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

function resetGameState() {
    stopTimer();
    milliseconds = 0;
    startTime = null;
    timerElement.textContent = '00:00:00';
    matchedPairs = 0;
}

// --- 計時器 ---
function startTimer() {
    if (timerInterval) return;
    startTime = Date.now(); 
    timerInterval = setInterval(() => {
        let currentTime = Date.now();
        milliseconds = currentTime - startTime; 
        let min = Math.floor(milliseconds / 60000);
        let sec = Math.floor((milliseconds % 60000) / 1000);
        let ms = Math.floor((milliseconds % 1000) / 10);
        timerElement.textContent = `${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}:${ms.toString().padStart(2, '0')}`;
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

    setTimeout(() => {
        modalMessage.textContent = `你花了 ${finalTime} 完成遊戲！`;
        nameInput.value = "";
        modal.style.display = 'flex';
    }, 500);
}

// --- 資料傳輸 ---
async function uploadScore(name, score) {
    try {
        const response = await fetch(SCRIPT_URL, {
            method: "POST",
            body: JSON.stringify({ name: name, score: score })
        });
        const topData = await response.json();
        renderLeaderboard(topData);
    } catch (error) {
        console.error("上傳失敗:", error);
    }
}

async function displayLeaderboard() {
    try {
        const response = await fetch(SCRIPT_URL);
        const topData = await response.json();
        renderLeaderboard(topData);
    } catch (error) {
        leaderboardList.innerHTML = '<li>讀取失敗</li>';
    }
}

function renderLeaderboard(data) {
    leaderboardList.innerHTML = ''; 
    if (!data || data.length === 0) {
        leaderboardList.innerHTML = '<li>無資料</li>';
        return;
    }
    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item');
        let medal = index === 0 ? "🥇" : index === 1 ? "🥈" : index === 2 ? "🥉" : `${index + 1}.`;
        li.innerHTML = `
            <span class="rank">${medal}</span>
            <span class="name">${item[0]}</span>
            <span class="divider">－</span>
            <span class="score">${item[1]}</span>
        `;
        leaderboardList.appendChild(li);
    });
}

// --- 事件監聽器 ---

modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
    initGame(); 
});

restartBtn.addEventListener('click', initGame);

submitScoreBtn.addEventListener('click', () => {
    const playerName = nameInput.value.trim() || "麵茶";
    const finalTime = timerElement.textContent;

    uploadScore(playerName, finalTime);

    submitScoreBtn.textContent = "上傳中...";
    submitScoreBtn.disabled = true;

    setTimeout(() => {
        modal.style.display = 'none';
        submitScoreBtn.textContent = "紀錄成績";
        submitScoreBtn.disabled = false;
        initGame(); 
    }, 800);
});

// --- 啟動 ---
initGame();