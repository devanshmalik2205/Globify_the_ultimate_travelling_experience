import "dotenv/config";
import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";
import db from "./db.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

const PORT = process.env.PORT || 8000;

/* ===================== AUTHENTICATION ROUTES ===================== */

app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  const sql = "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, 'user')";
  db.query(sql, [name, email, password], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') return res.status(400).json({ success: false, message: "Email is already registered." });
      return res.status(500).json({ success: false, message: "Database error." });
    }
    res.json({ success: true, message: "Registration successful! You can now log in." });
  });
});

app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;
  const sql = "SELECT user_id, name, email, role FROM Users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });
    if (results.length > 0) res.json({ success: true, user: results[0] });
    else res.status(401).json({ success: false, message: "Invalid email or password." });
  });
});

/* ===================== NEW ADVANCED ROUTES ===================== */

app.get("/api/stats/premium-destinations", (req, res) => {
  db.query("SELECT * FROM vw_premium_destinations", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

/* ✅ DYNAMIC PRICE RANGE: Extracts exact Min and Max values from database */
app.get("/api/homes/price-range", (req, res) => {
  db.query("SELECT MIN(price) AS minPrice, MAX(price) AS maxPrice FROM Home", (err, results) => {
    if (err) return res.status(500).json({ minPrice: 0, maxPrice: 100000 });
    res.json({
        minPrice: results[0].minPrice || 0,
        maxPrice: results[0].maxPrice || 100000
    });
  });
});

/* ===================== ACID TRANSACTION ROUTES ===================== */

app.post("/api/book-flight", (req, res) => {
  const { flight_id, guest_name, seats } = req.body;
  
  // Backend Validation for maximum allowed limit
  if (!seats || seats < 1 || seats > 10) {
      return res.status(400).json({ Message: "Invalid booking request. A maximum of 10 seats is allowed per booking." });
  }

  db.query("CALL sp_book_flight(?, ?, ?)", [flight_id, guest_name, seats], (err, results) => {
    if (err) return res.status(500).json({ error: "System Error", details: err });
    res.json(results[0][0]); 
  });
});

app.post("/api/book-room", (req, res) => {
  const { room_id, guest_name, nights } = req.body;
  
  // Backend Validation for maximum allowed limit
  if (!nights || nights < 1 || nights > 5) {
      return res.status(400).json({ Message: "Invalid booking request. A maximum of 5 nights is allowed per booking." });
  }

  db.query("CALL sp_book_room(?, ?, ?)", [room_id, guest_name, nights], (err, results) => {
    if (err) return res.status(500).json({ error: "System Error", details: err });
    res.json(results[0][0]); 
  });
});

/* ===================== STANDARD ROUTES ===================== */

app.get("/api/locations", (req, res) => {
  const searchTerm = req.query.search;
  let sql = "SELECT * FROM Location";
  let params = [];
  if (searchTerm) {
    sql += " WHERE location_name LIKE ?";
    params.push(`%${searchTerm}%`);
  }
  sql += " ORDER BY location_name ASC";
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.post("/api/locations", (req, res) => {
  const { location_name, image, link } = req.body;
  db.query("INSERT INTO Location (location_name, image, link) VALUES (?, ?, ?)", [location_name, image, link], (err, results) => {
    if (err) return res.status(500).json({ error: err });
    res.status(201).json(results);
  });
});

app.put("/api/locations/:id", (req, res) => {
  const { location_name, image, link } = req.body;
  db.query("UPDATE Location SET location_name=?, image=?, link=? WHERE location_id=?", [location_name, image, link, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.delete("/api/locations/:id", (req, res) => {
  db.query("DELETE FROM Location WHERE location_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* --- Homes/Hotels (With Advanced Search & Slider Filters) --- */
app.get("/api/homes", (req, res) => {
  const { search, minPrice, maxPrice } = req.query;
  
  let sql = `
    SELECT h.*, l.location_name,
           (CASE
               WHEN h.rating >= 9.5 THEN 'Top Rated ✨'
               WHEN h.price < 15000 AND h.rating >= 9.0 THEN 'Great Value 💰'
               WHEN h.price > 30000 THEN 'Luxury 💎'
               ELSE 'Popular 🔥'
            END) AS dynamic_badge
    FROM Home h
    LEFT JOIN Location l ON h.location_id = l.location_id
    WHERE 1=1
  `;
  let params = [];

  if (search) {
    sql += " AND (h.title LIKE ? OR l.location_name LIKE ?)";
    params.push(`%${search}%`, `%${search}%`);
  }

  if (minPrice && !isNaN(minPrice)) {
    sql += " AND h.price >= ?";
    params.push(Number(minPrice));
  }

  if (maxPrice && !isNaN(maxPrice)) {
    sql += " AND h.price <= ?";
    params.push(Number(maxPrice));
  }

  sql += " ORDER BY h.rating DESC, h.price ASC";

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.get("/api/homes/:id", (req, res) => {
  const sql = `
    SELECT h.*, l.location_name
    FROM Home h
    LEFT JOIN Location l ON h.location_id = l.location_id
    WHERE h.home_id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || null); 
  });
});

app.post("/api/homes", (req, res) => {
  const { location_id, title, subtitle, image, link, price, rating } = req.body;
  db.query("INSERT INTO Home (location_id, title, subtitle, image, link, price, rating) VALUES (?,?,?,?,?,?,?)", [location_id, title, subtitle, image, link, price, rating], (err, r) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true, id: r.insertId });
  });
});

app.put("/api/homes/:id", (req, res) => {
  const { location_id, title, subtitle, image, link, price, rating } = req.body;
  db.query("UPDATE Home SET location_id=?, title=?, subtitle=?, image=?, link=?, price=?, rating=? WHERE home_id=?", [location_id, title, subtitle, image, link, price, rating, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

app.delete("/api/homes/:id", (req, res) => {
  db.query("DELETE FROM Home WHERE home_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* --- Hotel Rooms --- */
app.get("/api/homes/:id/rooms", (req, res) => {
  const search = req.query.search;
  db.query("SHOW COLUMNS FROM HotelRoom LIKE 'home_id'", (err, cols) => {
    let sql = "";
    let params = [];
    if (cols && cols.length > 0) {
        sql = `SELECT hr.room_id, hr.name, hr.price, hr.priceSubtext, rf.feature_name 
               FROM HotelRoom hr LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id 
               WHERE hr.home_id = ?`;
        params.push(req.params.id);
    } else {
        sql = `SELECT hr.room_id, hr.name, hr.price, hr.priceSubtext, rf.feature_name 
               FROM HotelRoom hr LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id
               WHERE 1=1`;
    }
    if (search) {
        sql += ` AND hr.name LIKE ?`;
        params.push(`%${search}%`);
    }
    db.query(sql, params, (err, results) => {
      if (err) return res.status(500).json([]);
      const roomsMap = {};
      results.forEach(row => {
        if (!roomsMap[row.room_id]) {
          roomsMap[row.room_id] = { room_id: row.room_id, name: row.name, price: row.price, priceSubtext: row.priceSubtext, features: [] };
        }
        if (row.feature_name) roomsMap[row.room_id].features.push(row.feature_name);
      });
      res.json(Object.values(roomsMap));
    });
  });
});

app.get("/api/rooms/:id", (req, res) => {
  const sql = `
    SELECT hr.*, h.title as hotel_name, l.location_name 
    FROM HotelRoom hr 
    LEFT JOIN Home h ON hr.home_id = h.home_id 
    LEFT JOIN Location l ON h.location_id = l.location_id 
    WHERE hr.room_id = ?
  `;
  db.query(sql, [req.params.id], (err, results) => {
    if (err) return res.status(500).json(err);
    res.json(results[0] || null);
  });
});

app.post("/api/rooms", (req, res) => {
  const { home_id, name, price, priceSubtext, features } = req.body;
  db.query("INSERT INTO HotelRoom (home_id, name, price, priceSubtext) VALUES (?, ?, ?, ?)", [home_id, name, price, priceSubtext], (err, results) => {
    if (err) return res.status(500).json(err);
    const roomId = results.insertId;
    if (features && features.length > 0) {
      const values = features.map(f => [roomId, f]);
      db.query("INSERT INTO RoomFeature (room_id, feature_name) VALUES ?", [values]);
    }
    res.json({ success: true, room_id: roomId });
  });
});

app.put("/api/rooms/:id", (req, res) => {
  const { name, price, priceSubtext, features } = req.body;
  db.query("UPDATE HotelRoom SET name=?, price=?, priceSubtext=? WHERE room_id=?", [name, price, priceSubtext, req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    db.query("DELETE FROM RoomFeature WHERE room_id=?", [req.params.id], () => {
      if (features && features.length > 0) {
        const values = features.map(f => [req.params.id, f]);
        db.query("INSERT INTO RoomFeature (room_id, feature_name) VALUES ?", [values]);
      }
    });
    res.json({ success: true });
  });
});

app.delete("/api/rooms/:id", (req, res) => {
  db.query("DELETE FROM HotelRoom WHERE room_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* --- Airports --- */
app.get("/api/airports", (req, res) => {
  const searchTerm = req.query.search;
  let sql = `SELECT a.*, l.location_name FROM Airport a LEFT JOIN Location l ON a.location_id = l.location_id`;
  let params = [];
  if (searchTerm) {
    sql += " WHERE a.name LIKE ? OR a.code LIKE ? OR l.location_name LIKE ?";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`, `%${searchTerm}%`);
  }
  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

app.post("/api/airports", (req, res) => {
  const { name, code, location_id } = req.body;
  db.query("INSERT INTO Airport (name, code, location_id) VALUES (?, ?, ?)", [name, code, location_id], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true, id: results.insertId });
  });
});

app.put("/api/airports/:id", (req, res) => {
  const { name, code, location_id } = req.body;
  db.query("UPDATE Airport SET name=?, code=?, location_id=? WHERE airport_id=?", [name, code, location_id, req.params.id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/airports/:id", (req, res) => {
  db.query("DELETE FROM Airport WHERE airport_id=?", [req.params.id], (err) => {
    if (err) return res.status(500).json(err);
    res.json({ success: true });
  });
});

/* --- Flights --- */
app.get("/api/flights", (req, res) => {
  const { from, to, search } = req.query;
  const params = [];
  let viewSql = `SELECT * FROM vw_flight_details WHERE 1=1`;
  if (from) { viewSql += " AND from_city = ?"; params.push(from); }
  if (to) { viewSql += " AND to_city = ?"; params.push(to); }
  if (search) {
    viewSql += " AND (flightNumber LIKE ? OR airlineName LIKE ? OR departure_code LIKE ? OR arrival_code LIKE ?)";
    params.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
  }

  db.query(viewSql, params, (err, results) => {
    if (err) {
      let fallbackSql = `
        SELECT f.*, l1.location_name AS departureCity, a1.code AS departureAirportCode,
          l2.location_name AS arrivalCity, a2.code AS arrivalAirportCode, al.airlineName, al.airlineLogo
        FROM Flight f LEFT JOIN Location l1 ON f.from_location_id = l1.location_id
        LEFT JOIN Location l2 ON f.to_location_id = l2.location_id LEFT JOIN Airport a1 ON f.departure_airport_id = a1.airport_id
        LEFT JOIN Airport a2 ON f.arrival_airport_id = a2.airport_id LEFT JOIN Airline al ON f.airline_id = al.airline_id WHERE 1=1
      `;
      const fallbackParams = [];
      if (from) { fallbackSql += " AND l1.location_name = ?"; fallbackParams.push(from); }
      if (to) { fallbackSql += " AND l2.location_name = ?"; fallbackParams.push(to); }
      if (search) {
         fallbackSql += " AND (f.flightNumber LIKE ? OR al.airlineName LIKE ? OR a1.code LIKE ? OR a2.code LIKE ?)";
         fallbackParams.push(`%${search}%`, `%${search}%`, `%${search}%`, `%${search}%`);
      }
      db.query(fallbackSql, fallbackParams, (fallbackErr, fallbackResults) => {
        if (fallbackErr) return res.status(500).json([]);
        res.json(fallbackResults);
      });
    } else {
        const mappedResults = results.map(f => ({ ...f, departureCity: f.from_city, departureAirportCode: f.departure_code, arrivalCity: f.to_city, arrivalAirportCode: f.arrival_code }));
        res.json(mappedResults);
    }
  });
});

app.post("/api/flights", (req, res) => {
  const { flightNumber, airlineName, airlineLogo, from_location_id, departure_airport_id, to_location_id, arrival_airport_id, departureTime, arrivalTime, duration, price, stops, refundable } = req.body;
  
  db.query("SELECT airline_id FROM Airline WHERE airlineName = ?", [airlineName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const insertFlight = (airline_id) => {
        const sql = "INSERT INTO Flight (from_location_id, to_location_id, departure_airport_id, arrival_airport_id, airline_id, flightNumber, departureTime, arrivalTime, duration, price, stops, refundable) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
        db.query(sql, [from_location_id, to_location_id, departure_airport_id, arrival_airport_id, airline_id, flightNumber, departureTime, arrivalTime, duration, price, stops, refundable], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true, id: result.insertId });
        });
    };

    if (results.length > 0) {
        insertFlight(results[0].airline_id);
    } else {
        db.query("INSERT INTO Airline (airlineName, airlineLogo) VALUES (?, ?)", [airlineName, airlineLogo], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            insertFlight(result.insertId);
        });
    }
  });
});

app.put("/api/flights/:id", (req, res) => {
  const { flightNumber, airlineName, airlineLogo, from_location_id, departure_airport_id, to_location_id, arrival_airport_id, departureTime, arrivalTime, duration, price, stops, refundable } = req.body;
  
  db.query("SELECT airline_id FROM Airline WHERE airlineName = ?", [airlineName], (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const updateFlight = (airline_id) => {
        const sql = "UPDATE Flight SET from_location_id=?, to_location_id=?, departure_airport_id=?, arrival_airport_id=?, airline_id=?, flightNumber=?, departureTime=?, arrivalTime=?, duration=?, price=?, stops=?, refundable=? WHERE flight_id=?";
        db.query(sql, [from_location_id, to_location_id, departure_airport_id, arrival_airport_id, airline_id, flightNumber, departureTime, arrivalTime, duration, price, stops, refundable, req.params.id], (err) => {
            if (err) return res.status(500).json({ error: err.message });
            res.json({ success: true });
        });
    };

    if (results.length > 0) {
        updateFlight(results[0].airline_id);
    } else {
        db.query("INSERT INTO Airline (airlineName, airlineLogo) VALUES (?, ?)", [airlineName, airlineLogo], (err, result) => {
            if (err) return res.status(500).json({ error: err.message });
            updateFlight(result.insertId);
        });
    }
  });
});

app.delete("/api/flights/:id", (req, res) => {
  db.query("DELETE FROM Flight WHERE flight_id=?", [req.params.id], (err) => {
     res.json({ success: !err });
  });
});

/* --- Testimonials --- */
app.get("/api/testimonials", (req, res) => {
  db.query("SELECT * FROM Testimonial", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

/* --- Dynamic City Content Categories --- */
app.get("/api/cities/:id", (req, res) => {
  db.query("SELECT * FROM Location WHERE location_id = ?", [req.params.id], (err, results) => res.json(results[0] || {}));
});

app.get("/api/cities/:id/:category", (req, res) => {
  const { id, category } = req.params;
  const search = req.query.search;
  const tables = {
    'attractions': 'Attraction', 'restaurants': 'Restaurant', 'food': 'FoodPlace',
    'shopping': 'ShoppingPlace', 'culture': 'Culture', 'gallery': 'GalleryImage'
  };
  const tableName = tables[category];
  if (!tableName) return res.status(404).json({ error: "Category not found" });

  let sql = `SELECT * FROM ${tableName} WHERE location_id = ?`;
  let params = [id];

  if (search) {
    if (category === 'gallery') {
        sql += " AND alt LIKE ?";
    } else {
        sql += " AND name LIKE ?";
    }
    params.push(`%${search}%`);
  }

  db.query(sql, params, (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

/* --- Add/Edit/Delete Dynamic City Content Engine --- */
const dynamicTables = {
  'attractions': { name: 'Attraction', idCol: 'attraction_id' },
  'restaurants': { name: 'Restaurant', idCol: 'restaurant_id' },
  'food': { name: 'FoodPlace', idCol: 'food_id' },
  'shopping': { name: 'ShoppingPlace', idCol: 'shopping_id' },
  'culture': { name: 'Culture', idCol: 'culture_id' },
  'gallery': { name: 'GalleryImage', idCol: 'image_id' }
};

app.post("/api/:category", (req, res, next) => {
  const { category } = req.params;
  const tableInfo = dynamicTables[category];
  if (!tableInfo) return next(); // Not a dynamic category, pass to 404 handler

  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);
  if(keys.length === 0) return res.status(400).json({ error: "No data provided" });

  const placeholders = keys.map(() => '?').join(', ');
  const sql = `INSERT INTO ${tableInfo.name} (${keys.join(', ')}) VALUES (${placeholders})`;

  db.query(sql, values, (err, results) => {
    if (err) return res.status(500).json({ error: err.message });
    res.status(201).json({ success: true, id: results.insertId });
  });
});

app.put("/api/:category/:id", (req, res, next) => {
  const { category, id } = req.params;
  const tableInfo = dynamicTables[category];
  if (!tableInfo) return next();

  const data = req.body;
  const keys = Object.keys(data);
  const values = Object.values(data);
  if(keys.length === 0) return res.status(400).json({ error: "No data provided" });

  const setClause = keys.map(k => `${k}=?`).join(', ');
  const sql = `UPDATE ${tableInfo.name} SET ${setClause} WHERE ${tableInfo.idCol} = ?`;
  values.push(id);

  db.query(sql, values, (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

app.delete("/api/:category/:id", (req, res, next) => {
  const { category, id } = req.params;
  const tableInfo = dynamicTables[category];
  if (!tableInfo) return next();

  db.query(`DELETE FROM ${tableInfo.name} WHERE ${tableInfo.idCol} = ?`, [id], (err) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json({ success: true });
  });
});

/* ✅ GLOBAL 404 HANDLER */
app.use("/api/*", (req, res) => res.status(404).json({ error: "API Route Not Found." }));

app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT} 🚀`));