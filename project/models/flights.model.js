import db from "../db.js";

/* ✅ Get flights (with filters) */
export const getFlights = (from, to) => {
  return new Promise((resolve, reject) => {

    let sql = `
      SELECT 
        f.flight_id,
        f.flightNumber,
        f.airlineName,
        f.airlineLogo,
        f.departureTime,
        f.arrivalTime,
        f.duration,
        f.price,
        f.refundable,
        f.stops,

        l1.location_name AS departureCity,
        l2.location_name AS arrivalCity,

        a1.code AS departureAirportCode,
        a2.code AS arrivalAirportCode

      FROM Flight f
      JOIN Location l1 ON f.from_location_id = l1.location_id
      JOIN Location l2 ON f.to_location_id = l2.location_id
      JOIN Airport a1 ON f.departure_airport_id = a1.airport_id
      JOIN Airport a2 ON f.arrival_airport_id = a2.airport_id

      WHERE 1=1
    `;

    const params = [];

    if (from) {
      sql += " AND l1.location_name = ?";
      params.push(from);
    }

    if (to) {
      sql += " AND l2.location_name = ?";
      params.push(to);
    }

    db.query(sql, params, (err, results) => {
      if (err) reject(err);
      else resolve(results);
    });

  });
};