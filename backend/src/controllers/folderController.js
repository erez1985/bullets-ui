const { Folder, Note } = require('../models');

// Get all folders
exports.getAllFolders = async (req, res) => {
  try {
    const folders = await Folder.find({ userId: req.userId })
      .populate('children')
      .sort({ order: 1, createdAt: 1 });
    
    res.json({
      success: true,
      count: folders.length,
      data: folders,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single folder
exports.getFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.userId })
      .populate('children');
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }
    
    res.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create folder
exports.createFolder = async (req, res) => {
  try {
    const folder = await Folder.create({
      ...req.body,
      userId: req.userId,
    });
    
    res.status(201).json({
      success: true,
      data: folder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update folder
exports.updateFolder = async (req, res) => {
  try {
    const folder = await Folder.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }
    
    res.json({
      success: true,
      data: folder,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete folder
exports.deleteFolder = async (req, res) => {
  try {
    const folder = await Folder.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!folder) {
      return res.status(404).json({
        success: false,
        error: 'Folder not found',
      });
    }
    
    // Move notes in this folder to root (null folderId)
    await Note.updateMany(
      { folderId: req.params.id, userId: req.userId },
      { folderId: null }
    );
    
    // Delete child folders recursively
    await Folder.deleteMany({ parentId: req.params.id, userId: req.userId });
    
    // Delete the folder
    await Folder.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    res.json({
      success: true,
      data: {},
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
