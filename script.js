const canvas = document.getElementById("game");
const ctx = canvas.getContext("2d");

const scoreElement = document.getElementById("score");
const startScreen = document.getElementById("start-screen");
const gameOverScreen = document.getElementById("game-over-screen");
const finalScore = document.getElementById("final-score");

const startButton = document.getElementById("start-button");
const restartButton = document.getElementById("restart-button");

const leftButton = document.getElementById("left-button");
const rightButton = document.getElementById("right-button");

let width = 0;
let height = 0;

let running = false;
let score = 0;
let lastTime = 0;

let spawnTimer = 0;
let coinTimer = 0;

let speed = 300;
let playerLane = 1;

let roadOffset = 0;

let enemies = [];
let coins = [];

let enemyId = 0;


// ==========================================
// TAMANHO DO CANVAS
// ==========================================

function resize() {

    const rect =
        canvas.getBoundingClientRect();

    width = rect.width;
    height = rect.height;

    const ratio =
        Math.min(
            window.devicePixelRatio || 1,
            2
        );

    canvas.width =
        Math.floor(width * ratio);

    canvas.height =
        Math.floor(height * ratio);

    ctx.setTransform(
        ratio,
        0,
        0,
        ratio,
        0,
        0
    );
}

window.addEventListener(
    "resize",
    resize
);

window.addEventListener(
    "orientationchange",
    () => {
        setTimeout(resize, 100);
    }
);

resize();


// ==========================================
// CONFIGURAÇÃO RESPONSIVA DA ESTRADA
// ==========================================

function getRoadData() {

    const mobile =
        width < 600;

    const tablet =
        width >= 600 &&
        width < 1000;


    let topRatio;
    let bottomRatio;


    if (mobile) {

        topRatio = 0.24;
        bottomRatio = 1.18;

    } else if (tablet) {

        topRatio = 0.27;
        bottomRatio = 1.32;

    } else {

        topRatio = 0.30;
        bottomRatio = 1.45;
    }


    return {

        horizon:
            height * 0.18,

        roadTop:
            Math.min(
                width * topRatio,
                280
            ),

        roadBottom:
            Math.min(
                width * bottomRatio,
                1150
            )
    };
}


// ==========================================
// ESTRADA
// ==========================================

