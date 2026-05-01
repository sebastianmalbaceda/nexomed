const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const prisma = new PrismaClient();

async function testLogin() {
  try {
    console.log('Testing database connection...');
    const userCount = await prisma.user.count();
    console.log('Total users:', userCount);
    
    if (userCount === 0) {
      console.log('No users found. Creating a test user...');
      const passwordHash = await bcrypt.hash('password123', 10);
      const user = await prisma.user.create({
        data: {
          email: 'doctor@test.com',
          passwordHash: passwordHash,
          role: 'DOCTOR',
          name: 'Dr. Test'
        }
      });
      console.log('Created user:', user.email);
    }
    
    const user = await prisma.user.findFirst({
      select: { id: true, email: true, passwordHash: true, role: true, name: true }
    });
    console.log('User found:', user ? { email: user.email, hasPasswordHash: !!user.passwordHash } : 'None');
    
    if (user && user.passwordHash) {
      const valid = await bcrypt.compare('password123', user.passwordHash);
      console.log('Password valid:', valid);
      
      const token = jwt.sign(
        { id: user.id, role: user.role },
        process.env.JWT_SECRET || 'test_secret',
        { expiresIn: '8h' }
      );
      console.log('Token generated successfully');
      console.log('Login would succeed!');
    }
    
    await prisma.$disconnect();
  } catch (error) {
    console.error('Error:', error.message);
    await prisma.$disconnect();
  }
}

testLogin();
