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

/* ✅ Register New User */
app.post("/api/auth/register", (req, res) => {
  const { name, email, password } = req.body;
  
  const sql = "INSERT INTO Users (name, email, password, role) VALUES (?, ?, ?, 'user')";
  db.query(sql, [name, email, password], (err, results) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.status(400).json({ success: false, message: "Email is already registered." });
      }
      return res.status(500).json({ success: false, message: "Database error." });
    }
    res.json({ success: true, message: "Registration successful! You can now log in." });
  });
});

/* ✅ Login User / Admin */
app.post("/api/auth/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT user_id, name, email, role FROM Users WHERE email = ? AND password = ?";
  db.query(sql, [email, password], (err, results) => {
    if (err) return res.status(500).json({ success: false, message: "Server error." });
    
    if (results.length > 0) {
      res.json({ success: true, user: results[0] });
    } else {
      res.status(401).json({ success: false, message: "Invalid email or password." });
    }
  });
});


/* ===================== NEW ADVANCED ROUTES ===================== */

/* ✅ Premium Destinations (Uses our SQL View with Subqueries & Grouping) */
app.get("/api/stats/premium-destinations", (req, res) => {
  db.query("SELECT * FROM vw_premium_destinations", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});


/* ===================== ACID TRANSACTION ROUTES ===================== */

/* ✅ Book a Flight (Uses Stored Procedure for Atomicity & Isolation) */
app.post("/api/book-flight", (req, res) => {
  const { flight_id, guest_name, seats } = req.body;
  
  db.query("CALL sp_book_flight(?, ?, ?)", [flight_id, guest_name, seats], (err, results) => {
    if (err) return res.status(500).json({ error: "System Error", details: err });
    res.json(results[0][0]); 
  });
});

/* ✅ Book a Room (Uses Stored Procedure for Atomicity & Isolation) */
app.post("/api/book-room", (req, res) => {
  const { room_id, guest_name, nights } = req.body;
  
  db.query("CALL sp_book_room(?, ?, ?)", [room_id, guest_name, nights], (err, results) => {
    if (err) return res.status(500).json({ error: "System Error", details: err });
    res.json(results[0][0]); 
  });
});


/* ===================== STANDARD ROUTES ===================== */

/* --- Locations --- */
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

/* --- Homes/Hotels --- */
app.get("/api/homes", (req, res) => {
  const searchTerm = req.query.search;
  
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
  `;
  let params = [];

  if (searchTerm) {
    sql += " WHERE h.title LIKE ? OR l.location_name LIKE ?";
    params.push(`%${searchTerm}%`, `%${searchTerm}%`);
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

/* --- Hotel Rooms --- */
app.get("/api/homes/:id/rooms", (req, res) => {
  db.query("SHOW COLUMNS FROM HotelRoom LIKE 'home_id'", (err, cols) => {
    let sql = "";
    if (cols && cols.length > 0) {
        sql = `SELECT hr.room_id, hr.name, hr.price, hr.priceSubtext, rf.feature_name 
               FROM HotelRoom hr LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id 
               WHERE hr.home_id = ?`;
    } else {
        sql = `SELECT hr.room_id, hr.name, hr.price, hr.priceSubtext, rf.feature_name 
               FROM HotelRoom hr LEFT JOIN RoomFeature rf ON hr.room_id = rf.room_id`;
    }
    db.query(sql, [req.params.id], (err, results) => {
      if (err) return res.status(500).json([]);
      
      const roomsMap = {};
      results.forEach(row => {
        if (!roomsMap[row.room_id]) {
          roomsMap[row.room_id] = {
            room_id: row.room_id, name: row.name, price: row.price, priceSubtext: row.priceSubtext, features: []
          };
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
  db.query("SELECT * FROM Airport", (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

/* --- Flights --- */
app.get("/api/flights", (req, res) => {
  const { from, to } = req.query;
  const params = [];

  let viewSql = `SELECT * FROM vw_flight_details WHERE 1=1`;
  if (from) { viewSql += " AND from_city = ?"; params.push(from); }
  if (to) { viewSql += " AND to_city = ?"; params.push(to); }

  db.query(viewSql, params, (err, results) => {
    if (err) {
      let fallbackSql = `
        SELECT 
          f.*, 
          l1.location_name AS departureCity, a1.code AS departureAirportCode,
          l2.location_name AS arrivalCity, a2.code AS arrivalAirportCode
        FROM Flight f
        LEFT JOIN Location l1 ON f.from_location_id = l1.location_id
        LEFT JOIN Location l2 ON f.to_location_id = l2.location_id
        LEFT JOIN Airport a1 ON f.departure_airport_id = a1.airport_id
        LEFT JOIN Airport a2 ON f.arrival_airport_id = a2.airport_id
        WHERE 1=1
      `;
      const fallbackParams = [];
      if (from) { fallbackSql += " AND l1.location_name = ?"; fallbackParams.push(from); }
      if (to) { fallbackSql += " AND l2.location_name = ?"; fallbackParams.push(to); }
      
      db.query(fallbackSql, fallbackParams, (fallbackErr, fallbackResults) => {
        if (fallbackErr) return res.status(500).json([]);
        res.json(fallbackResults);
      });
    } else {
        const mappedResults = results.map(f => ({
            ...f,
            departureCity: f.from_city,
            departureAirportCode: f.departure_code,
            arrivalCity: f.to_city,
            arrivalAirportCode: f.arrival_code
        }));
        res.json(mappedResults);
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
  const tables = {
    'attractions': 'Attraction', 'restaurants': 'Restaurant', 'food': 'FoodPlace',
    'shopping': 'ShoppingPlace', 'culture': 'Culture', 'gallery': 'GalleryImage'
  };
  const tableName = tables[category];
  if (!tableName) return res.status(404).json({ error: "Category not found" });

  db.query(`SELECT * FROM ${tableName} WHERE location_id = ?`, [id], (err, results) => {
    if (err) return res.status(500).json([]);
    res.json(results);
  });
});

/* ✅ GLOBAL 404 HANDLER */
app.use("/api/*", (req, res) => {
  res.status(404).json({ error: "API Route Not Found." });
});

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT} 🚀`);
});