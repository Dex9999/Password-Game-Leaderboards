const express = require('express');
const path = require('path');

const app = express();
const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

//redirect path to hash
app.use((req, res, next) => {
  if (!req.originalUrl.includes("#")) {
    const redirectUrl = `https://the-password-game.vercel.app/#${req.originalUrl.slice(1)}`;
    return res.redirect(301, redirectUrl);
  }
  next();
});

//for any path give index.html (doesn't work?)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public/index.html'));
});

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
