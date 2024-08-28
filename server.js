const express = require('express');
const app = express();
const port = 3000; // You can change this to any port you prefer

// Middleware to serve static files from the 'public' directory
app.use(express.static('public'));

// Define a simple route
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'))
    res.send('Hello, world!');
});

// Define another route
app.get('/about', (req, res) => {
    res.send('About page');
});

// Start the server
app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});
