
const videoElement = document.getElementsByClassName("vid2")[0];
const canvasElement = document.getElementsByClassName("output_dance")[0];
const canvasCtx = canvasElement.getContext("2d");

const fpsControl2 = new FPS();

let intervalId =-1;
function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function onResultsPose2(results) {
  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(results.image, 0, 0, canvasElement.width, canvasElement.height);

  drawConnectors(canvasCtx, results.poseLandmarks, POSE_CONNECTIONS, {
    color: (data) => {
      const x0 = canvasElement.width * data.from.x;
      const y0 = canvasElement.height * data.from.y;
      const x1 = canvasElement.width * data.to.x;
      const y1 = canvasElement.height * data.to.y;

      const z0 = clamp(data.from.z + 0.5, 0, 1);
      const z1 = clamp(data.to.z + 0.5, 0, 1);

      const gradient = canvasCtx.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
      gradient.addColorStop(1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
      return gradient;
    },
  });

  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_LEFT).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#FF0000" }
  );

  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_RIGHT).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#00FF00" }
  );

  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_NEUTRAL).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#AAAAAA" }
  );
}

videoElement.addEventListener("play", () => {
  startDrawing();
});

videoElement.addEventListener("pause", () => {
  clearInterval(intervalId);
});


const pose2 = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  },
});
pose2.onResults(onResultsPose2);

function startDrawing() {
  clearInterval(intervalId);

  const captureInterval = 300;
  intervalId = setInterval(() => {
    pose2.send({image: videoElement});
  }, captureInterval);
}

const video = document.getElementById("video");

function toggleVideo() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}