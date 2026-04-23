require('dotenv').config();
const mongoose = require('mongoose');
const User = require('./models/User');
const Blog = require('./models/Blog');

const testDatabase = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    
    await User.deleteMany({});
    await Blog.deleteMany({});

    const dummyUser = await User.create({
      username: 'anand_dev',
      email: 'admin@lekhak.local',
      password: 'hashedpassword_placeholder'
    });

    const dummyBlog = await Blog.create({
      title: 'Testing the MERN Setup',
      content: '<p>This is a test block of text for the rich text editor integration.</p>',
      author: dummyUser._id
    });

    console.log(dummyUser);
    console.log(dummyBlog);

    process.exit(0);
  } catch (error) {
    console.error(error);
    process.exit(1);
  }
};

testDatabase();