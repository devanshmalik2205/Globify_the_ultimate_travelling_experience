import mongoose from 'mongoose';

// Based on your airports.json
const airportSchema = new mongoose.Schema({
  city: String,
  code: String,
  name: String
});

// Mongoose will create a collection named 'airports'
const Airport = mongoose.model('Airport', airportSchema);

export default Airport;