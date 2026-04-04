import db from "../db.js";

/* ✅ Get all Delhi gallery images */
export const getDelhiGallery = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        image_id,
        src,
        alt
      FROM GalleryImage
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};