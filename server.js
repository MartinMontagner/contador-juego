const express = require("express");
const sqlite3 = require("sqlite3").verbose();
const bodyParser = require("body-parser");
const xlsx = require("xlsx");
const app = express();
const PORT = 3000;

// Configuración del middleware
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Conexión a la base de datos
const db = new sqlite3.Database("players_stats.db", (err) => {
  if (err) {
    console.error("Error al conectar a la base de datos:", err.message);
  } else {
    console.log("Conexión a SQLite establecida.");
  }
});

// Crear tabla si no existe
db.run(`
  CREATE TABLE IF NOT EXISTS players_stats (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    games_played INTEGER NOT NULL,
    losses INTEGER NOT NULL,
    month INTEGER NOT NULL,
    year INTEGER NOT NULL
  )
`);

// Función para cargar datos del archivo Excel
const loadExcelData = () => {
  const workbook = xlsx.readFile("data.xlsx");
  const sheet = workbook.Sheets["players"];
  const rows = xlsx.utils.sheet_to_json(sheet);

  rows.forEach((row) => {
    const { Name, GamesPlayed, Losses, Month, Year } = row;
    db.run(
      "INSERT INTO players_stats (name, games_played, losses, month, year) VALUES (?, ?, ?, ?, ?)",
      [Name, GamesPlayed, Losses, Month, Year],
      (err) => {
        if (err) {
          console.error("Error al insertar datos:", err.message);
        }
      }
    );
  });

  console.log("Datos cargados desde Excel.");
};

// Cargar datos desde el Excel al iniciar el servidor
loadExcelData();

// Endpoint para obtener datos de un mes
app.get("/stats/month/:month/year/:year", (req, res) => {
  const { month, year } = req.params;
  db.all(
    "SELECT name, games_played, losses, (losses * 100.0 / games_played) AS loss_percentage FROM players_stats WHERE month = ? AND year = ?",
    [month, year],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Endpoint para obtener datos acumulados del año
app.get("/stats/year/:year", (req, res) => {
  const { year } = req.params;
  db.all(
    "SELECT name, SUM(games_played) AS total_games, SUM(losses) AS total_losses, (SUM(losses) * 100.0 / SUM(games_played)) AS loss_percentage FROM players_stats WHERE year = ? GROUP BY name",
    [year],
    (err, rows) => {
      if (err) {
        res.status(500).json({ error: err.message });
      } else {
        res.json(rows);
      }
    }
  );
});

// Iniciar el servidor
app.listen(PORT, () => {
  console.log(`Servidor corriendo en http://localhost:${PORT}`);
});
