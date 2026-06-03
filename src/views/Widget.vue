<template>
	<div v-if="!tokenValido" class="msg-estado">{{ errorMensaje }}</div>

	<Transition name="tv">
		<div v-show="mostrarWidget" id="contenedor-apuesta" :class="{ 'glitch-active': glitchActive }">
			<div class="top-label">LUDOPATÍA ON</div>
			<div id="timer-display" class="timer-style">{{ timerDisplay }}</div>

			<div class="header">
				<span class="badge">SECTION 9 SYSTEM</span>
				<h2>{{ titulo }}</h2>
			</div>

			<div class="duelo-container">
				<div class="barra si" :style="{ width: porcSi + '%' }">
					<span class="perc">{{ porcSi }}%</span>
				</div>
				<div class="barra no" :style="{ width: porcNo + '%' }">
					<span class="perc">{{ porcNo }}%</span>
				</div>
			</div>

			<div class="puntos-container">
				<div class="bando-puntos si-puntos">
					<span class="label">{{ labelSi }}</span>
					<span class="puntos-num">{{ puntosSi }} PTS</span>
				</div>
				<div class="bando-puntos no-puntos">
					<span class="label">{{ labelNo }}</span>
					<span class="puntos-num">{{ puntosNo }} PTS</span>
				</div>
			</div>
		</div>
	</Transition>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue';

const TIEMPO_PRUEBA_SEG = 10;
const TIEMPO_OCULTAR_MS = 10000;

const tokenValido = ref(false);
const errorMensaje = ref("ESPERANDO CONEXIÓN...");
const mostrarWidget = ref(false);
const glitchActive = ref(false);
const titulo = ref("ESPERANDO DATOS...");
const labelSi = ref("OPCIÓN A");
const labelNo = ref("OPCIÓN B");
const puntosSiRaw = ref(0);
const puntosNoRaw = ref(0);
const timerDisplay = ref("00:00");

const porcSi = computed(() => {
	const total = puntosSiRaw.value + puntosNoRaw.value;
	return total > 0 ? Math.round((puntosSiRaw.value / total) * 100) : 50;
});
const porcNo = computed(() => 100 - porcSi.value);
const puntosSi = computed(() => puntosSiRaw.value.toLocaleString());
const puntosNo = computed(() => puntosNoRaw.value.toLocaleString());

let countdownInterval;

const startTimer = (duration) => {
	clearInterval(countdownInterval);
	let timer = duration;
	countdownInterval = setInterval(() => {
		let minutes = Math.floor(timer / 60);
		let seconds = timer % 60;
		timerDisplay.value = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;

		if (--timer < 0) {
			clearInterval(countdownInterval);
			timerDisplay.value = "00:00";

			setTimeout(() => {
				mostrarWidget.value = false;
			}, TIEMPO_OCULTAR_MS);
		}
	}, 1000);
};

const triggerGlitch = () => {
	glitchActive.value = false;
	setTimeout(() => { glitchActive.value = true; }, 10);
	setTimeout(() => { glitchActive.value = false; }, 350);
};

const simularApuesta = () => {
	if (!mostrarWidget.value) {
		mostrarWidget.value = true;
		startTimer(TIEMPO_PRUEBA_SEG);
	}
	titulo.value = "ALERTA DE INTRUSIÓN EN LA RED";
	labelSi.value = "INTERCEPTAR";
	labelNo.value = "DEJAR PASAR Y RASTREAR";
	puntosSiRaw.value = Math.floor(Math.random() * 15000);
	puntosNoRaw.value = Math.floor(Math.random() * 15000);
	triggerGlitch();
};

let ws = null;

onMounted(async () => {
	const hashString = window.location.hash.substring(1);
	const paramsHash = new URLSearchParams(hashString);
	let tokenUrl = paramsHash.get("access_token");

	let token = tokenUrl || localStorage.getItem('gits_twitch_token_v2');

	if (token) {
		localStorage.setItem('gits_twitch_token_v2', token);
		tokenValido.value = true;

		const cleanToken = token.replace('oauth:', '');
		const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;

		try {
			const userRes = await fetch(`https://api.twitch.tv/helix/users`, {
				headers: {
					'Client-ID': clientId,
					'Authorization': `Bearer ${cleanToken}`
				}
			});

			if (userRes.status === 401) {
				tokenValido.value = false;
				errorMensaje.value = "TOKEN EXPIRADO. Entra desde tu navegador, genera un link nuevo y pégalo aquí.";
				localStorage.removeItem('gits_twitch_token_v2');
				return;
			}

			const userData = await userRes.json();
			if (!userData.data || userData.data.length === 0) throw new Error("Usuario no encontrado");
			const broadcasterId = userData.data[0].id;

			ws = new WebSocket('wss://eventsub.wss.twitch.tv/ws');

			ws.onmessage = async (event) => {
				const data = JSON.parse(event.data);

				if (data.metadata.message_type === 'session_welcome') {
					const sessionId = data.payload.session.id;
					const topics = ['channel.prediction.begin', 'channel.prediction.progress', 'channel.prediction.end'];

					for (const topic of topics) {
						await fetch('https://api.twitch.tv/helix/eventsub/subscriptions', {
							method: 'POST',
							headers: {
								'Client-ID': clientId,
								'Authorization': `Bearer ${cleanToken}`,
								'Content-Type': 'application/json'
							},
							body: JSON.stringify({
								type: topic,
								version: '1',
								condition: { broadcaster_user_id: broadcasterId },
								transport: { method: 'websocket', session_id: sessionId }
							})
						});
					}
				}

				if (data.metadata.message_type === 'notification') {
					const type = data.metadata.subscription_type;
					const payload = data.payload.event;

					if (type === 'channel.prediction.begin' || type === 'channel.prediction.progress') {
						mostrarWidget.value = true;
						titulo.value = payload.title.toUpperCase();
						labelSi.value = payload.outcomes[0].title.toUpperCase();
						labelNo.value = payload.outcomes[1].title.toUpperCase();
						puntosSiRaw.value = payload.outcomes[0].channel_points || 0;
						puntosNoRaw.value = payload.outcomes[1].channel_points || 0;

						if (type === 'channel.prediction.begin') {
							const locksAt = new Date(payload.locks_at).getTime();
							const now = new Date().getTime();
							const diffSeconds = Math.max(0, Math.floor((locksAt - now) / 1000));
							startTimer(diffSeconds);
						}
						triggerGlitch();
					}

					if (type === 'channel.prediction.end') {
						clearInterval(countdownInterval);
						timerDisplay.value = "CERRADO";
						setTimeout(() => { mostrarWidget.value = false; }, TIEMPO_OCULTAR_MS);
					}
				}
			};
		} catch (error) {
			console.error("Error conectando con Twitch API:", error);
		}
	} else {
		errorMensaje.value = "ERROR: Falta el Token. Ingresa desde el Home para generarlo.";
	}

	window.addEventListener("click", simularApuesta);
});

