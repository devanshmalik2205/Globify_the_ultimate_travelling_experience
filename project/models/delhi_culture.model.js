import mongoose from 'mongoose';

const delhiCultureSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const DelhiCulture = mongoose.model('DelhiCulture', delhiCultureSchema, 'delhi_culture');

export default DelhiCulture;