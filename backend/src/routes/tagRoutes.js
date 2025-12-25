const express = require('express');
const router = express.Router();
const {
  getAllTags,
  getTag,
  createTag,
  updateTag,
  deleteTag,
  getBulletsByTag,
} = require('../controllers/tagController');

router.route('/')
  .get(getAllTags)
  .post(createTag);

router.route('/:id')
  .get(getTag)
  .put(updateTag)
  .delete(deleteTag);

router.get('/:id/bullets', getBulletsByTag);

module.exports = router;