function drawRoad() {

    const road =
        getRoadData();

    const horizon =
        road.horizon;

    const roadTop =
        road.roadTop;

    const roadBottom =
        road.roadBottom;


    // ======================================
    // CÉU
    // ======================================

    const sky =
        ctx.createLinearGradient(
            0,
            0,
            0,
            horizon
        );

    sky.addColorStop(
        0,
        "#02030a"
    );

    sky.addColorStop(
        1,
        "#151d42"
    );

    ctx.fillStyle = sky;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );


    // ======================================
    // CHÃO
    // ======================================

    ctx.fillStyle =
        "#03050b";

    ctx.fillRect(
        0,
        horizon,
        width,
        height - horizon
    );


    // ======================================
    // ESTRADA
    // ======================================

    ctx.beginPath();

    ctx.moveTo(
        width / 2 - roadTop / 2,
        horizon
    );

    ctx.lineTo(
        width / 2 + roadTop / 2,
        horizon
    );

    ctx.lineTo(
        width / 2 + roadBottom / 2,
        height
    );

    ctx.lineTo(
        width / 2 - roadBottom / 2,
        height
    );

    ctx.closePath();


    const roadGradient =
        ctx.createLinearGradient(
            0,
            horizon,
            0,
            height
        );

    roadGradient.addColorStop(
        0,
        "#111522"
    );

    roadGradient.addColorStop(
        1,
        "#292d38"
    );

    ctx.fillStyle =
        roadGradient;

    ctx.fill();


    // ======================================
    // BORDAS
    // ======================================

    ctx.shadowBlur = 18;

    ctx.shadowColor =
        "#35d7ff";

    ctx.strokeStyle =
        "#35d7ff";

    ctx.lineWidth =
        Math.max(
            3,
            width * 0.004
        );


    // Esquerda
    ctx.beginPath();

    ctx.moveTo(
        width / 2 - roadTop / 2,
        horizon
    );

    ctx.lineTo(
        width / 2 - roadBottom / 2,
        height
    );

    ctx.stroke();


    // Direita
    ctx.beginPath();

    ctx.moveTo(
        width / 2 + roadTop / 2,
        horizon
    );

    ctx.lineTo(
        width / 2 + roadBottom / 2,
        height
    );

    ctx.stroke();


    ctx.shadowBlur = 0;


    // ======================================
    // FAIXAS
    // ======================================

    for (
        let lane = 1;
        lane <= 2;
        lane++
    ) {

        const topX =
            width / 2 +
            (lane - 1.5) *
            roadTop / 3;


        const bottomX =
            width / 2 +
            (lane - 1.5) *
            roadBottom / 3;


        for (
            let i = 0;
            i < 16;
            i++
        ) {

            const progress =
                (
                    i * 0.09 +
                    roadOffset
                ) % 1;


            const nextProgress =
                Math.min(
                    progress + 0.045,
                    1
                );


            const y1 =
                horizon +
                Math.pow(
                    progress,
                    2
                ) *
                (height - horizon);


            const y2 =
                horizon +
                Math.pow(
                    nextProgress,
                    2
                ) *
                (height - horizon);


            const x1 =
                topX +
                (
                    bottomX - topX
                ) *
                Math.pow(
                    progress,
                    1.5
                );


            const x2 =
                topX +
                (
                    bottomX - topX
                ) *
                Math.pow(
                    nextProgress,
                    1.5
                );


            ctx.strokeStyle =
                "rgba(255,255,255,0.75)";

            ctx.lineWidth =
                Math.max(
                    2,
                    2 + progress * 6
                );


            ctx.beginPath();

            ctx.moveTo(
                x1,
                y1
            );

            ctx.lineTo(
                x2,
                y2
            );

            ctx.stroke();
        }
    }


    // ======================================
    // LUZES
    // ======================================

    for (
        let i = 0;
        i < 24;
        i++
    ) {

        const progress =
            (
                i * 0.065 +
                roadOffset * 0.8
            ) % 1;


        const y =
            horizon +
            Math.pow(
                progress,
                2
            ) *
            (height - horizon);


        const roadWidth =
            roadTop +
            (
                roadBottom -
                roadTop
            ) *
            progress;


        const sideDistance =
            Math.max(
                12,
                width * 0.018
            );


        const leftX =
            width / 2 -
            roadWidth / 2 -
            sideDistance;


        const rightX =
            width / 2 +
            roadWidth / 2 +
            sideDistance;


        const size =
            Math.max(
                2,
                2 + progress * 5
            );


        ctx.fillStyle =
            "#35d7ff";

        ctx.shadowBlur = 15;

        ctx.shadowColor =
            "#35d7ff";


        ctx.beginPath();

        ctx.arc(
            leftX,
            y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.beginPath();

        ctx.arc(
            rightX,
            y,
            size,
            0,
            Math.PI * 2
        );

        ctx.fill();


        ctx.shadowBlur = 0;
    }


    // ======================================
    // BRILHO NO HORIZONTE
    // ======================================

    const glow =
        ctx.createRadialGradient(
            width / 2,
            horizon,
            0,
            width / 2,
            horizon,
            width * 0.6
        );


    glow.addColorStop(
        0,
        "rgba(53,215,255,0.35)"
    );

    glow.addColorStop(
        1,
        "rgba(53,215,255,0)"
    );


    ctx.fillStyle =
        glow;

    ctx.fillRect(
        0,
        0,
        width,
        height
    );
}


// ==========================================
// POSIÇÃO DAS PISTAS
// ==========================================

function getLaneX(
    lane,
    progress = 1
) {

    const road =
        getRoadData();


    const p =
        Math.max(
            0,
            Math.min(
                progress,
                1
            )
        );


    const roadWidth =
        road.roadTop +
        (
            road.roadBottom -
            road.roadTop
        ) *
        Math.pow(
            p,
            1.25
        );


    return (
        width / 2 +
        (lane - 1) *
        roadWidth / 3
    );
}


// ==========================================
// POSIÇÃO NA ESTRADA
// ==========================================

function getRoadPosition(
    lane,
    progress
) {

    const road =
        getRoadData();


    const p =
        Math.max(
            0,
            Math.min(
                progress,
                1.2
            )
        );


    return {

        x:
            getLaneX(
                lane,
                p
            ),

        y:
            road.horizon +
            Math.pow(
                p,
                1.85
            ) *
            (
                height -
                road.horizon
            )
    };
}


