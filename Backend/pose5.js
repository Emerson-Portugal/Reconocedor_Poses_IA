const video5 = document.getElementsByClassName("input_video5")[0];
const out5 = document.getElementsByClassName("output5")[0];
const controlsElement4 = document.getElementsByClassName("control4")[0];
const canvasCtx5 = out5.getContext("2d");
const bodyElement = document.body;

const porcentajeSimilitudElement = document.getElementById('porcentajeSimilitud');


const myVideo = document.getElementById("myVideo");

const fpsControl = new FPS();

const spinner = document.querySelector(".loading");
spinner.ontransitionend = () => {
  spinner.style.display = "none";
};

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


// Define un evento personalizado para notificar la actualización de landmarks
const landmarksUpdateEvent = new Event('landmarksUpdate');



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
    //console.log(`Porcentaje de similitud: ${porcentajeSimilitud}%`);
    porcentajeSimilitudElement.textContent = `${porcentajeRedondeado}%`;


  }
  
}

// Función que se ejecutará cada vez que los landmarks se actualicen

// En algún lugar de tu código, regístrate para el evento
document.addEventListener('landmarksUpdate', handleLandmarksUpdate);



function checkFullBodyDetected(results) {
  const poseLandmarks = results.poseLandmarks;

  // Verificar si la visibilidad es mayor a 0.9 para todos los landmarks
  const todosLosLandmarksDetectados = poseLandmarks.every(
    (landmark) => landmark.visibility > 0.1
  );

  if (todosLosLandmarksDetectados) {
    console.log("Cuerpo completo detectado");
    // Agrega lógica adicional aquí si es necesario
  } else {
    console.log("No se detecta el cuerpo completo");
    // Agrega lógica adicional aquí si es necesario
  }
}

function zColor(data) {
  const z = clamp(data.from.z + 0.5, 0, 1);
  return `rgba(0, ${255 * z}, ${255 * (1 - z)}, 1)`;
}

