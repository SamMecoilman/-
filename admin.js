document.addEventListener('DOMContentLoaded', () => {
    const manualUploadForm = document.getElementById('manualUploadForm');
    const manualVideoList = document.getElementById('manualVideoList');

    manualUploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const videoUrl = document.getElementById('manualVideoUrl').value;
        if (videoUrl) {
            addManualVideo(videoUrl);
            document.getElementById('manualVideoUrl').value = '';
        }
    });

    function addManualVideo(videoUrl) {
        const videoId = extractVideoId(videoUrl);
        if (videoId) {
            const videoHtml = `
                <div class="video-card">
                    <div class="video-thumbnail">
                        <iframe src="https://www.youtube.com/embed/${videoId}" frameborder="0" allowfullscreen></iframe>
                        <div class="comment-overlay" id="overlay-${videoId}"></div>
                    </div>
                </div>
            `;
            manualVideoList.innerHTML += videoHtml;
        } else {
            alert('有効なYouTubeのURLを入力してください。');
        }
    }

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length == 11) ? match[2] : null;
    }
});
