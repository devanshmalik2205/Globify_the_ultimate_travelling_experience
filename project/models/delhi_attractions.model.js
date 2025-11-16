import mongoose from 'mongoose';

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

const DelhiAttraction = mongoose.model('DelhiAttraction', delhiAttractionSchema, 'delhi_attractions');

export default DelhiAttraction;