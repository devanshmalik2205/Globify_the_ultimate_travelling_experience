import db from "../db.js";

/* ✅ Get all Delhi restaurants */
export const getDelhiRestaurants = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        restaurant_id,
        name,
        description,
        image,
        googleMapsUrl,
        cuisine,
        price_range
      FROM Restaurant
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};