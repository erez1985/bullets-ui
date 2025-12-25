const express = require('express');
const router = express.Router();
const {
  getAllPeople,
  getPerson,
  createPerson,
  updatePerson,
  deletePerson,
  getBulletsByPerson,
} = require('../controllers/personController');

router.route('/')
  .get(getAllPeople)
  .post(createPerson);

router.route('/:id')
  .get(getPerson)
  .put(updatePerson)
  .delete(deletePerson);

router.get('/:id/bullets', getBulletsByPerson);

module.exports = router;

