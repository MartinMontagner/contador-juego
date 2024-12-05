document.addEventListener("DOMContentLoaded", () => {
    const playerNameInput = document.getElementById("player-name");
    const addPlayerButton = document.getElementById("add-player");
    const playerList = document.getElementById("player-list");
    const timerInput = document.getElementById("timer-input");
    const startTimerButton = document.getElementById("start-timer");
    const timerDisplay = document.getElementById("timer-display");
  
    const players = [];
    const maxPlayers = 10;
    const maxWins = 7;
    let timerInterval;
    let audioEnabled = false;
    const audio = new Audio("https://www.soundjay.com/button/beep-07.wav");
  
    // Habilitar sonido en la primera interacción
    document.body.addEventListener("click", () => {
      if (!audioEnabled) {
        audio.play().then(() => {
          audioEnabled = true;
          alert("Sonido habilitado. Ahora puedes usar el temporizador.");
        }).catch((error) => {
          console.error("Error al habilitar el sonido:", error);
          alert("No se pudo habilitar el sonido, asegúrate de habilitarlo en tu navegador.");
        });
      }
    });
  
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
  