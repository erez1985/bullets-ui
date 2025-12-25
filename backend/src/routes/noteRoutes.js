const express = require('express');
const router = express.Router();
const {
  getAllNotes,
  getNote,
  createNote,
  updateNote,
  deleteNote,
  togglePin,
  addBullet,
  updateBullet,
  deleteBullet,
} = require('../controllers/noteController');

// Note routes
router.route('/')
  .get(getAllNotes)
  .post(createNote);

router.route('/:id')
  .get(getNote)
  .put(updateNote)
  .delete(deleteNote);

router.patch('/:id/pin', togglePin);

// Bullet routes
router.post('/:id/bullets', addBullet);
router.put('/:id/bullets/:bulletId', updateBullet);
router.delete('/:id/bullets/:bulletId', deleteBullet);

module.exports = router;

