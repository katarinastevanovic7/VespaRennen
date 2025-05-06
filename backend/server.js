// server.js
const express = require('express');
const WebSocket = require('ws');
const app = express();
const port = 3000;

// Express: Test-Endpunkt
app.get('/', (req, res) => {
  res.send('Backend läuft!');
});
app.listen(port, () => {
  console.log(`HTTP-Server läuft unter http://localhost:${port}`);
});

// WebSocket-Server auf Port 8080
const wss = new WebSocket.Server({ port: 8080 });
wss.on('connection', (ws) => {
  console.log('Frontend verbunden');
  
  // Dummy-Speed alle 2 Sekunden senden
  setInterval(() => {
    const speed = (Math.random() * 30).toFixed(1); // z. B. 12.3 km/h
    ws.send(speed);
  }, 2000);
});
