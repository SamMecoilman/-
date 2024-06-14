const apiKey = 'AIzaSyC1imLgoRZLRhBn5qFGMXbcpQUK5VEagzY';
const channelId = 'UCSgIKM0G8Exo3UgZF0MAsdg'; // サムのヘタレ英雄譚のチャンネルID

async function fetchChannelVideos() {
    const apiUrl = `https://www.googleapis.com/youtube/v3/search?key=${apiKey}&channelId=${channelId}&part=snippet,id&order=date&maxResults=10`;
    try {
        const response = await axios.get(apiUrl);
        if (response.data.items.length === 0) {
            console.warn('指定されたチャンネルIDに動画が見つかりません');
        }
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
    const videos = await fetchChannelVideos();
    const videoContainer = document.getElementById('video-container');
    videoContainer.innerHTML = ''; // 既存の動画をクリア

    for (const video of videos) {
        const videoData = await fetchVideoData(video.id.videoId);
        if (videoData) {
            const videoElement = createVideoElement(videoData);
            videoContainer.appendChild(videoElement);
        }
    }
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

document.addEventListener('DOMContentLoaded', loadVideos);
