import mongoose from 'mongoose';

// Based on your flights.json
const flightSchema = new mongoose.Schema({
  id: Number,
  airlineName: String,
  airlineLogo: String,
  flightNumber: String,
  departureCity: String,
  departureAirportCode: String,
  departureTime: String,
  arrivalCity: String,
  arrivalAirportCode: String,
  arrivalTime: String,
  duration: String,
  stops: String,
  price: Number,
  refundable: Boolean
});

// Mongoose will create a collection named 'flights'
const Flight = mongoose.model('Flight', flightSchema);

export default Flight;