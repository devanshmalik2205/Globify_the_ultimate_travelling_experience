import db from "../db.js";

/* ✅ Get all Delhi culture data */
export const getDelhiCulture = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        culture_id,
        name,
        description,
        image
      FROM Culture
      WHERE location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};