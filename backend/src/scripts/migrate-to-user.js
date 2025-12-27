require('dotenv').config();

const mongoose = require('mongoose');
const { Note, Folder, Tag, Person, User } = require('../models');

const migrateData = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bullets');
    console.log('Connected to MongoDB');

    // Find the first user (the one who just logged in)
    const user = await User.findOne({});
    
    if (!user) {
      console.error('No user found. Please log in first.');
      process.exit(1);
    }

    console.log(`Found user: ${user.name} (${user.email})`);
    console.log(`User ID: ${user._id}`);

    // Update all notes without a userId
    const notesResult = await Note.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: user._id } }
    );
    console.log(`Updated ${notesResult.modifiedCount} notes`);

    // Update all folders without a userId
    const foldersResult = await Folder.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: user._id } }
    );
    console.log(`Updated ${foldersResult.modifiedCount} folders`);

    // Update all tags without a userId
    const tagsResult = await Tag.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: user._id } }
    );
    console.log(`Updated ${tagsResult.modifiedCount} tags`);

    // Update all people without a userId
    const peopleResult = await Person.updateMany(
      { userId: { $exists: false } },
      { $set: { userId: user._id } }
    );
    console.log(`Updated ${peopleResult.modifiedCount} people`);

    console.log('\n✅ Migration completed successfully!');
    console.log(`All data is now associated with user: ${user.email}`);

    process.exit(0);
  } catch (error) {
    console.error('Error migrating data:', error);
    process.exit(1);
  }
};

migrateData();

