import mongoose from 'mongoose';

// Based on holiday_inn_rooms.json
const holidayInnRoomSchema = new mongoose.Schema({
  name: String,
  features: [String], // This defines an array of strings
  price: String,
  priceSubtext: String
});

// Mongoose will create a collection named 'holidayinnrooms'
const HolidayInnRoom = mongoose.model('HolidayInnRoom', holidayInnRoomSchema);

export default HolidayInnRoom;