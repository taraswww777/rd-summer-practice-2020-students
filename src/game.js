'use strict';

/**
 * TODO Task1. Объявление переменных и их связка с DOM
 *  Для получения доступа к DOM элементу следует
 *  использовать document.getElementById('elementId')
 */
const $containerGame = document.getElementById('containerGame');
const $loading = document.getElementById('loadingBlock');
const $error = document.getElementById('errorBlock');

const $mapCanvas = document.getElementById('mapCanvas');

const $gameCaption = document.getElementById('gameCaption');
const $roomName = document.getElementById('roomName');
const $roomStatus = document.getElementById('roomStatus');

const $switchTimer = document.getElementById('switchTimer');
const $team1Container = document.getElementById('team1Container');
const $team1Caption = document.getElementById('team1Caption');
const $team1Players = document.getElementById('team1Players');
const $team1Lives = document.getElementById('team1Lives');
const $team1Coins = document.getElementById('team1Coins');
const $team2Container = document.getElementById('team2Container');
const $team2Caption = document.getElementById('team2Caption');
const $team2Players = document.getElementById('team2Players');
const $team2Lives = document.getElementById('team2Lives');
const $team2Coins = document.getElementById('team2Coins');

const $btnGameList = document.getElementById('btnConnectRandom');
const $btnStart = document.getElementById('btnConnectRandom');
const $btnConnect = document.getElementById('btnConnectRandom');
const $btnConnectPolice = document.getElementById('btnConnectRandom');
const $btnConnectThief = document.getElementById('btnConnectRandom');
const $btnLeave = document.getElementById('btnConnectRandom');
const $btnPause = document.getElementById('btnConnectRandom');
const $btnCancel = document.getElementById('btnConnectRandom');

const $imgHeart = document.getElementById('imgHeart');
const $imgCoin = document.getElementById('imgCoin');
const $imgPolice = document.getElementById('imgPolice');
const $imgPoliceSelf = document.getElementById('imgPoliceSelf');
const $imgThief = document.getElementById('imgThief');
const $imgThiefSelf = document.getElementById('imgThiefSelf');
const $imgSwitch = document.getElementById('imgSwitch');

