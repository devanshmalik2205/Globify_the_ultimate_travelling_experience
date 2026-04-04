import db from "../db.js";

/* ✅ Get all Delhi shopping places */
export const getDelhiShopping = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        shopping_id,
        name,
        description,
        image,
        googleMapsUrl
      FROM ShoppingPlace
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};