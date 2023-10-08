const express = require("express");
const path = require("path");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");
let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running");
    });
  } catch (e) {
    console.log(`Db error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

app.get("/players/", async (request, response) => {
  const getPlayersQuery = `
    SELECT * FROM cricket_team;`;
  const players = await db.all(getPlayersQuery);
  const updateResponse = players.map((each) => ({
    playerId: each.player_id,
    playerName: each.player_name,
    jerseyNumber: each.jersey_number,
    role: each.role,
  }));
  response.send(updateResponse);
});
module.exports = app;

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;

  const postPlayersQuery = `
    INSERT INTO cricket_team(player_name,jersey_number,role)
    VALUES("${playerName}",
    ${jerseyNumber},
    "${role}");
    `;
  const dbResponse = await db.run(postPlayersQuery);
  const playerId = dbResponse.lastID;
  response.send("Player Added to Team");
});
module.exports = app;

app.get("/players/:playerId", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT * FROM cricket_team WHERE player_id=${playerId}`;

  const dbResponse = await db.get(getPlayerQuery);
  const updatedDbResponse = {
    playerId: dbResponse.player_id,
    playerName: dbResponse.player_name,
    jerseyNumber: dbResponse.jersey_number,
    role: dbResponse.role,
  };
  response.send(updatedDbResponse);
});
module.exports = app;

app.put("players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const { playerDetails } = request.body;
  const { playerName, jerseyNumber, role } = playerDetails;
  const updatePlayersQuery = `
  UPDATE cricket_team
  SET 
  player_name="${playerName}",
  jersey_number=${jerseyNumber},
  role="${role}"
  WHERE 
  player_id=${playerId}`;

  await db.run(updatePlayersQuery);
  response.send("Player Details Updated");
});
module.exports = app;

app.delete("players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const deleteQuery = `
    DELETE FROM cricket_team
     WHERE
      player_id=${playerId};`;

  await db.run(deleteQuery);
  response.send("Player Removed");
});
module.exports = app;
