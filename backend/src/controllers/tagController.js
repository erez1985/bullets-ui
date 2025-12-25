const { Tag, Note } = require('../models');

// Get all tags
exports.getAllTags = async (req, res) => {
  try {
    const tags = await Tag.find().sort({ name: 1 });
    
    res.json({
      success: true,
      count: tags.length,
      data: tags,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single tag
exports.getTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
      });
    }
    
    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create tag
exports.createTag = async (req, res) => {
  try {
    // Normalize tag name
    const tagData = {
      ...req.body,
      name: req.body.name?.toLowerCase().replace(/\s+/g, '-'),
    };
    
    const tag = await Tag.create(tagData);
    
    res.status(201).json({
      success: true,
      data: tag,
    });
  } catch (error) {
    // Handle duplicate tag name
    if (error.code === 11000) {
      return res.status(400).json({
        success: false,
        error: 'Tag with this name already exists',
      });
    }
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update tag
exports.updateTag = async (req, res) => {
  try {
    const updateData = { ...req.body };
    if (updateData.name) {
      updateData.name = updateData.name.toLowerCase().replace(/\s+/g, '-');
    }
    
    const tag = await Tag.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true, runValidators: true }
    );
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
      });
    }
    
    res.json({
      success: true,
      data: tag,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete tag
exports.deleteTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
      });
    }
    
    // Remove tag from all notes' bullets
    await Note.updateMany(
      { 'bullets.tags': req.params.id },
      { $pull: { 'bullets.$[].tags': req.params.id } }
    );
    
    await Tag.findByIdAndDelete(req.params.id);
    
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

// Get bullets by tag
exports.getBulletsByTag = async (req, res) => {
  try {
    const tag = await Tag.findById(req.params.id);
    
    if (!tag) {
      return res.status(404).json({
        success: false,
        error: 'Tag not found',
      });
    }
    
    const notes = await Note.find({ 'bullets.tags': req.params.id })
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    const bullets = notes.flatMap(note =>
      note.bullets
        .filter(b => b.tags.some(t => t._id.toString() === req.params.id))
        .map(b => ({
          ...b.toObject(),
          noteId: note._id,
          noteTitle: note.title,
        }))
    );
    
    res.json({
      success: true,
      count: bullets.length,
      data: bullets,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

