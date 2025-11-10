import mongoose from 'mongoose';

// Based on delhi_shopping.json
const delhiShoppingSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String
});

// Mongoose will create a collection named 'delhishoppings'
const DelhiShopping = mongoose.model('DelhiShopping', delhiShoppingSchema);

export default DelhiShopping;