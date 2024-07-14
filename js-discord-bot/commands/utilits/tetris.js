const { ActionRowBuilder, ButtonBuilder, ButtonStyle, SlashCommandBuilder, Client, GatewayIntentBits, Message } = require('discord.js');
const fs = require('fs');
const { getUserScore, saveUserScore } = require('../../scoreUtils.js');


module.exports = {
    data: new SlashCommandBuilder().setName('tetris').setDescription('Play a game of Tetris'),
    async execute(interaction) {
        const left = new ButtonBuilder()
            .setCustomId('left')
            .setEmoji('<:arrow4:1211025846609911890>')
            .setStyle(ButtonStyle.Primary); 

        const rotate = new ButtonBuilder()
            .setCustomId('rotate')
            .setEmoji('<:arrow1:1226967622499700858>')
            .setStyle(ButtonStyle.Primary);

        const right = new ButtonBuilder()
            .setCustomId('right')
            .setEmoji('<:arrow3:1211020585799516180>')
            .setStyle(ButtonStyle.Primary);

        const pause = new ButtonBuilder()
            .setCustomId('pause')
            .setEmoji('<:pause:1260229339849424928>')
            .setStyle(ButtonStyle.Danger);

        const down = new ButtonBuilder()
            .setCustomId('down')
            .setEmoji('<:arrow2:1260231768657891378>') 
            .setStyle(ButtonStyle.Primary);
            
        const stop = new ButtonBuilder()
            .setCustomId('stop')
            .setLabel('Stop')
            .setStyle(ButtonStyle.Danger);
        

        const row1 = new ActionRowBuilder()
          .addComponents(left, rotate, right);
        const row2 = new ActionRowBuilder()
          .addComponents(pause, down, stop);


        const message = await interaction.reply({ components: [row1, row2] });
        const userId = interaction.user.id;
        let { score, lines } = await getUserScore(userId);

        if (score === undefined) score = 0;
        if (lines === undefined) lines = 0;


        const filter = (button) => button.user.id === interaction.user.id;
        const collector = message.createMessageComponentCollector({ filter, time: null });

        let isPaused = false;
        let isDropped = false;
        let tetrominoInterval ;

        collector.on('collect', async (button) => {
            if (isPaused && button.customId !== 'pause') {
                await button.update({ content: 'Game is paused. Please resume to continue.', ephemeral: true });
                return; // Важно вернуться после обновления кнопки, чтобы предотвратить дальнейшую обработку
            }
        
            // Обработка нажатия на кнопки
            if (button.customId === 'pause') {
                isPaused = !isPaused;
                await button.update({ 
                    content: isPaused ? 'Game paused.' : 'Game resumed.', 
                    components: [row1, row2] 
                });
        
                // Дополнительные действия в зависимости от isPaused
                if (!isPaused) {
                    moveTetrominoDown(initialPosition, gameBoard, interaction);
                } else {
                    clearInterval(tetrominoInterval);
                }
            } else if (button.customId === 'right') {
                moveRight(initialPosition, tetromino, gameBoard, button);
            } else if (button.customId === 'left') {
                moveLeft(initialPosition, tetromino, gameBoard, button);
            } else if (button.customId === 'rotate') {
                const rotatedTetromino = rotateMatrix(tetromino);
                if (canPlaceTetromino(initialPosition, rotatedTetromino, gameBoard)) {
                    tetromino = rotatedTetromino;
                    const embedDescription = createGameBoardWithTetromino(gameBoard, tetromino, initialPosition);
                    await button.update({
                        embeds: [{
                            color: 0x0099FF,
                            description: embedDescription,
                            title: 'Tetris',
                            url: 'https://discord.gg/8Pxh49Kx',
                            fields: [
                                { name: 'Score', value: score.toString(), inline: true },
                                { name: 'Lines', value: lines.toString(), inline: true },
                                { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                            ]
                        }]
                    });
                }
            } else if (button.customId === 'down') {
                dropTetrominoDown(initialPosition, tetromino, gameBoard, button);
            } else if (button.customId === 'stop') {
                isPaused = !isPaused;
                await button.update({ 
                    content:'The game is stopped.', 
                });
                await message.delete();
                collector.stop();
            }
            return true;
        });
        

        const aBe = ':blue_square:';
        const eSE = ':black_large_square:';
        const eBe = ':orange_square:'

        const gameBoard = [
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE],
            [eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE, eSE]
        ];

        const tetrominos = {
            'I': [
                [aBe, aBe, aBe, aBe]
            ],
            'L': [
                [eSE, eSE, aBe],
                [aBe, aBe, aBe],
            ],
            'J': [
                [aBe, eSE, eSE],
                [aBe, aBe, aBe],
            ],
            'O': [
                [aBe, aBe],
                [aBe, aBe],
            ],
            'S': [
                [eSE, aBe, aBe],
                [aBe, aBe, eSE],
            ],
            'Z': [
                [aBe, aBe, eSE],
                [eSE, aBe, aBe],
            ],
            'T': [
                [eSE, aBe, eSE],
                [aBe, aBe, aBe],
            ]
        };

        let nextTetrominoKey = getRandomTetrominoKey(tetrominos);
        let nextTetromino = Object.assign([], tetrominos[nextTetrominoKey]);

        async function moveRight(currentPosition, tetromino, gameBoard, button) {
            if (currentPosition[1] < gameBoard[0].length - tetromino[0].length) {
                currentPosition[1]++;
                const embedDescription = createGameBoardWithTetromino(gameBoard, tetromino, currentPosition);
                await button.update({
                    embeds: [{
                        color: 0x0099FF,
                        description: embedDescription,
                        title: 'Tetris',
                        url: 'https://discord.gg/8Pxh49Kx',
                        fields: [
                            { name: 'Score', value: score.toString(), inline: true },
                            { name: 'Lines', value: lines.toString(), inline: true },
                            { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                        ]
                    }]
                });
            }
        }

        async function dropTetrominoDown(currentPosition, tetromino, gameBoard, button) {
            if (currentPosition[1] > 0) {
                while (canMoveDown(currentPosition, tetromino, gameBoard)) {
                    currentPosition[0]++;
            }
            const embedDescription = createGameBoardWithTetromino(gameBoard, tetromino, currentPosition);
            await button.update({
                embeds: [{
                    color: 0x0099FF,
                    description: embedDescription,
                    title: 'Tetris',
                    url: 'https://discord.gg/8Pxh49Kx',
                    fields: [
                        { name: 'Score', value: score.toString(), inline: true },
                        { name: 'Lines', value: lines.toString(), inline: true },
                        { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                    ]
                    }]
                });
            }
        }

        async function moveLeft(currentPosition, tetromino, gameBoard, button) {
            if (currentPosition[1] > 0) {
                currentPosition[1]--;
                const embedDescription = createGameBoardWithTetromino(gameBoard, tetromino, currentPosition);
                await button.update({
                    embeds: [{
                        color: 0x0099FF,
                        description: embedDescription,
                        title: 'Tetris',
                        url: 'https://discord.gg/8Pxh49Kx',
                        fields: [
                            { name: 'Score', value: score.toString(), inline: true },
                            { name: 'Lines', value: lines.toString(), inline: true },
                            { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                        ]
                    }]
                });
            }
        }


        function rotateMatrix(matrix) {
            const rows = matrix.length;
            const cols = matrix[0].length;
            const rotated = [];

            for (let i = 0; i < cols; i++) {
                rotated[i] = [];
                for (let j = 0; j < rows; j++) {
                    rotated[i][j] = matrix[rows - 1 - j][i];
                }
            }

            return rotated;
        }

        function canPlaceTetromino(position, tetromino, gameBoard) {
            const rows = tetromino.length;
            const cols = tetromino[0].length;

            for (let i = 0; i < rows; i++) {
                for (let j = 0; j < cols; j++) {
                    if (tetromino[i][j] !== eSE) {
                        const row = position[0] + i;
                        const col = position[1] + j;
                        if (
                            row >= gameBoard.length ||
                            col >= gameBoard[0].length ||
                            row < 0 ||
                            col < 0 ||
                            gameBoard[row][col] !== eSE
                        ) {
                            return false;
                        }
                    }
                }
            }
            return true;
        }

        function canMoveDown(currentPosition, tetromino, gameBoard) {
            const tetrominoHeight = tetromino.length;
            const tetrominoWidth = tetromino[0].length;

            if (currentPosition[0] + tetrominoHeight >= gameBoard.length) {
                return false;
            }

            for (let i = 0; i < tetrominoHeight; i++) {
                for (let j = 0; j < tetrominoWidth; j++) {
                    const row = currentPosition[0] + i + 1;
                    const col = currentPosition[1] + j;
                    if (
                        row >= gameBoard.length ||
                        col >= gameBoard[0].length ||
                        (tetromino[i][j] !== eSE &&
                            (gameBoard[row] === undefined || gameBoard[row][col] !== eSE))
                    ) {
                        return false;
                    }
                }
            }

            return true;
        }

        function delay(ms) {
            return new Promise(resolve => setTimeout(resolve, ms));
        }

        function placeTetrominoOnBoard(position, tetromino, gameBoard) {
            const tetrominoHeight = tetromino.length;
            const tetrominoWidth = tetromino[0].length;

            if (position[0] + tetrominoHeight > gameBoard.length || position[1] + tetrominoWidth > gameBoard[0].length) {
                return;
            }

            for (let i = 0; i < tetrominoHeight; i++) {
                if (!gameBoard[position[0] + i]) {
                    gameBoard[position[0] + i] = [];
                }
                for (let j = 0; j < tetrominoWidth; j++) {
                    if (tetromino[i][j] === aBe) {
                        gameBoard[position[0] + i][position[1] + j] = tetromino[i][j];
                    }
                }
            }
        }

        async function moveTetrominoDown(currentPosition, gameBoard, interaction) {
            while (!isPaused && canMoveDown(currentPosition, tetromino, gameBoard)) {
                if (isDropped) {
                    dropTetrominoDown(currentPosition, gameBoard, interaction);
                    return;
                }
                currentPosition[0]++;
                const embedDescription = createGameBoardWithTetromino(gameBoard, tetromino, currentPosition);
                await interaction.editReply({
                    embeds: [{
                        color: 0x0099FF,
                        description: embedDescription,
                        title: 'Tetris',
                        url: 'https://discord.gg/8Pxh49Kx',
                        fields: [
                            { name: 'Score', value: score.toString(), inline: true },
                            { name: 'Lines', value: lines.toString(), inline: true },
                            { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                        ]
                    }]
                });
                await delay(500);
            }
            if (currentPosition[0] === 0) {
                isPaused = !isPaused;
                await interaction.editReply({
                    components:[],
                    embeds: [{
                        color: 0x0099FF,
                        description: `### Your score is ${score.toString()}.\n ### Your number of lines is ${lines.toString()}.`,
                        title: 'Game Over',
                        url: 'https://discord.gg/8Pxh49Kx',
                    }]
                });
                collector.stop();
                setTimeout(async () => {
                    await interaction.deleteReply();
                }, 0,5 * 60 * 1000); 
            

            }
        

            if (!isPaused) {
                placeTetrominoOnBoard(currentPosition, tetromino, gameBoard);
                checkAndClearFullLines(gameBoard, interaction);
                tetromino = nextTetromino;
                nextTetrominoKey = getRandomTetrominoKey(tetrominos);
                nextTetromino = Object.assign([], tetrominos[nextTetrominoKey]);
                const maxPosition = gameBoard[0].length - tetromino[0].length;
                initialPosition = [0, Math.floor(Math.random() * maxPosition)];        
                moveTetrominoDown(initialPosition, gameBoard, interaction);
            }
        }  
                
        async function checkAndClearFullLines(gameBoard, interaction) {
          let linesCleared = 0;
          for (let i = 0; i < gameBoard.length; i++) {
              if (isLineFull(gameBoard[i])) {
                  clearLine(gameBoard, i);
                  linesCleared++;
              }
          }
          if (linesCleared > 0) {
              score += linesCleared * 12;
              lines += linesCleared;
              const embedDescription = createGameBoardWithTetromino(gameBoard, [], [-1, -1]);
              await interaction.editReply({
                  embeds: [{
                      color: 0x0099FF,
                      description: embedDescription,
                      title: 'Tetris',
                      url: 'https://discord.gg/8Pxh49Kx',
                      fields: [
                          { name: 'Score', value: score.toString(), inline: true },
                          { name: 'Lines', value: lines.toString(), inline: true },
                          { name: 'Next Tetromino', value: formatTetromino(nextTetromino), inline: true }
                      ]
                  }]
              });
              await saveUserScore(userId, score, lines);
          }
      }

        function isLineFull(line) {
            return line.every(cell => cell === aBe);
        }

        function clearLine(gameBoard, lineIndex) {
            for (let i = lineIndex; i > 0; i--) {
                gameBoard[i] = [...gameBoard[i - 1]];
            }
            gameBoard[0] = Array(gameBoard[0].length).fill(eSE);
        }

        function createGameBoardWithTetromino(gameBoard, tetromino, position) {
            let result = '';
            for (let i = 0; i < gameBoard.length; i++) {
                for (let j = 0; j < gameBoard[i].length; j++) {
                    if (i >= position[0] && i < position[0] + tetromino.length &&
                        j >= position[1] && j < position[1] + tetromino[0].length) {
                        result += tetromino[i - position[0]][j - position[1]];
                    } else {
                        result += gameBoard[i][j];
                    }
                }
                result += '\n';
            }
            return result;
        }

        function formatTetromino(tetromino) {
            return tetromino.map(row => row.join('')).join('\n');
        }

        function getRandomTetrominoKey(tetrominos) {
            const tetrominoKeys = Object.keys(tetrominos);
            const randomIndex = Math.floor(Math.random() * tetrominoKeys.length);
            return tetrominoKeys[randomIndex];
        }

        let tetrominoKey = getRandomTetrominoKey(tetrominos);
        let tetromino = Object.assign([], tetrominos[tetrominoKey]);
        let initialPosition = [0,4];        
        moveTetrominoDown(initialPosition, gameBoard, interaction);
    },
};