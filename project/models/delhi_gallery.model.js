import mongoose from 'mongoose';

const delhiGallerySchema = new mongoose.Schema({
  src: String,
  alt: String
});

// The 3rd argument is the EXACt collection name in MongoDB
const DelhiGallery = mongoose.model('DelhiGallery', delhiGallerySchema, 'delhi_gallery');

export default DelhiGallery;