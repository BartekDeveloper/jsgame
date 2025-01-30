const express = require('express');
const path = require('path');
const app = express();
const port = 3000; // Or any port you prefer

app.use(express.static(path.join(__dirname, '.'))); // Serve static files from the current directory

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html')); // Send the HTML file
});


app.listen(port, () => {
  console.log(`Server listening at http://localhost:${port}`);
});