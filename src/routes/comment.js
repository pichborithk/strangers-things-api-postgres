const router = require('express').Router();
const controller = require('../controllers/comment');

router.post('/create/:postId', controller.addComment);
// router.get('/get', controller.readAll);
// router.delete('/delete/:postId', controller.deleteComment);

module.exports = router;
