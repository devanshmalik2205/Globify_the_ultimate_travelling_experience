import db from "../db.js";

/* ✅ Get all homes */
export const getHomes = () => {
  return new Promise((resolve, reject) => {
    const sql = `
      SELECT 
        h.home_id,
        h.link,
        h.image,
        h.rating,
        h.title,
        h.subtitle,
        h.price,
        l.location_name,
        h.location_id
      FROM Home h
      JOIN Location l ON h.location_id = l.location_id
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Add a new home/hotel (INSERT) */
export const addHome = (data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      INSERT INTO Home (title, subtitle, location_id, price, rating, image, link) 
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      data.title, 
      data.subtitle, 
      data.location_id, 
      data.price, 
      data.rating, 
      data.image, 
      data.link
    ];

    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Update an existing home/hotel (UPDATE) */
export const updateHome = (id, data) => {
  return new Promise((resolve, reject) => {
    const sql = `
      UPDATE Home 
      SET title = ?, subtitle = ?, location_id = ?, price = ?, rating = ?, image = ?, link = ?
      WHERE home_id = ?
    `;
    
    const values = [
      data.title, 
      data.subtitle, 
      data.location_id, 
      data.price, 
      data.rating, 
      data.image, 
      data.link, 
      id
    ];

    db.query(sql, values, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Delete a home/hotel (DELETE) */
export const deleteHome = (id) => {
  return new Promise((resolve, reject) => {
    const sql = `DELETE FROM Home WHERE home_id = ?`;

    db.query(sql, [id], (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};