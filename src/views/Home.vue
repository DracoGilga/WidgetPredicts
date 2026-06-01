<template>
	<div class="login-container">
		<div class="box">
			<h1>GITS PREDICTIONS</h1>
			<p>Configura tu widget para OBS</p>

			<div class="input-group">
				<label>Tu nombre de usuario en Twitch:</label>
				<input v-model="canal" type="text" placeholder="Tu nombre de usuario en Twitch" />
			</div>

			<button @click="conectarTwitch" :disabled="!canal">
				CONECTAR CON TWITCH
			</button>

			<p class="nota">Al autorizar, serás redirigido a la pantalla verde de tu widget. Copia esa URL completa y
				pégala en OBS.</p>
		</div>
	</div>
</template>

<script setup>
import { ref } from 'vue';

const canal = ref('');

const conectarTwitch = () => {
	localStorage.setItem('gits_canal_twitch', canal.value.trim().toLowerCase());
	const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
	const redirectUri = import.meta.env.VITE_TWITCH_REDIRECT_URI;

	const scopes = "channel:read:predictions";
	const authUrl = `https://id.twitch.tv/oauth2/authorize?client_id=${clientId}&redirect_uri=${redirectUri}&response_type=token&scope=${scopes}`;
	window.location.href = authUrl;
};
</script>

<style scoped>
.login-container {
	display: flex;
	justify-content: center;
	align-items: center;
	height: 100vh;
	background-color: #020c0c;
	color: #00ffcc;
	font-family: 'Share Tech Mono', monospace;
}

.box {
	border: 1px solid #00ffcc;
	padding: 2rem;
	box-shadow: 0 0 20px rgba(0, 255, 204, 0.3);
	text-align: center;
	max-width: 400px;
}

input {
	width: 100%;
	padding: 10px;
	margin: 10px 0 20px;
	background: #001a1a;
	border: 1px solid #00ffcc;
	color: white;
	text-align: center;
	box-sizing: border-box;
}

button {
	background: #00ffcc;
	color: black;
	border: none;
	padding: 10px 20px;
	font-weight: bold;
	cursor: pointer;
	transition: 0.2s;
	width: 100%;
}

button:disabled {
	background: #004444;
	color: #888;
	cursor: not-allowed;
}

button:hover:not(:disabled) {
	box-shadow: 0 0 10px #00ffcc;
}

.nota {
	font-size: 0.8rem;
	margin-top: 20px;
	color: #aaa;
}
</style>