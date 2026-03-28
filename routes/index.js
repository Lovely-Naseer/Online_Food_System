const express = require('express');
const router = express.Router();

// Define a route for the homepage
router.get('/', (req, res) => {
    res.render('home'); // Renders the 'index.ejs' template
});

module.exports = router;
