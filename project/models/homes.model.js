import mongoose from 'mongoose';

const homeSchema = new mongoose.Schema({
  link: String,
  image: String,
  rating: String,
  title: String,
  subtitle: String,
  price: String
});

const Home = mongoose.model('Home', homeSchema);

export default Home;