onUnmounted(() => {
	clearInterval(countdownInterval);
	if (ws) ws.close();
	window.removeEventListener("click", simularApuesta);
});
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Share+Tech+Mono&display=swap');

.msg-estado {
	color: #ff003c;
	font-family: 'Share Tech Mono', monospace;
	font-size: 1.5rem;
	text-align: center;
}

#contenedor-apuesta {
	background: rgba(2, 12, 12, 0.95);
	color: #00ffcc;
	width: 90vw;
	max-width: 500px;
	padding: 2.5em 2em 1.5em 2em;
	border: 1px solid #00ffcc;
	box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
	position: relative;
	box-sizing: border-box;
	font-family: 'Share Tech Mono', monospace;
	/* Se elimina la transition base porque Vue manejará la animación de TV */
}

/* --- ANIMACIÓN CRT (TELE VIEJA) --- */
.tv-enter-active {
	animation: crt-turn-on 0.5s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

.tv-leave-active {
	animation: crt-turn-off 0.4s cubic-bezier(0.23, 1, 0.32, 1) forwards;
}

@keyframes crt-turn-on {
	0% {
		transform: scale(1, 0.005);
		opacity: 0;
		filter: brightness(3);
	}

	40% {
		transform: scale(1, 0.005);
		opacity: 1;
		filter: brightness(3);
	}

	100% {
		transform: scale(1, 1);
		opacity: 1;
		filter: brightness(1);
	}
}

@keyframes crt-turn-off {
	0% {
		transform: scale(1, 1);
		opacity: 1;
		filter: brightness(1);
	}

	60% {
		transform: scale(1, 0.005);
		opacity: 1;
		filter: brightness(3);
	}

	100% {
		transform: scale(0, 0.005);
		opacity: 0;
		filter: brightness(3);
	}
}

/* ---------------------------------- */

.glitch-active {
	animation: glitch-color 0.2s steps(1) infinite;
}

@keyframes glitch-color {
	0% {
		transform: translate(4px, 0);
		filter: hue-rotate(90deg) brightness(2);
		box-shadow: 4px 0 0 red, -4px 0 0 blue;
	}

	50% {
		transform: translate(-4px, -2px);
		filter: hue-rotate(240deg);
		box-shadow: -4px 0 0 red, 4px 0 0 blue;
	}

	100% {
		transform: translate(0);
		filter: none;
	}
}

.timer-style {
	position: absolute;
	right: 20px;
	top: 15px;
	font-size: 1.1rem;
	color: #fff;
	text-shadow: 0 0 10px #00ffcc;
}

.top-label {
	position: absolute;
	top: 0;
	left: 50%;
	transform: translateX(-50%);
	background: #00ffcc;
	color: #000;
	font-size: 0.7rem;
	font-weight: 900;
	padding: 3px 20px;
	clip-path: polygon(10% 0, 90% 0, 100% 100%, 0% 100%);
}

.header {
	border-left: 4px solid #00ffcc;
	padding-left: 10px;
	margin-bottom: 1.2rem;
}

h2 {
	font-size: 1rem;
	color: #fff;
	text-transform: uppercase;
	margin: 10px 0 0 0;
	line-height: 1.2;
}

.duelo-container {
	display: flex;
	width: 100%;
	height: 2rem;
	background: #001a1a;
	border: 1px solid #00ffcc;
	overflow: hidden;
}

.barra {
	display: flex;
	align-items: center;
	padding: 0 10px;
	transition: width 0.6s cubic-bezier(0.18, 0.89, 0.32, 1.28);
	min-width: 45px;
	box-sizing: border-box;
}

.perc {
	font-size: 0.9rem;
	font-weight: 900;
}

.si {
	background: #00ffcc;
	color: #000;
}

.no {
	background: #004444;
	color: #fff;
	justify-content: flex-end;
}

.puntos-container {
	display: flex;
	justify-content: space-between;
	margin-top: 15px;
	gap: 10px;
}

.bando-puntos {
	display: flex;
	flex-direction: column;
	width: 48%;
	word-wrap: break-word;
}

.label {
	font-size: 0.75rem;
	color: #00ffcc !important;
	font-weight: 900;
	line-height: 1;
	margin-bottom: 5px;
}

.puntos-num {
	font-size: 0.9rem;
	color: #fff;
	opacity: 0.9;
}

.si-puntos {
	border-left: 2px solid #00ffcc;
	padding-left: 8px;
}

.no-puntos {
	border-right: 2px solid #00ffcc;
	padding-right: 8px;
	text-align: right;
}
</style>