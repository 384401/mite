// --- 遊戲設定 ---
// --- 遊戲設定 ---
// ⚠️ 重要：請確保你的 images 資料夾裡真的有這些檔案，且檔名完全一致 (包括大小寫)
const cardsData = [
    { name: 'cat1', img: 'images/cat1.png' },
    { name: 'cat2', img: 'images/cat2.png' },
    { name: 'cat3', img: 'images/cat3.png' },
   // { name: 'cat4', img: 'images/cat4.png' },
    { name: 'cat5', img: 'images/cat5.png' },
    { name: 'cat6', img: 'images/cat6.png' },
    // { name: 'cat6', img: 'images/cat7.png' }
    // { name: 'cat6', img: 'images/cat8.png' },
     { name: 'cat6', img: 'images/cat9.png' },
    // { name: 'cat6', img: 'images/cat10.png' },
    // 如果你有更多，請繼續往下拉，例如：
    // { name: 'cat7', img: 'images/cat7.png' },
    // { name: 'cat8', img: 'images/cat8.png' },
];

const cardBackImg = 'images/back.png'; // ⚠️ 重要：這是你的卡片背面圖片路徑


// --- HTML 元素引用 ---
const gameBoard = document.getElementById('game-board');
const timerElement = document.getElementById('timer');
const restartBtn = document.getElementById('restart-btn');
const leaderboardList = document.getElementById('leaderboard-list');

// --- 遊戲狀態變數 ---
let cards = []; // 存放所有卡片
let hasFlippedCard = false; // 是否已經翻了一張牌
let lockBoard = false; // 是否鎖定遊戲盤（防止在動畫時翻牌）
let firstCard, secondCard; // 記錄翻開的第一張和第二張牌
let matchedPairs = 0; // 已配對的數量
let totalPairs = cardsData.length; // 總配對數量
let timerInterval; // 計時器的間隔
let milliseconds = 0; // 當前秒數

// --- 遊戲初始化 ---
function initGame() {
    // 1. 準備卡片資料：複製一份，變成兩份
    cards = [...cardsData, ...cardsData];
    
    // 2. 洗牌
    shuffle(cards);

    // 3. 渲染遊戲盤
    renderBoard();

    // 4. 重設狀態
    resetGameState();

    // 5. 顯示排行榜
    displayLeaderboard();
}

// --- 洗牌函式 (Fisher-Yates 洗牌演算法) ---
function shuffle(array) {
    for (let i = array.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [array[i], array[j]] = [array[j], array[i]];
    }
}

// --- 渲染遊戲盤 ---
function renderBoard() {
    gameBoard.innerHTML = ''; // 清空遊戲盤
    cards.forEach(card => {
        const cardElement = document.createElement('div');
        cardElement.classList.add('card');
        cardElement.dataset.name = card.name; // 儲存卡片名稱，用於比較

        // 建立卡片正面
        const frontFace = document.createElement('div');
        frontFace.classList.add('card-front');
        const frontImg = document.createElement('img');
        frontImg.src = card.img;
        frontFace.appendChild(frontImg);

        // 建立卡片背面
        const backFace = document.createElement('div');
        backFace.classList.add('card-back');
        const backImg = document.createElement('img');
        backImg.src = cardBackImg;
        backFace.appendChild(backImg);

        // 將正面和背面加入卡片
        cardElement.appendChild(frontFace);
        cardElement.appendChild(backFace);

        // 為卡片添加點擊事件
        cardElement.addEventListener('click', flipCard);
        
        // 將卡片加入遊戲盤
        gameBoard.appendChild(cardElement);
    });
}

// --- 翻牌邏輯 ---
function flipCard() {
    if (lockBoard) return; // 如果鎖定，什麼都不做
    if (this === firstCard) return; // 如果點擊的是同一張牌，什麼都不做

    this.classList.add('flip'); // 添加翻轉 CSS 類別

    if (!hasFlippedCard) {
        // 第一次翻牌
        hasFlippedCard = true;
        firstCard = this;
        startTimer(); // 第一次翻牌時開始計時
        return;
    }

    // 第二次翻牌
    secondCard = this;
    checkForMatch();
}

