require('dotenv').config();

const mongoose = require('mongoose');
const { Note, Folder, Tag, Person } = require('../models');

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/bullets');
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      Note.deleteMany({}),
      Folder.deleteMany({}),
      Tag.deleteMany({}),
      Person.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create tags
    const tags = await Tag.create([
      { name: 'work', color: 'blue' },
      { name: 'personal', color: 'green' },
      { name: 'urgent', color: 'red' },
      { name: 'ideas', color: 'purple' },
      { name: 'restaurants', color: 'orange' },
    ]);
    console.log(`Created ${tags.length} tags`);

    // Create people
    const people = await Person.create([
      { name: 'John Smith' },
      { name: 'Sarah Connor' },
      { name: 'Alex Johnson' },
    ]);
    console.log(`Created ${people.length} people`);

    // Create folders
    const folders = await Folder.create([
      { name: 'All Notes', icon: '📝', order: 0 },
      { name: 'Work', icon: '💼', order: 1 },
      { name: 'Personal', icon: '🏠', order: 2 },
    ]);
    console.log(`Created ${folders.length} folders`);

    // Create notes
    const notes = await Note.create([
      {
        title: 'Project Planning',
        folderId: folders[1]._id, // Work folder
        color: 'yellow',
        isPinned: true,
        bullets: [
          {
            content: 'Review quarterly goals',
            type: 'checkbox',
            checked: true,
            tags: [tags[0]._id], // work
            mentions: [people[0]._id], // John
            indent: 0,
            order: 0,
          },
          {
            content: 'Schedule team meeting',
            type: 'checkbox',
            checked: false,
            tags: [tags[0]._id, tags[2]._id], // work, urgent
            mentions: [],
            indent: 0,
            order: 1,
          },
          {
            content: 'Prepare presentation slides',
            type: 'bullet',
            checked: false,
            tags: [],
            mentions: [people[1]._id], // Sarah
            indent: 1,
            order: 2,
          },
        ],
      },
      {
        title: 'Favorite Restaurants',
        folderId: folders[2]._id, // Personal folder
        color: 'green',
        isPinned: false,
        bullets: [
          {
            content: 'The Italian Place - amazing pasta',
            type: 'bullet',
            checked: false,
            tags: [tags[4]._id], // restaurants
            mentions: [],
            indent: 0,
            order: 0,
          },
          {
            content: 'Sushi Garden - great omakase',
            type: 'bullet',
            checked: false,
            tags: [tags[4]._id], // restaurants
            mentions: [],
            indent: 0,
            order: 1,
          },
        ],
      },
      {
        title: 'Ideas for the Weekend',
        folderId: folders[2]._id, // Personal folder
        color: 'blue',
        isPinned: false,
        bullets: [
          {
            content: 'Visit the new art museum',
            type: 'checkbox',
            checked: false,
            tags: [tags[3]._id], // ideas
            mentions: [people[2]._id], // Alex
            indent: 0,
            order: 0,
          },
        ],
      },
    ]);
    console.log(`Created ${notes.length} notes`);

    console.log('\n✅ Database seeded successfully!');
    console.log('\nSummary:');
    console.log(`  - ${tags.length} tags`);
    console.log(`  - ${people.length} people`);
    console.log(`  - ${folders.length} folders`);
    console.log(`  - ${notes.length} notes`);

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();

