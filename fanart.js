document.addEventListener('DOMContentLoaded', () => {
    const dropZone = document.getElementById('dropZone');
    const fileInput = document.getElementById('fileInput');
    const uploadForm = document.getElementById('uploadForm');
    const gallery = document.getElementById('gallery');

    dropZone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.classList.add('dragging');
    });

    dropZone.addEventListener('dragleave', () => {
        dropZone.classList.remove('dragging');
    });

    dropZone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.classList.remove('dragging');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    fileInput.addEventListener('change', (e) => {
        const files = e.target.files;
        handleFiles(files);
    });

    uploadForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const comment = document.getElementById('comment').value;
        const files = fileInput.files;
        if (files.length > 0) {
            handleFiles(files, comment);
        }
    });

    function handleFiles(files, comment = '') {
        for (let i = 0; i < files.length; i++) {
            const file = files[i];
            const reader = new FileReader();
            reader.onload = (e) => {
                const img = document.createElement('img');
                img.src = e.target.result;
                const div = document.createElement('div');
                div.className = 'gallery-item';
                div.appendChild(img);
                if (comment) {
                    const p = document.createElement('p');
                    p.textContent = comment;
                    div.appendChild(p);
                }
                gallery.appendChild(div);
            };
            reader.readAsDataURL(file);
        }
    }
});
