require('dotenv').config();
const bcrypt = require('bcryptjs');
const { connectDB, disconnectDB } = require('../server/config/db');
const User = require('../server/models/User');
const Project = require('../server/models/Project');
const Note = require('../server/models/Note');

const seedUsers = [
  { name: 'Devendra', email: 'devendra@gmail.com', password: 'demo1234', role: 'admin' },
  { name: 'Tannu', email: 'tannu@gmail.com', password: 'demo1234', role: 'member' },
  { name: 'Rinki', email: 'rinki@gmail.com', password: 'demo1234', role: 'member' },
  { name: 'Aman', email: 'aman@gmail.com', password: 'demo1234', role: 'member' },
];

const seedProjects = [
  {
    title: 'Apple Phone',
    description: 'This project focuses on product research, comparison, pricing strategy, and feature planning for a new phone launch.',
    isPublic: true,
    tags: ['Phone', 'Product', 'Research'],
  },
  {
    title: 'Chrome',
    description: 'Browser project tracking features, UI improvements, performance testing, and bug-fixing milestones for a smooth user experience.',
    isPublic: false,
    tags: ['Browser', 'Frontend', 'UI'],
  },
  {
    title: 'Learn Problem Solving',
    description: 'This project is for practicing logical thinking, code patterns, interview questions, and step-by-step problem solving strategies.',
    isPublic: true,
    tags: ['Learning', 'Problem Solving', 'DSA'],
  },
  {
    title: 'DSA',
    description: 'Data structure and algorithm practice project with arrays, trees, graphs, recursion, and interview-focused problem sets.',
    isPublic: false,
    tags: ['DSA', 'Algorithms', 'Practice'],
  },
];

const seedNotes = [
  {
    title: 'Launch checklist',
    content: 'Finalize beta messaging, confirm QA sign-off, and lock the launch timeline for Friday.',
  },
  {
    title: 'Research summary',
    content: 'Top friction points are onboarding clarity and pricing explanation. Prioritize friction reduction next sprint.',
  },
  {
    title: 'Weekly goals',
    content: 'Track engagement, monitor retention, and share a metric snapshot before the review meeting.',
  },
  {
    title: 'Design review',
    content: 'Refine CTA hierarchy and simplify the onboarding flow for a more confident first-run experience.',
  },
];

const main = async () => {
  try {
    await connectDB();

    const createdUsers = [];

    for (const userSeed of seedUsers) {
      const existingUser = await User.findOne({ email: userSeed.email.toLowerCase() });
      if (existingUser) {
        createdUsers.push(existingUser);
        continue;
      }

      const hashedPassword = await bcrypt.hash(userSeed.password, 10);
      const user = await User.create({
        ...userSeed,
        email: userSeed.email.toLowerCase(),
        password: hashedPassword,
      });

      createdUsers.push(user);
    }

    const owner = createdUsers[0];
    const projectEntries = [];

    for (let i = 0; i < seedProjects.length; i += 1) {
      const projectSeed = seedProjects[i];
      const ownerUser = createdUsers[i % createdUsers.length];
      const memberPool = createdUsers.filter((user) => user._id.toString() !== ownerUser._id.toString());

      const existingProject = await Project.findOne({ title: projectSeed.title });
      if (existingProject) {
        projectEntries.push(existingProject);
        continue;
      }

      const project = await Project.create({
        ...projectSeed,
        owner: ownerUser._id,
        members: memberPool.map((user) => user._id),
        shareToken: `${projectSeed.title.toLowerCase().replace(/\s+/g, '-')}-${Date.now()}-${i}`,
      });

      await User.updateMany(
        { _id: { $in: memberPool.map((user) => user._id) } },
        { $addToSet: { projects: project._id } }
      );

      projectEntries.push(project);
    }

    for (let i = 0; i < projectEntries.length; i += 1) {
      const project = projectEntries[i];
      const noteSeed = seedNotes[i % seedNotes.length];
      const noteCreator = createdUsers[i % createdUsers.length];

      const existingNote = await Note.findOne({ project: project._id, title: noteSeed.title });
      if (!existingNote) {
        await Note.create({
          ...noteSeed,
          project: project._id,
          createdBy: noteCreator._id,
        });
      }
    }

    console.log('Seed data inserted successfully.');
    console.log('Users created:', createdUsers.length);
    console.log('Projects created:', projectEntries.length);
    console.log('Demo login credentials:');
    console.log('Email: devendra@gmail.com | Password: demo1234');
  } catch (error) {
    console.error('Seed failed:', error.message);
    process.exitCode = 1;
  } finally {
    await disconnectDB();
  }
};

main();
