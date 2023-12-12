const videoElement = document.getElementsByClassName("video")[0];
const canvasElement = document.getElementsByClassName("canvas2")[0];
const canvasCtx = canvasElement.getContext("2d");
const controlsElement5 = document.getElementsByClassName("control4")[0];

const pruebamulti = "hola desde script3";

const fpsControl2 = new FPS();

const porcentajeSimilitudElement = document.getElementById('porcentajeSimilitud');


function calcularDistanciaEuclidiana(punto1, punto2) {
  const dx = punto2.x - punto1.x;
  const dy = punto2.y - punto1.y;
  const dz = punto2.z - punto1.z;

  return Math.sqrt(dx * dx + dy * dy + dz * dz);
}

function calcularSimilitudNormalizada(landmark1, landmark2) {
  if (landmark1.length !== landmark2.length) {
    throw new Error("Los landmarks deben tener la misma cantidad de puntos");
  }

  let sumaDistanciasCuadradas = 0;

  for (let i = 0; i < landmark1.length; i++) {
    const distancia = calcularDistanciaEuclidiana(landmark1[i], landmark2[i]);
    sumaDistanciasCuadradas += distancia * distancia;
  }

  const distanciaEuclidianaTotal = Math.sqrt(sumaDistanciasCuadradas);
  const similitudNormalizada = 1 / (1 + distanciaEuclidianaTotal / landmark1.length);

  return similitudNormalizada;
}


// Declara una variable global para almacenar los landmarks
let poseLandmarksGlobal = null;
let poseLandmarksGlobal2 = null;

// Define un evento personalizado para notificar la actualización de landmarks
const landmarksUpdateEvent = new Event('landmarksUpdate');

const landmarksUpdateEvent2 = new Event('landmarksUpdate2');

// Función que se ejecutará cada vez que los landmarks se actualicen
function handleLandmarksUpdate(event) {
  // Accede al nuevo valor de landmarks en el detalle del evento
  const detalle = event.detail;

  // Determina qué variable global actualizar según el tipo de evento
  if (event.type === 'landmarksUpdate') {
    poseLandmarksGlobal = detalle;
    //console.log("tilin");
  } else if (event.type === 'landmarksUpdate2') {
    poseLandmarksGlobal2 = detalle;
    //console.log("tilin2");
  }

  // Calcula la distancia euclidiana entre los landmarks
  if (poseLandmarksGlobal && poseLandmarksGlobal2) {
    const similitud = calcularSimilitudNormalizada(poseLandmarksGlobal, poseLandmarksGlobal2);
    const porcentajeSimilitud = similitud * 100;
    const porcentajeRedondeado = porcentajeSimilitud.toFixed(2);
    console.log(`Porcentaje de similitud: ${porcentajeSimilitud}%`);
    porcentajeSimilitudElement.textContent = `${porcentajeRedondeado}%`;


  }
  
}

// Función que se ejecutará cada vez que los landmarks se actualicen

// En algún lugar de tu código, regístrate para el evento
document.addEventListener('landmarksUpdate', handleLandmarksUpdate);

document.addEventListener('landmarksUpdate2', handleLandmarksUpdate);


function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function onResultsPose2(results) {
  fpsControl2.tick();
  canvasCtx.save();

  canvasCtx.clearRect(0, 0, canvasElement.width, canvasElement.height);
  canvasCtx.drawImage(
    results.image,
    0,
    0,
    canvasElement.width,
    canvasElement.height
  );

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
    Object.values(POSE_LANDMARKS_LEFT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#FF0000" }
  );

  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_RIGHT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#00FF00" }
  );

  drawLandmarks(
    canvasCtx,
    Object.values(POSE_LANDMARKS_NEUTRAL).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#AAAAAA" }
  );

  poseLandmarksGlobal = results.poseLandmarks;
  document.dispatchEvent(new CustomEvent('landmarksUpdate', { detail: poseLandmarksGlobal }));

  canvasCtx.restore();
}

const pose2 = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  },
});
pose2.onResults(onResultsPose2);

async function onFrame() {
  if (!videoElement.paused && !videoElement.ended) {
    await pose2.send({
      image: videoElement,
    });
    await new Promise(requestAnimationFrame);
    onFrame();
  } else setTimeout(onFrame, 500);
}

// must be same domain otherwise it will taint the canvas!
videoElement.src = "./bachata1.mp4";
videoElement.onloadeddata = (evt) => {
  let video = evt.target;

  canvasElement.width = 480;
  canvasElement.height = 480;

  onFrame();
};

new ControlPanel(controlsElement5, {
  selfieMode: false,
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
})
  .add([
    new StaticText({ title: "MediaPipe Pose" }),
    fpsControl2,
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
    videoElement.classList.toggle("selfie", options.selfieMode);
    pose2.setOptions(options);
  });

const video = document.getElementById("myVideo");

function toggleVideo() {
  if (video.paused) {
    video.play();
  } else {
    video.pause();
  }
}

const videoElement3 = document.getElementsByClassName("video3")[0];
const canvasElement3 = document.getElementsByClassName("canvas3")[0];
const canvasCtx3 = canvasElement3.getContext("2d");
const controlsElement6 = document.getElementsByClassName("control5")[0];

const fpsControl3 = new FPS();

function onResultsPose3(results) {
  fpsControl3.tick();
  canvasCtx3.save();

  canvasCtx3.clearRect(0, 0, canvasElement3.width, canvasElement3.height);
  canvasCtx3.drawImage(
    results.image,
    0,
    0,
    canvasElement3.width,
    canvasElement3.height
  );

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
    Object.values(POSE_LANDMARKS_LEFT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#FF0000" }
  );

  drawLandmarks(
    canvasCtx3,
    Object.values(POSE_LANDMARKS_RIGHT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#00FF00" }
  );

  drawLandmarks(
    canvasCtx3,
    Object.values(POSE_LANDMARKS_NEUTRAL).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#AAAAAA" }
  );
  poseLandmarksGlobal2 = results.poseLandmarks;
  document.dispatchEvent(new CustomEvent('landmarksUpdate2', { detail: poseLandmarksGlobal2 }));
  canvasCtx3.restore();
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
      image: videoElement3,
    });
    await new Promise(requestAnimationFrame);
    onFrame2();
  } else setTimeout(onFrame2, 500);
}

// must be same domain otherwise it will taint the canvas!
videoElement3.src = "./bachata1.mp4";
videoElement3.onloadeddata = (evt) => {
  let video = evt.target;

  canvasElement3.width = 480;
  canvasElement3.height = 480;

  onFrame2();
};

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

