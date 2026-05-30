// CONFIGURACIÓN (Cambia estos datos)
const miCanal = "creador"; 
const oAuthToken = "oauth:TU_TOKEN"; 

// Referencias
const contenedor = document.getElementById("contenedor-apuesta");
const barraSi = document.getElementById("progreso-si");
const barraNo = document.getElementById("progreso-no");
const textoSi = document.getElementById("porcentaje-si");
const textoNo = document.getElementById("porcentaje-no");
const puntosSiCont = document.getElementById("puntos-si");
const puntosNoCont = document.getElementById("puntos-no");
const tituloH2 = document.getElementById("titulo");
const labelSi = document.querySelector(".si-puntos .label");
const labelNo = document.querySelector(".no-puntos .label");

function actualizarDuelo(puntosSi, puntosNo) {
    contenedor.classList.add("glitch-active");
    setTimeout(() => contenedor.classList.remove("glitch-active"), 250);

    const total = puntosSi + puntosNo;
    let porcSi = 50, porcNo = 50;

    if (total > 0) {
        porcSi = Math.round((puntosSi / total) * 100);
        porcNo = 100 - porcSi;
    }
    
    barraSi.style.width = porcSi + "%";
    barraNo.style.width = porcNo + "%";
    textoSi.innerText = porcSi + "%";
    textoNo.innerText = porcNo + "%";
    puntosSiCont.innerText = puntosSi.toLocaleString() + " PTS";
    puntosNoCont.innerText = puntosNo.toLocaleString() + " PTS";
}

// Evento: Predicción iniciada o actualizada
ComfyJS.onPrediction = ( (event) => {
    // Activar visibilidad y secuencia de rayos
    contenedor.classList.remove("oculto");
    contenedor.classList.add("mostrar");

    // Datos dinámicos de Twitch
    tituloH2.innerText = event.title.toUpperCase();
    labelSi.innerText = event.outcomes[0].title.toUpperCase();
    labelNo.innerText = event.outcomes[1].title.toUpperCase();

    const pSi = event.outcomes[0].channel_points || 0;
    const pNo = event.outcomes[1].channel_points || 0;
    actualizarDuelo(pSi, pNo);
});

// Evento: Predicción finalizada
ComfyJS.onPredictionEnd = ( (event) => {
    // Esperar 30 segundos antes de ocultar
    setTimeout(() => {
        contenedor.classList.add("oculto");
        contenedor.classList.remove("mostrar");
    }, 30000); 
});

// Inicialización
if(miCanal !== "creador" && oAuthToken.includes("oauth:")) {
    ComfyJS.Init(miCanal, oAuthToken);
}

// PRUEBA MANUAL: Clic para ver la secuencia completa
document.addEventListener("click", () => {
    contenedor.classList.add("oculto");
    contenedor.classList.remove("mostrar");

    setTimeout(() => {
        contenedor.classList.remove("oculto");
        contenedor.classList.add("mostrar");
        
        tituloH2.innerText = "PRUEBA DE PROTOCOLO SECCIÓN 9";
        labelSi.innerText = "HACKEAR";
        labelNo.innerText = "DESCONECTAR";
        
        actualizarDuelo(Math.floor(Math.random() * 5000), Math.floor(Math.random() * 5000));
    }, 100);
});
