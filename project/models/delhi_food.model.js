import mongoose from 'mongoose';

const delhiFoodSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  type: String,
  area: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const DelhiFood = mongoose.model('DelhiFood', delhiFoodSchema, 'delhi_food');

export default DelhiFood;