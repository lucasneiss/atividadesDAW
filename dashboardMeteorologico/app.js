const BH_COORDS = { lat: -19.9167, lon: -43.9333 };

const WMO_MAP = {
    0: { texto: "Céu Limpo", emoji: "☀️" },
    1: { texto: "Parcialmente Nublado", emoji: "🌤️" },
    2: { texto: "Parcialmente Nublado", emoji: "🌤️" },
    3: { texto: "Parcialmente Nublado", emoji: "🌤️" },
    45: { texto: "Nevoeiro", emoji: "🌫️" },
    48: { texto: "Nevoeiro", emoji: "🌫️" },
    51: { texto: "Chuvisco", emoji: "🌦️" },
    53: { texto: "Chuvisco", emoji: "🌦️" },
    55: { texto: "Chuvisco", emoji: "🌦️" },
    61: { texto: "Chuva", emoji: "🌧️" },
    63: { texto: "Chuva", emoji: "🌧️" },
    65: { texto: "Chuva", emoji: "🌧️" },
    80: { texto: "Pancadas de Chuva", emoji: "🌦️" },
    81: { texto: "Pancadas de Chuva", emoji: "🌦️" },
    82: { texto: "Pancadas de Chuva", emoji: "🌦️" },
    95: { texto: "Tempestade", emoji: "⛈️" },
    96: { texto: "Tempestade", emoji: "⛈️" },
    99: { texto: "Tempestade", emoji: "⛈️" }
};

function iniciar() {
    if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
            (pos) => carregarDashboard(pos.coords.latitude, pos.coords.longitude, "Localização Real"),
            () => carregarDashboard(BH_COORDS.lat, BH_COORDS.lon, "Belo Horizonte (Padrão)")
        );
    } else {
        carregarDashboard(BH_COORDS.lat, BH_COORDS.lon, "Belo Horizonte (Padrão)");
    }
}

async function carregarDashboard(lat, lon, modo) {
    document.getElementById("localizacao-info").innerText = `Modo: ${modo} [${lat.toFixed(2)}, ${lon.toFixed(2)}]`;
    
    await buscarClima(lat, lon);
    setInterval(() => buscarClima(lat, lon), 60000);
}

async function buscarClima(lat, lon) {
    try {
        const url = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current_weather=true`;
        const response = await fetch(url);
        const data = await response.json();

        atualizarUI(data.current_weather);
    } catch (erro) {
        console.error("Erro ao buscar dados do clima:", erro);
    }
}

function atualizarUI(clima) {

    const condicao = WMO_MAP[clima.weathercode] || { texto: "Desconhecido", emoji: "🌫️"}
   
    document.getElementById("condicao-texto").innerText = condicao.texto;
    document.getElementById("condicao-emoji").innerText = condicao.emoji;

    document.getElementById("temp-valor").innerText = clima.temperature;

    document.getElementById("temp-valor").innerText = clima.temperature;
    
    const cardTemp = document.getElementById("card-temp");
    const tempEmoji = document.getElementById("temp-emoji");

    if (clima.temperature < 15) {
        cardTemp.className = "card frio";
        tempEmoji.innerText = "🥶";
    } else if (clima.temperature <= 27) {
        cardTemp.className = "card agradavel";
        tempEmoji.innerText = "😊";
    } else {
        cardTemp.className = "card quente";
        tempEmoji.innerText = "🔥";
    }

    document.getElementById("dashboard").classList.remove("hidden");

    const timerAtual = new Date();
    document.getElementById("timer").innerText = timerAtual.toLocaleTimeString();

}

iniciar();