function onResultsPose(results) {
  fpsControl.tick();
  canvasCtx5.save();

  canvasCtx5.clearRect(0, 0, out5.width, out5.height);
  canvasCtx5.drawImage(results.image, 0, 0, out5.width, out5.height);

  drawConnectors(canvasCtx5, results.poseLandmarks, POSE_CONNECTIONS, {
    color: (data) => {
      const x0 = out5.width * data.from.x;
      const y0 = out5.height * data.from.y;
      const x1 = out5.width * data.to.x;
      const y1 = out5.height * data.to.y;

      const z0 = clamp(data.from.z + 0.5, 0, 1);
      const z1 = clamp(data.to.z + 0.5, 0, 1);

      const gradient = canvasCtx5.createLinearGradient(x0, y0, x1, y1);
      gradient.addColorStop(0, `rgba(0, ${255 * z0}, ${255 * (1 - z0)}, 1)`);
      gradient.addColorStop(1.0, `rgba(0, ${255 * z1}, ${255 * (1 - z1)}, 1)`);
      return gradient;
    },
  });

  drawLandmarks(
    canvasCtx5,
    Object.values(POSE_LANDMARKS_LEFT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#FF0000" }
  );
  drawLandmarks(
    canvasCtx5,
    Object.values(POSE_LANDMARKS_RIGHT).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#00FF00" }
  );
  drawLandmarks(
    canvasCtx5,
    Object.values(POSE_LANDMARKS_NEUTRAL).map(
      (index) => results.poseLandmarks[index]
    ),
    { color: zColor, fillColor: "#AAAAAA" }
  );
  //console.log(results.poseLandmarks);
  const leftWrist = results.poseLandmarks[15];
  const rightWrist = results.poseLandmarks[16];

  const adjustedLeftWristX = rightWrist.x;
  const adjustedLeftWristY = rightWrist.y;

 
  drawButton(0, 0.05, 0.25, 0.08, "Iniciar/Pausar", function () {
    if (clickEnabled && !notificationShown) {
      toggleVideo2();
      clickEnabled = false;
      notificationShown = true;

      setTimeout(function () {
        clickEnabled = true;
        notificationShown = false;
      }, 1000); // Reactivar clic después de 1 segundo
    }
  });


  const buttonNormalized = { x: 0.05, y: 0.2, width: 0.1, height: 0.05 };

  // Verificar si la muñeca izquierda está cerca del botón
  if (isNearButton(
    { x: adjustedLeftWristX, y: adjustedLeftWristY },
    {
      x: buttonNormalized.x,
      y: buttonNormalized.y,
      width: buttonNormalized.width,
      height: buttonNormalized.height,
    }
  )) {

    if (clickEnabled) {
      toggleVideo2();
      clickEnabled = false;

      setTimeout(function () {
        clickEnabled = true;
      }, 1000); // Reactivar clic después de 1 segundo
    }

  }

  checkFullBodyDetected(results);


  poseLandmarksGlobal = results.poseLandmarks;
  document.dispatchEvent(new CustomEvent('landmarksUpdate', { detail: poseLandmarksGlobal }));

  canvasCtx5.restore();
}

const pose = new Pose({
  locateFile: (file) => {
    return `https://cdn.jsdelivr.net/npm/@mediapipe/pose@0.2/${file}`;
  },
});
pose.onResults(onResultsPose);

const camera = new Camera(video5, {
  onFrame: async () => {
    await pose.send({ image: video5 });
  },
  width: 480,
  height: 480,
});
camera.start();

new ControlPanel(controlsElement4, {
  selfieMode: true,
  upperBodyOnly: false,
  smoothLandmarks: true,
  minDetectionConfidence: 0.5,
  minTrackingConfidence: 0.5,
})
  .add([
    new StaticText({ title: "MediaPipe Pose" }),
    fpsControl,
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
    video5.classList.toggle("selfie", options.selfieMode);
    pose.setOptions(options);
  });

var buttons = []; // Array para almacenar botones
var clickEnabled = true; // Variable para controlar si el clic está habilitado
var notificationShown = false; // Variable para verificar si ya se mostró una notificación


function drawButton(xNormalized, yNormalized, widthNormalized, heightNormalized, text, onClick) {
  // Escalar las coordenadas normalizadas según el tamaño del canvas
  const canvasWidth = out5.width;
  const canvasHeight = out5.height;

  const x = xNormalized * canvasWidth;
  const y = yNormalized * canvasHeight;
  const width = widthNormalized * canvasWidth;
  const height = heightNormalized * canvasHeight;

  buttons.push({
    x: x,
    y: y,
    width: width,
    height: height,
    text: text,
    onClick: onClick,
  });

  canvasCtx5.fillStyle = "#3498db";
  canvasCtx5.fillRect(x, y, width, height);

  canvasCtx5.fillStyle = "#fff";
  canvasCtx5.font = "16px Arial";
  canvasCtx5.fillText(
    text,
    x + width / 2 - canvasCtx5.measureText(text).width / 2,
    y + height / 2 + 5
  );
}


out5.addEventListener("click", function (event) {
  var mouseX = event.clientX - out5.getBoundingClientRect().left;
  var mouseY = event.clientY - out5.getBoundingClientRect().top;

  buttons.forEach(function (button) {
    if (
      mouseX >= button.x &&
      mouseX <= button.x + button.width &&
      mouseY >= button.y &&
      mouseY <= button.y + button.height
    ) {
      button.onClick();
    }
  });
});

out5.addEventListener("mouseup", function () {
  lastClickedButton = null;
});

function toggleVideo2() {
  if (myVideo.paused) {
    myVideo.play();
  } else {
    myVideo.pause();
  }
}

const proximityThreshold = 20; // Ajusta según tus necesidades

// Función para verificar si la muñeca está cerca del botón
function isNearButton(wristCoordinates, buttonCoordinates) {
  const wristX = wristCoordinates.x;
  const wristY = wristCoordinates.y;
  const buttonX = buttonCoordinates.x;
  const buttonY = buttonCoordinates.y;
  const buttonWidth = buttonCoordinates.width;
  const buttonHeight = buttonCoordinates.height;

  return (
    wristX >= buttonX &&
    wristX <= buttonX + buttonWidth &&
    wristY >= buttonY &&
    wristY <= buttonY + buttonHeight
  );
}
