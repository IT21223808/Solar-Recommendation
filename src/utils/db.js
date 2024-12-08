const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const connectToDatabase = async () => {
  try {
    await prisma.$connect();
    console.log('Connected to MongoDB');
  } catch (error) {
    console.error('Error connecting to MongoDB', error);
    process.exit(1);
  }
};

module.exports = {
  prisma,
  connectToDatabase,
};
