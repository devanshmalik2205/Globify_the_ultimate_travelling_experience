import db from "../db.js";

/* ✅ Get Holiday Inn rooms with features */
export const getHolidayInnRooms = () => {
  return new Promise((resolve, reject) => {

    const sql = `
      SELECT 
        hr.room_id,
        hr.name,
        hr.price,
        hr.priceSubtext,
        rf.feature_name
      FROM HotelRoom hr
      LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id
      WHERE hr.location_id = 8
    `;

    db.query(sql, (err, results) => {
      if (err) reject(err);
      else {

        /* 🔥 Group features properly (IMPORTANT) */
        const roomsMap = {};

        results.forEach(row => {
          if (!roomsMap[row.room_id]) {
            roomsMap[row.room_id] = {
              room_id: row.room_id,
              name: row.name,
              price: row.price,
              priceSubtext: row.priceSubtext,
              features: []
            };
          }

          if (row.feature_name) {
            roomsMap[row.room_id].features.push(row.feature_name);
          }
        });

        resolve(Object.values(roomsMap));
      }
    });

  });
};