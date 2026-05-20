import Room from '../models/Room.js';

const generateRoomId = async () => {
  let roomId;
  let isUnique = false;
  let attempts = 0;

  console.log('Starting Room ID generation...');

  while (!isUnique && attempts < 10) {
    attempts++;
    // Generate random 6-digit number (100000–999999)
    roomId = Math.floor(100000 + Math.random() * 900000).toString();
    console.log(`Attempt ${attempts}: Generated ${roomId}, checking uniqueness...`);

    try {
      // Check if it already exists in the database
      const existingRoom = await Room.findOne({ roomId });
      if (!existingRoom) {
        isUnique = true;
        console.log(`Room ID ${roomId} is unique.`);
      } else {
        console.log(`Room ID ${roomId} already exists.`);
      }
    } catch (err) {
      console.error('Error checking room uniqueness:', err.message);
      throw err;
    }
  }

  if (!isUnique) {
    throw new Error('Failed to generate a unique Room ID after 10 attempts');
  }

  return roomId;
};

export default generateRoomId;
