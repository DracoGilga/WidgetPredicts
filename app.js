// CONFIGURACIÓN: Borra los espacios cuando pongas el token real
const miCanal = "creador"; 
const oAuthToken = "oauth:TU_TOKEN"; 

const contenedor = document.getElementById("contenedor-apuesta");
const barraSi = document.getElementById("progreso-si");
const barraNo = document.getElementById("progreso-no");
const puntosSiCont = document.getElementById("puntos-si");
const puntosNoCont = document.getElementById("puntos-no");
const tituloH2 = document.getElementById("titulo");
const timerDisplay = document.getElementById("timer-display");
const labelSi = document.querySelector(".si-puntos .label");
const labelNo = document.querySelector(".no-puntos .label");

let countdownInterval;

function startTimer(duration) {
    clearInterval(countdownInterval);
    let timer = duration;
    countdownInterval = setInterval(() => {
        let minutes = Math.floor(timer / 60);
        let seconds = timer % 60;
        timerDisplay.innerText = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
        if (--timer < 0) {
            clearInterval(countdownInterval);
            timerDisplay.innerText = "00:00";
        }
    }, 1000);
}

function actualizarDuelo(pSi, pNo) {
    // REINICIO DE ANIMACIÓN GLITCH
    contenedor.classList.remove("glitch-active");
    void contenedor.offsetWidth; 
    contenedor.classList.add("glitch-active");
    setTimeout(() => contenedor.classList.remove("glitch-active"), 350);

    const total = pSi + pNo;
    let porcSi = 50, porcNo = 50;
    if (total > 0) {
        porcSi = Math.round((pSi / total) * 100);
        porcNo = 100 - porcSi;
    }
    
    barraSi.style.width = porcSi + "%";
    barraNo.style.width = porcNo + "%";
    document.getElementById("porcentaje-si").innerText = porcSi + "%";
    document.getElementById("porcentaje-no").innerText = porcNo + "%";
    puntosSiCont.innerText = pSi.toLocaleString() + " PTS";
    puntosNoCont.innerText = pNo.toLocaleString() + " PTS";
}

ComfyJS.onPrediction = ( (event) => {
    contenedor.classList.remove("oculto");
    contenedor.classList.add("mostrar");
    
    tituloH2.innerText = event.title.toUpperCase();
    labelSi.innerText = event.outcomes[0].title.toUpperCase();
    labelNo.innerText = event.outcomes[1].title.toUpperCase();
    
    if(event.prediction_window) startTimer(event.prediction_window);
    
    const pSi = event.outcomes[0].channel_points || 0;
    const pNo = event.outcomes[1].channel_points || 0;
    actualizarDuelo(pSi, pNo);
});

ComfyJS.onPredictionEnd = ( (event) => {
    clearInterval(countdownInterval);
    timerDisplay.innerText = "CERRADO";
    setTimeout(() => {
        contenedor.classList.add("oculto");
        contenedor.classList.remove("mostrar");
    }, 30000); 
});

// Inicialización
if(miCanal !== "creador") {
    ComfyJS.Init(miCanal, oAuthToken);
}

// PRUEBA MANUAL: Haz clic en la pantalla para simular una apuesta
document.addEventListener("click", () => {
    if(contenedor.classList.contains("oculto")){
        contenedor.classList.remove("oculto");
        contenedor.classList.add("mostrar");
        startTimer(60);
    }
    // Simula nombres largos para probar el diseño
    labelSi.innerText = "ESTA ES UNA OPCIÓN MUY LARGA";
    labelNo.innerText = "ESTA TAMBIÉN ES LARGA";
    actualizarDuelo(Math.floor(Math.random()*10000), Math.floor(Math.random()*10000));
});
