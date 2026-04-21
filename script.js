// 游戏配置
const config = {
    gridSize: 20, // 网格大小
    snakeSpeed: 150, // 移动速度（毫秒）
    initialLength: 3, // 初始长度
    foodColor: '#ff3366', // 食物颜色
    snakeHeadColor: '#00ff8c', // 蛇头颜色
    snakeBodyColor: '#00cc6e', // 蛇身体颜色
    wallColor: '#2a2a2a', // 背景颜色
    gridColor: 'rgba(0, 255, 140, 0.1)' // 网格线颜色
};

// 游戏状态
let gameState = {
    snake: [],
    direction: 'right',
    nextDirection: 'right',
    food: {},
    score: 0,
    highScore: 0,
    isRunning: false,
    isPaused: false,
    gameLoop: null,
    canvas: null,
    ctx: null,
    cellSize: 0
};

// DOM元素
const elements = {
    canvas: document.getElementById('gameCanvas'),
    scoreDisplay: document.getElementById('score'),
    highScoreDisplay: document.getElementById('highScore'),
    startBtn: document.getElementById('startBtn'),
    pauseBtn: document.getElementById('pauseBtn'),
    restartBtn: document.getElementById('restartBtn')
};

// 初始化游戏
function initGame() {
    // 设置Canvas
    gameState.canvas = elements.canvas;
    gameState.ctx = gameState.canvas.getContext('2d');
    gameState.cellSize = gameState.canvas.width / config.gridSize;
    
    // 从本地存储加载最高分
    const savedHighScore = localStorage.getItem('snakeHighScore');
    if (savedHighScore) {
        gameState.highScore = parseInt(savedHighScore);
        elements.highScoreDisplay.textContent = gameState.highScore;
    }
    
    // 初始化蛇
    resetGame();
    
    // 绘制初始状态
    drawGame();
    
    // 绑定事件
    bindEvents();
}

// 重置游戏
function resetGame() {
    // 初始化蛇的位置（居中）
    const centerPos = Math.floor(config.gridSize / 2);
    gameState.snake = [];
    
    for (let i = 0; i < config.initialLength; i++) {
        gameState.snake.push({
            x: centerPos - i,
            y: centerPos
        });
    }
    
    // 重置方向
    gameState.direction = 'right';
    gameState.nextDirection = 'right';
    
    // 生成食物
    generateFood();
    
    // 重置分数
    gameState.score = 0;
    elements.scoreDisplay.textContent = gameState.score;
    
    // 重置游戏状态
    gameState.isPaused = false;
}

// 生成食物
function generateFood() {
    let newFood;
    let onSnake;
    
    do {
        onSnake = false;
        newFood = {
            x: Math.floor(Math.random() * config.gridSize),
            y: Math.floor(Math.random() * config.gridSize)
        };
        
        // 检查食物是否生成在蛇身上
        for (let segment of gameState.snake) {
            if (segment.x === newFood.x && segment.y === newFood.y) {
                onSnake = true;
                break;
            }
        }
    } while (onSnake);
    
    gameState.food = newFood;
}

// 开始游戏
function startGame() {
    if (!gameState.isRunning) {
        gameState.isRunning = true;
        gameState.isPaused = false;
        
        // 隐藏开始按钮，显示暂停按钮
        elements.startBtn.style.display = 'none';
        elements.pauseBtn.style.display = 'inline-block';
        
        // 开始游戏循环
        gameLoop();
    }
}

// 暂停/继续游戏
function togglePause() {
    if (gameState.isRunning) {
        gameState.isPaused = !gameState.isPaused;
        
        if (!gameState.isPaused && !gameState.gameLoop) {
            gameLoop();
        }
        
        elements.pauseBtn.textContent = gameState.isPaused ? '继续' : '暂停';
    }
}

// 游戏循环
function gameLoop() {
    if (!gameState.isRunning || gameState.isPaused) {
        gameState.gameLoop = null;
        return;
    }
    
    // 移动蛇
    moveSnake();
    
    // 检查碰撞
    if (checkCollision()) {
        gameOver();
        return;
    }
    
    // 检查是否吃到食物
    checkFood();
    
    // 绘制游戏
    drawGame();
    
    // 继续游戏循环
    gameState.gameLoop = setTimeout(gameLoop, config.snakeSpeed);
}

// 移动蛇
function moveSnake() {
    // 更新方向
    gameState.direction = gameState.nextDirection;
    
    // 获取蛇头
    const head = {
        x: gameState.snake[0].x,
        y: gameState.snake[0].y
    };
    
    // 根据方向移动蛇头
    switch (gameState.direction) {
        case 'up':
            head.y--;
            break;
        case 'down':
            head.y++;
            break;
        case 'left':
            head.x--;
            break;
        case 'right':
            head.x++;
            break;
    }
    
    // 将新蛇头添加到数组开头
    gameState.snake.unshift(head);
}

// 检查碰撞
function checkCollision() {
    const head = gameState.snake[0];
    
    // 检查是否撞墙
    if (head.x < 0 || head.x >= config.gridSize || head.y < 0 || head.y >= config.gridSize) {
        return true;
    }
    
    // 检查是否撞到自己
    for (let i = 1; i < gameState.snake.length; i++) {
        if (head.x === gameState.snake[i].x && head.y === gameState.snake[i].y) {
            return true;
        }
    }
    
    return false;
}

