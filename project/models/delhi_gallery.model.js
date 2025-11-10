import mongoose from 'mongoose';

// Based on delhi_gallery.json
const delhiGallerySchema = new mongoose.Schema({
  src: String,
  alt: String
});

// Mongoose will create a collection named 'delhigalleries'
const DelhiGallery = mongoose.model('DelhiGallery', delhiGallerySchema);

export default DelhiGallery;