// ==========================================
// PLAYER
// ==========================================

function drawPlayer() {

    const x =
        getLaneX(
            playerLane,
            1
        );


    const y =
        height * 0.78;


    // Tamanho proporcional
    const base =
        Math.min(
            width,
            height
        );


    const carWidth =
        Math.max(
            42,
            Math.min(
                55,
                base * 0.075
            )
        );


    const carHeight =
        carWidth * 1.73;


    // Sombra
    ctx.fillStyle =
        "rgba(0,0,0,0.5)";

    ctx.fillRect(
        x - carWidth * 0.64,
        y + carHeight * 0.42,
        carWidth * 1.28,
        carHeight * 0.15
    );


    // Glow
    ctx.shadowBlur =
        Math.max(
            15,
            width * 0.025
        );

    ctx.shadowColor =
        "#35d7ff";

    ctx.fillStyle =
        "#35d7ff";


    // Corpo
    ctx.beginPath();

    ctx.roundRect(
        x - carWidth / 2,
        y - carHeight / 2,
        carWidth,
        carHeight,
        carWidth * 0.20
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    // Vidro
    ctx.fillStyle =
        "#111827";

    ctx.fillRect(
        x - carWidth * 0.33,
        y - carHeight * 0.26,
        carWidth * 0.66,
        carHeight * 0.27
    );


    // Faróis
    ctx.fillStyle =
        "#ffffff";


    const lightWidth =
        carWidth * 0.22;


    const lightHeight =
        Math.max(
            4,
            carHeight * 0.075
        );


    ctx.fillRect(
        x - carWidth * 0.36,
        y + carHeight * 0.26,
        lightWidth,
        lightHeight
    );


    ctx.fillRect(
        x + carWidth * 0.14,
        y + carHeight * 0.26,
        lightWidth,
        lightHeight
    );
}


// ==========================================
// CRIAR CARRO
// ==========================================

function createEnemy() {

    const lane =
        Math.floor(
            Math.random() * 3
        );


    enemies.push({

        id:
            enemyId++,

        lane:

            lane,

        // Começa atrás do horizonte
        progress:
            -0.12,

        speedMultiplier:
            0.90 +
            Math.random() * 0.20,

        type:
            Math.floor(
                Math.random() * 3
            )
    });
}


// ==========================================
// DESENHAR CARRO
// ==========================================

function drawEnemy(enemy) {

    if (
        enemy.progress < 0
    ) {
        return;
    }


    const position =
        getRoadPosition(
            enemy.lane,
            enemy.progress
        );


    const x =
        position.x;

    const y =
        position.y;


    const progress =
        Math.max(
            enemy.progress,
            0
        );


    const scale =
        0.12 +
        Math.pow(
            progress,
            0.75
        );


    const w =
        54 * scale;

    const h =
        90 * scale;


    // Aparecimento suave
    let alpha = 1;


    if (
        progress < 0.08
    ) {

        alpha =
            progress / 0.08;
    }


    ctx.save();

    ctx.globalAlpha =
        Math.max(
            0,
            Math.min(
                alpha,
                1
            )
        );


    // Sombra
    ctx.fillStyle =
        "rgba(0,0,0,0.45)";

    ctx.fillRect(
        x - w / 2 - 5,
        y + h / 2 - 3,
        w + 10,
        Math.max(
            2,
            8 * scale
        )
    );


    // Cor
    let carColor =
        "#e83d55";


    if (
        enemy.type === 1
    ) {

        carColor =
            "#ff315f";

    } else if (
        enemy.type === 2
    ) {

        carColor =
            "#c92746";
    }


    // Corpo
    ctx.shadowBlur =
        20 * scale + 4;

    ctx.shadowColor =
        carColor;

    ctx.fillStyle =
        carColor;


    ctx.beginPath();

    ctx.roundRect(
        x - w / 2,
        y - h / 2,
        w,
        h,
        Math.max(
            3,
            10 * scale
        )
    );

    ctx.fill();


    ctx.shadowBlur = 0;


    // Vidro
    ctx.fillStyle =
        "#101522";

    ctx.fillRect(
        x - w * 0.33,
        y - h * 0.25,
        w * 0.66,
        h * 0.25
    );


    // Faróis
    ctx.fillStyle =
        "#ffb3b3";


    ctx.fillRect(
        x - w * 0.37,
        y + h * 0.27,
        w * 0.22,
        Math.max(
            2,
            7 * scale
        )
    );


    ctx.fillRect(
        x + w * 0.15,
        y + h * 0.27,
        w * 0.22,
        Math.max(
            2,
            7 * scale
        )
    );


    ctx.restore();
}


// ==========================================
// CRIAR MOEDA
// ==========================================

function createCoin() {

    const lane =
        Math.floor(
            Math.random() * 3
        );


    coins.push({

        lane:
            lane,

        progress:
            -0.05,

        rotation:
            0,

        value:
            35
    });
}


// ==========================================
// DESENHAR MOEDA
// ==========================================

function drawCoin(coin) {

    if (
        coin.progress < 0
    ) {
        return;
    }


    const position =
        getRoadPosition(
            coin.lane,
            coin.progress
        );


    const progress =
        Math.max(
            coin.progress,
            0
        );


    const size =
        Math.max(
            5,
            4 + progress * 15
        );


    ctx.save();


    if (
        progress < 0.08
    ) {

        ctx.globalAlpha =
            progress / 0.08;
    }


    ctx.translate(
        position.x,
        position.y
    );


    ctx.rotate(
        coin.rotation
    );


    ctx.shadowBlur =
        10 +
        progress * 15;

    ctx.shadowColor =
        "#ffd43b";


    ctx.strokeStyle =
        "#ffd43b";


    ctx.lineWidth =
        Math.max(
            2,
            3 + progress * 5
        );


    ctx.beginPath();

    ctx.arc(
        0,
        0,
        size,
        0,
        Math.PI * 2
    );

    ctx.stroke();


    // Brilho
    if (
        progress > 0.25
    ) {

        ctx.strokeStyle =
            "#fff3a3";

        ctx.lineWidth =
            Math.max(
                1,
                1 + progress * 2
            );


        ctx.beginPath();

        ctx.arc(
            0,
            0,
            size * 0.55,
            0,
            Math.PI * 2
        );

        ctx.stroke();
    }


    ctx.restore();
}


// ==========================================
// COLISÃO
// ==========================================

function collision(
    ax,
    ay,
    aw,
    ah,
    bx,
    by,
    bw,
    bh
) {

    return (

        ax < bx + bw &&

        ax + aw > bx &&

        ay < by + bh &&

        ay + ah > by
    );
}


// ==========================================
// GAME OVER
// ==========================================

function endGame() {

    running = false;

    finalScore.textContent =
        Math.floor(score);

    gameOverScreen.classList.remove(
        "hidden"
    );
}


// ==========================================
// ATUALIZAÇÃO
// ==========================================

function update(delta) {

    if (!running) {
        return;
    }


    // Pontuação
    score +=
        delta * 10;


    scoreElement.textContent =
        Math.floor(score);


    // Velocidade
    speed =
        300 +
        score * 2;


    // Estrada
    roadOffset +=
        delta *
        (speed / 400);

    roadOffset %= 1;


    // ======================================
    // CARROS
    // ======================================

    spawnTimer -= delta;


    if (
        spawnTimer <= 0
    ) {

        createEnemy();


        const difficulty =
            Math.min(
                score / 1200,
                0.40
            );


        spawnTimer =
            0.85 +
            Math.random() * 0.70 -
            difficulty;


        if (
            spawnTimer < 0.45
        ) {

            spawnTimer =
                0.45;
        }
    }


    // ======================================
    // MOEDAS
    // ======================================

    coinTimer -= delta;


    if (
        coinTimer <= 0
    ) {

        createCoin();


        coinTimer =
            0.70 +
            Math.random() * 1.20;
    }


    // ======================================
    // MOVIMENTO DOS CARROS
    // ======================================

    enemies.forEach(
        enemy => {

            enemy.progress +=
                delta *
                (speed / 900) *
                enemy.speedMultiplier;
        }
    );


    // ======================================
    // MOVIMENTO DAS MOEDAS
    // ======================================

    coins.forEach(
        coin => {

            coin.progress +=
                delta *
                (speed / 900) *
                0.88;


            coin.rotation +=
                delta * 6;
        }
    );


    // ======================================
    // PLAYER
    // ======================================

    const playerX =
        getLaneX(
            playerLane,
            1
        );


    const playerY =
        height * 0.78;


    const base =
        Math.min(
            width,
            height
        );


    const playerWidth =
        Math.max(
            42,
            Math.min(
                55,
                base * 0.075
            )
        );


    const playerHeight =
        playerWidth * 1.73;


    // ======================================
    // COLISÃO
    // ======================================

    for (
        const enemy of enemies
    ) {

        if (
            enemy.progress < 0.65
        ) {
            continue;
        }


        const position =
            getRoadPosition(
                enemy.lane,
                enemy.progress
            );


        const scale =
            0.12 +
            Math.pow(
                Math.max(
                    enemy.progress,
                    0
                ),
                0.75
            );


        const enemyWidth =
            54 * scale;


        const enemyHeight =
            90 * scale;


        if (
            collision(

                playerX -
                    playerWidth * 0.45,

                playerY -
                    playerHeight * 0.48,

                playerWidth * 0.90,

                playerHeight * 0.90,

                position.x -
                    enemyWidth / 2,

                position.y -
                    enemyHeight / 2,

                enemyWidth,

                enemyHeight
            )
        ) {

            endGame();

            return;
        }
    }


    // ======================================
    // MOEDAS
    // ======================================

    for (
        let i = coins.length - 1;
        i >= 0;
        i--
    ) {

        const coin =
            coins[i];


        if (
            coin.progress < 0.60
        ) {
            continue;
        }


        const position =
            getRoadPosition(
                coin.lane,
                coin.progress
            );


        const collectDistance =
            Math.max(
                30,
                width * 0.035
            );


        if (

            Math.abs(
                position.x -
                playerX
            ) < collectDistance &&

            Math.abs(
                position.y -
                playerY
            ) < 75

        ) {

            score +=
                coin.value;


            coins.splice(
                i,
                1
            );
        }
    }


    // ======================================
    // LIMPEZA
    // ======================================

    enemies =
        enemies.filter(
            enemy =>
                enemy.progress < 1.20
        );


    coins =
        coins.filter(
            coin =>
                coin.progress < 1.20
        );
}


// ==========================================
// DESENHAR
// ==========================================

function draw() {

    ctx.clearRect(
        0,
        0,
        width,
        height
    );


    drawRoad();


    coins.forEach(
        drawCoin
    );


    enemies.forEach(
        drawEnemy
    );


    drawPlayer();
}


// ==========================================
// LOOP
// ==========================================

function gameLoop(time) {

    const delta =
        Math.min(
            (time - lastTime) / 1000,
            0.05
        );


    lastTime =
        time;


    update(delta);

    draw();


    requestAnimationFrame(
        gameLoop
    );
}


// ==========================================
// INICIAR
// ==========================================

function startGame() {

    score = 0;

    speed = 300;

    playerLane = 1;

    roadOffset = 0;

    enemies = [];

    coins = [];

    enemyId = 0;

    spawnTimer = 0.8;

    coinTimer = 0.8;

    running = true;


    scoreElement.textContent =
        "0";


    startScreen.classList.add(
        "hidden"
    );


    gameOverScreen.classList.add(
        "hidden"
    );
}


// ==========================================
// MOVIMENTO
// ==========================================

function moveLeft() {

    if (!running) {
        return;
    }


    if (
        playerLane > 0
    ) {

        playerLane--;
    }
}


function moveRight() {

    if (!running) {
        return;
    }


    if (
        playerLane < 2
    ) {

        playerLane++;
    }
}


// ==========================================
// TECLADO
// ==========================================

document.addEventListener(
    "keydown",
    event => {

        const key =
            event.key.toLowerCase();


        if (
            key === "arrowleft" ||
            key === "a"
        ) {

            moveLeft();
        }


        if (
            key === "arrowright" ||
            key === "d"
        ) {

            moveRight();
        }
    }
);


// ==========================================
// TOQUE / CELULAR
// ==========================================

startButton.addEventListener(
    "click",
    startGame
);


restartButton.addEventListener(
    "click",
    startGame
);


leftButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        moveLeft();
    }
);


rightButton.addEventListener(
    "pointerdown",
    event => {

        event.preventDefault();

        moveRight();
    }
);


// ==========================================
// INICIALIZAÇÃO
// ==========================================

draw();

requestAnimationFrame(
    gameLoop
);