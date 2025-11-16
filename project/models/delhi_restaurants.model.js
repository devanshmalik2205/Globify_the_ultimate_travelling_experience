import mongoose from 'mongoose';

const delhiRestaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  cuisine: String,
  price_range: String
});

const DelhiRestaurant = mongoose.model('DelhiRestaurant', delhiRestaurantSchema, 'delhi_restaurants');

export default DelhiRestaurant;