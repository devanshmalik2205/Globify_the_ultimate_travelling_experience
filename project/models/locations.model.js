import db from "../db.js";

/* ✅ Get all locations */
export const getLocations = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        location_id,
        location_name AS title,
        image,
        link
      FROM Location
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Add a new location (INSERT) */
export const addLocation = (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Location (location_name, image, link) 
      VALUES (?, ?, ?)
    `;
    
    // We expect the frontend to send { location_name, image, link }
    const values = [data.location_name, data.image, data.link];

    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Update an existing location (UPDATE) */
export const updateLocation = (id, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Location 
      SET location_name = ?, image = ?, link = ?
      WHERE location_id = ?
    `;
    
    const values = [data.location_name, data.image, data.link, id];

    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Delete a location (DELETE) */
export const deleteLocation = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM Location WHERE location_id = ?`;

    db.query(sql, [id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};