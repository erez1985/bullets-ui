const express = require('express');
const router = express.Router();
const {
  getAllFolders,
  getFolder,
  createFolder,
  updateFolder,
  deleteFolder,
} = require('../controllers/folderController');

router.route('/')
  .get(getAllFolders)
  .post(createFolder);

router.route('/:id')
  .get(getFolder)
  .put(updateFolder)
  .delete(deleteFolder);

module.exports = router;

