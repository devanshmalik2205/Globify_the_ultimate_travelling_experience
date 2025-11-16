import mongoose from 'mongoose';

const airportSchema = new mongoose.Schema({
  city: String,
  code: String,
  name: String
});

const Airport = mongoose.model('Airport', airportSchema);

export default Airport;