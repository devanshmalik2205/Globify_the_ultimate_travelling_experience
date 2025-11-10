import mongoose from 'mongoose';

const delhiShoppingSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const DelhiShopping = mongoose.model('DelhiShopping', delhiShoppingSchema, 'delhi_shopping');

export default DelhiShopping;