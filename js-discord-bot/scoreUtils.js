const fs = require('fs');
const path = require('path');

const scoresFilePath = path.join(__dirname, 'scores.json');

async function readScoresFromFile() {
    return new Promise((resolve, reject) => {
        fs.readFile(scoresFilePath, 'utf8', (err, data) => {
            if (err) {
                if (err.code === 'ENOENT') {
                    resolve({});
                } else {
                    reject(err);
                }
            } else {
                resolve(JSON.parse(data));
            }
        });
    });
}

async function saveScoresToFile(scores) {
    return new Promise((resolve, reject) => {
        fs.writeFile(scoresFilePath, JSON.stringify(scores), (err) => {
            if (err) reject(err);
            resolve();
        });
    });
}

async function getUserScore(userId) {
    const scores = await readScoresFromFile();
    return scores[userId] || { score: 0, lines: 0 };
}

async function saveUserScore(userId, score, lines) {
    const scores = await readScoresFromFile();
    scores[userId] = { score, lines };
    await saveScoresToFile(scores);
}

module.exports = {
    getUserScore,
    saveUserScore,
};