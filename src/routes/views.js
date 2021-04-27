// dependencies
const express = require('express');
const router = express.Router();

// public endpoints
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'src/views' });
});

router.get('/stores', function(req, res) {
  res.sendFile('stores.html', { root: 'src/views' });
});

router.get('/floors', function(req, res) {
  res.sendFile('floors.html', { root: 'src/views' });
});

router.get('/flow', function(req, res) {
  res.sendFile('flow.html', { root: 'src/views' });
});
module.exports = router;
