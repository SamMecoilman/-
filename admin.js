document.addEventListener('DOMContentLoaded', () => {
    const manualUploadForm = document.getElementById('manualUploadForm');

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
            let manualVideos = JSON.parse(localStorage.getItem('manualVideos')) || [];
            manualVideos.push(videoId);
            localStorage.setItem('manualVideos', JSON.stringify(manualVideos));
            alert('動画が追加されました');
        } else {
            alert('有効なYouTubeのURLを入力してください。');
        }
    }

    function extractVideoId(url) {
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
        const match = url.match(regExp);
        return (match && match[2].length === 11) ? match[2] : null;
    }
});
