const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const Member = require('./models/Member');
const Trainer = require('./models/Trainer');
const ClassBooking = require('./models/ClassBooking');

const seedInitialData = async () => {
  const memberCount = await Member.countDocuments();
  if (memberCount > 0) {
    console.log('Database already has data. Skipping auto-seed.');
    return;
  }

  console.log('Seeding initial FitZone data...');

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const memberPassword = await bcrypt.hash('password123', salt);
  const adminPassword = await bcrypt.hash('admin123', salt);

  // 1. Seed Members
  const member1 = await Member.create({
    name: 'John Carter',
    email: 'john@fitzone.com',
    password: memberPassword,
    phone: '+1 555-0199',
    membershipType: 'platinum',
    role: 'Member',
  });

  const member2 = await Member.create({
    name: 'Emily Watson',
    email: 'emily@fitzone.com',
    password: memberPassword,
    phone: '+1 555-0144',
    membershipType: 'premium',
    role: 'Member',
  });

  const adminMember = await Member.create({
    name: 'FitZone Admin',
    email: 'admin@fitzone.com',
    password: adminPassword,
    phone: '+1 555-0100',
    membershipType: 'platinum',
    role: 'Admin',
  });

  // 2. Seed Trainers
  const trainer1 = await Trainer.create({
    name: 'Rahul Sharma',
    specialization: 'Strength Training',
    available: true,
  });

  const trainer2 = await Trainer.create({
    name: 'Priya Patel',
    specialization: 'Yoga & Flexibility',
    available: true,
  });

  const trainer3 = await Trainer.create({
    name: 'Amit Kumar',
    specialization: 'HIIT & Cardio',
    available: true,
  });

  const trainer4 = await Trainer.create({
    name: 'Sarah Jenkins',
    specialization: 'Pilates & Core',
    available: false, // Fully booked example
  });

  const trainer5 = await Trainer.create({
    name: 'Marcus Vance',
    specialization: 'CrossFit & Conditioning',
    available: true,
  });

  // 3. Seed Sample Bookings
  await ClassBooking.create({
    memberId: member1._id,
    trainerId: trainer1._id,
    className: 'Strength & Conditioning Masterclass',
    date: '2026-09-01',
    timeSlot: '07:00 AM - 08:00 AM',
    status: 'booked',
  });

  await ClassBooking.create({
    memberId: member1._id,
    trainerId: trainer2._id,
    className: 'Morning Vinyasa Flow',
    date: '2026-08-20',
    timeSlot: '06:30 AM - 07:30 AM',
    status: 'attended',
  });

  await ClassBooking.create({
    memberId: member2._id,
    trainerId: trainer3._id,
    className: 'Full Body HIIT Blast',
    date: '2026-09-02',
    timeSlot: '05:30 PM - 06:30 PM',
    status: 'booked',
  });

  console.log('FitZone initial seed completed successfully.');
};

if (require.main === module) {
  require('dotenv').config();
  const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/fitzone';
  mongoose
    .connect(mongoUri)
    .then(async () => {
      await Member.deleteMany({});
      await Trainer.deleteMany({});
      await ClassBooking.deleteMany({});
      await seedInitialData();
      console.log('Standalone seed finished.');
      process.exit(0);
    })
    .catch((err) => {
      console.error('Seed error:', err);
      process.exit(1);
    });
}

module.exports = { seedInitialData };
