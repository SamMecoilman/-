const apiKey = 'AIzaSyDGKMTmXMWQWAIABQecXvfgAinHbG8_BpA';
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg';
let nextPageToken = '';
let isLoading = false;

async function fetchChannelVideos(pageToken = '') {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10&pageToken=${pageToken}`;
    try {
        const response = await axios.get(apiUrl);
        nextPageToken = response.data.nextPageToken || '';
        return response.data.items;
    } catch (error) {
        console.error('チャンネル動画の取得エラー:', error);
        return [];
    }
}

async function fetchVideoData(videoId) {
    const apiUrl = `https://www.googleapis.com/youtube/v3/videos?id=${videoId}&part=snippet,statistics&key=${apiKey}`;
    try {
        const response = await axios.get(apiUrl);
        return response.data.items[0];
    } catch (error) {
        console.error('動画データの取得エラー:', error);
        return null;
    }
}

async function loadVideos() {
    if (isLoading) return;
    isLoading = true;
    const videos = await fetchChannelVideos(nextPageToken);
    const videoContainer = document.getElementById('video-container');
    for (const video of videos) {
        const videoData = await fetchVideoData(video.id.videoId);
        if (videoData) {
            const videoElement = createVideoElement(videoData);
            videoContainer.appendChild(videoElement);
        }
    }
    isLoading = false;
}

function createVideoElement(video) {
    const videoElement = document.createElement('div');
    videoElement.classList.add('video');
    videoElement.innerHTML = `
        <h3>${video.snippet.title}</h3>
        <img src="${video.snippet.thumbnails.medium.url}" alt="${video.snippet.title}">
        <p>${video.snippet.description}</p>
        <p>再生回数: ${video.statistics.viewCount}</p>
    `;
    return videoElement;
}

function setupInfiniteScroll() {
    const observer = new IntersectionObserver(async (entries) => {
        if (entries[0].isIntersecting && nextPageToken) {
            await loadVideos();
        }
    }, {
        root: null,
        rootMargin: '0px',
        threshold: 1.0
    });

    observer.observe(document.getElementById('video-container-end'));
}

// 既存のコードに追加
function addCommentSystem(videoElement, videoId) {
    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');
    
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'コメントを入力してください';
    commentInput.classList.add('comment-input');
    

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupInfiniteScroll();
});
