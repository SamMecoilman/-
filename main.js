const apiKey = 'AIzaSyC1imLgoRZLRhBn5qFGMXbcpQUK5VEagzY';
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg'; // サムのヘタレ英雄譚のチャンネルID

// YouTube Data APIを使ってチャンネルの動画の情報を取得する関数
async function fetchChannelVideos() {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`; // maxResultsを減らす
    try {
        const response = await axios.get(apiUrl);
        if (response.data.items.length === 0) {
            console.warn('No videos found for the specified channel ID');
        }
        return response.data.items;
    } catch (error) {
        console.error('Error fetching channel videos:', error);
        return [];
    }
}

// YouTube Data APIを使って動画の情報を取得する関数
async function fetchVideoData(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
    try {
        const response = await axios.get(apiUrl);
        return response.data.items[0];
    } catch (error) {
        console.error('Error fetching video data:', error);
        return null;
    }
}

const videoListContainer = document.getElementById('videoList');

async function loadVideos() {
    // キャッシュの有効期限を1日とする（ミリ秒）
    const cacheExpirationTime = 24 * 60 * 60 * 1000;

    let cachedVideos = localStorage.getItem('cachedVideos');
    let cacheTimestamp = localStorage.getItem('cacheTimestamp');
    
    if (cachedVideos && cacheTimestamp) {
        const currentTime = new Date().getTime();
        const cacheAge = currentTime - parseInt(cacheTimestamp, 10);

        if (cacheAge < cacheExpirationTime) {
            cachedVideos = JSON.parse(cachedVideos);
            console.log('Using cached data');
            displayVideos(cachedVideos);
            return;
        }
    }

    const videos = await fetchChannelVideos();
    displayVideos(videos);
    // キャッシュをローカルストレージに保存
    localStorage.setItem('cachedVideos', JSON.stringify(videos));
    localStorage.setItem('cacheTimestamp', new Date().getTime().toString());
}

function displayVideos(videos) {
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.id.videoId;
        const videoData = video.snippet;
        const videoHtml = `
            <div class="video-card">
                <div class="video-thumbnail">
                    <a href="https://www.youtube.com/watch?v=${videoId}" target="_blank">
                        <img src="https://img.youtube.com/vi/${videoId}/hqdefault.jpg" alt="${videoData.title}">
                    </a>
                </div>
                <div class="video-info">
                    <h3>${videoData.title}</h3>
                    <p>${videoData.description}</p>
                    <p>👍 ${videoData.likeCount || 'N/A'} | 👀 ${videoData.viewCount || 'N/A'}</p>
                    <div class="comments-section">
                        <textarea placeholder="コメントを追加"></textarea>
                        <div class="comments-list" id="comments-${videoId}"></div>
                    </div>
                </div>
            </div>
        `;
        videoListContainer.innerHTML += videoHtml;
    }
}

window.onload = loadVideos;

// サービスワーカーの登録
if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('service-worker.js')
        .then(registration => {
            console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
            console.error('Service Worker registration failed:', error);
        });
}
