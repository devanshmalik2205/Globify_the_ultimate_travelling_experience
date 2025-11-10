import mongoose from 'mongoose';

const holidayInnRoomSchema = new mongoose.Schema({
  name: String,
  features: [String],
  price: String,
  priceSubtext: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const HolidayInnRoom = mongoose.model('HolidayInnRoom', holidayInnRoomSchema, 'holiday_inn_rooms');

export default HolidayInnRoom;