const comments = {};

function submitComment(videoId) {
    const commentInput = document.getElementById(`comment-input-${videoId}`);
    const commentText = commentInput.value;
    if (!commentText.trim()) return;

    if (!comments[videoId]) {
        comments[videoId] = [];
    }

    comments[videoId].push(commentText);
    displayComments(videoId);
    commentInput.value = '';
    addCommentToVideo(videoId, commentText);
}

function displayComments(videoId) {
    const commentsList = document.getElementById(`comments-${videoId}`);
    commentsList.innerHTML = comments[videoId].map(comment => `<p>${comment}</p>`).join('');
}

function addCommentToVideo(videoId, commentText) {
    const overlay = document.getElementById(`overlay-${videoId}`);
    const commentElement = document.createElement('div');
    commentElement.className = 'comment';
    commentElement.innerText = commentText;
    overlay.appendChild(commentElement);

    const animationDuration = 10; // 10 seconds
    const videoWidth = overlay.clientWidth;
    commentElement.style.left = `${videoWidth}px`;
    commentElement.style.animationDuration = `${animationDuration}s`;

    commentElement.addEventListener('animationend', () => {
        overlay.removeChild(commentElement);
    });
}
