document.getElementById('uploadForm').addEventListener('submit', function(e) {
    e.preventDefault();

    const formData = new FormData();
    const imageFile = document.getElementById('image').files[0];
    const quality = document.getElementById('quality').value;
    formData.append('image', imageFile);
    formData.append('quality', quality);

    fetch('/upload', {
        method: 'POST',
        body: formData
    })
    .then(response => response.blob())
    .then(blob => {
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'converted.webp';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.getElementById('message').innerText = 'File converted successfully!';
    })
    .catch(error => {
        document.getElementById('message').innerText = `Error: ${error.message}`;
    });
});
