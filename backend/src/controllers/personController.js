const { Person, Note } = require('../models');

// Get all people
exports.getAllPeople = async (req, res) => {
  try {
    const people = await Person.find().sort({ name: 1 });
    
    res.json({
      success: true,
      count: people.length,
      data: people,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Get single person
exports.getPerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found',
      });
    }
    
    res.json({
      success: true,
      data: person,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Create person
exports.createPerson = async (req, res) => {
  try {
    const person = await Person.create(req.body);
    
    res.status(201).json({
      success: true,
      data: person,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Update person
exports.updatePerson = async (req, res) => {
  try {
    const person = await Person.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found',
      });
    }
    
    res.json({
      success: true,
      data: person,
    });
  } catch (error) {
    res.status(400).json({
      success: false,
      error: error.message,
    });
  }
};

// Delete person
exports.deletePerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found',
      });
    }
    
    // Remove person from all notes' bullets
    await Note.updateMany(
      { 'bullets.mentions': req.params.id },
      { $pull: { 'bullets.$[].mentions': req.params.id } }
    );
    
    await Person.findByIdAndDelete(req.params.id);
    
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

// Get bullets by person (mentions)
exports.getBulletsByPerson = async (req, res) => {
  try {
    const person = await Person.findById(req.params.id);
    
    if (!person) {
      return res.status(404).json({
        success: false,
        error: 'Person not found',
      });
    }
    
    const notes = await Note.find({ 'bullets.mentions': req.params.id })
      .populate('bullets.tags')
      .populate('bullets.mentions');
    
    const bullets = notes.flatMap(note =>
      note.bullets
        .filter(b => b.mentions.some(m => m._id.toString() === req.params.id))
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

