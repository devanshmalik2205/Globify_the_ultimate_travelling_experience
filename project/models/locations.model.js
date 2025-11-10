import mongoose from 'mongoose';

// Based on your locations.json
const locationSchema = new mongoose.Schema({
  link: String,
  image: String,
  title: String
});

// Mongoose will create a collection named 'locations'
const Location = mongoose.model('Location', locationSchema);

export default Location;