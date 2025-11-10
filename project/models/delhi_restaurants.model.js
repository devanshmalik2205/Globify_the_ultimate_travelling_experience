import mongoose from 'mongoose';

const delhiRestaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  cuisine: String,
  price_range: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const DelhiRestaurant = mongoose.model('DelhiRestaurant', delhiRestaurantSchema, 'delhi_restaurants');

export default DelhiRestaurant;