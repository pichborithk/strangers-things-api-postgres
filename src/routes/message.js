const router = require('express').Router();
const controller = require('../controllers/message');

router.post('/create', controller.addMessage);

module.exports = router;
