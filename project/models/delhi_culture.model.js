import mongoose from 'mongoose';

const delhiCultureSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String
});

const DelhiCulture = mongoose.model('DelhiCulture', delhiCultureSchema, 'delhi_culture');

export default DelhiCulture;