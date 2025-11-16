import mongoose from 'mongoose';

const delhiShoppingSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String
});

const DelhiShopping = mongoose.model('DelhiShopping', delhiShoppingSchema, 'delhi_shopping');

export default DelhiShopping;