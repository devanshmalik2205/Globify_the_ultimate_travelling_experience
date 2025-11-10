import mongoose from 'mongoose';

// Based on delhi_food.json
const delhiFoodSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  type: String,
  area: String
});

// Mongoose will create a collection named 'delhifoods'
const DelhiFood = mongoose.model('DelhiFood', delhiFoodSchema);

export default DelhiFood;