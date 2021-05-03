// dependencies
const express = require('express');
const router = express.Router();

// public endpoints
router.get('/', function(req, res, next) {
  res.sendFile('index.html', { root: 'src/views', title: '#' ,path:"#"});
});

router.get('/stores', function(req, res) {
  res.sendFile('stores.html', { root: 'src/views', title: 'stores' ,path:"stores" });
});

router.get('/data', function(req, res) {
  res.sendFile('data.html', { root: 'src/views', title: 'data' ,path:"data" });
});

router.get('/flow', function(req, res) {
  res.sendFile('flow.html', { root: 'src/views', title: 'flow' ,path:"flow" });
});
module.exports = router;
