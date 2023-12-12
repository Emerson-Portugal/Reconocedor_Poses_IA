const videoElement3 = document.getElementsByClassName("video3")[0];
const canvasElement3 = document.getElementsByClassName("canvas3")[0];
const canvasCtx3 = canvasElement3.getContext("2d");
const controlsElement6 = document.getElementsByClassName("control5")[0];

const fpsControl3 = new FPS();

function onResultsPose3(results) {

  fpsControl3.tick();
  canvasCtx3.save();

  canvasCtx3.clearRect(0, 0, canvasElement3.width, canvasElement3.height);
  canvasCtx3.drawImage(results.image, 0, 0, canvasElement3.width, canvasElement3.height);

  drawConnectors(canvasCtx3, results.poseLandmarks, POSE_CONNECTIONS, {
    color: (data) => {
      const x0 = canvasElement3.width * data.from.x;
      const y0 = canvasElement3.height * data.from.y;
      const x1 = canvasElement3.width * data.to.x;
      const y1 = canvasElement3.height * data.to.y;

      const z0 = clamp(data.from.z + 0.5, 0, 1);
      const z1 = clamp(data.to.z + 0.5, 0, 1);

      const gradient = canvasCtx3.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
      gradient.addColorStop(1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
      return gradient;
    },
  });

  drawLandmarks(
    canvasCtx3,
    Object.values(POSE_LANDMARKS_LEFT).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#FF0000" }
  );

  drawLandmarks(
    canvasCtx3,
    Object.values(POSE_LANDMARKS_RIGHT).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#00FF00" }
  );

  drawLandmarks(
    canvasCtx3,
    Object.values(POSE_LANDMARKS_NEUTRAL).map((index) => results.poseLandmarks[index]),
    { color: zColor, fillColor: "#AAAAAA" }
  );


}


const pose3 = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  },
});
pose3.onResults(onResultsPose3);

async function onFrame2() {
  if (!videoElement3.paused && !videoElement3.ended) {
    await pose3.send({
      image: videoElement3
    });
    await new Promise(requestAnimationFrame);
    onFrame2();
  } else
    setTimeout(onFrame2, 500);
}

// must be same domain otherwise it will taint the canvas! 
videoElement3.src = "./bachata1.mp4"; 
videoElement3.onloadeddata = (evt) => {
  let video = evt.target;

  canvasElement3.width = 480;
  canvasElement3.height = 480;

  onFrame2();
}


new ControlPanel(controlsElement6, {
  selfieMode: false,
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
})
  .add([
    new StaticText({ title: "MediaPipe Pose" }),
    fpsControl3,
    new Toggle({ title: "Selfie Mode", field: "selfieMode" }),
    new Toggle({ title: "Upper-body Only", field: "upperBodyOnly" }),
    new Toggle({ title: "Smooth Landmarks", field: "smoothLandmarks" }),
    new Slider({
      title: "Min Detection Confidence",
      field: "minDetectionConfidence",
      range: [0, 1],
      step: 0.01,
    }),
    new Slider({
      title: "Min Tracking Confidence",
      field: "minTrackingConfidence",
      range: [0, 1],
      step: 0.01,
    }),
  ])
  .on((options) => {
    videoElement3.classList.toggle("selfie", options.selfieMode);
    pose3.setOptions(options);
  });

  const video2 = document.getElementById("myVideo");

  function toggleVideo() {
    if (video2.paused) {
      video2.play();
    } else {
      video2.pause();
    }
  }