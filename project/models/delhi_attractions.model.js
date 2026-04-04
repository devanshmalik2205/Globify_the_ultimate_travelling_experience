import db from "../db.js";

/* ✅ Get all Delhi attractions */
export const getDelhiAttractions = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        attraction_id,
        name,
        description,
        image,
        googleMapsUrl,
        category,
        opening_hours,
        ticket_price,
        best_time_to_visit
      FROM Attraction
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};