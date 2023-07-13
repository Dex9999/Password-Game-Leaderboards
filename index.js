const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

// Serve static files from the 'public' directory
// app.use(express.static(path.join(__dirname, 'public')));

// Route all requests to index.html
app.get('/:any*', (req, res) => {
  res.status(404).sendFile(path.join(__dirname, 'index.html'));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
