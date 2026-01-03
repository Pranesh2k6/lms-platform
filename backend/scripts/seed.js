import mongoose from 'mongoose';
import dotenv from 'dotenv';
import User from '../models/User.js';
import Course from '../models/Course.js';
import Assignment from '../models/Assignment.js';
import Event from '../models/Event.js';
import Section from '../models/Section.js';

dotenv.config();

const seedData = async () => {
  try {
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('MongoDB Connected');

    // Clear existing data
    await User.deleteMany({});
    await Course.deleteMany({});
    await Assignment.deleteMany({});
    await Event.deleteMany({});
    await Section.deleteMany({});
    console.log('Cleared existing data');

    // Create Admin
    const admin = await User.create({
      name: 'Admin User',
      email: 'admin@college.edu',
      password: 'admin123',
      role: 'admin'
    });
    console.log('Created admin');

    // Create Professors
    const prof1 = await User.create({
      name: 'Dr. Sarah Johnson',
      email: 'prof1@college.edu',
      password: 'prof123',
      role: 'professor'
    });

    const prof2 = await User.create({
      name: 'Dr. Michael Chen',
      email: 'prof2@college.edu',
      password: 'prof123',
      role: 'professor'
    });
    console.log('Created 2 professors');

    // Create Sections
    const sectionA = await Section.create({
      name: 'Section A',
      program: 'B.Tech CSE',
      batch: '2024-2028',
      students: []
    });

    const sectionB = await Section.create({
      name: 'Section B',
      program: 'B.Tech CSE',
      batch: '2024-2028',
      students: []
    });
    console.log('Created 2 sections');

    // Create 60 Students (30 per section)
    const studentNames = [
      'Alice Williams', 'Bob Martinez', 'Charlie Davis', 'Diana Smith', 'Ethan Brown',
      'Fiona Garcia', 'George Wilson', 'Hannah Lee', 'Isaac Taylor', 'Julia Anderson',
      'Kevin Thomas', 'Laura Jackson', 'Michael White', 'Nancy Harris', 'Oliver Martin',
      'Patricia Thompson', 'Quinn Garcia', 'Rachel Moore', 'Samuel Miller', 'Tina Davis',
      'Uma Rodriguez', 'Victor Martinez', 'Wendy Lopez', 'Xavier Gonzalez', 'Yara Hernandez',
      'Zachary Wilson', 'Amy Anderson', 'Brian Thomas', 'Catherine Taylor', 'David Jackson',
      'Emma White', 'Frank Harris', 'Grace Martin', 'Henry Thompson', 'Iris Garcia',
      'James Moore', 'Kate Miller', 'Liam Davis', 'Mia Rodriguez', 'Noah Martinez',
      'Olivia Lopez', 'Paul Gonzalez', 'Quinn Hernandez', 'Ryan Wilson', 'Sophia Anderson',
      'Thomas Brown', 'Uma Lee', 'Victoria Smith', 'William Johnson', 'Ximena Williams',
      'Yasmine Garcia', 'Zane Martinez', 'Aria Davis', 'Blake Thompson', 'Chloe Wilson',
      'Dylan Anderson', 'Emily Thomas', 'Felix Jackson', 'Gabriella White', 'Harrison Harris'
    ];

    const students = [];
    for (let i = 0; i < 60; i++) {
      const section = i < 30 ? sectionA : sectionB;
      const student = await User.create({
        name: studentNames[i],
        email: `student${i + 1}@college.edu`,
        password: 'student123',
        role: 'student',
        section: section._id
      });
      students.push(student);
      section.students.push(student._id);
    }

    await sectionA.save();
    await sectionB.save();
    console.log('Created 60 students (30 per section)');

    // Create Courses (Section-based)
    const course1 = await Course.create({
      title: 'Introduction to Computer Science',
      courseCode: 'CS101',
      description: 'Learn the fundamentals of programming and computer science',
      colorIdentifier: '#3B82F6', // Blue
      instructor: prof1._id,
      targetSection: sectionA._id,
      students: [], // Deprecated - keeping for backward compatibility
      lectures: []
    });

    const course2 = await Course.create({
      title: 'Data Structures and Algorithms',
      courseCode: 'CS201',
      description: 'Advanced data structures and algorithm design',
      colorIdentifier: '#8B5CF6', // Purple
      instructor: prof1._id,
      targetSection: sectionB._id,
      students: [], // Deprecated - keeping for backward compatibility
      lectures: []
    });

    const course3 = await Course.create({
      title: 'Advanced Physics',
      courseCode: 'PHY301',
      description: 'Advanced topics in quantum mechanics and relativity',
      colorIdentifier: '#10B981', // Green
      instructor: prof2._id,
      targetSection: sectionA._id,
      students: [], // Deprecated - keeping for backward compatibility
      lectures: []
    });

    const course4 = await Course.create({
      title: 'Mathematics for Engineers',
      courseCode: 'MATH101',
      description: 'Essential mathematics concepts for engineering students',
      colorIdentifier: '#F59E0B', // Orange
      instructor: prof2._id,
      targetSection: sectionB._id,
      students: [], // Deprecated - keeping for backward compatibility
      lectures: []
    });
    console.log('Created 4 courses (2 per section)');

    // Update professors with course relationships
    prof1.assignedCourses.push(course1._id, course2._id);
    await prof1.save();

    prof2.assignedCourses.push(course3._id, course4._id);
    await prof2.save();
    console.log('Updated professor-course relationships');

    // Create Assignments
    const assignment1 = await Assignment.create({
      courseId: course1._id,
      title: 'Python Programming Assignment 1',
      description: 'Build a simple calculator using Python',
      dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
    });

    const assignment2 = await Assignment.create({
      courseId: course1._id,
      title: 'Object-Oriented Programming Project',
      description: 'Design a class hierarchy for a library management system',
      dueDate: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000)
    });

    const assignment3 = await Assignment.create({
      courseId: course2._id,
      title: 'Data Structures Project',
      description: 'Implement a linked list and binary tree',
      dueDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000)
    });

    const assignment4 = await Assignment.create({
      courseId: course3._id,
      title: 'Quantum Mechanics Problem Set',
      description: 'Solve problems from chapter 3',
      dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000)
    });

    const assignment5 = await Assignment.create({
      courseId: course4._id,
      title: 'Calculus Problem Set 1',
      description: 'Solve differentiation and integration problems',
      dueDate: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000)
    });
    console.log('Created 5 assignments');

    // Create Events
    const globalEvent = await Event.create({
      title: 'University Sports Day',
      start: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000),
      allDay: true,
      type: 'global',
      scopeId: null
    });

    const courseEvent1 = await Event.create({
      title: 'CS101 Mid-Semester Exam',
      start: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 20 * 24 * 60 * 60 * 1000),
      allDay: false,
      type: 'course',
      scopeId: course1._id
    });

    const personalEvent = await Event.create({
      title: 'Study Group Meeting',
      start: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      end: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
      allDay: false,
      type: 'personal',
      scopeId: students[0]._id
    });
    console.log('Created 3 events');

    console.log('\n✅ Database seeded successfully!');
    console.log('\n📝 Login credentials:');
    console.log('Admin: admin@college.edu / admin123');
    console.log('Professor 1: prof1@college.edu / prof123');
    console.log('Professor 2: prof2@college.edu / prof123');
    console.log('Students: student1@college.edu to student60@college.edu / student123');
    console.log('\n📚 Sections:');
    console.log('Section A (B.Tech CSE 2024-2028): 30 students (student1-student30)');
    console.log('Section B (B.Tech CSE 2024-2028): 30 students (student31-student60)');
    console.log('\n📖 Courses:');
    console.log('CS101 (Section A) - Introduction to Computer Science');
    console.log('CS201 (Section B) - Data Structures and Algorithms');
    console.log('PHY301 (Section A) - Advanced Physics');
    console.log('MATH101 (Section B) - Mathematics for Engineers');

    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