// 检查是否吃到食物
function checkFood() {
    const head = gameState.snake[0];
    
    if (head.x === gameState.food.x && head.y === gameState.food.y) {
        // 增加分数
        gameState.score += 10;
        elements.scoreDisplay.textContent = gameState.score;
        
        // 更新最高分
        if (gameState.score > gameState.highScore) {
            gameState.highScore = gameState.score;
            elements.highScoreDisplay.textContent = gameState.highScore;
            localStorage.setItem('snakeHighScore', gameState.highScore);
        }
        
        // 生成新食物
        generateFood();
    } else {
        // 如果没吃到食物，移除尾部
        gameState.snake.pop();
    }
}

// 绘制游戏
function drawGame() {
    const ctx = gameState.ctx;
    const cellSize = gameState.cellSize;
    
    // 清空画布
    ctx.fillStyle = config.wallColor;
    ctx.fillRect(0, 0, gameState.canvas.width, gameState.canvas.height);
    
    // 绘制网格线
    ctx.strokeStyle = config.gridColor;
    ctx.lineWidth = 1;
    
    for (let i = 0; i <= config.gridSize; i++) {
        // 垂直线
        ctx.beginPath();
        ctx.moveTo(i * cellSize, 0);
        ctx.lineTo(i * cellSize, gameState.canvas.height);
        ctx.stroke();
        
        // 水平线
        ctx.beginPath();
        ctx.moveTo(0, i * cellSize);
        ctx.lineTo(gameState.canvas.width, i * cellSize);
        ctx.stroke();
    }
    
    // 绘制食物
    ctx.fillStyle = config.foodColor;
    ctx.beginPath();
    ctx.arc(
        gameState.food.x * cellSize + cellSize / 2,
        gameState.food.y * cellSize + cellSize / 2,
        cellSize / 2 - 2,
        0,
        Math.PI * 2
    );
    ctx.fill();
    
    // 绘制蛇
    for (let i = 0; i < gameState.snake.length; i++) {
        const segment = gameState.snake[i];
        
        // 设置蛇头和蛇身不同的颜色
        ctx.fillStyle = i === 0 ? config.snakeHeadColor : config.snakeBodyColor;
        
        // 绘制蛇的身体部分
        ctx.beginPath();
        ctx.roundRect(
            segment.x * cellSize + 2,
            segment.y * cellSize + 2,
            cellSize - 4,
            cellSize - 4,
            5
        );
        ctx.fill();
        
        // 为蛇头绘制眼睛，增加视觉效果
        if (i === 0) {
            ctx.fillStyle = '#121212';
            const eyeSize = cellSize / 8;
            const eyeOffset = cellSize / 3;
            
            // 根据方向调整眼睛位置
            switch (gameState.direction) {
                case 'up':
                    ctx.beginPath();
                    ctx.arc(segment.x * cellSize + cellSize / 2 - eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * cellSize + cellSize / 2 + eyeOffset, segment.y * cellSize + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'down':
                    ctx.beginPath();
                    ctx.arc(segment.x * cellSize + cellSize / 2 - eyeOffset, segment.y * cellSize + cellSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * cellSize + cellSize / 2 + eyeOffset, segment.y * cellSize + cellSize - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'left':
                    ctx.beginPath();
                    ctx.arc(segment.x * cellSize + eyeOffset, segment.y * cellSize + cellSize / 2 - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * cellSize + eyeOffset, segment.y * cellSize + cellSize / 2 + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
                case 'right':
                    ctx.beginPath();
                    ctx.arc(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize / 2 - eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.arc(segment.x * cellSize + cellSize - eyeOffset, segment.y * cellSize + cellSize / 2 + eyeOffset, eyeSize, 0, Math.PI * 2);
                    ctx.fill();
                    break;
            }
        }
    }
}

// 游戏结束
function gameOver() {
    gameState.isRunning = false;
    clearTimeout(gameState.gameLoop);
    gameState.gameLoop = null;
    
    // 显示开始按钮，隐藏暂停按钮
    elements.startBtn.style.display = 'inline-block';
    elements.pauseBtn.style.display = 'none';
    elements.pauseBtn.textContent = '暂停';
    
    // 显示游戏结束提示
    alert(`游戏结束！\n得分：${gameState.score}\n最高分：${gameState.highScore}`);
}

// 绑定事件
function bindEvents() {
    // 按钮事件
    elements.startBtn.addEventListener('click', startGame);
    elements.pauseBtn.addEventListener('click', togglePause);
    elements.restartBtn.addEventListener('click', () => {
        resetGame();
        drawGame();
        if (gameState.isRunning) {
            startGame();
        }
    });
    
    // 键盘控制
    document.addEventListener('keydown', (e) => {
        // 阻止方向键滚动页面
        if ([37, 38, 39, 40].includes(e.keyCode)) {
            e.preventDefault();
        }
        
        switch (e.keyCode) {
            case 38: // 上
                if (gameState.direction !== 'down') {
                    gameState.nextDirection = 'up';
                }
                break;
            case 40: // 下
                if (gameState.direction !== 'up') {
                    gameState.nextDirection = 'down';
                }
                break;
            case 37: // 左
                if (gameState.direction !== 'right') {
                    gameState.nextDirection = 'left';
                }
                break;
            case 39: // 右
                if (gameState.direction !== 'left') {
                    gameState.nextDirection = 'right';
                }
                break;
            case 32: // 空格
                if (gameState.isRunning) {
                    togglePause();
                } else {
                    startGame();
                }
                break;
        }
    });
    
    // 窗口大小变化时重新绘制游戏
    window.addEventListener('resize', drawGame);
}

// 当页面加载完成后初始化游戏
window.addEventListener('load', initGame);