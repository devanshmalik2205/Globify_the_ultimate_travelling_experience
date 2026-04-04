import db from "../db.js";

/* ✅ Get all airports */
export const getAirports = () => {
  return new Promise((resolve, reject) => {
    db.query("SELECT * FROM Airport", (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });
  });
};

/* ✅ Get airport by code */
export const getAirportByCode = (code) => {
  return new Promise((resolve, reject) => {
    db.query(
      "SELECT * FROM Airport WHERE code = ?",
      [code],
      (err, results) => {
        if (err) reject(err);
        else resolve(results);
      }
    );
  });
};