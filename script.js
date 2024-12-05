document.addEventListener("DOMContentLoaded", () => {
  const enableAudioButton = document.getElementById("enable-audio");
  const playerNameInput = document.getElementById("player-name");
  const addPlayerButton = document.getElementById("add-player");
  const playerList = document.getElementById("player-list");
  const timerInput = document.getElementById("timer-input");
  const startTimerButton = document.getElementById("start-timer");
  const timerDisplay = document.getElementById("timer-display");
  const monthlyStatsButton = document.getElementById("monthly-stats");
  const yearlyStatsButton = document.getElementById("yearly-stats");
  const statsDiv = document.getElementById("stats");

  const players = [];
  const maxPlayers = 10;
  const maxWins = 7;
  let timerInterval;
  let audioEnabled = false;
  const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
      // Desbloquear audio con interacción inicial
  enableAudioButton.addEventListener("click", () => {
    audio.play().then(() => {
      alert("Sonido habilitado. Ahora puedes usar el temporizador.");
      audioEnabled = true;
      enableAudioButton.style.display = "none";
    }).catch((error) => {
      console.error("Error al habilitar el sonido:", error);
      alert("Por favor, habilita manualmente el sonido en tu navegador.");
    });
  });

  // Función para cargar estadísticas
  const loadStats = async (type) => {
    const year = prompt("Ingrese el año:");
    let url = `/stats/year/${year}`;
    if (type === "monthly") {
      const month = prompt("Ingrese el mes (número):");
      url = `/stats/month/${month}/year/${year}`;
    }

    const response = await fetch(url);
    const data = await response.json();
    displayStats(data, type === "monthly" ? "Estadísticas Mensuales" : "Estadísticas Anuales");
  };

  const displayStats = (data, title) => {
    statsDiv.innerHTML = `<h2>${title}</h2>`;
    if (data.length === 0) {
      statsDiv.innerHTML += "<p>No hay datos disponibles.</p>";
      return;
    }
    const table = document.createElement("table");
    table.innerHTML = `
      <tr>
        <th>Nombre</th>
        <th>Partidas Jugadas</th>
        <th>Derrotas</th>
        <th>% Derrotas</th>
      </tr>
    `;
    data.forEach((row) => {
      table.innerHTML += `
        <tr>
          <td>${row.name}</td>
          <td>${row.games_played || row.total_games}</td>
          <td>${row.losses || row.total_losses}</td>
          <td>${(row.loss_percentage || 0).toFixed(2)}%</td>
        </tr>
      `;
    });
    statsDiv.appendChild(table);
  };

  monthlyStatsButton.addEventListener("click", () => loadStats("monthly"));
  yearlyStatsButton.addEventListener("click", () => loadStats("yearly"));
  
    // Renderizar jugadores
    const renderPlayers = () => {
      playerList.innerHTML = "";
      players.forEach((player, index) => {
        const playerItem = document.createElement("li");
        playerItem.className = "player-item";
        playerItem.innerHTML = `
          <span>${player.name} - Ganó: ${player.wins} veces</span>
          <div>
            <button ${player.wins >= maxWins ? "disabled" : ""} data-index="${index}" class="increase">+1</button>
            <button ${player.wins <= 0 ? "disabled" : ""} data-index="${index}" class="decrease">-1</button>
          </div>
        `;
        playerList.appendChild(playerItem);
      });
  
      document.querySelectorAll(".increase").forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = e.target.getAttribute("data-index");
          if (players[index].wins < maxWins) {
            players[index].wins += 1;
            renderPlayers();
          }
        });
      });
  
      document.querySelectorAll(".decrease").forEach((button) => {
        button.addEventListener("click", (e) => {
          const index = e.target.getAttribute("data-index");
          if (players[index].wins > 0) {
            players[index].wins -= 1;
            renderPlayers();
          }
        });
      });
    };
  
    // Agregar jugador
    addPlayerButton.addEventListener("click", () => {
      const name = playerNameInput.value.trim();
      if (!name) {
        alert("Por favor, ingrese un nombre.");
        return;
      }
      if (players.length >= maxPlayers) {
        alert("No puedes agregar más jugadores.");
        return;
      }
      players.push({ name, wins: 0 });
      playerNameInput.value = "";
      renderPlayers();
    });
  
    // Iniciar temporizador
    startTimerButton.addEventListener("click", () => {
      const minutes = parseInt(timerInput.value);
      if (isNaN(minutes) || minutes <= 0) {
        alert("Por favor, ingrese un tiempo válido.");
        return;
      }
  
      // Reproducir el sonido de la alarma si está habilitado
      if (audioEnabled) {
        audio.play().catch((error) => {
          console.error("No se pudo reproducir el sonido de la alarma:", error);
        });
      }
  
      clearInterval(timerInterval);
      let remainingTime = minutes * 60;
  
      timerInterval = setInterval(() => {
        const mins = Math.floor(remainingTime / 60);
        const secs = remainingTime % 60;
        timerDisplay.textContent = `Tiempo restante: ${mins}:${secs < 10 ? "0" : ""}${secs}`;
        remainingTime--;
  
        if (remainingTime < 0) {
          clearInterval(timerInterval);
          timerDisplay.textContent = "¡Tiempo terminado!";
          playAlarm();
          showLoser();
        }
      }, 1000);
    });
  
    // Reproducir alarma
    const playAlarm = () => {
      if (audioEnabled) {
        audio.play().catch((error) => {
          console.error("No se pudo reproducir el sonido de la alarma:", error);
        });
      }
    };
  
    // Mostrar el jugador con menos victorias
    const showLoser = () => {
      const minWins = Math.min(...players.map((player) => player.wins));
      const losers = players.filter((player) => player.wins === minWins);
      if (losers.length === 1) {
        alert(`El jugador con menos victorias es: ${losers[0].name}`);
      } else {
        alert(`Empate entre los jugadores: ${losers.map((player) => player.name).join(", ")}`);
      }
    };
  });
  