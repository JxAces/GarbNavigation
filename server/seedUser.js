const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User'); // Adjust the path to your User model if necessary

// MongoDB URI
const mongoURI = 'mongodb://192.168.1.9:27017/Garbage';

mongoose.connect(mongoURI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => {
  console.log('MongoDB connected');
  seedUsers();
})
.catch(err => {
  console.error('MongoDB connection error:', err);
});

async function seedUsers() {
  try {
    // Users to be seeded
    const users = [
      {
        email: 'admin@gmail.com',
        password: await bcrypt.hash('secret', 10), // Hash password securely
        role: 'admin',
      },
      {
        email: 'user@gmail.com',
        password: await bcrypt.hash('secret', 10),
        role: 'user',
      },
    ];

    // Clear existing data
    await User.deleteMany({});
    console.log('Existing users removed');

    // Insert seed data
    const insertedUsers = await User.insertMany(users);
    console.log(`${insertedUsers.length} users created`);

    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding users:', error);
    mongoose.connection.close();
  }
}