// game.html UI
(function (app, $) {
    (function (game) {
        game.GameView = (function () {
            function getGame() {
                return {
                    $gameCaption,
                    $switchTimer,
                    team1: {
                        $container: $team1Container,
                        $caption: $team1Caption,
                        $players: $team1Players,
                        $lives: $team1Lives,
                        $coins: $team1Coins
                    },
                    team2: {
                        $container: $team2Container,
                        $caption: $team2Caption,
                        $players: $team2Players,
                        $lives: $team2Lives,
                        $coins: $team2Coins
                    },
                    mapBuffer: null,
                    $mapCanvas,
                    mapCellSize: 25
                };
            }

            function setMapCanvasSizing($canvas, width, height) {
                /**
                 * TODO Task 2. Опишите функцию которая задаст размеры игрового поля
                 */
                $canvas.style.width = `${width}px`;
                $canvas.style.height = `${height}px`;
                $canvas.width = `${width}`;
                $canvas.height = `${height}`;
                return $canvas;
            }

            function drawMapField(canvas, map, width, height, cellSize) {
                const ctx = canvas.getContext("2d");
                const colorWall = '#C0C0C0';
                const colorFreePlace = '#FFFFFF';
                const lineWidth = '1px';

                ctx.fillStyle = colorFreePlace;
                ctx.fillRect(0, 0, width, height);
                ctx.strokeStyle = colorWall;
                ctx.strokeWidth = lineWidth;
                /**
                 * TODO Task 3. Опишите заполнение цветами карты на канвасе
                 */
                for (let i = 0; i < map.cells.length; i++) {
                    const cell = map.cells[i];
                    const x = i % map.width;
                    const y = Math.floor(i / map.width);
                    if (cell === GameApi.MapCellType.wall) {
                        ctx.fillStyle = colorWall;
                        ctx.fillRect(x * cellSize, y * cellSize, cellSize, cellSize);
                    } else {
                        ctx.fillStyle = colorFreePlace;
                        ctx.rect(x * cellSize, y * cellSize, cellSize, cellSize);
                        ctx.stroke();
                    }
                }
            }

            function getCanvasBuffer(width, height, map, cellSize) {
                setMapCanvasSizing($mapCanvas, width, height);
                drawMapField($mapCanvas, map, width, height, cellSize);
                return $mapCanvas;
            }

            function getMapCellSize(map) {
                return map.width <= 20 ? 25 : 15;
            }

            function GameView(gameState) {
                this.imgRotationAngle = 0;
                this.imgRotationPeriod = 10;
                this.imgRotationTimer = null;
                this.state = gameState;
                this.game = getGame();
                this.bindEvents();
                this.bindButtons();
            }

            GameView.prototype.bindEvents = function () {
                const {
                    captionChanged,
                    invalidGame,
                    mapChanged,
                    playerChanged,
                    statusChanged,
                    synced,
                    syncing,
                    teamCaptionChanged,
                    teamCoinsChanged,
                    teamLivesChanged,
                    teamPlayersChanged,
                    timerChanged
                } = this.state.callbacks;

                captionChanged.add(this.setGameCaption.bind(this));
                invalidGame.add(this.showError.bind(this));
                mapChanged.add(this.updateMap.bind(this));
                playerChanged.add(this.updatePlayer.bind(this));

                statusChanged.add((status) => {
                    this.setButtons(status);
                    this.toggleRotation(status);
                });
                synced.add(this.show.bind(this));
                syncing.add(this.showLoading.bind(this));
                teamCaptionChanged.add(this.updateTeamCaption.bind(this));
                teamCoinsChanged.add(this.updateTeamCoins.bind(this));
                teamLivesChanged.add(this.updateTeamLives.bind(this));
                teamPlayersChanged.add(this.updateTeam.bind(this));
                timerChanged.add(this.setTimer.bind(this));
            };

            /**
             * TODO: Task 16. Обработайте ошибки которые могут быть при нажатии на кнопки
             *      для показа сообщения можно использовать alert
             *      можно попробовать сделать это используя модальные окна, только если игра уже работает
             *      https://getbootstrap.com/docs/3.3/javascript/#modals
             */
            GameView.prototype.goToGameList = function () { window.location.replace("index.html");};
            GameView.prototype.startGame = function () { this.state.game.start();};
            GameView.prototype.joinAsRandom = function () { this.state.game.join(GameApi.GameTeamRole.random);};
            GameView.prototype.joinAsPolice = function () { this.state.game.join(GameApi.GameTeamRole.police);};
            GameView.prototype.joinAsThief = function () { this.state.game.join(GameApi.GameTeamRole.thief);};
            GameView.prototype.leaveGame = function () { this.state.game.leave();};
            GameView.prototype.pauseGame = function () { this.state.game.pause();};
            GameView.prototype.cancelGame = function () { this.state.game.cancel();};

            GameView.prototype.stopMoving = function (event) {
                event.preventDefault();
                this.state.game.stopMoving();
            }
            GameView.prototype.moveLeft = function (event) {
                event.preventDefault();
                this.state.game.beginMove(GameApi.MoveDirection.left);
            }
            GameView.prototype.moveUp = function (event) {
                event.preventDefault();
                this.state.game.beginMove(GameApi.MoveDirection.top);
            }
            GameView.prototype.moveRight = function (event) {
                event.preventDefault();
                this.state.game.beginMove(GameApi.MoveDirection.right);
            }
            GameView.prototype.moveDown = function (event) {
                event.preventDefault();
                this.state.game.beginMove(GameApi.MoveDirection.bottom);
            }

            GameView.prototype.bindButtons = function () {
                let $lastKey = -1;
                /**
                 * TODO Task 4. Используя addEventListener повешайте обработчики событий на кнопки
                 *  нажатия на кнопки это событие click
                 */
                $btnGameList.addEventListener('click', this.goToGameList);
                $btnStart.addEventListener('click', this.startGame);
                $btnConnect.addEventListener('click', this.joinAsRandom);
                $btnConnectPolice.addEventListener('click', this.joinAsPolice);
                $btnConnectThief.addEventListener('click', this.joinAsThief);
                $btnLeave.addEventListener('click', this.leaveGame);
                $btnPause.addEventListener('click', this.pauseGame);
                $btnCancel.addEventListener('click', this.cancelGame);

                window.addEventListener('keydown', (event) => {
                    if ($lastKey === event.key) {
                        return;
                    }
                    /**
                     * TODO Task 5. Допишите обработку нажатий клавиш передвижения
                     */
                    switch (event.code) {
                        case 'ArrowUp':
                            this.moveUp();
                            break;
                        case 'ArrowRight':
                            this.moveRight();
                            break;
                        case 'ArrowDown':
                            this.moveDown();
                            break;
                        case 'ArrowLeft':
                            this.moveLeft();
                            break;
                        case 'Space':
                            this.stopMoving();
                            break;
                    }
                });
                window.addEventListener('keyup', () => $lastKey = -1);
            };
            GameView.prototype.toggleRotation = function (status) {
                if (status === GameApi.GameStatus.inProcess) {
                    if (!this.imgRotationTimer) {
                        this.imgRotationTimer = setInterval(() => {
                            this.imgRotationAngle += this.imgRotationPeriod;
                            if (this.imgRotationAngle >= 360) {
                                this.imgRotationAngle = 0;
                            }
                            this.updateMap();
                        }, 50);
                    }
                } else if (this.imgRotationTimer) {
                    clearInterval(this.imgRotationTimer);
                    this.imgRotationTimer = null;
                }
            };
            GameView.prototype.drawObject = function (ctx, objType, x, y, cellSize) {
                var img = null;
                switch (objType) {
                    case GameApi.MapCellType.coin:
                        img = $imgCoin;
                        break;
                    case GameApi.MapCellType.life:
                        img = $imgHeart;
                        break;
                    case GameApi.MapCellType.swtch:
                        img = $imgSwitch;
                        break;
                }
                if (img) {
                    ctx.drawImage(img, cellSize * x + 2, cellSize * y + 2, cellSize - 4, cellSize - 4);
                }
            };
            GameView.prototype.drawPlayer = function (ctx, playerId, police, x, y, cellSize) {
                const self = this.state.gameApi.questor.user.id === playerId;
                const halfCell = cellSize / 2;
                const img = police ? (self ? $imgPoliceSelf : $imgPolice) :
                    self ? $imgThiefSelf : $imgThief;
                ctx.save();

                ctx.translate(x * cellSize + halfCell, y * cellSize + halfCell);
                ctx.rotate(this.imgRotationAngle * Math.PI / 180);
                ctx.drawImage(img, 2 - halfCell, 2 - halfCell, cellSize - 4, cellSize - 4);

                ctx.restore();
            };
            GameView.prototype.drawTeam = function (ctx, team, cellSize) {
                // TODO: В этом месте может упасть ошибка, если что сообщите руководителю вашей группы
                const police = team.role === GameApi.GameTeamRole.police;
                $.each(team.players, (playerId) => {
                    const player = team.players[playerId];
                    if (player.alive) {
                        this.drawPlayer(ctx, playerId, police, player.x, player.y, cellSize);
                    }
                });
            };
            GameView.prototype.updateMap = function (map) {
                map = map || this.state.map;
                if (!this.game.mapBuffer) {
                    this.game.mapCellSize = getMapCellSize(map);
                    var width = map.width * this.game.mapCellSize;
                    var height = map.height * this.game.mapCellSize;
                    setMapCanvasSizing($mapCanvas, width, height);
                    this.game.mapBuffer = getCanvasBuffer(width, height, map, this.game.mapCellSize);
                }
                var ctx = this.game.$mapCanvas.getContext("2d");
                var cellSize = this.game.mapCellSize;
                ctx.drawImage(this.game.mapBuffer, 0, 0);
                for (var i = 0; i < map.cells.length; i++) {
                    var cell = map.cells[i];
                    var x = i % map.width;
                    var y = Math.floor(i / map.width);
                    this.drawObject(ctx, cell, x, y, cellSize);
                }
                if (this.state.status !== GameApi.GameStatus.open &&
                    this.state.status !== GameApi.GameStatus.ready) {
                    this.drawTeam(ctx, this.state.teams.team1, cellSize);
                    this.drawTeam(ctx, this.state.teams.team2, cellSize);
                }
            };
            GameView.prototype.setGameCaption = function (name, status) {
                name = name || this.state.name;
                status = status || this.state.status;
                /**
                 * TODO: Task 6. Поменяйте под вашу вёрстку
                 */
                $roomName.innerHTML = name;
                $roomStatus.innerHTML = utils.getStatusName(status);
                /**
                 * TODO: ДЗ. Task 6.1. Удалить старые значения статусов
                 */
                //...
                $gameCaption.classList.add(`game-caption--status_${status}`);
            };
            GameView.prototype.setTimer = function (data) {
                let seconds = data.s;
                let minutes = data.m;
                const timerState = minutes > 0 || seconds > 30 ? "game-timer-ok" :
                    seconds > 15 ? "game-timer-warn" : "game-timer-cri";
                if (seconds < 10) {
                    seconds = "0" + seconds;
                }
                if (minutes < 10) {
                    minutes = "0" + minutes;
                }
                utils.reWriteDomElement(this.game.$switchTimer, `<span class='${timerState}'>${minutes}:${seconds}</span>`);
            };
            GameView.prototype.getPlayer = function (player) {
                const status = player.alive ? (player.connected ? "ac" : "ad") : player.connected ? "dc" : "dd";
                /**
                 * TODO: Task 7. Поменяйте под вашу вёрстку
                 */
                console.log('player:', player);
                return `<div class="players__item players__item--status_${status}" id="player${player.id}">
                    <span class="login">${player.name}</span>
                    <div class="scope">
                        <div class="scope__item scope__item--coins">${player.coins}</div>
                        <div class="scope__item scope__item--lives">${player.lives}</div>
                        <div class="scope__item scope__item--dies">${player.deaths}</div>
                    </div>
                </div>`;
            };
            GameView.prototype.updatePlayer = function (player) {
                $("#player" + player.id).replaceWith(this.getPlayer(player));
            };
            GameView.prototype.getTeam = function (team) {
                return team === this.state.teams.team1 ? this.game.team1 : this.game.team2;
            };
            GameView.prototype.setTeamCaption = function (team, $team) {
                if (team.winner) {
                    utils.addClasses($team.$container, 'game-team-winner')
                }
                const role = team.role === GameApi.GameTeamRole.police ? "police" : "thief";
                utils.removeClasses($team.$container, ['police', 'thief'])
                utils.addClasses($team.$container, role)
                /**
                 * TODO: Task 8. Поменяйте под вашу вёрстку
                 */
                utils.reWriteDomElement($team.$caption, `<div class='game-team-${role}-caption'>
                    <span class='game-team-name'>${team.name}</span>
                    <span class='game-team-role game-team-role-${role}'>${ROLE_TITLES[team.role] || ROLE_TITLES[team.role]}</span>
                    </div>`
                );
            };
            GameView.prototype.setTeam = function (team, $team) {
                this.setTeamCaption(team, $team);
                utils.reWriteDomElement($team.$lives, team.lives);
                utils.reWriteDomElement($team.$coins, team.coins);
                utils.reWriteDomElement($team.$players, '');
                for (const key in team.players) {
                    utils.writeDomElement($team.$players, this.getPlayer(team.players[key]));
                }
            };
            GameView.prototype.updateTeam = function (team) {
                this.setTeam(team, this.getTeam(team));
            };
            GameView.prototype.updateTeamCaption = function (team) {
                this.setTeamCaption(team, this.getTeam(team));
            };
            GameView.prototype.updateTeamLives = function (team) {
                utils.reWriteDomElement(this.getTeam(team).$lives, team.lives);
            };
            GameView.prototype.updateTeamCoins = function (team) {
                utils.reWriteDomElement(this.getTeam(team).$coins, team.coins);
            };
            GameView.prototype.setButtons = function (status) {
                status = status || this.state.status;
                const currentUser = this.state.gameApi.questor.user.id;
                const isOwner = currentUser === this.state.owner.id;
                const isAdmin = this.state.gameApi.questor.user.isAdmin;
                const connected = Boolean(this.state.getPlayer(currentUser));

                const initBtnsStartCancel = () => {
                    /**
                     * TODO: Task 9. Проинициализируйте состояние кнопок для владельца игры и администратора
                     *    для добавление класса можно использовать utils.addClasses($el,'hidden')
                     *    для удаления класса можно использовать utils.removeClasses($el,'hidden')
                     */
                    // ...
                }
                /**
                 * TODO: Task 10. Проинициализируйте состояние кнопок, для статусов
                 *      GameApi.GameStatus.canceled и GameApi.GameStatus.finished
                 */
                if (status === GameApi.GameStatus.canceled || status === GameApi.GameStatus.finished) {
                    // ...
                    return;
                }

                /**
                 * TODO: Task 11. Проинициализируйте состояние кнопок, для статусов
                 *      GameApi.GameStatus.open и GameApi.GameStatus.ready
                 */
                if (this.state.status === GameApi.GameStatus.open ||
                    this.state.status === GameApi.GameStatus.ready) {
                    // ...
                    initBtnsStartCancel();
                    //...
                    return;
                }

                initBtnsStartCancel();
                /**
                 * TODO: Task 12. Проинициализируйте состояние кнопок, для статусов
                 *      GameApi.GameStatus.starting и GameApi.GameStatus.inProcess
                 */
                // ...
            };
            GameView.prototype.showLoading = () => {
                /**
                 * TODO: Task 13. Опишите доступность элементов при загрузке игры $container $error $loading
                 */
                // ...
            };
            GameView.prototype.showError = () => {
                /**
                 * TODO: Task 14. Опишите доступность элементов при показе ошибок $container $error $loading
                 */
                // ...
            };
            GameView.prototype.show = () => {
                /**
                 * TODO: Task 15. Опишите доступность элементов при показе игры $container $error $loading
                 */
                // ...
            };

            return GameView;
        })();
    })(app.game = app.game || {});
})(window.app = window.app || {}, $);


(() => {
    const gameApi = new GameApi();
    gameApi.questor.on("unauthorized", function () {
        window.location.replace("../login");
    });
    gameApi.questor.login();
    const gameState = new app.game.GameState(gameApi);
    new app.game.GameView(gameState);
    gameState.request();
})();