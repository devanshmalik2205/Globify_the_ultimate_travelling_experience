import mongoose from 'mongoose';

const testimonialSchema = new mongoose.Schema({
  name: String,
  ratingStars: String,
  quote: String
});

const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;