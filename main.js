const apiKey = 'AIzaSyC1imLgoRZLRhBn5qFGMXbcpQUK5VEagzY';
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg'; // サムのヘタレ英雄譚のチャンネルID

async function fetchChannelVideos() {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
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
const manualVideoListContainer = document.getElementById('manualVideoList');

async function loadVideos() {
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
    if (videos.length > 0) {
        displayVideos(videos);
        localStorage.setItem('cachedVideos', JSON.stringify(videos));
        localStorage.setItem('cacheTimestamp', new Date().getTime().toString());
    } else {
        loadManualVideos();
    }
}

function displayVideos(videos) {
    videoListContainer.innerHTML = '';
    manualVideoListContainer.style.display = 'none';
    for (let i = 0; i < videos.length; i++) {
        const video = videos[i];
        const videoId = video.id.videoId;
        const videoData = video.snippet;
        const videoHtml = `
            <div class="video-card">
                <div class="video-thumbnail">
                    <iframe id="video-${videoId}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                    <div class="comment-overlay" id="overlay-${videoId}"></div>
                </div>
                <div class="video-info">
                    <h3>${videoData.title}</h3>
                    <p>${videoData.description}</p>
                    <p>👍 ${video.statistics.likeCount} | 👀 ${video.statistics.viewCount}</p>
                    <div class="comments-section">
                        <textarea placeholder="コメントを追加" data-video-id="${videoId}"></textarea>
                        <button onclick="addComment('${videoId}')">送信</button>
                    </div>
                </div>
            </div>
        `;
        videoListContainer.innerHTML += videoHtml;
    }
}

async function loadManualVideos() {
    let manualVideos = JSON.parse(localStorage.getItem('manualVideos')) || [];
    videoListContainer.innerHTML = '';
    manualVideoListContainer.style.display = 'block';
    for (let i = 0; i < manualVideos.length; i++) {
        const videoId = manualVideos[i];
        const videoData = await fetchVideoData(videoId);
        if (videoData) {
            const videoHtml = `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <iframe id="video-${videoId}" src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                        <div class="comment-overlay" id="overlay-${videoId}"></div>
                    </div>
                    <div class="video-info">
                        <h3>${videoData.snippet.title}</h3>
                        <p>${videoData.snippet.description}</p>
                        <p>👍 ${videoData.statistics.likeCount} | 👀 ${videoData.statistics.viewCount}</p>
                        <div class="comments-section">
                            <textarea placeholder="コメントを追加" data-video-id="${videoId}"></textarea>
                            <button onclick="addComment('${videoId}')">送信</button>
                        </div>
                    </div>
                </div>
            `;
            manualVideoListContainer.innerHTML += videoHtml;
        }
    }
}

function addComment(videoId) {
    const textarea = document.querySelector(`textarea[data-video-id="${videoId}"]`);
    const comment = textarea.value;
    if (comment) {
        let comments = JSON.parse(localStorage.getItem(`comments-${videoId}`)) || [];
        const timestamp = new Date().getTime();
        comments.push({ comment, timestamp });
        localStorage.setItem(`comments-${videoId}`, JSON.stringify(comments));
        textarea.value = '';
        displayComments(videoId);
    }
}

function displayComments(videoId) {
    const overlay = document.getElementById(`overlay-${videoId}`);
    overlay.innerHTML = '';
    let comments = JSON.parse(localStorage.getItem(`comments-${videoId}`)) || [];
    comments.forEach(commentData => {
        const commentElement = document.createElement('div');
        commentElement.classList.add('comment');
        commentElement.textContent = commentData.comment;
        overlay.appendChild(commentElement);
    });
    startCommentAnimation(videoId);
}

function startCommentAnimation(videoId) {
    const overlay = document.getElementById(`overlay-${videoId}`);
    const comments = overlay.querySelectorAll('.comment');
    comments.forEach(comment => {
        comment.style.top = `${Math.random() * 80}%`;
        comment.style.animationDuration = `${5 + Math.random() * 5}s`;
        comment.style.animationDelay = `${Math.random() * 10}s`;
        comment.classList.add('move');
    });
}

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
});
