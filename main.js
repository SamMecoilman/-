const apiKey = 'AIzaSyDGKMTmXMWQWAIABQecXvfgAinHbG8_BpA';
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg'; // 新しいチャンネルID

// YouTube Data APIを使ってチャンネルの動画の情報を取得する関数
async function fetchChannelVideos() {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=20`;
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
    const videos = await fetchChannelVideos();
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.id.videoId;
        const videoData = await fetchVideoData(videoId);
        if (videoData) {
            const videoHtml = `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    </div>
                    <div class="video-info">
                        <h3>${videoData.snippet.title}</h3>
                        <p>${videoData.snippet.description}</p>
                        <p>👍 ${videoData.statistics.likeCount} | 👀 ${videoData.statistics.viewCount}</p>
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
