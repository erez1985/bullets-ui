const { Note } = require('../models');

// Get all notes
exports.getAllNotes = async (req, res) => {
  try {
    const { folderId, search, tagId } = req.query;
    
    let query = { userId: req.userId };
    
    // Filter by folder
    if (folderId && folderId !== 'all') {
      query.folderId = folderId;
    }
    
    // Filter by tag
    if (tagId) {
      query['bullets.tags'] = tagId;
    }
    
    let notes = await Note.find(query)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions')
      .sort({ isPinned: -1, updatedAt: -1 });
    
    // Text search
    if (search) {
      const searchLower = search.toLowerCase();
      notes = notes.filter(note => 
        note.title.toLowerCase().includes(searchLower) ||
        note.bullets.some(b => b.content.toLowerCase().includes(searchLower))
      );
    }
    
    res.json({
      success: true,
      count: notes.length,
      data: notes,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single note
exports.getNote = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId })
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create note
exports.createNote = async (req, res) => {
  try {
    const note = await Note.create({
      ...req.body,
      userId: req.userId,
    });
    
    const populatedNote = await Note.findById(note._id)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    res.status(201).json({
      success: true,
      data: populatedNote,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update note
exports.updateNote = async (req, res) => {
  try {
    const note = await Note.findOneAndUpdate(
      { _id: req.params.id, userId: req.userId },
      req.body,
      { new: true, runValidators: true }
    )
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete note
exports.deleteNote = async (req, res) => {
  try {
    const note = await Note.findOneAndDelete({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
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

// Toggle pin
exports.togglePin = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    note.isPinned = !note.isPinned;
    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    res.json({
      success: true,
      data: populatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Add bullet to note
exports.addBullet = async (req, res) => {
  try {
    const note = await Note.findOne({ _id: req.params.id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    const { afterBulletId, type = 'bullet', indent = 0 } = req.body;
    
    const newBullet = {
      content: '',
      type,
      checked: false,
      tags: [],
      mentions: [],
      indent,
      order: note.bullets.length,
    };
    
    if (afterBulletId) {
      const index = note.bullets.findIndex(b => b._id.toString() === afterBulletId);
      if (index !== -1) {
        newBullet.indent = note.bullets[index].indent;
        note.bullets.splice(index + 1, 0, newBullet);
      } else {
        note.bullets.push(newBullet);
      }
    } else {
      note.bullets.push(newBullet);
    }
    
    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    res.json({
      success: true,
      data: populatedNote,
      newBulletId: note.bullets[note.bullets.length - 1]._id,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Update bullet
exports.updateBullet = async (req, res) => {
  try {
    const { id, bulletId } = req.params;
    const updates = req.body;
    
    const note = await Note.findOne({ _id: id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    const bullet = note.bullets.id(bulletId);
    
    if (!bullet) {
      return res.status(404).json({
        success: false,
        error: 'Bullet not found',
      });
    }
    
    Object.assign(bullet, updates);
    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    res.json({
      success: true,
      data: populatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete bullet
exports.deleteBullet = async (req, res) => {
  try {
    const { id, bulletId } = req.params;
    
    const note = await Note.findOne({ _id: id, userId: req.userId });
    
    if (!note) {
      return res.status(404).json({
        success: false,
        error: 'Note not found',
      });
    }
    
    note.bullets = note.bullets.filter(b => b._id.toString() !== bulletId);
    
    // Ensure at least one bullet remains
    if (note.bullets.length === 0) {
      note.bullets.push({
        content: '',
        type: 'bullet',
        checked: false,
        tags: [],
        mentions: [],
        indent: 0,
        order: 0,
      });
    }
    
    await note.save();
    
    const populatedNote = await Note.findById(note._id)
      .populate('folderId')
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    res.json({
      success: true,
      data: populatedNote,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};
