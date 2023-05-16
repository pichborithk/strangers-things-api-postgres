const router = require('express').Router();
const controller = require('../controllers/post');

router.post('/create', controller.addPost);
router.get('/', controller.readAll);
router.patch('/:postId', controller.editPost);
router.delete('/:postId', controller.deletePost);

module.exports = router;
