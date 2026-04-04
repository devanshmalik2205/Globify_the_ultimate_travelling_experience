import db from "../db.js";

/* ✅ Get all testimonials */
export const getTestimonials = () => {
  return new Promise((resolve, reject) => {

    const sql = `
      SELECT 
        testimonial_id,
        name,
        quote,
        ratingStars
      FROM Testimonial
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });

  });
};