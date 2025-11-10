import mongoose from 'mongoose';

// Based on delhi_restaurants.json
const delhiRestaurantSchema = new mongoose.Schema({
  name: String,
  description: String,
  image: String,
  googleMapsUrl: String,
  cuisine: String,
  price_range: String
});

// Mongoose will create a collection named 'delhirestaurants'
const DelhiRestaurant = mongoose.model('DelhiRestaurant', delhiRestaurantSchema);

export default DelhiRestaurant;