// 貼上你剛剛得到的部署網址
const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwObOZmnIZZQjh7XVpnAetjewh8XYUzZn2OrhWbvWPlvcQTZbLEr-QECj7sZU8T8aIFDw/exec";



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
let startTime; //

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

    // --- 新增：防止重複點擊已經配對成功的牌 ---
    if (this.classList.contains('flip')) return;

    this.classList.add('flip');

    if (!hasFlippedCard) {
        hasFlippedCard = true;
        firstCard = this;
        startTimer();
        return;
    }

    secondCard = this;
    // 一旦翻開第二張，立刻鎖定板子，防止玩家點擊第三張
    lockBoard = true; 
    checkForMatch();
}

// --- 檢查是否配對 ---
function checkForMatch() {
    let isMatch = firstCard.dataset.name === secondCard.dataset.name;
    
    if (isMatch) {
        // 配對成功：執行成功邏輯
        disableCards();
    } else {
        // 配對失敗：執行失敗邏輯
        unflipCards();
    }
    // 🚩 注意：這裡絕對不能放 matchedPairs++ 或 resetBoard()！
    // 必須分開寫在下面兩個函式裡，時機才對。
}

// --- 配對成功 ---
function disableCards() {
    // 1. 移除點擊事件，讓這兩張牌不能再被點
    firstCard.removeEventListener('click', flipCard);
    secondCard.removeEventListener('click', flipCard);
    
    // 2. 只有在這裡才加分
    matchedPairs++;

    // 3. 檢查是否全破
    if (matchedPairs === totalPairs) {
        gameOver();
    }
    
    // 4. 立刻重設變數，準備下一對
    resetBoard();
}

// --- 配對失敗 ---
function unflipCards() {
    // 保持 lockBoard = true (這是在 flipCard 那邊設定的)
    
    setTimeout(() => {
        // 1. 把牌翻回去
        if (firstCard && secondCard) {
            firstCard.classList.remove('flip');
            secondCard.classList.remove('flip');
        }
        
        // 2. 🚩 關鍵：等 350ms 翻回去後，才執行重置與「解鎖」
        // 這樣玩家在翻牌動畫期間怎麼點都沒用，邏輯才不會亂
        resetBoard(); 
    }, 350); // 你想改快手感就在這裡調整數字
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
    startTime = null; // 清空開始時間
    timerElement.textContent = '00:00:00';
    matchedPairs = 0;
}

// --- 計時器函式 ---
function startTimer() {
    if (timerInterval) return;

    // 紀錄點擊那一刻的精確時間戳記
    startTime = Date.now(); 

    timerInterval = setInterval(() => {
        // 計算「現在」跟「開始」差了多少毫秒
        let currentTime = Date.now();
        milliseconds = currentTime - startTime; 
        
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

    setTimeout(() => {
        // 先詢問朋友的名字
        const playerName = prompt("輸入大名：", "麵茶") || "麵茶";
        
        modalMessage.textContent = `${playerName}，你花了 ${finalTime} 完成遊戲！`;
        modal.style.display = 'flex';
        
        // 送出成績並重新抓取排行榜
        uploadScore(playerName, finalTime);
    }, 500);
}

// async 代表這是一個非同步函式
async function uploadScore(name, score) {
    try {
        // fetch 就是「發送請求」，就像寄信一樣
        const response = await fetch(SCRIPT_URL, {
            method: "POST", // 使用 POST 方式傳送資料
            body: JSON.stringify({ name: name, score: score }) // 把資料轉成字串
        });

        // 等 Google 回傳最新的前 5 名
        const top10 = await response.json();
        
        // 拿到資料後，更新網頁上的排行榜畫面
        renderLeaderboard(top10);
    } catch (error) {
        console.error("上傳失敗，請檢查網路或 SCRIPT_URL:", error);
    }
}

// --- 顯示排行榜 ---
async function displayLeaderboard() {
    try {
        // 直接 fetch 網址 (預設是 GET)，Google 就會執行 doGet 並回傳前 5 名
        const response = await fetch(SCRIPT_URL);
        const top10 = await response.json();
        
        // 渲染畫面
        renderLeaderboard(top10);
    } catch (error) {
        console.log("讀取失敗。");
        leaderboardList.innerHTML = '<li>尚無記錄</li>';
    }
}

function renderLeaderboard(data) {
    leaderboardList.innerHTML = ''; 

    if (!data || data.length === 0) {
        leaderboardList.innerHTML = '<li>目前還沒有雲端紀錄，快來搶第一！</li>';
        return;
    }

    data.forEach((item, index) => {
        const li = document.createElement('li');
        li.classList.add('leaderboard-item'); // 增加一個 class 方便寫 CSS

        let medal = "";
        if (index === 0) medal = "🥇";
        else if (index === 1) medal = "🥈";
        else if (index === 2) medal = "🥉";
        else medal = `${index + 1}.`;

        // 🏆 關鍵：將內容拆開，包裹在不同的 span 裡
        li.innerHTML = `
            <span class="rank">${medal}</span>
            <span class="name">${item[0]}</span>
            <span class="divider">－</span>
            <span class="score">${item[1]}</span>
        `;
        
        leaderboardList.appendChild(li);
    });
}


// --- 彈窗關閉按鈕 ---
modalCloseBtn.addEventListener('click', () => {
    modal.style.display = 'none';
});

// --- 重新開始按鈕 ---
restartBtn.addEventListener('click', initGame);

// --- 啟動遊戲 ---
initGame();