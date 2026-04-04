import db from "../db.js";

/* ✅ Get all Delhi food places */
export const getDelhiFood = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        food_id,
        name,
        description,
        image,
        googleMapsUrl,
        type,
        area
      FROM FoodPlace
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};