// --- 檢查是否配對 ---
function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;

    if (isMatch) {
        // 配對成功
        disableCards();
    } else {
        // 配對失敗
        unflipCards();
    }
}

// --- 配對成功：禁用卡片點擊 ---
function disableCards() {
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    matchedPairs++;

    if (matchedPairs === totalPairs) {
        // 遊戲結束
        gameOver();
    }

    resetBoard(); // 重設翻牌狀態
}

// --- 配對失敗：將卡片翻回去 ---
function unflipCards() {
    lockBoard = true; // 鎖定遊戲盤

    setTimeout(() => {
        firstCard.classList.remove('flip');
        secondCard.classList.remove('flip');
        resetBoard(); // 重設翻牌狀態
    }, 500); // 0.5 秒後翻回去
}

// --- 重設翻牌狀態 ---
function resetBoard() {
    [hasFlippedCard, lockBoard] = [false, false];
    [firstCard, secondCard] = [null, null];
}

// --- 重設遊戲狀態 ---
function resetGameState() {
    stopTimer();
    seconds = 0;
    timerElement.textContent = '0';
    matchedPairs = 0;
}

// --- 計時器函式 ---
function startTimer() {
    if (timerInterval) return;

    timerInterval = setInterval(() => {
        milliseconds += 10; // 每次加 10 毫秒
        
        // 計算分、秒、毫秒
        let min = Math.floor(milliseconds / 60000);
        let sec = Math.floor((milliseconds % 60000) / 1000);
        let ms = Math.floor((milliseconds % 1000) / 10);

        // 補零格式化 (例如 5 秒變成 05)
        let minStr = min.toString().padStart(2, '0');
        let secStr = sec.toString().padStart(2, '0');
        let msStr = ms.toString().padStart(2, '0');

        timerElement.textContent = `${minStr}:${secStr}:${msStr}`;
    }, 10); // 每 10 毫秒更新一次
}

function stopTimer() {
    clearInterval(timerInterval);
    timerInterval = null;
}

// --- 遊戲結束 ---
function gameOver() {
    stopTimer();
    const finalTime = timerElement.textContent;
    
    // 這裡就是噴彩帶的神奇指令！
    confetti({
        particleCount: 150, // 彩帶數量
        spread: 70,         // 噴灑角度
        origin: { y: 0.6 }  // 從螢幕哪個高度噴出
    });

    // 稍微延遲一下再跳出警示視窗，才不會擋住彩帶
    setTimeout(() => {
        alert(`恭喜！你花了 ${finalTime} 完成遊戲！`);
        saveScore(finalTime);
        displayLeaderboard();
    }, 500);
}
function resetGameState() {
    stopTimer();
    milliseconds = 0;
    timerElement.textContent = '00:00:00';
    matchedPairs = 0;
}

// --- 保存分數 (本地排行榜) ---
function saveScore(score) {
    let leaderboard = JSON.parse(localStorage.getItem('catLeaderboard')) || [];
    leaderboard.push(score);
    // 由小到大排序 (時間越短越好)
    leaderboard.sort((a, b) => a - b);
    // 只保留前 5 名
    leaderboard = leaderboard.slice(0, 5);
    localStorage.setItem('catLeaderboard', JSON.stringify(leaderboard));
}

// --- 顯示排行榜 ---
function displayLeaderboard() {
    const leaderboard = JSON.parse(localStorage.getItem('catLeaderboard')) || [];
    leaderboardList.innerHTML = ''; // 清空排行榜
    if (leaderboard.length === 0) {
        leaderboardList.innerHTML = '<li>尚無記錄</li>';
    } else {
        leaderboard.forEach((score, index) => {
            const li = document.createElement('li');
            li.textContent = `第 ${index + 1} 名: ${score} `;
            leaderboardList.appendChild(li);
        });
    }
}

// --- 重新開始按鈕 ---
restartBtn.addEventListener('click', initGame);

// --- 啟動遊戲 ---
initGame();