import mongoose from 'mongoose';

const delhiGallerySchema = new mongoose.Schema({
  src: String,
  alt: String
});

const DelhiGallery = mongoose.model('DelhiGallery', delhiGallerySchema, 'delhi_gallery');

export default DelhiGallery;