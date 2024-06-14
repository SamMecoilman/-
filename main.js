let nextPageToken = '';
let isLoading = false;

async function fetchChannelVideos(pageToken = '') {
    const apiUrl = `https://samu-no-hetare-eiyuu-tan.vercel.app/api/videos?pageToken=${pageToken}`;
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
    const apiUrl = `https://samu-no-hetare-eiyuu-tan.vercel.app/api/video?id=${videoId}`;
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
            loadComments(videoElement, video.id.videoId); // Load comments for the video
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
    addCommentSystem(videoElement, video.id.videoId); // Add comment system to each video
    return videoElement;
}

function addCommentSystem(videoElement, videoId) {
    const commentContainer = document.createElement('div');
    commentContainer.classList.add('comment-container');
    
    const commentInput = document.createElement('input');
    commentInput.type = 'text';
    commentInput.placeholder = 'コメントを入力してください';
    commentInput.classList.add('comment-input');
    
    const commentButton = document.createElement('button');
    commentButton.textContent = '送信';
    commentButton.classList.add('comment-button');
    
    commentButton.addEventListener('click', async () => {
        const comment = commentInput.value;
        if (comment) {
            await postComment(videoId, comment);
            commentInput.value = '';
            loadComments(videoElement, videoId);
        }
    });

    commentContainer.appendChild(commentInput);
    commentContainer.appendChild(commentButton);
    videoElement.appendChild(commentContainer);
}

async function postComment(videoId, comment) {
    try {
        await axios.post(`https://samu-no-hetare-eiyuu-tan.vercel.app/comments`, { videoId, comment });
    } catch (error) {
        console.error('コメントの投稿エラー:', error);
    }
}

async function loadComments(videoElement, videoId) {
    try {
        const response = await axios.get(`https://samu-no-hetare-eiyuu-tan.vercel.app/comments/${videoId}`);
        const comments = response.data;
        const commentContainer = videoElement.querySelector('.comment-container');
        commentContainer.querySelectorAll('.comment').forEach(e => e.remove());
        comments.forEach(c => addComment(commentContainer, c.comment));
    } catch (error) {
        console.error('コメントの取得エラー:', error);
    }
}

function addComment(container, comment) {
    const commentElement = document.createElement('div');
    commentElement.classList.add('comment');
    commentElement.textContent = comment;
    container.appendChild(commentElement);

    // Logic to make the comment flow on the video
    animateComment(commentElement);
}

function animateComment(commentElement) {
    commentElement.style.position = 'absolute';
    commentElement.style.whiteSpace = 'nowrap';
    commentElement.style.top = `${Math.random() * 100}%`;
    commentElement.style.left = '100%';
    commentElement.style.transition = 'left 10s linear';

    setTimeout(() => {
        commentElement.style.left = '-100%';
    }, 100);
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

document.addEventListener('DOMContentLoaded', () => {
    loadVideos();
    setupInfiniteScroll();
});
