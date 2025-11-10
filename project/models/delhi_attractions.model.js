import mongoose from 'mongoose';

// Based on delhi_attractions.json
const delhiAttractionSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  category: String,
  opening_hours: String,
  ticket_price: String,
  best_time_to_visit: String
});

// Mongoose will create a collection named 'delhiattractions'
const DelhiAttraction = mongoose.model('DelhiAttraction', delhiAttractionSchema);

export default DelhiAttraction;