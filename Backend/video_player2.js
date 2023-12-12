document.addEventListener('DOMContentLoaded', function () {
    const video2 = document.getElementById('myVideo3');
    const playPauseBtn2 = document.getElementById('playPauseBtn2');
    const progressBar2 = document.querySelector('.progress-bar2');
    const progress2 = document.querySelector('.progress2');
    const volumeRange2 = document.getElementById('volumeRange2');

    playPauseBtn2.addEventListener('click', togglePlayPause);
    video2.addEventListener('timeupdate', updateProgressBar);
    progressBar2.addEventListener('click', seek);
    volumeRange2.addEventListener('input', setVolume);

    function togglePlayPause() {
        if (video2.paused) {
            video2.play();
            playPauseBtn2.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            video2.pause();
            playPauseBtn2.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function updateProgressBar() {
        const value = (video2.currentTime / video2.duration) * 100;
        progress2.style.width = value + '%';
    }

    function seek(e) {
        const percent = e.offsetX / progressBar2.offsetWidth;
        video2.currentTime = percent * video2.duration;
    }

    function setVolume() {
        video2.volume = volumeRange2.value;
    }
});

console.log(pruebamulti)