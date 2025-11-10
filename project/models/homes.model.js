import mongoose from 'mongoose';

// Based on your homes.json
const homeSchema = new mongoose.Schema({
  link: String,
  image: String,
  rating: String,
  title: String,
  subtitle: String,
  price: String // Kept as String since it includes "INR", "AED" etc.
});

// Mongoose will create a collection named 'homes'
const Home = mongoose.model('Home', homeSchema);

export default Home;