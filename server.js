const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const NodeCache = require('node-cache');
const axios = require('axios');
const app = express();
const PORT = process.env.PORT || 3000;

const apiKey = process.env.API_KEY;
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg';

app.use(bodyParser.json());
app.use(express.static('public'));

const db = new sqlite3.Database(':memory:');
const apiCache = new NodeCache({ stdTTL: 600 }); // 10 minutes TTL

db.serialize(() => {
    db.run("CREATE TABLE comments (id INTEGER PRIMARY KEY, videoId TEXT, comment TEXT, timestamp DATETIME DEFAULT CURRENT_TIMESTAMP)");
});

app.post('/comments', (req, res) => {
    const { videoId, comment } = req.body;
    db.run("INSERT INTO comments (videoId, comment) VALUES (?, ?)", [videoId, comment], function(err) {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(200).send({ id: this.lastID });
    });
});

app.get('/comments/:videoId', (req, res) => {
    const { videoId } = req.params;
    db.all("SELECT * FROM comments WHERE videoId = ? ORDER BY timestamp ASC", [videoId], (err, rows) => {
        if (err) {
            return res.status(500).send(err.message);
        }
        res.status(200).send(rows);
    });
});

// APIキャッシュ用のミドルウェア
function cacheMiddleware(req, res, next) {
    const key = req.originalUrl;
    const cachedResponse = apiCache.get(key);
    if (cachedResponse) {
        return res.status(200).send(cachedResponse);
    } else {
        res.originalSend = res.send;
        res.send = (body) => {
            apiCache.set(key, body);
            res.originalSend(body);
        };
        next();
    }
}

// YouTube APIリクエストのエンドポイント
app.get('/api/videos', cacheMiddleware, async (req, res) => {
    const pageToken = req.query.pageToken || '';
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&pageToken=${pageToken}`;
    try {
        const response = await axios.get(apiUrl);
        res.status(200).send(response.data);
    } catch (error) {
        res.status(500).send('YouTube APIリクエストエラー');
    }
});

// 動画データ取得用のエンドポイント
app.get('/api/video', cacheMiddleware, async (req, res) => {
    const videoId = req.query.id;
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
    try {
        const response = await axios.get(apiUrl);
        res.status(200).send(response.data);
    } catch (error) {
        res.status(500).send('YouTube APIリクエストエラー');
    }
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}/`);
});
