import mongoose from 'mongoose';

const locationSchema = new mongoose.Schema({
  link: String,
  image: String,
  title: String
});

const Location = mongoose.model('Location', locationSchema);

export default Location;