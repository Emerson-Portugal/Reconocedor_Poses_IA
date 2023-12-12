document.addEventListener('DOMContentLoaded', function () {
    const video = document.getElementById('myVideo');
    const playPauseBtn = document.getElementById('playPauseBtn');
    const progressBar = document.querySelector('.progress-bar');
    const progress = document.querySelector('.progress');
    const volumeRange = document.getElementById('volumeRange');

    playPauseBtn.addEventListener('click', togglePlayPause);
    video.addEventListener('timeupdate', updateProgressBar);
    progressBar.addEventListener('click', seek);
    volumeRange.addEventListener('input', setVolume);

    function togglePlayPause() {
        if (video.paused) {
            video.play();
            playPauseBtn.innerHTML = '<i class="fa-solid fa-pause"></i>';
        } else {
            video.pause();
            playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
        }
    }

    function updateProgressBar() {
        const value = (video.currentTime / video.duration) * 100;
        progress.style.width = value + '%';
    }

    function seek(e) {
        const percent = e.offsetX / progressBar.offsetWidth;
        video.currentTime = percent * video.duration;
    }

    function setVolume() {
        video.volume = volumeRange.value;
    }
});

// Agrega esta función al final de tu script2.js o al lugar adecuado
function showLoadingScreen() {
    var loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'flex';
    }
  }
  
  function hideLoadingScreen() {
    var loadingScreen = document.getElementById('loadingScreen');
    if (loadingScreen) {
      loadingScreen.style.display = 'none';
    }
  }
  