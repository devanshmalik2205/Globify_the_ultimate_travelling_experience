import mongoose from 'mongoose';

// Based on delhi_culture.json
const delhiCultureSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String
});

// Mongoose will create a collection named 'delhicultures'
const DelhiCulture = mongoose.model('DelhiCulture', delhiCultureSchema);

export default DelhiCulture;