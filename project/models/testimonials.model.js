import mongoose from 'mongoose';

// Based on your testimonials.json
const testimonialSchema = new mongoose.Schema({
  name: String,
  ratingStars: String,
  quote: String
});

// Mongoose will create a collection named 'testimonials'
const Testimonial = mongoose.model('Testimonial', testimonialSchema);

export default Testimonial;